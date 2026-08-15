/* ============================================================
   MÛRA · CÓDIGO GLOBAL DE LA TIENDA
   ============================================================
   Sustituye al bloque que hay hoy en:
     Sitio "Mura" → Settings → Tracking Code → BODY
   (en el DOM aparece como <div id="gb-track-hl-custom-code">)

   Es código GLOBAL: se ejecuta en TODAS las páginas del sitio.
   Por eso lo primero que hace es el guardia de rutas — sin él
   pintaría también /home, /prendas, /mura…

   QUÉ CAMBIA RESPECTO A LA VERSIÓN ANTERIOR
   1. Se añaden /checkout, /product-details y /thank-you al
      guardia. Antes solo entraba en /cart y /products-list, que
      es por lo que el checkout salía sin maquetar.
   2. El carrito se estiliza por sus clases REALES
      (.hl-cart-container, .hl-amount-subtotal, .hl-checkout-btn…),
      leídas del DOM el 15/8, en vez de solo por selectores
      genéricos de atributo.
   3. Se ocultan los dos SVG genéricos que mete GHL (el carrito
      vacío y la flechita del botón): son de su catálogo, no de
      la marca, y las páginas de MÛRA no llevan ilustración.
   4. La traducción por JavaScript se queda como red de
      seguridad, pero deja de hacer falta: el elemento Cart tiene
      esos textos como ajustes nativos. Ver NOTA al final.

   CLASES DE INSTANCIA — no usarlas nunca:
   `.cstore-cart-J14MT1D5-f` lleva el id del elemento dentro. Si
   alguien recrea el elemento en el editor, ese sufijo cambia y
   el CSS deja de aplicar en silencio. Se usa `.c-store-cart`,
   que es estable.

   PALETA: la de la tienda (#F0EEE8 / #1D1B18 / #55524B), que no
   es exactamente la de los correos y las páginas legales
   (#F6F2EB / #1E1B1A / #8A7E71). Ver sección 27.3 del doc.
   ============================================================ */

