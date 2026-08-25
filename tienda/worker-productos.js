/**
 * MÛRA · Puente de productos GHL
 * Cloudflare Worker (plan gratuito es suficiente)
 *
 * Expone:  GET /products         JSON con las piezas (nombre, precio, tallas, stock, imágenes, colección)
 *          GET /products?id=…    UNA pieza, con TODA su galería  ← 25/8
 *          GET /collections      JSON con las colecciones de la tienda
 *
 * Variables de entorno a configurar en el Worker (Settings → Variables):
 *   GHL_TOKEN       Token de integración privada (scopes: View Products, View Product Prices,
 *                   View Product Collections)
 *   GHL_LOCATION    Location ID de la subcuenta de MÛRA
 *   ALLOWED_ORIGIN  (opcional) lista de dominios permitidos separados por comas,
 *                   p. ej. "https://stylebymura.com". Vacía o "*" = cualquier origen
 *                   (recomendado durante la fase de diseño; restringir al publicar).
 *
 * ------------------------------------------------------------------
 * CAMBIO DEL 25/8 — LA GALERÍA
 *
 * La ficha de producto enseñaba UNA foto por pieza, en las 36. La causa
 * estaba aquí: `imagenes` se construía con `p.medias`, pero `p` viene de
 * `GET /products/` —el listado—, y ese endpoint NO TRAE el campo `medias`.
 * No es que llegue vacío: no existe. Así que la línea siempre se quedaba
 * en `[p.image]`, la foto destacada.
 *
 *     GET /products/?locationId=…    image ✓   medias → no existe
 *     GET /products/{id}?locationId= image ✓   medias → las 5
 *
 * Comprobado también que el listado no admite pedirlo (`expand`, `include`,
 * `includeMedias`, `fields`: ninguno lo devuelve).
 *
 * ⚠️ POR QUÉ NO SE ENRIQUECEN TODAS LAS PIEZAS
 * Lo evidente sería pedir el detalle de las 36 en el mismo Promise.all.
 * Serían 1 + 36 + 36 = 73 subpeticiones, y el plan gratuito de Workers
 * corta en 50 por petición: el catálogo entero dejaría de responder.
 * Hoy son 37 y hay margen justo.
 *
 * Por eso la galería se resuelve SOLO cuando se pide una pieza concreta
 * (`?id=`), que es la única pantalla que la necesita: detalle + precio,
 * 2 subpeticiones. La rejilla sigue con una foto por tarjeta y su llamada
 * única, que es lo que necesita.
 * ------------------------------------------------------------------
 */

