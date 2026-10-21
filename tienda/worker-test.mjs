// Prueba local del Worker con `fetch` y `caches` simulados.
//   node tienda/worker-test.mjs
// Comprueba que /products nunca pasa de 50 subpeticiones aunque haya 60
// productos, que el formato de salida es el de siempre, que la caché de
// precios deja el catálogo en 2 llamadas en caliente, y que un fallo de GHL
// sale como JSON y no como excepción.

import worker from './worker-productos.js';
import assert from 'node:assert/strict';

const N = 60; // productos: más que el límite del plan gratuito
const products = Array.from({ length: N }, (_, i) => ({ _id: `p${i}`, name: `Pieza ${i}`, image: `img${i}.jpg`, description: '' }));
const inventory = products.flatMap((p, i) => ['S', 'M', 'L'].map((t, j) => ({ _id: `${p._id}-${t}`, product: p._id, name: t, availableQuantity: j, trackInventory: true, productName: p.name })));
const precios = (id) => ['S', 'M', 'L'].map((t) => ({ _id: `${id}-${t}`, name: t, amount: 79, currency: 'EUR', trackInventory: true, availableQuantity: 9, variantOptionIds: [`talla-${t.toLowerCase()}`], type: 'one_time' }));

let llamadas = 0, modo = 'ok';
globalThis.fetch = async (u) => {
  llamadas++;
  const url = new URL(u);
  if (modo === 'caido') return new Response('upstream down', { status: 503 });
  if (modo === 'explota') throw new Error('Too many subrequests');
  if (url.pathname === '/products/') return Response.json({ products, total: [{ total: N }] });
  if (url.pathname === '/products/inventory') {
    const off = Number(url.searchParams.get('offset') || 0);
    return Response.json({ inventory: inventory.slice(off, off + 100), total: [{ total: inventory.length }] });
  }
  let m = url.pathname.match(/^\/products\/([^/]+)\/price$/);
  if (m) return Response.json({ prices: precios(m[1]) });
  m = url.pathname.match(/^\/products\/([^/]+)$/);
  if (m) return Response.json({ ...products.find((p) => p._id === m[1]), medias: [{ type: 'image', url: 'g1.jpg' }] });
  return new Response('nf', { status: 404 });
};

const store = new Map();
// En Cloudflare las operaciones de la Cache API cuentan como subpeticiones:
// se suman a `llamadas` igual que los fetch.
globalThis.caches = { default: {
  async match(req) { llamadas++; const r = store.get(req.url); return r ? r.clone() : undefined; },
  async put(req, res) { llamadas++; store.set(req.url, res); },
} };

const env = { GHL_TOKEN: 'x', GHL_LOCATION: 'loc', ALLOWED_ORIGIN: '*' };
const ctx = { waitUntil: (p) => { ctx.pend.push(p); }, pend: [] };
const pedir = async (path) => { llamadas = 0; const r = await worker.fetch(new Request('https://w.test' + path), env, ctx); await Promise.all(ctx.pend.splice(0)); return { r, body: await r.json(), llamadas }; };

// 1. Frío: 60 productos, nunca más de 50 llamadas, y sale JSON válido
let { r, body, llamadas: l } = await pedir('/products');
assert.equal(r.status, 200);
assert.ok(l < 50, `frío: ${l} llamadas`);
assert.equal(body.piezas.length, N);
const conPrecio = body.piezas.filter((p) => p.tallas[0] && p.tallas[0].precio != null).length;
assert.ok(conPrecio >= 38, `frío: solo ${conPrecio} con precio`);
// las que no cupieron llevan igualmente tallas y stock del inventario
const sin = body.piezas.find((p) => p.tallas[0] && p.tallas[0].precio == null);
if (sin) { assert.equal(sin.tallas.length, 3); assert.equal(sin.tallas[1].stock, 1); }
console.log(`frío: ${l} llamadas, ${conPrecio}/${N} con precio, ${body._sinPrecio} pendientes`);
// formato de una talla completa
const t = body.piezas[0].tallas[0];
assert.deepEqual(Object.keys(t).sort(), ['allowOutOfStockPurchases', 'availableQuantity', 'moneda', 'precio', 'priceId', 'stock', 'talla', 'trackInventory', 'type', 'variantOptionIds']);
assert.equal(t.stock, 0); // el stock sale del inventario (0,1,2), no de precios (9)
assert.equal(body.piezas[0].estado, 'ultimas');

// 2. Segunda petición (caché de respuesta 60 s): 0 llamadas
({ r, body, llamadas: l } = await pedir('/products'));
assert.equal(l, 1, 'caché de respuesta: solo el match');

// 3. Caliente sin caché de respuesta: 2 llamadas + lo que faltara de precios
store.delete('https://w.test/products?__origin=*');
({ r, body, llamadas: l } = await pedir('/products'));
assert.ok(l < 50, `caliente: ${l} llamadas`);
assert.equal(body.piezas.filter((p) => p.tallas[0].precio != null).length, N, 'caliente: todas con precio');
store.delete('https://w.test/products?__origin=*');
({ llamadas: l } = await pedir('/products'));
// listado + inventario paginado de 100 en 100 (180 variantes → 2 páginas)
// match respuesta + listado + inventario (2 páginas) + match precios + put respuesta
assert.equal(l, 1 + 1 + Math.ceil(inventory.length / 100) + 1 + 1, `caliente del todo: ${l} llamadas`);
console.log(`caliente: ${l} llamadas (listado + inventario), todas con precio`);

// 4. Una pieza: 2 llamadas, con galería y precio
({ r, body, llamadas: l } = await pedir('/products?id=p3'));
assert.equal(l, 4); assert.equal(body.piezas[0].imagenes.length, 2); assert.equal(body.piezas[0].tallas[0].precio, 79);

// 5. GHL caído: JSON con error, no excepción
store.clear(); modo = 'caido';
({ r, body } = await pedir('/products'));
assert.equal(r.status, 502); assert.equal(body.error, 'ghl_products');
({ r, body } = await pedir('/collections'));
assert.equal(r.status, 502);

// 6. Excepción dentro: JSON 500, no 1101
modo = 'explota';
({ r, body } = await pedir('/products'));
assert.equal(r.status, 500); assert.equal(body.error, 'worker');
assert.match(body.detalle, /subrequests/);

console.log('ok: todas las comprobaciones pasan');
