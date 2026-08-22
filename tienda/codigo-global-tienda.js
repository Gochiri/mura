/* ============================================================
   MÛRA · CÓDIGO GLOBAL DE LA TIENDA
   ============================================================
   ESTE ARCHIVO SE PEGA EN DOS SITIOS. Genera los dos pegables:

       cd tienda && ./build.sh

     tracking-code-head.html → Settings → Tracking Code → HEAD
     tracking-code-body.html → Settings → Tracking Code → BODY

   ------------------------------------------------------------
   POR QUÉ DOS, Y NO UNO (17/8)

   En /checkout el CSS tardaba unos segundos en aparecer: se veía
   el formulario con el estilo de GHL y luego cambiaba al nuestro.

   El CSS no llegaba tarde por sí mismo —se inyecta síncrono, en
   cuanto corre el script—. Lo que llegaba tarde era EL SCRIPT: el
   Tracking Code del BODY lo mete GHL dentro de un
   <div id="gb-track-hl-custom-code"> del propio body, y el
   checkout lo pinta el bundle de la tienda antes de que nosotros
   lleguemos.

   Así que el CSS se muda al HEAD, que el navegador tiene antes de
   pintar nada, y en el BODY se queda solo lo que necesita que el
   DOM exista.

   El archivo fuente sigue siendo UNO —el sentido de la sección
   27.7 era dejar de tener copias del CSS repartidas—. `build.sh`
   envuelve el mismo código dos veces cambiando `MURA_PARTE`, y
   cada bloque mira esa constante. Los dos pegables llevan el
   código entero y solo se diferencian en esa línea: es a
   propósito, para no partir el archivo con marcadores de texto,
   que es la clase de build que se rompe en silencio.

   Si falta la constante (por ejemplo, abriendo este .js a pelo),
   `MURA_PARTE` vale 'todo' y se comporta como antes del cambio.

   ------------------------------------------------------------
   QUÉ HACE CADA PARTE

     HEAD (CSS, nada toca el DOM)
       1. Sistema de diseño `.mura-*`   → todas las páginas
       2. CSS de la encuesta            → solo /experiencia
       3. CSS del buscador              → rutas de rejilla
       4. CSS que pisa la tienda de GHL → rutas de tienda

     BODY (necesita el DOM)
       5. Contador del carrito          → todas las páginas
       6. Buscador de la rejilla        → rutas de rejilla
       7. Cabecera inyectada + idioma   → rutas de tienda

   El redirect de /cart va lo primero y en las dos partes: cuanto
   antes salte, menos se ve el carrito viejo.

   ------------------------------------------------------------
   POR QUÉ EL CSS SE MOVIÓ AQUÍ (15/8)

   El bloque `.mura-*` estaba copiado dentro del código de cada
   página. Eso significaba que en el carrito viajaban reglas de
   `.mura-grid`, `.mura-card`, `.mura-filtros` y `.mura-acc` que
   allí no pintan nada, y sobre todo que cualquier retoque de
   marca había que repetirlo página por página: basta olvidar una
   para que diverjan sin que nadie se entere.

   Ahora vive aquí una sola vez y cada página se queda solo con su
   HTML.

   LA MIGRACIÓN ES SEGURA DE HACER POCO A POCO. Mientras una
   página conserve su copia del CSS, las reglas están duplicadas
   pero son idénticas, así que no pasa nada. Se puede pegar esto
   primero y ya ir vaciando páginas una a una. Las que llevan
   copia propia:
     /carrito · /prendas · /producto · /colecciones · /novedades
     /home · /mura · /contacto · /devoluciones · /gracias
   De cada una se borra solo el bloque <style>…</style> de su
   elemento de código. El HTML se queda.

   ⚠️ NO borrar el <style> de una página sin haber pegado antes
   este archivo, o esa página se queda en crudo.

   ------------------------------------------------------------
   CLASES DE INSTANCIA — no usarlas nunca:
   `.cstore-cart-J14MT1D5-f`, `.cstore-checkout-sTf_Fd0JV5` y
   compañía llevan el id del elemento dentro. Si alguien recrea el
   elemento en el editor ese sufijo cambia y el CSS deja de
   aplicar en silencio. Se usan `.c-store-cart` y las `hl-…`, que
   son estables.
   ============================================================ */

