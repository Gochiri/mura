/* Saca el CSS de las páginas de tienda a un archivo pegable.
 *
 *   node extraer-css.js  →  css-paginas-tienda.css
 *
 * POR QUÉ EXISTE ESTO (22/8)
 * GHL no sirve el Tracking Code del Head dentro del <head>: lo deja en el
 * body y lo inyecta arriba por JavaScript cuando la app ya arrancó. Medido
 * en /checkout con `fetch(location.href)`: en el HTML servido `MURA_PARTE`
 * aparece 2 veces y NINGUNA antes de </head>. De ahí los ~10 s sin estilo.
 *
 * Lo que sí viaja en el HTML es el Custom CSS de la página. Así que el CSS
 * se pega ahí, y este script lo saca del MISMO archivo fuente que los dos
 * tracking codes, para no acabar con copias que se separan —que es justo lo
 * que costó semanas de skins duplicados.
 *
 * No parsea texto: EJECUTA el global con un DOM de mentira y se queda con
 * lo que el propio código le pasa a estilo(). Si mañana cambian los bloques
 * o las guardias de ruta, esto sigue sacando lo correcto.
 */
const fs = require('fs');
const path = require('path');

const hojas = [];

global.window = { MURA_PARTE: 'head' };
global.location = { pathname: '/checkout', search: '' };
global.MutationObserver = class { observe() {} disconnect() {} };
global.NodeFilter = { SHOW_TEXT: 4 };
global.document = {
  readyState: 'loading',
  body: null,
  documentElement: {},
  addEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createTreeWalker() { return { nextNode() { return null; } }; },
  createElement() {
    return {
      attrs: {},
      setAttribute(k, v) { this.attrs[k] = v; },
      textContent: ''
    };
  },
  head: { appendChild(el) { hojas.push(el); } }
};

/* La fuente no se añade como hoja sino como <link>, con href de propiedad y
   no de atributo. En una caja de Custom CSS no cabe un <link>, así que se
   convierte en @import — que además tiene que ir antes que ninguna regla. */
function esFuente(el) { return !!el.href; }

require(path.join(__dirname, 'codigo-global-tienda.js'));

if (!hojas.length) {
  console.error('No salió ninguna hoja: el global no llamó a estilo(). Revisa las guardias de ruta.');
  process.exit(1);
}

const cabecera = [
  '/* ============================================================',
  '   MÛRA · CSS DE LAS PÁGINAS DE TIENDA',
  '   ============================================================',
  '   GENERADO — no editar a mano. Sale de codigo-global-tienda.js:',
  '',
  '       cd tienda && node extraer-css.js',
  '',
  '   VA EN: Settings → Custom CSS de /checkout, que es la única',
  '   página nativa de tienda que se usa. /products-list,',
  '   /product-details y /thank-you existen porque la tienda de GHL',
  '   las necesita, pero la clienta ve /prendas, /producto y',
  '   /gracias. Tenerlo pegado ahí tampoco estorba.',
  '',
  '   Esa caja es por página y no hay una global; el Tracking Code',
  '   del Head no vale porque GHL no lo sirve dentro del <head>, lo',
  '   inyecta por JS cuando ya arrancó.',
  '',
  '   Sin <style>: la caja de GHL espera CSS suelto.',
  '   ============================================================ */',
  ''
].join('\n');

const fuentes = hojas.filter(esFuente);
const bloques = hojas.filter(h => !esFuente(h));

if (!bloques.length) {
  console.error('Salieron links pero ninguna hoja de estilos. Revisa las guardias de ruta.');
  process.exit(1);
}

const salida = cabecera +
  fuentes.map(f => '\n@import url("' + f.href + '");\n').join('') +
  bloques
    .map(h => '\n/* ---------- bloque: ' + h.attrs['data-mura'] + ' ---------- */\n' + h.textContent)
    .join('\n') + '\n';

const destino = path.join(__dirname, 'css-paginas-tienda.css');
fs.writeFileSync(destino, salida, 'utf8');
console.log(
  'css-paginas-tienda.css generado (' + Buffer.byteLength(salida) + ' bytes) · bloques: ' +
  bloques.map(h => h.attrs["data-mura"]).join(", ")
);