const GHL_API = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const CACHE_SECONDS = 60; // el stock se refresca como máximo cada minuto

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean);
    const open = allowed.length === 0 || allowed.includes('*');
    // Refleja el Origin de la petición si está permitido (nunca falla por origen desconocido en fase abierta)
    const allowOrigin = open ? (origin || '*') : (allowed.includes(origin) ? origin : allowed[0]);
    const cors = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname !== '/products' && url.pathname !== '/collections') return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: cors });

    // Caché de borde: no golpeamos la API de GHL en cada visita.
    // La clave lleva la query entera, así que ?id=… se cachea por separado.
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

    // Tallas de un producto. Cada precio de GHL es una variante.
    const tallasDe = async (idPieza) => {
      const priceRes = await fetch(`${GHL_API}/products/${idPieza}/price?locationId=${env.GHL_LOCATION}&limit=100`, { headers });
      const priceData = priceRes.ok ? await priceRes.json() : { prices: [] };
      return (priceData.prices || []).map((pr) => ({
        priceId: pr._id,
        talla: pr.name || 'Única',
        precio: pr.amount,
        moneda: pr.currency || 'EUR',
        stock: pr.trackInventory ? (pr.availableQuantity ?? 0) : null, // null = sin control de stock
        // campos crudos para poder escribir el carrito nativo de GHL desde la ficha custom
        variantOptionIds: pr.variantOptionIds || [],
        trackInventory: !!pr.trackInventory,
        availableQuantity: pr.availableQuantity ?? null,
        allowOutOfStockPurchases: !!pr.allowOutOfStockPurchases,
        type: pr.type || 'one_time',
      }));
    };

    // Una pieza en el formato que espera la web.
    // La destacada va PRIMERA y el Set quita el duplicado si además está en
    // la galería: así la portada de la ficha es la misma que la de la rejilla.
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
        // La colección/cápsula se lee del campo "collectionIds" o de una etiqueta en el nombre interno
        coleccion: (p.collectionIds && p.collectionIds[0]) || null,
        coleccionIds: p.collectionIds || [],
        creado: p.createdAt || null,
        tallas,
        estado: total === 0 ? 'agotado' : total <= 3 ? 'ultimas' : 'disponible',
      };
    };

    if (url.pathname === '/collections') {
      const colRes = await fetch(`${GHL_API}/products/collections?altId=${env.GHL_LOCATION}&altType=location&limit=100`, { headers });
      if (!colRes.ok) {
        return new Response(JSON.stringify({ error: 'ghl_collections', status: colRes.status }), { status: 502, headers: cors });
      }
      const colData = await colRes.json();
      const rawCols = colData.data || colData.collections || [];
      // Piezas de cada colección (el listado de productos no trae collectionIds,
      // así que consultamos la membresía aquí, una petición por colección)
      const cols = await Promise.all(rawCols.map(async (c) => {
        const cid = c._id || c.id;
        let piezaIds = [];
        try {
          const inCol = await fetch(`${GHL_API}/products/?locationId=${env.GHL_LOCATION}&limit=100&collectionIds=${cid}`, { headers });
          if (inCol.ok) {
            const inColData = await inCol.json();
            piezaIds = (inColData.products || []).map((p) => p._id);
          }
        } catch (e) { /* colección sin piezas */ }
        return {
          id: cid,
          nombre: c.name,
          slug: c.slug || null,
          imagen: c.image || null,
          piezaIds,
        };
      }));
      const colBody = JSON.stringify({ actualizado: new Date().toISOString(), colecciones: cols });
      const colOut = new Response(colBody, { headers: cors });
      ctx.waitUntil(cache.put(cacheKey, colOut.clone()));
      return colOut;
    }

    // ---- Una sola pieza, CON galería (la ficha de producto) ----
    const idPieza = url.searchParams.get('id');
    if (idPieza) {
      const [detRes, tallas] = await Promise.all([
        fetch(`${GHL_API}/products/${idPieza}?locationId=${env.GHL_LOCATION}`, { headers }),
        tallasDe(idPieza),
      ]);
      if (detRes.ok) {
        const p = await detRes.json();
        const body = JSON.stringify({ actualizado: new Date().toISOString(), piezas: [aPieza(p, tallas)] });
        const out = new Response(body, { headers: cors });
        ctx.waitUntil(cache.put(cacheKey, out.clone()));
        return out;
      }
      // Si el detalle falla, se sigue por el camino de siempre: la ficha
      // se verá con una foto, pero se verá.
    }

    // ---- Catálogo completo (la rejilla) ----
    // 1. Lista de productos de la location
    const prodRes = await fetch(`${GHL_API}/products/?locationId=${env.GHL_LOCATION}&limit=100`, { headers });
    if (!prodRes.ok) {
      return new Response(JSON.stringify({ error: 'ghl_products', status: prodRes.status }), { status: 502, headers: cors });
    }
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    // 2. Precios/variantes de cada producto (en paralelo).
    //    Aquí NO se pide el detalle de cada pieza: serían 36 subpeticiones
    //    más y el plan gratuito corta en 50. La galería la sirve ?id=.
    const withPrices = await Promise.all(products.map(async (p) => aPieza(p, await tallasDe(p._id))));

    const body = JSON.stringify({ actualizado: new Date().toISOString(), piezas: withPrices });
    const res = new Response(body, { headers: cors });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  },
};