(function () {
  var PARTE = (typeof window !== 'undefined' && window.MURA_PARTE) || 'todo';
  var HAY_CSS = PARTE === 'head' || PARTE === 'todo';
  var HAY_DOM = PARTE === 'body' || PARTE === 'todo';
  /* La traducción va con el HEAD, no con el BODY: tiene que estar
     escuchando ANTES de que el bundle de la tienda pinte, o el texto
     en inglés se ve un instante. Ver la sección 9. */
  var HAY_TRAD = HAY_CSS;

  var path = location.pathname.replace(/\/+$/, '');
  var RUTAS_TIENDA = ['/products-list', '/product-details', '/checkout', '/thank-you'];
  var RUTAS_REJILLA = ['/prendas', '/colecciones', '/novedades'];
  var esTienda = RUTAS_TIENDA.indexOf(path) !== -1;
  var esRejilla = RUTAS_REJILLA.indexOf(path) !== -1;

  /* ============================================================
     0 · /cart se retira: el carrito bueno es /carrito
     ============================================================
     No se puede borrar la página: la tienda de GHL necesita su
     paso de carrito y tiene enlaces internos que apuntan ahí —el
     "Editar" del resumen del checkout, sin ir más lejos—.

     Va lo primero y EN LAS DOS PARTES: desde el head salta antes
     de que se pinte nada. Con `replace` en vez de `href`, así no
     deja entrada en el historial y el botón "atrás" no devuelve a
     la clienta al carrito viejo. No hay bucle posible, /carrito
     no entra aquí. */

  if (path === '/cart') {
    location.replace('/carrito' + location.search);
    return;
  }

  /* Inyecta una hoja una sola vez. El guardia por `data-mura` importa:
     si alguien pega el mismo bloque en head y en body, o `MURA_PARTE`
     se queda en 'todo' por error, no se duplican las reglas. */
  function estilo(nombre, css) {
    if (document.querySelector('style[data-mura="' + nombre + '"]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-mura', nombre);
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ============================================================
     1 · SISTEMA DE DISEÑO `.mura-*` — todas las páginas
     ============================================================
     Todo va prefijado, así que aplicarlo en todo el sitio no pisa
     nada del tema de GHL: solo toca elementos que llevan estas
     clases, y esos los ponemos nosotros. */

  var sistema = [
    '.mura, .mura *, .mura *::before, .mura *::after { box-sizing: border-box; }',
    ".mura { background: #F0EEE8; color: #1D1B18; font-family: 'Jost', sans-serif; font-weight: 300; margin: 0; -webkit-font-smoothing: antialiased; }",
    ".mura h1, .mura h2, .mura h3, .mura .mura-serif { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; margin: 0; }",
    '.mura p { margin: 0; }',
    '.mura a { color: #1D1B18; text-decoration: none; transition: color .2s ease; }',
    '.mura a:hover { color: #6E6A61; }',

    /* full-bleed dentro del contenedor de GHL */
    '.mura { width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); overflow-x: clip; }',

    /* ---- Cabecera ----
       Las reglas de enlace se repiten aquí a propósito, sin depender de
       `.mura`. En las páginas propias la cabecera va dentro de
       <div class="mura"> y heredaba de `.mura a`; en las de tienda la
       insertamos suelta en el <body>, así que sin esto los enlaces salían
       subrayados y en el color del tema. */
    '.mura-nav { position: sticky; top: 0; z-index: 50; background: rgba(240,238,232,.92); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(29,27,24,.08); }',
    '.mura-nav, .mura-nav * { box-sizing: border-box; }',
    '.mura-nav a { text-decoration: none !important; color: #1D1B18; transition: color .2s ease; }',
    '.mura-nav a:hover { color: #6E6A61; }',
    '.mura-nav-in { max-width: 1440px; margin: 0 auto; padding: 0 clamp(20px,4vw,56px); height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }',
    ".mura-logo { font-family: 'Cormorant Garamond', serif !important; font-size: 26px; font-weight: 500; letter-spacing: .32em; color: #1D1B18 !important; }",
    '.mura-links { display: flex; align-items: center; gap: clamp(16px,2.6vw,38px); font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; }',
    '.mura-links a { color: #55524B; }',
    '.mura-links a.on { color: #1D1B18; }',
    '.mura-cart { font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; color: #1D1B18 !important; white-space: nowrap; }',
    '@media (max-width: 719px) { .mura-links a.hm { display: none; } }',
    /* A 390 px el "CARRITO (n)" se salía y lo cortaba el overflow-x:clip de
       .mura: quedaba "CARRITO (5" sin cerrar el paréntesis. */
    '@media (max-width: 440px) { .mura-nav-in { padding: 0 16px; gap: 12px; } .mura-logo { font-size: 21px; letter-spacing: .24em; } .mura-links { gap: 14px; font-size: 10.5px; } .mura-cart { font-size: 10.5px; letter-spacing: .12em; } }',

    /* ---- Piezas sueltas ---- */
    '.mura-label { font-size: 11px; letter-spacing: .3em; text-transform: uppercase; color: #8A857B; }',
    ".mura-btn { display: flex; align-items: center; justify-content: center; height: 56px; border: none; background: #1D1B18; color: #F0EEE8 !important; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: .24em; text-transform: uppercase; font-weight: 300; transition: background .2s ease; width: 100%; }",
    '.mura-btn:hover { background: #38352F; }',
    '.mura-link-u { font-size: 11.5px; letter-spacing: .22em; text-transform: uppercase; border-bottom: 1px solid #1D1B18; padding-bottom: 6px; }',

    /* ---- Rejilla de producto ---- */
    '.mura-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(260px,100%),1fr)); gap: clamp(28px,3vw,44px) clamp(14px,1.6vw,22px); }',
    '.mura-card { display: flex; flex-direction: column; gap: 16px; color: #1D1B18 !important; }',
    '.mura-card-img { position: relative; aspect-ratio: 3/4; background: #E3DFD6; overflow: hidden; }',
    '.mura-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }',
    '.mura-badge { position: absolute; top: 14px; left: 14px; background: rgba(240,238,232,.92); padding: 6px 12px; font-size: 9.5px; letter-spacing: .2em; text-transform: uppercase; }',
    ".mura-card-name { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 500; text-align: center; }",
    '.mura-card-price { font-size: 12px; letter-spacing: .14em; color: #55524B; text-align: center; }',

    /* ---- Filtros, tallas y acordeón ---- */
    '.mura-filtros { display: flex; justify-content: center; gap: clamp(18px,3vw,36px); flex-wrap: wrap; padding: 0 20px clamp(36px,4vw,56px); }',
    ".mura-filtros button { border: none; background: transparent; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 11.5px; letter-spacing: .2em; text-transform: uppercase; font-weight: 300; color: #8A857B; padding: 10px 2px 8px; border-bottom: 1px solid transparent; }",
    '.mura-filtros button.on { color: #1D1B18; border-bottom-color: #1D1B18; }',
    ".mura-talla { min-width: 52px; height: 48px; padding: 0 14px; border: 1px solid rgba(29,27,24,.25); background: transparent; color: #1D1B18; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: .14em; font-weight: 300; }",
    '.mura-talla.on { border-color: #1D1B18; background: #1D1B18; color: #F0EEE8; }',
    '.mura-talla:disabled { color: #B9B4A9; text-decoration: line-through; cursor: default; }',
    '.mura-acc { border-bottom: 1px solid rgba(29,27,24,.14); }',
    ".mura-acc > button { width: 100%; display: flex; justify-content: space-between; align-items: center; border: none; background: transparent; cursor: pointer; padding: 20px 2px; font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; font-weight: 300; color: #1D1B18; }",
    '.mura-acc > div { display: none; padding: 0 2px 24px; font-size: 13.5px; line-height: 2; color: #55524B; white-space: pre-line; }',
    '.mura-acc.open > div { display: block; }',

    /* ---- Líneas del carrito ---- */
    '.mura-qty { display: flex; align-items: center; border: 1px solid rgba(29,27,24,.25); height: 40px; }',
    ".mura-qty button { width: 38px; height: 100%; border: none; background: transparent; cursor: pointer; color: #1D1B18; font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 300; line-height: 1; transition: background .2s ease; }",
    '.mura-qty button:hover { background: rgba(29,27,24,.06); }',
    '.mura-qty span { min-width: 34px; text-align: center; font-size: 13px; letter-spacing: .08em; }',
    ".mura-quitar { border: none; background: transparent; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; font-weight: 300; color: #8A857B; padding: 0; }",
    '.mura-quitar:hover { color: #1D1B18; }',
    '.mura-linea { display: flex; gap: 16px; align-items: center; }',
    '.mura-linea-acc { display: flex; align-items: center; gap: clamp(14px,2vw,26px); }',
    '@media (max-width: 560px) { .mura-linea { flex-wrap: wrap; } .mura-linea-acc { width: 100%; justify-content: space-between; padding-left: 88px; } }',

    /* ---- Newsletter (sección de /home) ---- */
    '.mura-nl { max-width: 1120px; margin: 0 auto; padding: clamp(70px,9vw,120px) clamp(20px,4vw,56px); text-align: center; }',
    '.mura-nl form { text-align: left; margin-top: clamp(32px,4vw,44px); }',

    /* Dos columnas: ventajas a la izquierda, formulario a la derecha.
       Por debajo de 860 px se apilan — a esa anchura los campos en pareja
       (nombre/apellidos, teléfono/fecha) ya salen estrechísimos. */
    '.mura-nl-2col { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,5vw,88px); align-items: start; text-align: left; margin-top: clamp(48px,6vw,80px); }',
    '.mura-nl-2col form { margin-top: 0; }',
    '@media (max-width: 860px) { .mura-nl-2col { grid-template-columns: 1fr; gap: clamp(36px,6vw,52px); } }',
    '.mura-nl-rule { width: 36px; height: 1px; background: #1D1B18; margin: 20px 0 30px; }',
    '.mura-nl-ventajas ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }',
    '.mura-nl-ventajas li { position: relative; padding-left: 28px; font-size: 13.5px; line-height: 1.7; color: #55524B; }',
    ".mura-nl-ventajas li::before { content: '\\2713'; position: absolute; left: 0; top: 0; color: #8A857B; font-size: 12px; }",
    '.mura-nl-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }',
    '@media (max-width: 560px) { .mura-nl-fila { grid-template-columns: 1fr; } }',
    '.mura-nl-campo { margin-bottom: 18px; }',
    '.mura-nl-campo label { display: block; font-size: 10.5px; letter-spacing: .18em; text-transform: uppercase; color: #55524B; padding-bottom: 8px; }',
    ".mura-nl-campo input { width: 100%; height: 50px; padding: 0 14px; border: 1px solid rgba(29,27,24,.25); background: transparent; color: #1D1B18; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300; border-radius: 0; -webkit-appearance: none; appearance: none; }",
    '.mura-nl-campo input:focus { outline: none; border-color: #1D1B18; }',
    '.mura-nl-campo input::placeholder { color: rgba(29,27,24,.4); }',
    /* el icono nativo del date picker, en tinta y no en azul del sistema */
    '.mura-nl-campo input[type=date] { color-scheme: light; }',
    '.mura-nl-consent { display: flex; gap: 12px; align-items: flex-start; margin: 6px 0 26px 0; font-size: 12.5px; line-height: 1.7; color: #55524B; }',
    '.mura-nl-consent input { accent-color: #1D1B18; width: 15px; height: 15px; margin-top: 3px; flex: 0 0 auto; }',
    '.mura-nl-consent a { color: #55524B; border-bottom: 1px solid rgba(29,27,24,.3); }',
    '.mura-nl-estado { margin-top: 18px; font-size: 13.5px; line-height: 1.7; }',
    '.mura-nl-estado.err { color: #7A2E2E; }',

    /* ---- Pie ---- */
    '.mura-foot { border-top: 1px solid rgba(29,27,24,.12); }',
    '.mura-foot-in { max-width: 1440px; margin: 0 auto; padding: clamp(70px,8vw,110px) clamp(20px,4vw,56px) 30px; }',
    '.mura-foot-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: clamp(36px,5vw,72px); }',
    '.mura-foot-h { font-size: 11px; letter-spacing: .28em; text-transform: uppercase; font-weight: 400; margin-bottom: 18px; }',
    '.mura-foot-c { display: flex; flex-direction: column; gap: 12px; font-size: 13px; }',
    '.mura-foot-c a { color: #55524B; }',
    '.mura-foot-c a:hover { color: #1D1B18; }'
  ].join('\n');

  if (HAY_CSS) {
    /* La fuente, con el CSS y no después: si el <link> entrara por el body,
       el primer pintado saldría con la tipografía del tema y cambiaría al
       cargar. Es el mismo parpadeo que estamos quitando, en pequeño. */
    var fuente = document.createElement('link');
    fuente.rel = 'stylesheet';
    fuente.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Jost:wght@200;300;400&display=swap';
    document.head.appendChild(fuente);

    estilo('sistema', sistema);
  }

  /* ============================================================
     5 · CONTADOR DEL CARRITO — todas las páginas
     ============================================================
     Se define aquí arriba porque lo usan tanto las páginas que ya
     traen su cabecera como la que inyectamos más abajo. */

  var CARRITO_KEY = 'cart_details_rlc7iAyGF4U1nfwAJOJQ';

  /* ⚠️ Solo escribe si el valor CAMBIÓ. No es una optimización: esta función
     se llama desde un MutationObserver, y asignar textContent cuenta como
     mutación aunque el texto sea el mismo — sin el guard, el observer se
     dispara a sí mismo en bucle infinito y congela la página. Reproducido
     el 15/8 en Chromium: una sola mutación ajena bastaba para colgarla. */
  function pintarContador() {
    var n = 0;
    try {
      var d = JSON.parse(localStorage.getItem(CARRITO_KEY) || '{"products":[]}');
      n = (d.products || []).reduce(function (a, x) { return a + (x.quantity || 0); }, 0);
    } catch (e) { n = 0; }
    var txt = String(n);
    document.querySelectorAll('.mura-cart-n').forEach(function (e) {
      if (e.textContent !== txt) e.textContent = txt;
    });
    var disp = n > 0 ? 'inline' : 'none';
    document.querySelectorAll('.mura-cart-w').forEach(function (e) {
      if (e.style.display !== disp) e.style.display = disp;
    });
  }

  /* ============================================================
     2 · CSS de la encuesta — SOLO /experiencia
     ============================================================
     Son ~40 reglas que no pintan nada en el resto del sitio, así
     que van detrás de su propio guardia en vez de engordar el
     bloque `sistema`, que sí se carga en todas las páginas. */

  if (HAY_CSS && path === '/experiencia') {
    var encuesta = [
      '.mura-enc { max-width: 720px; margin: 0 auto; padding: clamp(56px,7vw,90px) clamp(20px,4vw,56px) clamp(80px,10vw,130px); }',
      '.mura-enc-cab { text-align: center; padding-bottom: clamp(44px,5vw,64px); }',
      '.mura-enc-cab p { font-size: 14.5px; line-height: 1.95; color: #55524B; margin-top: 18px !important; }',
      '.mura-enc-min { font-size: 11px; letter-spacing: .2em; text-transform: uppercase; color: #8A857B; margin-top: 26px !important; }',

      /* ---- Progreso ---- */
      '.mura-enc-prog { display: flex; align-items: center; gap: 16px; padding-bottom: clamp(40px,5vw,56px); }',
      '.mura-enc-prog-pista { flex: 1 1 auto; height: 1px; background: rgba(29,27,24,.14); position: relative; }',
      '.mura-enc-prog-fill { position: absolute; left: 0; top: 0; height: 1px; background: #1D1B18; transition: width .35s ease; }',
      '.mura-enc-prog-n { font-size: 10.5px; letter-spacing: .2em; text-transform: uppercase; color: #8A857B; white-space: nowrap; }',

      /* ---- Bloques: uno visible cada vez ---- */
      '.mura-enc-bloque { display: none; }',
      '.mura-enc-bloque.on { display: block; }',
      '.mura-enc-bloque > .mura-label { display: block; padding-bottom: clamp(34px,4vw,48px); }',
      '.mura-enc-preg { padding-bottom: clamp(38px,4.5vw,52px); }',
      '.mura-enc-preg:last-child { padding-bottom: 0; }',
      ".mura-enc-q { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(19px,2.2vw,23px); font-weight: 400; line-height: 1.45; padding-bottom: 20px; }",
      '.mura-enc-q i { font-style: normal; color: #8A857B; }',

      /* ---- Opciones ---- */
      '.mura-enc-ops { display: flex; flex-direction: column; gap: 2px; }',
      '.mura-enc-op { display: flex; align-items: flex-start; gap: 14px; padding: 11px 0; cursor: pointer; font-size: 14px; line-height: 1.7; color: #55524B; }',
      '.mura-enc-op:hover { color: #1D1B18; }',
      '.mura-enc-op input { accent-color: #1D1B18; width: 15px; height: 15px; margin: 4px 0 0; flex: 0 0 auto; }',

      /* ---- Estrellas ----
         Los <input> van de 5 a 1 y el contenedor en row-reverse, así el 1
         queda a la izquierda. Con ese orden, `input:checked ~ label` alcanza
         justo las estrellas de valor menor, que son las que hay que rellenar. */
      '.mura-enc-estrellas { display: inline-flex; flex-direction: row-reverse; justify-content: flex-end; gap: 8px; }',
      '.mura-enc-estrellas input { position: absolute; opacity: 0; width: 1px; height: 1px; }',
      '.mura-enc-estrellas label { cursor: pointer; font-size: 27px; line-height: 1; color: rgba(29,27,24,.20); transition: color .15s ease; }',
      '.mura-enc-estrellas input:checked ~ label, .mura-enc-estrellas input:checked + label { color: #1D1B18; }',
      '.mura-enc-estrellas label:hover, .mura-enc-estrellas label:hover ~ label { color: #6E6A61; }',
      '.mura-enc-estrellas input:focus-visible + label { outline: 1px solid #1D1B18; outline-offset: 3px; }',

      /* ---- NPS 0-10 ---- */
      '.mura-enc-nps { display: flex; flex-wrap: wrap; gap: 8px; }',
      '.mura-enc-nps input { position: absolute; opacity: 0; width: 1px; height: 1px; }',
      '.mura-enc-nps label { cursor: pointer; min-width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(29,27,24,.25); font-size: 13px; letter-spacing: .06em; color: #55524B; transition: all .15s ease; }',
      '.mura-enc-nps label:hover { border-color: #1D1B18; color: #1D1B18; }',
      '.mura-enc-nps input:checked + label { background: #1D1B18; border-color: #1D1B18; color: #F0EEE8; }',
      '.mura-enc-nps-pies { display: flex; justify-content: space-between; padding-top: 12px; font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: #8A857B; }',

      /* ---- Texto libre ---- */
      ".mura-enc-txt { width: 100%; min-height: 108px; padding: 14px; border: 1px solid rgba(29,27,24,.25); background: transparent; color: #1D1B18; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; border-radius: 0; resize: vertical; -webkit-appearance: none; appearance: none; }",
      '.mura-enc-txt:focus { outline: none; border-color: #1D1B18; }',
      ".mura-enc-linea { width: 100%; height: 50px; padding: 0 14px; border: 1px solid rgba(29,27,24,.25); background: transparent; color: #1D1B18; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300; border-radius: 0; -webkit-appearance: none; appearance: none; }",
      '.mura-enc-linea:focus { outline: none; border-color: #1D1B18; }',

      /* ---- Navegación ---- */
      '.mura-enc-navs { display: flex; align-items: center; gap: 18px; padding-top: clamp(44px,5vw,60px); border-top: 1px solid rgba(29,27,24,.14); margin-top: clamp(44px,5vw,60px); }',
      '.mura-enc-navs .mura-btn { width: auto; padding: 0 clamp(32px,4vw,52px); }',
      ".mura-enc-atras { border: none; background: transparent; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 11px; letter-spacing: .2em; text-transform: uppercase; font-weight: 300; color: #8A857B; padding: 0; }",
      '.mura-enc-atras:hover { color: #1D1B18; }',
      '.mura-enc-aviso { font-size: 13px; line-height: 1.7; color: #7A2E2E; padding-top: 16px; }',

      /* ---- Pantalla final ---- */
      '.mura-enc-fin { display: none; text-align: center; padding: clamp(60px,9vh,110px) 0; }',
      '.mura-enc-fin.on { display: block; }',
      '.mura-enc-fin p { font-size: 14.5px; line-height: 1.95; color: #55524B; margin-top: 20px !important; }',

      '@media (max-width: 480px) { .mura-enc-estrellas label { font-size: 23px; } .mura-enc-nps label { min-width: 40px; height: 40px; } .mura-enc-navs { gap: 14px; } .mura-enc-navs .mura-btn { padding: 0 26px; flex: 1 1 auto; } }'
    ].join('\n');

    estilo('encuesta', encuesta);
  }

  /* ============================================================
     2.c · Buscador de la rejilla — /prendas /colecciones /novedades
     ============================================================
     Petición de Sonia: "buscador de colección con lupa".

     ⚠️ CÓMO OCULTA, Y POR QUÉ ASÍ
     Esas páginas ya tienen los filtros `.mura-filtros`, que esconden
     y enseñan tarjetas escribiendo en `style.display`. Si el buscador
     escribiera también ahí, el último en tocar ganaría y las dos
     cosas se pisarían: buscar borraría el filtro, filtrar borraría la
     búsqueda.

     Por eso el buscador NO toca `display`: pone y quita la clase
     `.mura-oculta-busq`, que esconde con `!important`. Las dos capas
     se componen — una tarjeta se ve solo si el filtro la dejó visible
     Y además casa con lo escrito —, y al vaciar la búsqueda reaparece
     lo que el filtro tuviera puesto, sin que haya que recordarlo.

     No hace nada si la página no trae rejilla, así que es inofensivo
     si alguna de esas rutas cambia de forma. */

  if (HAY_CSS && esRejilla) {
    estilo('buscador', [
      '.mura-oculta-busq { display: none !important; }',
      '.mura-busq { max-width: 420px; margin: 0 auto clamp(30px,3.5vw,46px); padding: 0 clamp(20px,4vw,56px); }',
      '.mura-busq-caja { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(29,27,24,.25); padding-bottom: 10px; transition: border-color .2s ease; }',
      '.mura-busq-caja:focus-within { border-bottom-color: #1D1B18; }',
      '.mura-busq-caja svg { flex: 0 0 auto; width: 15px; height: 15px; stroke: #8A857B; fill: none; stroke-width: 1.4; }',
      ".mura-busq input { flex: 1 1 auto; border: none; background: transparent; color: #1D1B18; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300; letter-spacing: .1em; padding: 0; }",
      '.mura-busq input:focus { outline: none; }',
      '.mura-busq input::placeholder { color: #9B968C; letter-spacing: .16em; text-transform: uppercase; font-size: 11px; }',
      ".mura-busq-x { border: none; background: transparent; cursor: pointer; color: #8A857B; font-family: 'Jost', sans-serif; font-size: 16px; line-height: 1; padding: 0 2px; display: none; }",
      '.mura-busq-x:hover { color: #1D1B18; }',
      '.mura-busq-nada { text-align: center; font-size: 13.5px; line-height: 1.8; color: #55524B; padding: clamp(40px,6vw,70px) 20px; display: none; }'
    ].join('\n'));
  }

  function montarBuscador() {
    /* Sin tildes y en minúsculas: quien busca "cardigan" tiene que encontrar
       "Cárdigan", y quien busca "MURA" tiene que encontrar "MÛRA". */
    function llano(s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function arrancar() {
      var grid = document.querySelector('.mura-grid');
      if (!grid || grid.getAttribute('data-busq')) return false;
      var cards = grid.querySelectorAll('.mura-card');
      if (!cards.length) return false;
      grid.setAttribute('data-busq', '1');

      var caja = document.createElement('div');
      caja.className = 'mura-busq';
      caja.innerHTML =
        '<div class="mura-busq-caja">' +
        '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6"></circle><line x1="13.5" y1="13.5" x2="18" y2="18"></line></svg>' +
        '<input type="search" id="mura-busq-i" placeholder="Buscar" aria-label="Buscar en la colección" autocomplete="off">' +
        '<button type="button" class="mura-busq-x" id="mura-busq-x" aria-label="Borrar la búsqueda">×</button>' +
        '</div>';

      /* Debajo de los filtros si los hay; si no, justo encima de la rejilla. */
      var filtros = document.querySelector('.mura-filtros');
      if (filtros && filtros.parentNode) filtros.parentNode.insertBefore(caja, filtros.nextSibling);
      else grid.parentNode.insertBefore(caja, grid);

      var nada = document.createElement('p');
      nada.className = 'mura-busq-nada';
      nada.id = 'mura-busq-nada';
      grid.parentNode.insertBefore(nada, grid.nextSibling);

      var input = document.getElementById('mura-busq-i');
      var borrar = document.getElementById('mura-busq-x');

      function filtrar() {
        var q = llano(input.value.trim());
        borrar.style.display = q ? 'block' : 'none';
        var vistas = 0;
        grid.querySelectorAll('.mura-card').forEach(function (c) {
          var nom = c.querySelector('.mura-card-name');
          var texto = llano((nom ? nom.textContent : '') + ' ' + c.textContent);
          var casa = !q || texto.indexOf(q) !== -1;
          c.classList.toggle('mura-oculta-busq', !casa);
          /* Cuenta solo lo que se ve de verdad: una tarjeta que el filtro de
             categoría ya había escondido no es un resultado. */
          if (casa && c.offsetParent !== null) vistas++;
        });
        if (q && vistas === 0) {
          nada.textContent = 'No encontramos ninguna prenda con “' + input.value.trim() + '”. Prueba con otra palabra, o mira la colección entera.';
          nada.style.display = 'block';
        } else {
          nada.style.display = 'none';
        }
      }

      input.addEventListener('input', filtrar);
      borrar.addEventListener('click', function () { input.value = ''; filtrar(); input.focus(); });
      /* Los filtros de categoría se pintan después: al pulsarlos hay que
         recontar, o el mensaje de "no hay resultados" se queda colgado. */
      document.addEventListener('click', function (ev) {
        if (ev.target.closest && ev.target.closest('.mura-filtros')) setTimeout(filtrar, 0);
      });
      return true;
    }

    /* La rejilla puede pintarse después de este script. Se intenta ya, y si
       todavía no está, se espera a que aparezca — con tope, para no dejar un
       observer vivo para siempre en una página que no la trae. */
    if (!arrancar()) {
      var obs = new MutationObserver(function () { if (arrancar()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { obs.disconnect(); }, 8000);
    }
  }

  /* ============================================================
     4 · CSS que pisa la tienda de GHL — solo rutas de tienda
     ============================================================
     Aquí se pisa el CSS del elemento de tienda, que no es nuestro.
     En el resto del sitio no hay nada que pisar, y además NO PUEDE
     aplicarse: `body, body *` con `!important` arrasaría con el
     sistema `.mura-*` de nuestras propias páginas. De ahí el
     guardia de rutas.

     Este es el bloque por el que se partió el archivo: es el que
     tarda en llegar si viaja en el Tracking Code del body. */

  var tienda = [

    /* ---------- Base ---------- */
    'body { background: #F0EEE8 !important; }',
    "body, body * { font-family: 'Jost', sans-serif !important; font-weight: 300; }",
    "h1, h2, h3, h4, [class*='title'], .hl-cart-heading, .empty-cart-heading { font-family: 'Cormorant Garamond', Georgia, serif !important; font-weight: 500 !important; color: #1D1B18 !important; background: transparent !important; }",
    'p, span, div, a, li, td { color: #1D1B18; }',
    'img { border-radius: 0 !important; }',
    'svg { color: #55524B; }',
    'input, select, textarea { border: 1px solid rgba(29,27,24,.25) !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }',
    'input:focus, select:focus, textarea:focus { outline: none !important; border-color: #1D1B18 !important; }',

    /* ---------- Botón de pago ----------
       El `:not(.checkout-breadcrumb-item)` NO es decorativo. Las migas del
       checkout son <button class="checkout-breadcrumb-item">, así que el
       selector de atributo las cazaba y salían como dos botones negros
       enormes: `button[class*='checkout']` (0,1,1) gana por especificidad a
       `.checkout-breadcrumb-item` (0,1,0) aunque las dos lleven !important.
       Se fuerza también el color de TODOS los hijos: el texto vive en un
       div y sin el `*` hereda el color del body. */
    "button[class*='checkout']:not(.checkout-breadcrumb-item), a[class*='checkout'], button[type=submit] { background: #1D1B18 !important; border: none !important; border-radius: 0 !important; min-height: 54px !important; width: 100%; box-shadow: none !important; margin-top: 28px; }",
    "button[class*='checkout']:not(.checkout-breadcrumb-item), button[class*='checkout']:not(.checkout-breadcrumb-item) *, a[class*='checkout'], a[class*='checkout'] *, button[type=submit], button[type=submit] * { color: #F0EEE8 !important; font-size: 12px !important; letter-spacing: .22em !important; text-transform: uppercase !important; font-weight: 300 !important; }",
    "button[class*='checkout']:not(.checkout-breadcrumb-item):disabled { background: rgba(29,27,24,.35) !important; cursor: not-allowed; }",

    /* ---------- Checkout ----------
       Clases leídas del DOM real el 15/8. Antes esta página no recibía ni
       una regla: el guardia de rutas no la incluía. */
    '.hl-store-checkout-container { max-width: 1180px; margin: 0 auto; padding: clamp(32px,5vw,72px) clamp(20px,4vw,56px); }',

    '.checkout-breadcrumb-wrap { display: flex; align-items: center; gap: 10px; padding-bottom: clamp(28px,4vw,44px); }',
    '.checkout-breadcrumb-wrap .checkout-breadcrumb-item { background: transparent !important; border: none !important; border-radius: 0 !important; padding: 0 !important; min-height: 0 !important; width: auto !important; margin: 0 !important; font-size: 11px !important; letter-spacing: .2em !important; text-transform: uppercase !important; color: #55524B !important; }',
    '.checkout-breadcrumb-wrap .checkout-breadcrumb-item--selected { color: #1D1B18 !important; }',
    '.checkout-breadcrumb-chevron { width: 14px; height: 14px; color: #55524B; }',

    '.checkout-heading { font-size: clamp(22px,2.4vw,28px) !important; margin: clamp(28px,3vw,40px) 0 20px 0; }',
    '.checkout-heading:first-child { margin-top: 0; }',

    '.input-label { font-size: 10.5px !important; letter-spacing: .18em; text-transform: uppercase; color: #55524B !important; padding-bottom: 8px; }',
    '.input-label span { color: #55524B !important; }',
    '.required-field { color: #55524B !important; }',
    '.hl-checkout-input { min-height: 50px !important; padding: 0 14px !important; font-size: 14px !important; }',
    '.hl-checkout-input::placeholder { color: rgba(29,27,24,.4) !important; }',
    '.checkout-form > div, .email-field, .phone-input { margin-bottom: 18px; }',
    '.hl-input-col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }',
    'label.flex input[type=checkbox] { accent-color: #1D1B18; width: 15px; height: 15px; }',

    /* OJO: es type="button" con clase .payment-btn, así que la regla de
       button[type=submit] no lo alcanzaba. */
    '.form-btn.payment-btn, .payment-btn { background: #1D1B18 !important; border: none !important; border-radius: 0 !important; min-height: 54px !important; width: 100%; margin-top: 28px !important; }',
    '.payment-btn, .payment-btn * { color: #F0EEE8 !important; font-size: 12px !important; letter-spacing: .22em !important; text-transform: uppercase !important; font-weight: 300 !important; }',
    '.payment-btn .cart-icon { display: none !important; }',

    '.alert-danger { border: 1px solid rgba(29,27,24,.25) !important; background: transparent !important; border-radius: 0 !important; padding: 12px 14px; font-size: 13px; }',

    /* ---------- Resumen del pedido, columna derecha ----------
       ⚠️ EL `!important` DE ESTE BLOQUE NO ES CAUTELA, ES NECESARIO.
       Las hojas de los componentes de GHL —CartSummary.css, Coupon.css,
       CheckoutElement.css— se cargan DESPUÉS que la nuestra en el head
       (comprobado leyendo el head real el 17/8). A igualdad de
       especificidad gana la última, así que sin `!important` GHL nos pisa
       el fondo, los bordes y los separadores. */
    '.hl-cart-summary-container { background: rgba(29,27,24,.03) !important; border: 1px solid rgba(29,27,24,.10) !important; box-shadow: none !important; padding: clamp(20px,2.5vw,32px) !important; }',
    '.cart-summary-heading-container { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid rgba(29,27,24,.10); margin-bottom: 0 !important; }',

    /* GHL pinta un fondo gris detrás de los títulos del resumen: es la barra
       que se veía tras "Resumen del carrito" en la captura del 17/8. Nuestra
       regla de arriba solo cubría `.hl-cart-heading`, así que la barra
       reaparecía en los demás. Venía del skin viejo de la página, que se
       retira con este cambio. */
    '[class*="summary"] h1, [class*="summary"] h2, [class*="summary"] h3, [class*="summary"] h4, [class*="summary"] [class*="header"], [class*="summary"] [class*="title"] { background: transparent !important; }',

    /* Iconos en tinta y no en el azul del tema. Se listan uno a uno en vez de
       un `[class*="summary"] svg` general: ese cazaba también la ilustración
       del carrito vacío y la dejaba como un manchón. */
    '.edit-cart svg, .coupon-container svg, .checkout-breadcrumb-chevron { color: #55524B !important; }',
    '.hl-cart-summary-container .hl-cart-heading { font-size: 22px !important; margin: 0; }',
    '.edit-cart { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #55524B !important; cursor: pointer; }',
    '.edit-cart-icon { display: none !important; }',
    '.edit-cart span { border-bottom: 1px solid rgba(29,27,24,.3); color: #55524B !important; }',
    '.cart-details-container { padding-top: 20px; }',
    '.hl-cart-item { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; }',
    '.hl-cart-product-image { width: 72px !important; height: 96px !important; object-fit: cover !important; margin-right: 14px; }',
    ".hl-cart-checkout-product-name { font-family: 'Cormorant Garamond', Georgia, serif !important; font-size: 17px !important; font-weight: 500 !important; }",
    '.cart-item-variant { font-size: 11px !important; letter-spacing: .14em; text-transform: uppercase; color: #55524B !important; margin: 4px 0 6px 0; }',
    '.hl-cart-checkout-product-price { font-size: 13px !important; }',
    '.coupon-text-container { display: flex; gap: 0; }',
    '.coupon-input { min-height: 44px !important; flex: 1; font-size: 13px !important; }',
    '.apply-coupon-btn { background: transparent !important; border: 1px solid rgba(29,27,24,.25) !important; border-left: none !important; border-radius: 0 !important; padding: 0 18px !important; font-size: 11px !important; letter-spacing: .16em; text-transform: uppercase; color: #1D1B18 !important; }',
    '.apply-coupon-btn:disabled { color: rgba(29,27,24,.35) !important; }',
    /* GHL le pone `border-bottom` a `.hl-divider`; si solo cambiamos el
       border-top salen las dos líneas. */
    '.hl-divider { border-top: 1px solid rgba(29,27,24,.10) !important; border-bottom: none !important; margin: 20px 0 !important; }',
    '.cart-subtotal, .cart-total { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; margin: 0 !important; }',
    '.cart-subtotal p, .cart-total p { margin: 0; font-size: 14px !important; }',
    '.cart-subtotal p:first-child, .cart-total p:first-child { letter-spacing: .14em; text-transform: uppercase; font-size: 11.5px !important; color: #55524B !important; }',
    /* .ecom-gray-divider trae un gris de GHL que no es el nuestro */
    '.cart-total.ecom-gray-divider { border-color: rgba(29,27,24,.14) !important; }',
    ".total-amount { font-family: 'Cormorant Garamond', Georgia, serif !important; font-size: 24px !important; font-weight: 500 !important; }",

    /* ---------- Listado y ficha de producto ---------- */
    "[class*='quantity'] button, [class*='quantity'] button * { background: transparent !important; border-radius: 0 !important; color: #1D1B18 !important; font-size: 14px !important; letter-spacing: 0 !important; }",
    "[class*='quantity'] button { border: 1px solid rgba(29,27,24,.25) !important; }",
    "a[class*='continue'], button[class*='continue'] { background: transparent !important; border: none !important; border-bottom: 1px solid #1D1B18 !important; color: #1D1B18 !important; letter-spacing: .18em; text-transform: uppercase; font-size: 11.5px !important; width: auto !important; margin: 0 auto !important; padding: 0 0 6px 0 !important; min-height: 0 !important; }",
    /* la flechita que GHL le mete delante */
    ".right-arrow, a[class*='continue'] svg, button[class*='continue'] svg { display: none !important; }",

    /* ---------- Carrito vacío ----------
       El dibujo es de GHL —un carrito con hojas verdes— y no es de la marca.
       El TEXTO no se toca desde aquí: vive en los ajustes del elemento
       (`emptyCartText`), y el que trae por defecto es una traducción
       automática que además trata de usted. Ver la NOTA del final. */
    '.empty-cart-container svg, .empty-cart-container img { display: none !important; }',
    '.empty-cart-container { padding: clamp(30px,5vw,56px) 0; }',
    ".empty-cart-heading { font-size: 22px !important; padding-top: 0 !important; }",
    '.empty-cart-description { font-size: 13.5px !important; line-height: 1.9 !important; color: #55524B !important; max-width: 320px; margin: 12px auto 0 !important; padding: 0 !important; }',

    '@media (max-width: 719px) { .hl-cart-summary-container { margin-top: 28px; } }'

  ].join('\n');

  if (HAY_CSS && esTienda) estilo('tienda', tienda);

  /* ============================================================
     9 · Textos de los elementos Cart y Checkout
     ============================================================
     Estos textos son ajustes del elemento y viven en la página, no
     aquí. Lo suyo es cambiarlos ahí —salen bien al primer pintado y
     esto se queda sin trabajo—, pero la API de páginas de GHL no
     tiene ruta de escritura alcanzable: `GET /funnels/page/{id}`
     responde, y todas las de guardado dan «Cannot POST». Así que
     mientras tanto los arregla este bloque.

     Corre en el HEAD y observa desde `documentElement`, así que
     reescribe cada nodo EN CUANTO SE INSERTA, no después de pintar.
     Esa es la diferencia con la versión anterior, que iba en el body
     y repasaba el documento entero en cada mutación: se veía «My
     cart» un instante y costaba más.

     Lo que se toca y por qué:
       · inglés puro          — el elemento Cart tiene sus seis textos
                                sin traducir, y el checkout se dejó el
                                placeholder de las notas.
       · traducción de máquina — el vacío del resumen es el «tumbleweeds»
                                literal de GHL, y encima trata de usted.
       · español de América    — «domicilio», «agregar», «regresar»:
                                la tienda vende en España.
       · el resto              — copia acordada, la que ya estaba escrita
                                en la NOTA del final de este archivo. */

  if (HAY_TRAD && esTienda) traducirTextos();

  function traducirTextos() {
    var exacto = {
      // --- elemento Cart ---
      'My cart': 'Tu selección',
      'My Cart': 'Tu selección',
      'Your Cart is empty': 'Aún no has seleccionado ninguna pieza.',
      'Continue Shopping': 'Descubrir colección',
      'Continue shopping': 'Descubrir colección',
      'Checkout': 'Completar pedido',
      'Qty': 'Ud.',
      'Cant': 'Ud.',
      // --- checkout: migas y secciones ---
      'Contacto y Envío': 'Datos y envío',
      'Regresar a Contacto y Envío': 'Volver a datos y envío',
      'Continuar a pagar': 'Continuar al pago',
      'Email': 'Correo electrónico',
      'Detalles de envío': 'Datos de envío',
      'Detalles del Pago': 'Datos de facturación',
      'Nombre completo': 'Nombre y apellidos',
      'Busca tu domicilio': 'Busca tu dirección',
      'Domicilio completo': 'Dirección completa',
      'Estado / Provincia': 'Provincia',
      'Codigo Postal': 'Código postal',
      'Agregar notas a tu pedido': 'Añadir una nota al pedido',
      'Métodos de envío': 'Forma de envío',
      'Dirección de facturación igual que la de envío':
        'La dirección de facturación es la misma que la de envío',
      '* Pagos 100% seguros y protegidos *': 'Pago seguro',
      // --- checkout: resumen ---
      'Resumen del carrito': 'Tu pedido',
      'Editar carrito': 'Editar',
      'Cupón': 'Código de descuento',
      'Introduce el código del cupón': 'Introduce tu código',
      'Descuento (cupón)': 'Descuento',
      'Eliminar': 'Quitar'
    };

    /* Por prefijo, no exactos: de estos dos no tengo el texto literal
       —el de GHL cambia con la versión— y una coma de diferencia
       dejaría la regla muda sin que nadie se entere. */
    var patrones = [
      [/^Las plantas rodadoras/i, 'Aún no has seleccionado ninguna pieza.'],
      [/^Add notes about your order/i, 'Indicaciones para la entrega']
    ];

    function traduccion(t) {
      if (!t) return null;
      if (exacto[t]) return exacto[t];
      for (var i = 0; i < patrones.length; i++) {
        if (patrones[i][0].test(t)) return patrones[i][1];
      }
      return null;
    }

    function pasada(nodo) {
      if (!nodo) return;
      if (nodo.nodeType === 3) {           // nodo de texto suelto
        var v = traduccion(nodo.textContent.trim());
        if (v) nodo.textContent = nodo.textContent.replace(nodo.textContent.trim(), v);
        return;
      }
      if (nodo.nodeType !== 1) return;     // comentarios y demás, fuera
      var w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = n.textContent.trim();
        var r = traduccion(t);
        if (r) n.textContent = n.textContent.replace(t, r);
      }
      /* Los placeholders son atributos, no nodos de texto. Y ojo:
         `querySelectorAll` solo mira DESCENDIENTES, así que el propio
         nodo insertado hay que comprobarlo aparte — si el <input> es
         justo lo que se inserta, por ahí se escapaba. */
      var campos = [];
      if (nodo.hasAttribute && nodo.hasAttribute('placeholder')) campos.push(nodo);
      if (nodo.querySelectorAll) {
        var dentro = nodo.querySelectorAll('[placeholder]');
        for (var k = 0; k < dentro.length; k++) campos.push(dentro[k]);
      }
      for (var i = 0; i < campos.length; i++) {
        var p = traduccion((campos[i].getAttribute('placeholder') || '').trim());
        if (p) campos[i].setAttribute('placeholder', p);
      }
    }

    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'characterData') { pasada(m.target); continue; }
        for (var j = 0; j < m.addedNodes.length; j++) pasada(m.addedNodes[j]);
      }
    }).observe(document.documentElement, {
      childList: true, subtree: true, characterData: true
    });

    // y una pasada de arranque, por lo que ya estuviera puesto
    function arranque() { pasada(document.body); }
    if (document.body) arranque();
    else document.addEventListener('DOMContentLoaded', arranque);
  }

  /* ============================================================
     A PARTIR DE AQUÍ, SOLO LO QUE NECESITA EL DOM
     ============================================================
     Todo lo anterior era CSS y puede correr en el <head>, antes de
     que exista el body. Lo que viene lee y escribe el DOM, así que
     va en el Tracking Code del BODY. */

  if (!HAY_DOM) return;

  pintarContador();
  if (esRejilla) montarBuscador();
  if (!esTienda) return;

  /* ============================================================
     7 · Cabecera en las páginas de tienda
     ============================================================
     Usa las MISMAS clases que la cabecera del resto del sitio
     (`.mura-nav`), que ahora viven en la parte 1. Antes esto tenía
     su propio `.mura-nav-inject` con su propio CSS: dos cabeceras
     distintas que había que mantener a la vez y que ya habían
     divergido —el orden del menú no coincidía y a esta le faltaba
     el contador del carrito—. */

  function init() {
    if (document.querySelector('.mura-nav')) return;

    var nav = document.createElement('nav');
    nav.className = 'mura-nav';
    nav.innerHTML = '<div class="mura-nav-in">' +
      '<a href="/" class="mura-logo">MÛRA</a>' +
      '<div class="mura-links">' +
        '<a href="/">Inicio</a>' +
        '<a href="/colecciones" class="hm">Colecciones</a>' +
        '<a href="/prendas">Prendas</a>' +
        '<a href="/novedades" class="hm">Novedades</a>' +
        '<a href="/mura" class="hm">MÛRA</a>' +
        '<a href="/contacto" class="hm">Contacto</a>' +
      '</div>' +
      '<a href="/carrito" class="mura-cart">Carrito<span class="mura-cart-w" style="display:none"> (<span class="mura-cart-n">0</span>)</span></a>' +
      '</div>';
    document.body.insertBefore(nav, document.body.firstChild);

    // Ocultar la cabecera del tema (la que trae Logo / Business Name)
    document.querySelectorAll('header, nav, [class*="header"]').forEach(function (h) {
      if (!h.contains(nav) && !nav.contains(h) && /Business Name/i.test(h.textContent)) h.style.display = 'none';
    });

    pintarContador();

    /* Los textos ya no se tocan aquí: de eso se encarga la sección 9,
       que corre desde el HEAD y llega antes de que se pinten. Este
       observer se queda solo con el contador del carrito. */
    new MutationObserver(pintarContador)
      .observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 1200); // por si el tema pinta tarde
})();

