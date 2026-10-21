/**
 * MÛRA · Puente de productos GHL
 * Cloudflare Worker (plan gratuito)
 *
 * Expone:  GET /products         JSON con las piezas (nombre, precio, tallas, stock, imágenes, colección)
 *          GET /products?id=…    UNA pieza, con TODA su galería
 *          GET /collections      JSON con las colecciones de la tienda
 *
 * Variables de entorno (Settings → Variables):
 *   GHL_TOKEN       Token de integración privada (scopes: View Products, View Product Prices,
 *                   View Product Collections)
 *   GHL_LOCATION    Location ID de la subcuenta de MÛRA
 *   ALLOWED_ORIGIN  (opcional) dominios permitidos separados por comas. Vacía o "*" = cualquiera.
 *
 * ------------------------------------------------------------------
 * CAMBIO DEL 21/10 — POR QUÉ LA WEB SE QUEDÓ SIN PRODUCTOS
 *
 * `/products` pedía el listado y después UNA llamada de precios POR PRODUCTO.
 * El plan gratuito de Workers corta en 50 subpeticiones por petición y, al
 * pasarse, lanza una excepción que Cloudflare enseña como «Error 1101». Con
 * 36 piezas eran 37 llamadas; con 47 ya eran 48, y en cuanto Sara añadió
 * alguna más, se pasó del límite: rejilla, ficha y colecciones en blanco.
 *
 * Ahora el catálogo se resuelve con 2 llamadas en caliente:
 *   1. GET /products/              el listado (nombre, foto, descripción)
 *   2. GET /products/inventory     TODAS las variantes con su stock, de golpe
 * Lo único que el inventario no trae es el PRECIO de cada variante y sus
 * `variantOptionIds`, que siguen saliendo de GET /products/{id}/price. Esa
 * respuesta se guarda en la caché de borde 24 h por producto (el precio no
 * cambia; el stock sí, y ese viene fresco del inventario). En frío se piden
 * los que falten hasta un presupuesto de PRESUPUESTO_SUBPETICIONES; los que
 * no quepan salen esa vez con `precio: null` y se completan en la siguiente.
 *
 * Y todo va dentro de un try/catch: si algo falla, la web recibe un JSON
 * con `error` y un 5xx, nunca un 1101 sin explicación. Los fallos salen en
 * Workers → Logs con `console.error`.
 *
 * ------------------------------------------------------------------
 * CAMBIO DEL 25/8 — LA GALERÍA
 *
 * El listado `GET /products/` NO trae `medias`; solo `GET /products/{id}`.
 * Por eso la galería se resuelve solo cuando se pide una pieza (`?id=`).
 * ------------------------------------------------------------------
 */

const GHL_API = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const CACHE_SECONDS = 60;            // la respuesta completa se refresca como máximo cada minuto
const CACHE_PRECIO_SECONDS = 86400;  // el precio de cada variante, un día
const LIMITE_SUBPETICIONES = 50;     // lo que corta el plan gratuito
const PRESUPUESTO_SUBPETICIONES = 46; // margen de 4 sobre el límite

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean);
    const open = allowed.length === 0 || allowed.includes('*');
    const allowOrigin = open ? (origin || '*') : (allowed.includes(origin) ? origin : allowed[0]);
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
    };
    const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: cors });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname !== '/products' && url.pathname !== '/collections') return json({ error: 'not found' }, 404);

    try {
      return await servir(url, env, ctx, cors, json, allowOrigin);
    } catch (e) {
      // Antes esto era un «Error 1101» mudo. Ahora la web recibe JSON y el
      // motivo queda en Workers → Logs.
      console.error('mura-productos', url.pathname + url.search, e && e.stack || e);
      return json({ error: 'worker', detalle: String(e && e.message || e) }, 500);
    }
  },
};