(function () {
  var path = location.pathname.replace(/\/+$/, '');

  /* ---------- /cart se retira: el carrito bueno es /carrito ----------
     No se puede borrar la página: la tienda de GHL necesita su paso de
     carrito, y hay enlaces suyos que apuntan ahí por dentro (el "Editar"
     del resumen del checkout, sin ir más lejos). Así que se redirige.

     Va lo primero de todo y con `replace` en vez de `href`: así no deja
     entrada en el historial y el botón "atrás" no devuelve a la clienta
     al carrito viejo. No hay bucle posible, /carrito no entra aquí. */
  if (path === '/cart') {
    location.replace('/carrito' + location.search);
    return;
  }

  var RUTAS = ['/cart', '/products-list', '/product-details', '/checkout', '/thank-you'];
  if (RUTAS.indexOf(path) === -1) return;

  var css = [

    /* ---------- Base ---------- */

    "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400&display=swap');",

    'body { background: #F0EEE8 !important; }',
    "body, body * { font-family: 'Jost', sans-serif !important; font-weight: 300; }",

    /* El título del carrito es un <p>, así que la regla de h1-h4 no lo alcanza:
       hay que nombrarlo aparte o sale en Jost como el cuerpo. */
    "h1, h2, h3, h4, [class*='title'], .hl-cart-heading, .empty-cart-heading { font-family: 'Cormorant Garamond', Georgia, serif !important; font-weight: 500 !important; color: #1D1B18 !important; background: transparent !important; }",

    'p, span, div, a, li, td { color: #1D1B18; }',
    'img { border-radius: 0 !important; }',
    'svg { color: #55524B; }',

    "input, select, textarea { border: 1px solid rgba(29,27,24,.25) !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; }",
    "input:focus, select:focus, textarea:focus { outline: none !important; border-color: #1D1B18 !important; }",

    /* ---------- Carrito /cart — RED DE SEGURIDAD ----------
       Desde el 15/8 el carrito bueno es /carrito y esta página redirige
       (arriba del todo), así que estas reglas no deberían llegar a pintar
       nunca. Se conservan para que, si alguien quita la redirección, la
       página no se quede en crudo. Si /cart se elimina de verdad algún día,
       este bloque se va con ella. */

    '.hl-cart-container { max-width: 1040px; margin: 0 auto; padding: clamp(32px,5vw,72px) clamp(20px,4vw,56px); }',

    '.hl-cart-heading { font-size: clamp(28px,3.4vw,40px) !important; letter-spacing: .01em; margin: 0 0 clamp(28px,4vw,48px) 0; }',

    /* Carrito vacío: fuera la ilustración de stock de GHL, el texto se sostiene solo. */
    '.empty-cart-container { text-align: center; padding: clamp(48px,7vw,96px) 0; }',
    '.empty-cart-container > img { display: none !important; }',
    '.empty-cart-heading { font-size: 22px !important; margin: 0 0 32px 0; }',
    '.empty-cart-heading b { font-weight: 500 !important; }',

    /* El "seguir comprando" es un enlace disfrazado de botón: se trata como enlace. */
    '.hl-continue-btn { background: transparent !important; border: none !important; border-bottom: 1px solid #1D1B18 !important; border-radius: 0 !important; color: #1D1B18 !important; letter-spacing: .18em; text-transform: uppercase; font-size: 11.5px !important; padding: 0 0 6px 0 !important; display: inline-flex; align-items: center; gap: 10px; }',
    '.hl-continue-btn img { display: none !important; }',

    /* Totales */
    '.hl-amount-subtotal { max-width: 420px; margin-left: auto; padding-top: clamp(24px,3vw,40px); border-top: 1px solid rgba(29,27,24,.14); }',
    '.cart-subtotal, .cart-total { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; }',
    '.cart-subtotal p, .cart-total p { margin: 0; font-size: 14px !important; }',
    '.cart-subtotal p:first-child, .cart-total p:first-child { letter-spacing: .14em; text-transform: uppercase; font-size: 11.5px !important; color: #55524B !important; }',
    /* .ecom-gray-divider trae un gris de GHL que no es el nuestro */
    '.cart-total.ecom-gray-divider { border-color: rgba(29,27,24,.14) !important; }',
    '.total-amount { font-family: "Cormorant Garamond", Georgia, serif !important; font-size: 24px !important; font-weight: 500 !important; }',

    /* ---------- Botón de pago ----------
       Se fuerza también el color de TODOS los hijos: el texto vive en un
       div .checkout-btn-text y sin el `*` hereda el color del body. */
    /* El `:not(.checkout-breadcrumb-item)` NO es decorativo. Las migas del
       checkout son <button class="checkout-breadcrumb-item">, así que el
       selector de atributo las cazaba y salían como dos botones negros
       enormes: `button[class*='checkout']` (0,1,1) gana por especificidad a
       `.checkout-breadcrumb-item` (0,1,0) aunque las dos lleven !important. */
    "button[class*='checkout']:not(.checkout-breadcrumb-item), a[class*='checkout'], button[type=submit], .hl-checkout-btn { background: #1D1B18 !important; border: none !important; border-radius: 0 !important; min-height: 54px !important; width: 100%; box-shadow: none !important; margin-top: 28px; }",
    "button[class*='checkout']:not(.checkout-breadcrumb-item), button[class*='checkout']:not(.checkout-breadcrumb-item) *, a[class*='checkout'], a[class*='checkout'] *, button[type=submit], button[type=submit] *, .hl-checkout-btn, .hl-checkout-btn * { color: #F0EEE8 !important; font-size: 12px !important; letter-spacing: .22em !important; text-transform: uppercase !important; font-weight: 300 !important; }",
    "button[class*='checkout']:not(.checkout-breadcrumb-item):disabled, .hl-checkout-btn:disabled { background: rgba(29,27,24,.35) !important; cursor: not-allowed; }",

    /* ---------- Cantidad ----------
       ⚠️ SIN VERIFICAR: el carrito estaba vacío cuando se leyó el DOM, así que
       las filas de artículo no se han visto. Son selectores de atributo, que
       no rompen nada si no casan — pero tampoco pintan. Revisar con el
       carrito lleno. */
    "[class*='quantity'] button, [class*='quantity'] button * { background: transparent !important; border-radius: 0 !important; color: #1D1B18 !important; font-size: 14px !important; letter-spacing: 0 !important; }",
    "[class*='quantity'] button { border: 1px solid rgba(29,27,24,.25) !important; }",

    "a[class*='continue'], button[class*='continue'] { background: transparent !important; border: none !important; border-bottom: 1px solid #1D1B18 !important; color: #1D1B18 !important; letter-spacing: .18em; text-transform: uppercase; font-size: 11.5px !important; }",

    /* ---------- Checkout ----------
       Clases leídas del DOM real el 15/8. Antes esta página no recibía ni una
       regla: el guardia de rutas no la incluía. */

    '.hl-store-checkout-container { max-width: 1180px; margin: 0 auto; padding: clamp(32px,5vw,72px) clamp(20px,4vw,56px); }',

    /* Migas: dos pasos, el activo en tinta y el otro apagado */
    '.checkout-breadcrumb-wrap { display: flex; align-items: center; gap: 10px; padding-bottom: clamp(28px,4vw,44px); }',
    '.checkout-breadcrumb-wrap .checkout-breadcrumb-item { background: transparent !important; border: none !important; border-radius: 0 !important; padding: 0 !important; min-height: 0 !important; width: auto !important; margin: 0 !important; font-size: 11px !important; letter-spacing: .2em !important; text-transform: uppercase !important; color: #55524B !important; }',
    '.checkout-breadcrumb-wrap .checkout-breadcrumb-item--selected { color: #1D1B18 !important; }',
    '.checkout-breadcrumb-chevron { width: 14px; height: 14px; color: #55524B; }',

    /* Títulos de sección */
    '.checkout-heading { font-size: clamp(22px,2.4vw,28px) !important; margin: clamp(28px,3vw,40px) 0 20px 0; }',
    '.checkout-heading:first-child { margin-top: 0; }',

    /* Campos */
    '.input-label { font-size: 10.5px !important; letter-spacing: .18em; text-transform: uppercase; color: #55524B !important; padding-bottom: 8px; }',
    '.input-label span { color: #55524B !important; }',
    '.required-field { color: #55524B !important; }',
    '.hl-checkout-input { min-height: 50px !important; padding: 0 14px !important; font-size: 14px !important; }',
    '.hl-checkout-input::placeholder { color: rgba(29,27,24,.4) !important; }',
    '.checkout-form > div, .email-field, .phone-input { margin-bottom: 18px; }',
    '.hl-input-col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }',
    "label.flex input[type=checkbox] { accent-color: #1D1B18; width: 15px; height: 15px; }",

    /* Botón "continuar al pago". OJO: es type="button" con clase .payment-btn,
       así que la regla de button[type=submit] no lo alcanzaba. */
    '.form-btn.payment-btn, .payment-btn { background: #1D1B18 !important; border: none !important; border-radius: 0 !important; min-height: 54px !important; width: 100%; margin-top: 28px !important; }',
    '.payment-btn, .payment-btn * { color: #F0EEE8 !important; font-size: 12px !important; letter-spacing: .22em !important; text-transform: uppercase !important; font-weight: 300 !important; }',
    '.payment-btn .cart-icon { display: none !important; }',

    '.alert-danger { border: 1px solid rgba(29,27,24,.25) !important; background: transparent !important; border-radius: 0 !important; padding: 12px 14px; font-size: 13px; }',

    /* Resumen del carrito, columna derecha */
    '.hl-cart-summary-container { background: rgba(29,27,24,.03); border: 1px solid rgba(29,27,24,.10); padding: clamp(20px,2.5vw,32px); }',
    '.cart-summary-heading-container { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding-bottom: 20px; border-bottom: 1px solid rgba(29,27,24,.10); }',
    '.hl-cart-summary-container .hl-cart-heading { font-size: 22px !important; margin: 0; }',
    '.edit-cart { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #55524B !important; cursor: pointer; }',
    '.edit-cart-icon { display: none !important; }',
    '.edit-cart span { border-bottom: 1px solid rgba(29,27,24,.3); color: #55524B !important; }',

    '.cart-details-container { padding-top: 20px; }',
    '.hl-cart-item { display: flex; justify-content: space-between; gap: 16px; padding: 16px 0; }',
    '.hl-cart-product-image { width: 72px !important; height: 96px !important; object-fit: cover !important; margin-right: 14px; }',
    '.hl-cart-checkout-product-name { font-family: "Cormorant Garamond", Georgia, serif !important; font-size: 17px !important; font-weight: 500 !important; }',
    '.cart-item-variant { font-size: 11px !important; letter-spacing: .14em; text-transform: uppercase; color: #55524B !important; margin: 4px 0 6px 0; }',
    '.hl-cart-checkout-product-price { font-size: 13px !important; }',

    '.coupon-text-container { display: flex; gap: 0; }',
    '.coupon-input { min-height: 44px !important; flex: 1; font-size: 13px !important; }',
    '.apply-coupon-btn { background: transparent !important; border: 1px solid rgba(29,27,24,.25) !important; border-left: none !important; border-radius: 0 !important; padding: 0 18px !important; font-size: 11px !important; letter-spacing: .16em; text-transform: uppercase; color: #1D1B18 !important; }',
    '.apply-coupon-btn:disabled { color: rgba(29,27,24,.35) !important; }',
    '.hl-divider { border-top: 1px solid rgba(29,27,24,.10); margin: 20px 0; }',
    '.hl-cart-summary-container .price { font-size: 14px !important; }',

    /* ---------- Cabecera propia ---------- */

    '.mura-nav-inject { background: rgba(240,238,232,.96); border-bottom: 1px solid rgba(29,27,24,.08); }',
    '.mura-nav-inject .in { max-width: 1440px; margin: 0 auto; padding: 0 clamp(20px,4vw,56px); height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }',
    ".mura-nav-inject .logo { font-family: 'Cormorant Garamond', serif !important; font-size: 26px; font-weight: 500; letter-spacing: .32em; color: #1D1B18; text-decoration: none; }",
    '.mura-nav-inject .links { display: flex; gap: clamp(16px,2.6vw,38px); font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; }',
    '.mura-nav-inject .links a { color: #55524B; text-decoration: none; }',
    '.mura-nav-inject .links a:hover { color: #1D1B18; }',
    '@media (max-width: 719px) { .mura-nav-inject .links a.hm { display: none; } }',

    /* ---------- Móvil ---------- */

    '@media (max-width: 719px) { .hl-amount-subtotal { max-width: none; } }'

  ].join('\n');

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function init() {
    if (document.querySelector('.mura-nav-inject')) return;

    var nav = document.createElement('div');
    nav.className = 'mura-nav-inject';
    // Mismo orden de menú que /carrito, que antes no coincidía: allí va
    // Colecciones antes que Novedades y aquí era al revés.
    nav.innerHTML = '<div class="in"><a class="logo" href="/">MÛRA</a><div class="links">' +
      '<a href="/">Inicio</a><a class="hm" href="/colecciones">Colecciones</a><a href="/prendas">Prendas</a>' +
      '<a class="hm" href="/novedades">Novedades</a><a class="hm" href="/mura">MÛRA</a><a class="hm" href="/contacto">Contacto</a></div>' +
      '<a href="/carrito" style="font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#1D1B18;text-decoration:none">Mi selección</a></div>';
    document.body.insertBefore(nav, document.body.firstChild);

    // Ocultar la cabecera del tema (la que trae Logo / Business Name)
    document.querySelectorAll('header, nav, [class*="header"]').forEach(function (h) {
      if (!h.contains(nav) && !nav.contains(h) && /Business Name/i.test(h.textContent)) h.style.display = 'none';
    });

    // Red de seguridad de idioma. Queda inerte en cuanto los textos se pongan
    // en los ajustes del elemento Cart (ver NOTA), porque entonces ninguna de
    // estas claves llega a aparecer en el DOM.
    var map = {
      'My cart': 'Tu selección',
      'My Cart': 'Tu selección',
      'Your Cart is empty': 'Aún no has seleccionado ninguna pieza.',
      'Continue Shopping': 'Descubrir colección',
      'Checkout': 'Completar pedido',
      'Qty': 'Ud.'
    };
    function tr() {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) {
        var t = n.textContent.trim();
        if (map[t]) n.textContent = n.textContent.replace(t, map[t]);
      }
    }
    tr();
    new MutationObserver(tr).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 1200); // por si el tema pinta tarde
})();

/* ============================================================
   NOTA · LOS TEXTOS VAN EN EL ELEMENTO, NO EN JS

   Los elementos Cart y Checkout guardan sus textos como ajustes
   propios. Hoy están TODOS en inglés. En el carrito los reescribe
   el JavaScript de arriba, que corre DESPUÉS de pintar: durante un
   instante la clienta ve "My cart". En el checkout no los reescribe
   nadie, así que la clienta paga en un formulario en inglés entero.

   Puestos en los ajustes salen traducidos en el primer pintado, sin
   parpadeo, y el mapa del JavaScript se queda sin nada que hacer.

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