/* ============================================================
   NOTA · LOS TEXTOS VAN EN EL ELEMENTO, NO EN JS

   Los elementos Cart y Checkout guardan sus textos como ajustes
   propios. Leídos por API el 22/8, así están:

     · Cart     — los SEIS en inglés ("My cart", "Your Cart is
                  empty", "Continue Shopping"…).
     · Checkout — traducido casi entero, con tres cabos: el
                  placeholder de las notas en inglés, varios
                  regionalismos de América ("domicilio", "agregar",
                  "regresar") y "Codigo Postal" sin tilde.

   La sección 9 los arregla desde el HEAD, así que hoy se ven bien.
   Pero el sitio bueno sigue siendo el ajuste del elemento: salen
   traducidos de origen, sin depender de que corra un script.

   NO SE PUDO HACER POR API (22/8). El contenido de una página se
   LEE en `GET /funnels/page/{pageId}` (backend interno, token-id;
   el PIT da 401 ahí) y el JSON del elemento vive en el
   `pageDataUrl` de Firebase. Para ESCRIBIR no hay ruta alcanzable:
   POST/PUT/PATCH sobre /funnels/page/{id} y sus variantes
   (/data, /save, /sections, /funnel/{id}/page/{id}…) responden
   "Cannot POST", que es ruta inexistente, no permiso denegado. El
   builder guarda por otra vía y app.gohighlevel.com no se alcanza
   desde el entorno para averiguar cuál.

   Así que esta lista es para pegar A MANO. El día que se haga, la
   sección 9 se queda sin trabajo y se puede borrar entera.

   ---- Página Cart → elemento Cart → Settings ----
     headline               → Tu selección
     emptyCartText          → Aún no has seleccionado ninguna pieza.
     continueShopping       → Descubrir colección
     subtotalColumnHeading  → Subtotal
     totalColumnHeading     → Total
     checkoutButtonText     → Completar pedido

   ---- Página Checkout → elemento Checkout → Settings ----
   Migas
     step1Label                  → Datos y envío
     step2Label                  → Pago
     continueToPaymentText       → Continuar al pago
     returnToContactShippingText → Volver a datos y envío
   Contacto
     headline                    → Contacto
     email                       → Correo electrónico
   Envío
     headline                    → Datos de envío
     fullName                    → Nombre y apellidos
     phoneNumber                 → Teléfono
     searchBoxPlaceholder        → Busca tu dirección
     fullAddress                 → Dirección completa
     country                     → País
     state                       → Provincia
     cityName                    → Ciudad
     zipCode                     → Código postal
     notesHeadingLabelText       → Añadir una nota al pedido
     notesTextBoxPlaceholder     → Indicaciones para la entrega
     shippingMethodsHeadline     → Forma de envío
     freeShippingLabelText       → Gratis
   Facturación
     headline                    → Datos de facturación
     checkboxText                → La dirección de facturación es la misma que la de envío
   Pago
     headline                    → Pago
     checkoutButtonText          → Confirmar pedido
     footerText                  → Pago seguro
   Resumen
     headline                    → Tu pedido
     editCartButtonText          → Editar
     emptyCartText               → Aún no has seleccionado ninguna pieza.
     continueShopping            → Descubrir colección
       ⚠️ El texto que trae GHL por defecto es una traducción automática
       —"Las plantas rodadoras son espectaculares, pero este carrito anda
       en busca de algo más emocionante"— que además trata de usted cuando
       el resto de la web tutea. El dibujo del carrito con hojas verdes ya
       se oculta desde el CSS; el texto solo se cambia aquí.
     quantityColumnHeading       → Ud.
     couponHeadline              → Código de descuento
     couponCodePlaceholder       → Introduce tu código
     applyCouponButtonText       → Aplicar
     subtotalColumnHeading       → Subtotal
     discountHeading             → Descuento
     removeCouponButtonText      → Quitar
     shippingHeading             → Envío
     totalColumnHeading          → Total
   ============================================================ */