async function servir(url, env, ctx, cors, json, allowOrigin) {
  // Caché de borde de la respuesta completa (60 s). La clave lleva la query
  // entera, así que ?id=… se cachea por separado.
  const cacheUrl = new URL(url); cacheUrl.searchParams.set('__origin', allowOrigin);
  const cacheKey = new Request(cacheUrl.toString());
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const headers = {
    Authorization: `Bearer ${env.GHL_TOKEN}`,
    Version: API_VERSION,
    Accept: 'application/json',
  };

  // Contador de subpeticiones: si nos acercamos al límite, dejamos de pedir
  // en vez de reventar.
  let usadas = 0;
  const ghl = async (path) => {
    if (usadas >= LIMITE_SUBPETICIONES - 1) throw new Error(`presupuesto de subpeticiones agotado en ${path}`);
    usadas++;
    return fetch(`${GHL_API}${path}`, { headers });
  };
  const quedan = () => PRESUPUESTO_SUBPETICIONES - usadas;

  // ---- Precios de una pieza (cada precio de GHL es una variante) ----
  // Van a la caché de borde por producto, 24 h. Devuelve null si no hay
  // presupuesto para pedirlos y no estaban en caché.
  const preciosDe = async (idPieza, { forzar = false } = {}) => {
    const k = new Request(`${url.origin}/__precio/${idPieza}`);
    if (!forzar) {
      const c = await cache.match(k);
      if (c) return c.json();
    }
    if (!forzar && quedan() <= 0) return null;
    const res = await ghl(`/products/${idPieza}/price?locationId=${env.GHL_LOCATION}&limit=100`);
    if (!res.ok) return null;
    const data = await res.json();
    const prices = data.prices || [];
    ctx.waitUntil(cache.put(k, new Response(JSON.stringify(prices), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_PRECIO_SECONDS}` },
    })));
    return prices;
  };

  // Una variante en el formato que espera la web. `inv` es la fila del
  // inventario (stock fresco); `pr` la del endpoint de precios (importe).
  // Puede faltar cualquiera de las dos.
  const aTalla = (pr, inv) => {
    const track = pr ? !!pr.trackInventory : (inv ? !!inv.trackInventory : false);
    const qty = inv ? (inv.availableQuantity ?? null) : (pr ? (pr.availableQuantity ?? null) : null);
    return {
      priceId: (pr && pr._id) || (inv && inv._id) || null,
      talla: (pr && pr.name) || (inv && inv.name) || 'Única',
      precio: pr ? pr.amount : null,
      moneda: (pr && pr.currency) || 'EUR',
      stock: track ? (qty ?? 0) : null, // null = sin control de stock
      variantOptionIds: (pr && pr.variantOptionIds) || [],
      trackInventory: track,
      availableQuantity: qty,
      allowOutOfStockPurchases: !!((pr && pr.allowOutOfStockPurchases) || (inv && inv.allowOutOfStockPurchases)),
      type: (pr && pr.type) || 'one_time',
    };
  };

  const aPieza = (p, tallas) => {
    const total = tallas.reduce((a, t) => a + (t.stock ?? 99), 0);
    return {
      id: p._id,
      nombre: p.name,
      descripcion: p.description || '',
      imagenes: [...new Set([
        p.image,
        ...(p.medias || []).filter((m) => (m.type || 'image') === 'image').map((m) => m.url),
      ].filter(Boolean))],
      coleccion: (p.collectionIds && p.collectionIds[0]) || null,
      coleccionIds: p.collectionIds || [],
      creado: p.createdAt || null,
      tallas,
      estado: total === 0 ? 'agotado' : total <= 3 ? 'ultimas' : 'disponible',
    };
  };

  const guardar = (res) => { ctx.waitUntil(cache.put(cacheKey, res.clone())); return res; };

  // ---- Colecciones ----
  if (url.pathname === '/collections') {
    const colRes = await ghl(`/products/collections?altId=${env.GHL_LOCATION}&altType=location&limit=100`);
    if (!colRes.ok) return json({ error: 'ghl_collections', status: colRes.status }, 502);
    const colData = await colRes.json();
    const rawCols = colData.data || colData.collections || [];
    const cols = await Promise.all(rawCols.map(async (c) => {
      const cid = c._id || c.id;
      let piezaIds = [];
      try {
        const inCol = await ghl(`/products/?locationId=${env.GHL_LOCATION}&limit=100&collectionIds=${cid}`);
        if (inCol.ok) piezaIds = ((await inCol.json()).products || []).map((p) => p._id);
      } catch (e) { /* colección sin piezas o sin presupuesto */ }
      return { id: cid, nombre: c.name, slug: c.slug || null, imagen: c.image || null, piezaIds };
    }));
    return guardar(json({ actualizado: new Date().toISOString(), colecciones: cols }));
  }

  // ---- Una sola pieza, CON galería (la ficha) ----
  // 2 subpeticiones: detalle + precios (aquí sí se piden siempre, para que
  // la ficha tenga el stock al minuto).
  const idPieza = url.searchParams.get('id');
  if (idPieza) {
    const [detRes, prices] = await Promise.all([
      ghl(`/products/${idPieza}?locationId=${env.GHL_LOCATION}`),
      preciosDe(idPieza, { forzar: true }),
    ]);
    if (!detRes.ok) return json({ error: 'ghl_product', status: detRes.status }, detRes.status === 404 ? 404 : 502);
    const p = await detRes.json();
    const tallas = (prices || []).map((pr) => aTalla(pr, null));
    return guardar(json({ actualizado: new Date().toISOString(), piezas: [aPieza(p, tallas)] }));
  }

  // ---- Catálogo completo (la rejilla) ----
  // 1. Listado
  const prodRes = await ghl(`/products/?locationId=${env.GHL_LOCATION}&limit=100`);
  if (!prodRes.ok) return json({ error: 'ghl_products', status: prodRes.status }, 502);
  const products = ((await prodRes.json()).products || []);

  // 2. Inventario: todas las variantes con stock en una o dos llamadas
  const invPorPrecio = new Map();   // priceId → fila
  const invPorProducto = new Map(); // productId → filas
  let inventarioOk = false;
  try {
    for (let offset = 0, total = Infinity; offset < total && offset < 1000; offset += 100) {
      const invRes = await ghl(`/products/inventory?altId=${env.GHL_LOCATION}&altType=location&limit=100&offset=${offset}`);
      if (!invRes.ok) break;
      const d = await invRes.json();
      const filas = d.inventory || d.data || [];
      for (const f of filas) {
        invPorPrecio.set(f._id, f);
        if (!invPorProducto.has(f.product)) invPorProducto.set(f.product, []);
        invPorProducto.get(f.product).push(f);
      }
      inventarioOk = true;
      const t = Array.isArray(d.total) ? (d.total[0] && d.total[0].total) : d.total;
      total = typeof t === 'number' ? t : (filas.length < 100 ? offset + filas.length : Infinity);
      if (filas.length === 0) break;
    }
  } catch (e) { console.error('inventario', e && e.message || e); }

  // 3. Precios: de caché; los que falten, de GHL hasta donde llegue el presupuesto.
  //    Primero los que ya están en caché (gratis), después los que faltan.
  const precios = new Map();
  const faltan = [];
  for (const p of products) {
    const c = await cache.match(new Request(`${url.origin}/__precio/${p._id}`));
    if (c) precios.set(p._id, await c.json()); else faltan.push(p._id);
  }
  // En paralelo por lotes, sin pasarnos: cada lote cabe en lo que queda.
  while (faltan.length && quedan() > 0) {
    const lote = faltan.splice(0, Math.min(faltan.length, quedan(), 15));
    const res = await Promise.all(lote.map((id) => preciosDe(id).catch(() => null)));
    lote.forEach((id, i) => { if (res[i]) precios.set(id, res[i]); });
  }
  if (faltan.length) console.error(`sin presupuesto para los precios de ${faltan.length} piezas; saldrán en la siguiente petición`);

  // 4. Montar cada pieza: precio de `precios`, stock del inventario.
  const piezas = products.map((p) => {
    const prs = precios.get(p._id);
    let tallas;
    if (prs && prs.length) {
      tallas = prs.map((pr) => aTalla(pr, invPorPrecio.get(pr._id) || null));
    } else if (inventarioOk && invPorProducto.has(p._id)) {
      tallas = invPorProducto.get(p._id).map((inv) => aTalla(null, inv));
    } else {
      tallas = [];
    }
    return aPieza(p, tallas);
  });

  return guardar(json({
    actualizado: new Date().toISOString(),
    piezas,
    // Para depurar desde el navegador: cuántas llamadas costó y si quedó algo pendiente.
    _subpeticiones: usadas,
    _sinPrecio: faltan.length,
  }));
}
