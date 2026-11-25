# Anexo 1 · Código de la web, Worker, n8n y scripts (25/11/2026)

Hecho leyendo a fondo `tienda/`, `web/`, `plantillas/` y `legal/`, y ejecutando `node tienda/worker-test.mjs` y `extraer-css.js` (los dos bien). Lo urgente que sale de aquí está recogido en `docs/TRASPASO.md`.

# Informe de traspaso: código de la tienda MÛRA (`/home/user/mura`)

No he modificado ningún archivo del repo. He hecho tres comprobaciones sin escribir en él:

- `node tienda/worker-test.mjs` pasa entero. Imprime una traza de pila, pero es el `console.error` que el caso 6 provoca a propósito.
- Los dos `tracking-code-*.html` son idénticos a `codigo-global-tienda.js`, salvo la cabecera y la línea `MURA_PARTE`.
- He ejecutado `extraer-css.js` sobre una copia en el directorio temporal de la sesión. Sale idéntico al `css-paginas-tienda.css` del repo, así que los generados están al día (13/11).

No copio tokens: en los JSON de n8n solo aparece el marcador `PEGAR_AQUI_EL_PIT`, y los scripts de Meta leen el token del entorno.

---

## 0. Lo esencial en diez líneas

1. **Hay una sola fuente de JS y CSS global:** `tienda/codigo-global-tienda.js`. `build.sh` la envuelve dos veces:
   - con `MURA_PARTE='head'`, que lleva el CSS, la traducción y las API de consentimiento y Meta;
   - con `MURA_PARTE='body'`, que lleva todo lo que toca el DOM.

   Las dos salidas van en GHL → Settings → Tracking Code → Head / Body. Además genera `css-paginas-tienda.css` para el Custom CSS de `/checkout`.
2. **Los catálogos los sirve el Worker de Cloudflare** `mura-productos.germanborrello-d78.workers.dev`, con `/products`, `/products?id=` y `/collections`.
3. **Ficha y carrito son código propio.** La ficha es `tienda/producto.html`. El carrito vigente es `web/carrito.html`; `tienda/carrito.html` es el antiguo. Los dos leen y escriben `localStorage['cart_details_rlc7iAyGF4U1nfwAJOJQ']`, el almacén nativo de la tienda de GHL que también lee el checkout.
4. **Consentimiento.** La API es `window.muraConsent` y guarda la elección en `localStorage['mura_consent']`. Clarity (`yyrkyipd10`) se carga solo con «Análisis». El píxel de Meta (`1799475611078369`) se carga solo con «Publicidad».
5. **Eventos de navegador.** La ficha emite `ViewContent` y `AddToCart` hacia Meta, y hacia Clarity las etiquetas `prenda_vista` / `prenda_carrito` y los eventos `anadir_carrito`. La barra de la cabecera emite `barra_carrito`. `Purchase` no sale del navegador: lo manda GHL por la API de Conversiones desde el workflow SP01, según `docs/meta-campana.md`.
6. **Cabecera y pie son elementos universales de GHL** desde noviembre: `web/global/cabecera.html` («Cabecera MURA») y `web/global/pie.html` («Pie MURA»). La cabecera además guarda el origen de la visita (`mura_origen`) y pinta la barra «Tu selección» en móvil.
7. **La numeración de secciones de los README y de CLAUDE.md no coincide con la del código** (detalle en §8). Banner, Clarity y píxel son las secciones **16, 17 y 18** en el código, no 10, 11 y 12.

---

## 1. Archivo por archivo

### 1.1 `tienda/`

#### `README.md`
Es la guía de «qué se pega y dónde», con historial fechado:
- Worker v2 (21/10), banner (16/10), Clarity (16/10) y píxel paso 1 (16/10).
- Por qué hay CSS suelto y por qué el global son dos archivos.
- Ficha del 11/11, origen de la suscripción (13/11), saltos de carga en /prendas y /colecciones (13/11).
- Etiquetas de Clarity (16/11), barra «Tu selección» (18/11) y envío a la vista en el carrito (18/11).

Su tabla de pegado (las líneas 5 a 15) está parcialmente desfasada; ver §8.

#### `build.sh`
- Es `sh`, con `set -e`, y se ejecuta con `cd tienda && ./build.sh`.
- Genera `tracking-code-head.html` y `tracking-code-body.html`. Cada uno es: comentario «GENERADO — NO EDITAR», `<script>`, `window.MURA_PARTE='head'|'body';`, `cat codigo-global-tienda.js` y `</script>`.
- Después ejecuta `node extraer-css.js`.
- **Requiere `node`.**
- No toca `producto.html`, aunque ese archivo diga que sí (ver §8).

#### `extraer-css.js`
- Ejecuta el global en Node con un DOM falso, simulando `window.MURA_PARTE='head'` y `location.pathname='/checkout'`.
- Captura lo que se pasa a `estilo()` y escribe `css-paginas-tienda.css`.
- Convierte el `<link>` de Google Fonts en `@import`.
- Hoy salen tres bloques: `sistema`, `bocadillo` y `tienda`.
- Si no sale ninguna hoja, termina con código 1.

#### Archivos generados: no se editan a mano
| Archivo | Dónde se pega |
|---|---|
| `tracking-code-head.html` (155 KB) | Sitio «Mura» → Settings → Tracking Code → **Head** |
| `tracking-code-body.html` (155 KB) | Sitio «Mura» → Settings → Tracking Code → **Body** |
| `css-paginas-tienda.css` (28 KB) | **Custom CSS de la página `/checkout`**. Opcional en `/products-list`, `/product-details` y `/thank-you` |

Hay que pegar los dos tracking codes:
- Solo el Head: hay estilo, pero no hay contador, banner, píxel ni nada del DOM.
- Solo el Body: funciona todo, pero sin el CSS de tienda temprano.

El Custom CSS existe porque GHL no sirve el Tracking Code del Head dentro de `<head>`: lo inyecta tarde por JS, y el CSS del Custom CSS sí llega en el primer HTML.

#### `codigo-global-tienda.js`
Es la fuente única. Su detalle está en §2.

#### `producto.html` (página `producto`, id de página `cmPhl3N0IF3smLo8Oy8x`)
- **Dónde va:** elemento de código `custom-code-oM1HT_mKKm`. Se rehízo el 11/11 a partir de lo publicado y no lleva cabecera ni pie propios, porque los pone el universal.
- **CSS propio, dos bloques:**
  - Uno marcado `<!-- mura:css:inicio/fin -->` con `<style data-mura="sistema">`. Es un subconjunto podado del bloque `sistema` del global. Como lleva `data-mura="sistema"`, **el global no inyecta su bloque `sistema` en /producto**: su función `estilo()` ve que ya existe.
  - Otro de reglas propias: huecos reservados `#md-*:empty`, `#md-falta`, `#md-ajuste`, el visor `.md-visor` y la lupa en línea `.mura-busql`.
- **Datos:**
  - `fetch(API+'/products?id='+id)`, donde `API='https://mura-productos.germanborrello-d78.workers.dev'`.
  - Si la descripción trae `Modelo:` o un apartado «Completa tu look», hace una segunda llamada a `/products` con el catálogo entero. La guarda en caché en `sessionStorage['mura_catalogo_v1']` durante 5 minutos.
  - Si `id` no existe, usa la primera pieza (`ps[0]`).
- **Lógica de la descripción de GHL:**
  - `Modelo: X · Color: Y` agrupa las piezas por modelo. Pinta miniaturas de otros colores (`#md-colores`, `.mura-colores`) y titula con el modelo.
  - «Completa tu look» pinta hasta cuatro tarjetas (`#md-look`), recorta ese apartado del acordeón y lo coloca con `colocarLook()` según las columnas reales de la rejilla.
  - Una nota «… de lo habitual» (y «Si dudas entre dos tallas…») se saca a `#md-ajuste` y a «Talla y ajuste».
  - Acordeones: Descripción, Talla y ajuste, Composición y cuidados (corta en `<h3>Composición|Cuidados`) y Entrega y devoluciones.
  - «Talla y ajuste» tiene dos versiones: talla única (si alguna talla contiene «únic») o una tabla S–XL. Lleva las medidas de la modelo y un enlace de WhatsApp a `wa.me/34637681234`.
- **Añadir al carrito (`#md-add`):**
  - Sin talla elegida, marca `#md-tallas.falta` y muestra «Elige tu talla».
  - Con una sola talla disponible, la elige sola.
  - Escribe en `cart_details_rlc7iAyGF4U1nfwAJOJQ` un objeto con `{_id, name, selectedProductImage, selectedPrice:{_id:priceId, variantOptionIds, trackInventory, name:talla, type, currency, amount, availableQuantity, allowOutOfStockPurchases}, quantity, buyNowQuantity, showName}`. Si la misma `priceId` ya está, suma una unidad.
  - Después muestra «Ver carrito y finalizar compra» (`#md-added`).
- **Eventos de Meta:**
  - Crea una cola `window.muraMeta={q:[],track(){…}}` si el global aún no ha llegado.
  - `ViewContent` con `{content_ids:[id], content_type:'product', content_name, value: precio mínimo, currency:'EUR'}`.
  - `AddToCart` con `{content_ids, content_type, content_name, contents:[{id, quantity:1, item_price}], value, currency:'EUR'}`.
- **Clarity:** la función `clar()` reintenta 30 veces cada 500 ms (15 s) hasta que exista `window.clarity`. Acumula los valores en `sessionStorage['mura_cl_prenda_vista' / 'mura_cl_prenda_carrito']` y llama a `clarity('set', clave, lista)`. Al añadir, también `clarity('event','anadir_carrito')` y `clarity('upgrade','anadir_carrito')`.
- **Galería:** deslizar cambia de foto y tocar abre el visor a pantalla completa (flechas, Escape, ✕).
- **Texto fijo de envío:** `#md-envio` dice «Envío gratis desde 99 € · Recogida gratis en punto Nacex».
- **Lupa:** la de la miga envía a `/prendas?q=…`.

#### `carrito.html` (el antiguo, no es el vigente)
- Indica el elemento `custom-code-DN8OVgnA5P` de la página `carrito` (`qsUEwHJLz2xiSulCN5jD`).
- Lleva cabecera y pie copiados dentro y no trae CSS: depende del global.
- Muestra solo un «Total», sin envío. Ver §5.

#### `experiencia.html` (página `/experiencia`)
- Encuesta editorial en siete bloques (b1 a b7). Si la clienta no ha comprado, se salta b3, b4 y b5.
- Lleva cabecera y pie propios, y su CSS (`.mura-enc-*`) vive en el global, sección 2, solo en esta ruta.
- Identificación: `?cid=` o `?email=`. Si no llega ninguno, pide el correo como opcional.
- Obligatorios: la primera pregunta y el NPS (0–10).
- Envía un POST JSON a **`https://n8n.letsbebanana.com/webhook/experiencia-mura`**, el flujo de Sonia. El cuerpo lleva `origen:'experiencia-web'`.
- Depende de que el webhook tenga CORS para el dominio, y de que n8n escriba el campo `nps` (id `BpEcTG8IYDXRUQNrM3h0`) y el tag `encuesta-completada`, que es el que dispara el 06b.

#### `devoluciones-form.html` (página **`/devolucion`**, en singular)
- Distingue tres páginas: `/devoluciones` (instrucciones), `/devolucion` (este formulario) y `/gracias-devolucion` (confirmación, `legal/gracias-devolucion.html`).
- Pide nombre, apellidos, email, teléfono, número de pedido (formato M…), motivo y aceptación RGPD.
- Envía un POST JSON a **`https://n8n.letsbebanana.com/webhook/devolucion-web`**. La respuesta `{status:'sin-pedido'}` muestra un error y deja corregir. Cualquier otra lleva a `/gracias-devolucion`.
- Usa las clases `.mura-nl-*` y `.mura-dev-*` del global.
- El formulario nativo de GHL anterior (`HBK7tGDlcIFN0vaXoksg`) y su trigger (`EQfcssMWOwqEkHqAFxZj`) se mantienen hasta confirmar el nuevo.

#### `gracias-compra.html` (post-compra)
- Es HTML completo; se copia solo lo que hay entre las marcas COPIAR.
- No lleva JS ni número de pedido: el número lo genera SP01 más tarde.
- Usa la paleta de entregables (`#F6F2EB` / `#1E1B1A`, solo Cormorant), no la de la web (`#F0EEE8` / `#1D1B18` + Jost).
- **Su cabecera dice que va en `/thank-you`; el README y el global dicen `/gracias`.** Lo vigente es `/gracias`, porque el global redirige `/thank-you` → `/gracias` (ver §8).

#### `newsletter-home.html` (sección al final de `/home`, `id="mura-nl"`)
- Formulario en dos columnas: nombre, apellidos, email, teléfono, fecha de nacimiento y RGPD.
- Envía un POST JSON a **`https://n8n.letsbebanana.com/webhook/alta-newsletter`**. Respuestas `{status:'ok'|'ya-suscrita'}`.
- Desde el 13/11 manda `origen_fuente`, `origen_medio`, `origen_campana`, `origen_anuncio`, `origen_entrada`, `origen_fecha` y `origen_fbclid`:
  - de la UTM o el `fbclid` de la propia URL, si los hay;
  - si no, de `localStorage['mura_origen']`, si tiene menos de 30 días.
- El README avisa de que el bloque publicado en la home **no es igual** a este archivo: la home entera va en un solo bloque, y el fragmento de origen se insertó a mano.

#### `suscripcion-confirmada.html` (página `/suscripcion-confirmada`)
- Destino del enlace de doble opt-in (TL-LS02-CONFIRMAR-OPTIN).
- Lleva cabecera, contador y pie propios; sin CSS, depende del global.

#### Archivos de n8n
| Archivo | Qué es |
|---|---|
| `n8n-newsletter-workflow.json` | «MURA · Alta newsletter web». Webhook POST con path `alta-newsletter`, CORS `allowedOrigins: https://stylebymura.com` y respuesta por nodo. Busca el contacto (`/contacts/?query=`, locationId `NxPF5fOicowujokEk5Hm`). Si ya tiene el tag `nl`, responde `ya-suscrita`. Si no, hace upsert con los siete campos «Origen web · …» por id, quita el tag `nl` y lo vuelve a poner (+ `origen-meta` si la fuente es meta/facebook/instagram/fb/ig). El tag `nl` dispara LS02. |
| `n8n-devolucion-web-nodos.json` | «MURA · Solicitud de devolucion web». Path `devolucion-web`, mismo CORS. Valida email, pedido, motivo y consentimiento, y busca el contacto por email: si no existe responde `sin-pedido`; si existe, hace upsert con los campos `q73ODvZiPLCMqRrUkVCK` (pedido) y `2GQ11kHcaUggy8K4P9U4` (motivo), quita y pone el tag `solicitud-devolucion` (que dispara el 08a) y responde `ok`. **No comprueba que el pedido sea de esa clienta**; su propio `meta` lo dice. |
| `n8n-experiencia-workflow.json` | «MURA · Formulario de experiencia», con path **`mura-experiencia`**. Normaliza, escribe una fila en Google Sheets y responde ok. Si la clienta viene identificada, busca el contacto, escribe el NPS (PUT) y pone el tag `encuesta-completada`. **La página no apunta aquí**, sino a `experiencia-mura`: el JSON es un juego de nodos para copiar al flujo de Sonia. |
| `n8n-aviso-pedido-nodos.json` | Cuatro nodos para pegar en el flujo que ya recibe el `orderId`. Primero pide el pedido completo a GHL `/payments/orders/{id}`. Un nodo de código prepara `mensaje`, `resumen` y `resumenHtml` (con foto por prenda). Después hace PUT a la oportunidad, en los campos `resumen_pedido` y `resumen_pedido_html` (id `wq6dRJdf6jLfWwreqAR5`), y POST a un webhook de avisos por Telegram (`https://n8n.letsbebanana.com/webhook/db8ae6be-…`, una URL que funciona como llave: no conviene difundirla). |

Las peticiones a GHL de estos nodos llevan `Authorization: Bearer PEGAR_AQUI_EL_PIT`; hay que sustituirlo, o mejor usar una credencial Header Auth de n8n.

#### `meta-campana.sh`
- Crea en pausa, con `curl` contra la Graph API v21.0, la campaña «MÛRA · Ventas · Cápsula 01» (OUTCOME_SALES) y un conjunto:
  - 2200 céntimos al día, `OFFSITE_CONVERSIONS` con `ADD_TO_CART` del píxel;
  - España, mujeres 25–65, Advantage+ audience;
  - inicio el 2/11, con `dsa_beneficiary` y `dsa_payor` = MÛRA.
- Variables: `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` y `META_PIXEL_ID`. Con `--ver` solo lista.
- **Está desfasado: no hay que ejecutarlo** (ver §8).

#### `meta-subir-anuncios.py`
- Sube vídeos con `curl`: `advideos`, espera a `ready`, saca una miniatura con ffmpeg, la sube a `adimages`, crea `adcreatives` (SHOP_NOW, `url_tags` con `utm_source=meta&utm_medium=paid_social&utm_campaign&utm_content`) y crea los anuncios en PAUSA.
- Valores fijos en el código: conjunto `52588391414956` (el activo), página `1239437265929299` e Instagram `17841410968485139`.
- Variables: `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` y, opcional, `META_DOF`.
- Necesita ffmpeg.
- Deja un `tienda/__pycache__/` que sobra.

#### `worker-productos.js` y `worker-test.mjs`
Ver §4.

### 1.2 `web/`

#### `web/carrito.html`: el carrito vigente desde el 18/11 (página `/carrito`)
- Trae su propio `<style>` y no lleva cabecera ni pie (son universales).
- Las líneas enlazan a `/producto?id=` (clase `.mura-linea-ir`).
- Muestra subtotal, envío a domicilio (Nacex) a 3 € o «Gratis», y recogida en punto Nacex siempre «Gratis».
- Muestra «Te faltan X € para el envío gratis a domicilio» con barra de progreso (`#mcar-barra`).
- Constantes: `ENVIO=3` y `GRATIS_DESDE=99`.

#### `web/prendas.html` (página `/prendas`)
- CSS propio y rejilla `#mp-grid`, que ya incluye las seis tarjetas de relleno del 13/11.
- Filtros `#mp-filtros` sacados de las colecciones de GHL. Excluye «Colección» y las temáticas de `OCULTAS`, y ordena según `PREFERIDO`.
- Lupa propia (`#mp-busq`, `?q=`) y `?coleccion=<id>`.
- Patrón móvil 2-1-2-1.
- Las agotadas se filtran (`estado!=='agotado'`).
- Flechas de galería por tarjeta: con un IntersectionObserver pide `/products?id=` de cada tarjeta cercana.
- Llama a `/products` y `/collections` en paralelo.

#### `web/colecciones.html` (página `/colecciones`)
- Tarjetas de colección con portada (la de la colección, o la primera foto de una pieza no agotada, sin repetir).
- Mismas colecciones ocultas que /prendas.
- Enlaza a `/prendas?coleccion=`.
- Lupa en línea hacia `/prendas?q=`.
- `#mc-grid:empty{min-height:150vh}`.

#### `web/global/cabecera.html`: elemento universal «Cabecera MURA», en todas las páginas
- **CSS:** sticky en `.c-custom-code:has(.mura-cab)` y `.c-section:has(.mura-cab)`. Quita el relleno a cualquier `.c-section` que contenga `.mura-cab`, `.mura` o `.mura-pie`, y fuerza `height:auto` en sus `.c-custom-code`.
- **Navegación:** marca el enlace actual con `on` (en `/producto` marca `/prendas`).
- **Bocadillo móvil propio**, con la bandera `window.muraBocadillo`, la misma que el global, para que nunca haya dos.
- **Origen de la visita:** con UTM, `fbclid` o un referente externo (excluye leadconnectorhq, gohighlevel, msgsndr y letsbebanana), lo guarda en `localStorage['mura_origen']`. **Solo si `mura_consent` permite Análisis o Publicidad.** Lo borra si se retira el permiso y escucha `mura:consent`.
- **Barra «Tu selección»** (`#mura-barra`, solo ≤719 px, z-index 45): «N piezas · total» con «Finalizar compra →» hacia `/carrito`.
  - Lee el carrito cada segundo, y también en `storage` y `pageshow`.
  - Pone al día `.mura-cart-n` y `.mura-cart-w`.
  - No sale en `/carrito`, `/checkout`, `/thank-you` ni `/gracias*`.
  - Al pulsarla, envía `clarity('event','barra_carrito')`.
- **Su comentario de cabecera sigue diciendo «EN PRUEBA (3/10), solo en /prueba-cabecera»:** está desfasado.

#### `web/global/pie.html`: elemento universal «Pie MURA»
- Pie de cuatro columnas con enlaces legales e Instagram.
- Las legales no lo llevan.
- El global añade «Configurar cookies» junto a `a[href="/politica-cookies"]`.

#### `web/arreglos/1-PRENDAS-cambio.txt` y `2-COLECCIONES-cambio.txt`
- Son instrucciones manuales del 13/11 contra los saltos de carga (CLS): tarjetas de relleno y alto reservado.
- **Ya están incorporadas** en `web/prendas.html` (líneas 98–99) y `web/colecciones.html` (línea 77). Son historia, no hay que volver a aplicarlas.

### 1.3 `plantillas/`

- **`README.md`:** solo lista `plan-contenido/`. **No menciona `anuncios/`.**
- **`plan-contenido/`:**
  - `README.md`: método en cinco pasos y prompt para un cliente nuevo.
  - `plan-contenido.md`: plantilla con huecos `[ASÍ]`, fichas `### N · …` y campos en negrita que parsea el generador.
  - `gen.py`: genera artboards `.dc.html` y `canvas.json` en `<out>/project`. Argumentos: `--marca` (obligatorio), `--pie` (por defecto «Profit Technology para X»), `--fondo #F6F2EB`, `--tinta #1E1B1A`, Cormorant y Jost.
  - `medir.sh`: mide la holgura sobre el pie de cada página A4 con `/opt/pw-browsers/chromium` en modo headless.
- **`anuncios/`:** son montajes **específicos de MÛRA**, no plantillas genéricas.
  - `montar_e.py`: anuncio E «Así llega tu pedido de fiesta» y la copia E_BF (Black Friday, «20 % en toda la web», «Código BLACK20», del 27 al 30/11). Usa ffmpeg y drawtext, en 9×16 y 4×5, sin audio. Texto: «Envío en 24/48 h · Gratis desde 99 €».
  - `montar_fiesta.py`: anuncios B2 (detalle, v2 22/11), F (noche, v3 22/11) y G (Black Friday). Movimiento afín fotograma a fotograma con Pillow y ffmpeg con `xfade`. Necesita las fuentes Cormorant, CormorantIt, Jost400 y Jost600. Con `GUARDAR=1` conserva los segmentos.

### 1.4 `legal/`

- **`README.md`:** las cuatro legales (aviso legal, privacidad, condiciones, más `gracias-devolucion.html`) usan `.mura-legal-*` propio, no dependen del global y se copian entre las marcas COPIAR. La política de cookies **no está en el repo**: está en el Drive de Sonia.
  - Este README dice que `/politica-cookies` no está publicada y que el píxel «hoy no está puesto». **Las dos cosas están desfasadas**, al menos la segunda.
  - Los textos son borradores de IA sin revisión jurídica.
- **`politica-cookies-cambios-2026-10-16.md`:** hallazgos del 16/10 y textos de sustitución para los apartados 02 a 05 de la política.
  - Cookies encontradas: `__cf_bm` y `msgsndr_id`.
  - Claves de GHL `v2_*` / `v3_*`, que se instalan antes de que la clienta consienta.
  - Dudas para el revisor: si `msgsndr_id` puede considerarse técnica, si la API de Conversiones necesita consentimiento previo y qué hacen las claves `v2_` / `v3_`.

---

## 2. Secciones de `codigo-global-tienda.js` (2.869 líneas)

Variables al arranque:
- `PARTE` toma el valor de `window.MURA_PARTE`, y `'todo'` si no existe.
- `HAY_CSS` es head o todo; `HAY_DOM` es body o todo; `HAY_TRAD` es igual que `HAY_CSS`.
- `path` es la ruta sin la barra final.
- `RUTAS_TIENDA` = `/products-list`, `/product-details`, `/checkout`, `/thank-you`.
- `RUTAS_REJILLA` = `/prendas`, `/colecciones`, `/novedades`.
- `estilo(nombre, css)` inyecta un `<style data-mura=nombre>` una sola vez.

| Nº en el código | Parte | Qué hace |
|---|---|---|
| **0 / 0b** | las dos | Lleva `REDIRECCIONES = {'/cart':'/carrito', '/thank-you':'/gracias'}` con `location.replace` y conserva la query. Hace `return` antes que todo lo demás. |
| **1** Sistema de diseño | HEAD | Carga Google Fonts (Cormorant Garamond + Jost) como `<link>` e inyecta `estilo('sistema')`: `.mura` (full-bleed **100vw**), `.mura-nav`, `.mura-logo`, `.mura-links`, `.mura-cart`, `.mura-btn`, `.mura-label`, `.mura-grid`, `.mura-card*`, `.mura-badge`, `.mura-filtros`, `.mura-talla`, `.mura-acc`, `.mura-colores`, `.mura-look`, `.mura-qty`, `.mura-quitar`, `.mura-linea`, `.mura-nl-*` (newsletter y formularios), `.mura-dev-*` (devolución) y `.mura-foot*`. |
| CSS del bocadillo (de la 8) | HEAD | `estilo('bocadillo')` con `.mura-burger` y `.mura-mnav`, a ≤719 px. |
| **5** Contador del carrito | se define arriba y se usa en BODY | Constante `CARRITO_KEY='cart_details_rlc7iAyGF4U1nfwAJOJQ'`. `pintarContador()` actualiza `.mura-cart-n` y `.mura-cart-w` solo si el valor cambia, para que el MutationObserver no entre en bucle. |
| **2** CSS de la encuesta | HEAD, solo `/experiencia` | `.mura-enc-*`: progreso, bloques, estrellas en `row-reverse`, NPS, navegación y pantalla final. |
| **2.c** Buscador de la rejilla (el «3» y el «6» de la cabecera del archivo) | CSS en HEAD y DOM en BODY, en rutas de rejilla | Inyecta un cuadro `.mura-busq` (`#mura-busq-i`) bajo los filtros, filtra con la clase `.mura-oculta-busq` (no toca `display`) y muestra el mensaje «no encontramos». Espera la rejilla con un observer de 8 s como tope. |
| **4** CSS que pisa la tienda de GHL | HEAD, solo rutas de tienda | Bloque `tienda` acotado a `.hl_page-preview--content` con `acotar()`; `:scope` apunta al envoltorio. Cubre base, campos de línea, botón de pago (`:not(.checkout-breadcrumb-item)`), checkout, `.payment-btn`, `.mura-falta`, `.mura-tachado`, reordenación del CP con `order`/`:has()`, `.mura-cp-fuera`/`-otras`, el panel `.mura-puntos*`, el resumen del pedido (`!important` necesarios), producto y carrito vacío. |
| **9** Textos de Cart y Checkout | HEAD, rutas de tienda | Un MutationObserver sobre `documentElement` traduce los textos según un diccionario `exacto` y unos `patrones` («Las plantas rodadoras…», «Add notes…», «Cerciórese…»), también en los placeholder. La NOTA final del archivo lista los ajustes que deberían ponerse a mano en el elemento. |
| **16** Consentimiento | API en HEAD+BODY y banner en BODY | `window.muraConsent` = `{estado, permite(cat), guardar, alCambiar, abrir}` (detalle debajo). |
| **17** Clarity | BODY | `CLARITY_ID='yyrkyipd10'`. `CLARITY_EXCLUIR` = `/checkout`, `/thank-you`, `/gracias`, `/devoluciones`. Con permiso de Análisis manda `consentv2` y carga `https://www.clarity.ms/tag/<ID>`. Guardia `window.__muraClarity`. |
| **18** Píxel de Meta | API en HEAD+BODY y carga en BODY | `META_PIXEL_ID='1799475611078369'` (detalle debajo). |
| Fin de la parte HEAD | — | `if (!HAY_DOM) return;` Después, en BODY: `pintarContador()`, buscador en las rejillas, en `/checkout` las secciones 10, 11, 12, 13 y 14, y el banner con `enlazarPie`, a los 0, 1,2 s y 3,5 s, más `montarClarity()` y `montarMeta()`. |
| **12** Envío tachado | BODY, `/checkout` | Delante de un «Gratis» cuya fila nombra «envio a tu puerta» o «envio estandar» inserta `<s class="mura-tachado">3,00 €</s>`. La recogida en punto no se tacha. Variables `NOMBRES` y `PRECIO='3,00 €'`. |
| **10** Señalar el campo que falta | BODY, `/checkout` | En fase de captura, al pulsar avanzar o pagar, vuelve a emitir `input`/`change` en los campos rellenos (por el autorrelleno). Cuando aparece `.alert-danger` fuera del resumen, marca los obligatorios vacíos con `.mura-falta` y lleva la vista al primero. |
| **11** EDITAR → /carrito | BODY, `/checkout` | Intercepta en captura `.edit-cart`, `a[href="/cart"]` y `a[href^="/cart?"]` y navega a `/carrito`. |
| **13** Dirección por código postal | BODY, `/checkout` | Pone España por defecto. Del prefijo del CP saca la provincia (tabla `PROV`). La ciudad sale de `URL_CP` (un JSON de GeoNames alojado en la librería de medios de GHL), con un selector `.mura-cp-otras` si hay varias poblaciones. Los valores se ponen con `input`+`change`+`blur` (el `blur` recalcula las tarifas). Fuera de España muestra «consúltanos» por WhatsApp y apaga `.payment-btn` (marca `_muraBloqueado`). Ajusta el tabulador al orden visual. |
| **14** Puntos Nacex Shop | BODY, `/checkout` | Con la tarifa «nacex shop» marcada abre `.mura-puntos`: lista de puntos del CP, búsqueda por otro CP y «Elegir». Detalle debajo. |
| **8** Bocadillo móvil | BODY | Oyente delegado con la bandera `window.muraBocadillo`. Si una `.mura-nav` no trae `.mura-burger` (las cabeceras que inyecta la sección 7), lo añade. Observer con 10 s de tope. |
| **15** Aviso del 10 % | BODY | Detalle debajo. |
| Fin para las no-tienda | — | `if (!esTienda) return;` |
| **7** Cabecera y pie inyectados | BODY, rutas de tienda | Si no existe `.mura-nav`, inserta la cabecera con contador y oculta la del tema («Business Name»). Añade `.mura-foot` si falta y un observer para el contador. Corre al cargar y otra vez a los 1,2 s. |
| NOTA final | — | Los textos de los elementos Cart y Checkout que habría que poner a mano. La API de páginas de GHL no permite escribir. |

**Detalle de la 16 (consentimiento):**
- Guarda en `localStorage['mura_consent']` el objeto `{v:1, ts, analitica, marketing}`. Caduca a los 365 días y tiene respaldo en memoria si no se puede escribir.
- Al retirar el permiso borra `_clck` y `_clsk` (análisis) o `_fbp` y `_fbc` (marketing).
- Avisa a Clarity con `consentv2` y a Meta con `fbq('consent')`, y emite el evento `window` `mura:consent`.
- El banner `.mura-ck` tiene «Rechazar todas», «Aceptar todas» y «Configurar»; su CSS se inyecta al montarlo (desde el 23/10).
- Cualquier `[data-mura-cookies]` reabre el panel. `enlazarPie()` añade «Configurar cookies» (`href="#cookies"`) junto a cada `a[href="/politica-cookies"]`.

**Detalle de la 18 (píxel de Meta):**
- `window.muraMeta` = `{track(nombre, datos), ultimo{}, _cola, _vaciar}`.
- `track` genera un `eventID` `nombre_<base36>_<aleatorio>`.
- Sin permiso no envía nada, salvo que guarda en memoria el último `ViewContent`.
- `cargarMeta()` carga `connect.facebook.net/en_US/fbevents.js`, y hace `set autoConfig false`, `consent grant`, `init`, `PageView` y vacía la cola.
- Recoge las llamadas que la ficha haya dejado en cola en `muraMeta.q`.

**Detalle de la 14 (Nacex Shop):**
- Webhooks:
  - `GET https://n8n.letsbebanana.com/webhook/puntos-nacex-shop?cp=`
  - `POST https://n8n.letsbebanana.com/webhook/seleccion-punto-shop`, con cuerpo `{email, cp_busqueda, codigo}` como `text/plain`.
- Guarda el punto en `sessionStorage['mura_punto']` y lo vuelve a confirmar con n8n.
- Apaga `.payment-btn` (marca `_muraBloqueadoShop`) hasta que n8n responde `{ok:true}`.
- Mientras la clienta no elija, fuerza «Envío a tu puerta» con un `click()` real y manda la recogida al final de la lista con `order`.

**Detalle de la 15 (aviso del 10 %):**
- Panel lateral que entra a 1 s y se recoge a 6 s, y deja una pestaña «10 %».
- `sessionStorage['mura_dto_visto']`: en las páginas siguientes de la visita sale ya recogido.
- `localStorage['mura_dto']==='suscrita'`: no sale más.
- No sale en `RUTAS_SIN_AVISO` (checkout, carrito, cart, páginas de gracias, baja, suscripción confirmada, experiencia, devolución y legales).
- Espera a que la clienta conteste el banner de cookies.
- El botón lleva a `/#mura-nl` y deja el foco en `#mnl-email`.

---

## 3. Flujo de build

```
tienda/codigo-global-tienda.js  (ÚNICA FUENTE)
   │  cd tienda && ./build.sh
   ├─► tracking-code-head.html   (window.MURA_PARTE='head' + fuente)  → Tracking Code Head
   ├─► tracking-code-body.html   (window.MURA_PARTE='body' + fuente)  → Tracking Code Body
   └─► node extraer-css.js ─► css-paginas-tienda.css (sistema+bocadillo+tienda) → Custom CSS de /checkout
```

- **Generados (no se tocan):** los dos `tracking-code-*.html` y `css-paginas-tienda.css`.
- **No generado, aunque lo diga:** el bloque `mura:css:inicio/fin` de `producto.html`. Su comentario cita `build.sh` y `poda-css.js`, pero `build.sh` no lo toca y `poda-css.js` no existe en ningún sitio del sistema. Hoy se mantiene a mano.
- **Fuentes que se pegan tal cual, sin build:** `producto.html`, `web/*.html`, `web/global/*.html`, `tienda/{experiencia,devoluciones-form,newsletter-home,suscripcion-confirmada,gracias-compra}.html` y `legal/*.html` (estos, solo entre las marcas COPIAR).
- **Orden de pegado del README:** primero Head y Body, después el CSS de `/checkout`, después las páginas.
- **Antes de publicar o hacer commit:** pasar el grep de secretos de CLAUDE.md, `grep -rE 'AMf-|pit-[0-9a-f]|EAA[A-Za-z0-9]' . --exclude-dir=.git`.

---

## 4. El Worker `mura-productos` (`tienda/worker-productos.js`)

**Despliegue:** Cloudflare → Workers → `mura-productos` → Edit code → pegar el archivo entero → Deploy. Plan gratuito. URL: `https://mura-productos.germanborrello-d78.workers.dev`.

**Variables de entorno:**
- `GHL_TOKEN`: PIT con View Products, View Product Prices y View Product Collections.
- `GHL_LOCATION`.
- `ALLOWED_ORIGIN`: opcional, separada por comas. Vacía o `*` deja pasar cualquier origen.

**Endpoints (solo GET y OPTIONS; cualquier otra ruta devuelve 404 JSON):**

| Ruta | Llamadas a GHL | Salida |
|---|---|---|
| `GET /products` | Listado `/products/?limit=100`, inventario `/products/inventory` paginado de 100 en 100 hasta 1000, y los precios que falten (`/products/{id}/price`) hasta **`PRESUPUESTO_PRECIOS=38`** por petición, en lotes de 15 | `{actualizado, piezas:[…], _subpeticiones, _sinPrecio}` |
| `GET /products?id=X` | Detalle (con `medias`, la galería) y precios, siempre frescos | `{actualizado, piezas:[pieza]}` |
| `GET /collections` | `/products/collections` y **una llamada por colección** (`/products/?collectionIds=`) | `{actualizado, colecciones:[{id, nombre, slug, imagen (o primera foto), piezaIds}]}` |

**Formato de pieza:** `{id, nombre, descripcion, imagenes[], coleccion, coleccionIds, creado, tallas[], estado}`.
- `estado` vale `agotado` si el total es 0, `ultimas` si es ≤3 y `disponible` en otro caso. El stock nulo cuenta como 99.

**Formato de talla:** `{priceId, talla, precio, moneda, stock (null = sin control), variantOptionIds, trackInventory, availableQuantity, allowOutOfStockPurchases, type}`.

**Caché:**
- Respuesta completa: 60 s en `caches.default`. La clave incluye la query y `__origin`.
- Precios de todo el catálogo: una sola entrada, `__precios`, de 24 h.
- La cabecera `Cache-Control: public, max-age=60` va en todas las respuestas, también en las de error.

**Límites:**
- 50 subpeticiones por petición, y las operaciones `match`/`put` de la Cache API cuentan.
- El contador `usadas` corta en 48.
- Peor caso en frío: unas 45.

**Errores:**
- `try/catch` global: un fallo devuelve 500 `{error:'worker', detalle}` y queda en Logs.
- Fallos de GHL: 502 `ghl_products`, `ghl_collections` o `ghl_product` (404 si GHL da 404).
- Un 401 significa que hay que renovar el PIT.

**CORS:** `Access-Control-Allow-Origin` devuelve el origen de la petición si la lista está abierta. Si no, el origen permitido, o el primero de la lista. Lleva `Vary: Origin` y métodos `GET, OPTIONS`.

**`worker-test.mjs`:**
- Simula 60 productos con `fetch` y `caches` falsos.
- Comprueba:
  - menos de 50 llamadas en frío y al menos 38 piezas con precio;
  - el formato de las tallas;
  - una sola llamada con la respuesta en caché;
  - todas las piezas con precio en caliente;
  - el número exacto de llamadas en caliente;
  - `?id` con galería;
  - colecciones sin imagen;
  - 502 con GHL caído y 500 ante una excepción.
- Pasa hoy.

---

## 5. `tienda/carrito.html` frente a `web/carrito.html`

**El vigente es `web/carrito.html`** (README del 18/11). Los dos van en el elemento de código de `/carrito`; `tienda/carrito.html` documenta `custom-code-DN8OVgnA5P`.

| | `tienda/carrito.html` (antiguo, 30/10 o antes) | `web/carrito.html` (vigente) |
|---|---|---|
| CSS | ninguno, depende del global | `<style>` propio con Google Fonts y las reglas `.mura-*` que usa |
| Cabecera y pie | copiados dentro, con su script de contador | ninguno: los ponen los universales |
| Línea | imagen y nombre sin enlace | imagen y nombre enlazan a `/producto?id=` (`.mura-linea-ir`) |
| Resumen | «Total» | «Subtotal», envío a domicilio 3 € o Gratis, recogida en punto Gratis, «Te faltan X €» con barra, `ENVIO=3`, `GRATIS_DESDE=99` |
| Texto bajo el botón | «Los datos de envío y el pago…» | «Eliges la entrega y pagas…» |
| Lógica común | `fmt()` (redondeo a céntimos, coma decimal), `setQty` (bajar de 1 quita la línea), «Quitar», sin validar stock | igual |

---

## 6. Constantes importantes

**Carrito y almacenamiento del navegador:**
- `localStorage`: `cart_details_rlc7iAyGF4U1nfwAJOJQ` (el carrito de GHL), `mura_consent`, `mura_origen`, `mura_dto`.
- `sessionStorage`: `mura_catalogo_v1` (5 min), `mura_punto`, `mura_dto_visto`, `mura_cl_prenda_vista`, `mura_cl_prenda_carrito`.
- Banderas en `window`: `muraConsent`, `muraMeta`, `muraBocadillo`, `muraBarra`, `__muraClarity`, `__muraMeta`.

**Envío:**
- Gratis desde **99 €**: lo decidió Sara el 20/11; antes era 99,99 €.
  - Está en `web/carrito.html` (`GRATIS_DESDE`), en el texto de `producto.html` (`#md-envio`), en los textos de `montar_e.py` y en las tarifas de la zona «España» de la tienda de GHL.
- Precio del envío a domicilio: **3 €** (`ENVIO=3` en el carrito y `PRECIO='3,00 €'` en la sección 12).
- La recogida en punto Nacex Shop es siempre gratis.

**Identificadores de GHL y elementos:**
- Ficha: `custom-code-oM1HT_mKKm` (página `cmPhl3N0IF3smLo8Oy8x`).
- Carrito: `custom-code-DN8OVgnA5P` (página `qsUEwHJLz2xiSulCN5jD`).
- Location: `NxPF5fOicowujokEk5Hm`.
- Campo NPS: `BpEcTG8IYDXRUQNrM3h0`.
- Devolución: campos `q73ODvZiPLCMqRrUkVCK` (pedido) y `2GQ11kHcaUggy8K4P9U4` (motivo); custom value `url_formulario_devolucion` `2S2b9lrVpft9p1adZxN5`.
- Campos de origen: `TFcfrXYQEVkceLrsUwNh`, `TsWpl0Ruj14aQExe8Ymb`, `H3Hdw340TwSgbNEu5K9i`, `5TnYmVZ70fLAWhHSQLvf`, `2TyFnk7n80k5CTyvkPlp`, `FpQ4DRr31zqiupKkuApY` y `OnLq8TJNstBIn8UrURRV` (también en `datos/ghl_campos_origen.json`).
- Campo `resumen_pedido_html`: `wq6dRJdf6jLfWwreqAR5`.

**Clarity:**
- Proyecto: `yyrkyipd10`. Se entra con la cuenta de GHL Team Latam.
- Etiquetas: `prenda_vista`, `prenda_carrito`.
- Eventos: `anadir_carrito` (con `upgrade`), `barra_carrito`.

**Meta:**
- Píxel: `1799475611078369`. El de Profit, `1577201230843977`, ya no se usa.
- Conjunto activo: `52588391414956`. Campaña activa: `52585971203356` (según `docs/meta-campana.md`).
- Página: `1239437265929299`. Instagram: `17841410968485139`.
- Cuenta publicitaria: `act_1141864065246239`, del portafolio de Profit.

**URLs:**
- Worker: `https://mura-productos.germanborrello-d78.workers.dev`.
- n8n: `https://n8n.letsbebanana.com/webhook/` seguido de `alta-newsletter`, `devolucion-web`, `experiencia-mura`, `puntos-nacex-shop` o `seleccion-punto-shop`.
- JSON de códigos postales: `https://assets.cdn.filesafe.space/NxPF5fOicowujokEk5Hm/media/cd38d82d-beea-43d5-8939-873dae4b58b2.json`.
- WhatsApp: `34637681234`.
- Correo: `hello@stylebymura.com`.

---

## 7. Cómo encaja todo (dependencias)

- **Páginas propias** (/home, /prendas, /colecciones, /producto, /carrito, etc.):
  - Llevan la cabecera y el pie universales y su elemento de contenido con CSS propio.
  - El Tracking Code Body corre en todas: contador, banner, Clarity, Meta, aviso del 10 % y bocadillo de respaldo.
  - El Head aporta `sistema` (salvo en /producto) y la traducción en las rutas de tienda.
- **Rutas nativas de tienda** (`/checkout` y las nativas que no se ven): el CSS llega del Custom CSS y del Head; cabecera y pie los inyecta la sección 7; en /checkout corren las secciones 9 a 14.
- **Meta:** ficha → `muraMeta.track` → `fbq` solo con permiso de Publicidad. `Purchase` sale del servidor por GHL (SP01 → «Meta Conversion API»).
- **Atribución:** cabecera (`mura_origen`, con consentimiento) → formulario de la home → n8n → campos «Origen web · …» + tag `origen-meta`.

---

## 8. Riesgos, código muerto e incoherencias

### Numeración y documentación desfasada
1. **La numeración de secciones choca.**
   - `tienda/README.md` llama al banner «sección 10», a Clarity «sección 11» y al píxel «sección 12». CLAUDE.md dice que `ViewContent`/`AddToCart` se envían en la «sección 12».
   - En el código son la **16, la 17 y la 18**. La 10 es «señalar el campo que falta» y la 12 es «envío tachado».
   - Además, la lista de la cabecera del archivo menciona las secciones «3» y «6», que en el código son la «2.c», y no lista la 0b, 9, 12, 13 ni 14.
2. **`gracias-compra.html` dice que va en `/thank-you`** (y que `/gracias` no lo vería nadie). El README y el global (sección 0b: redirige `/thank-you` → `/gracias`) dicen lo contrario. Lo vigente es **`/gracias`**; el comentario del archivo está mal.
3. **La tabla de pegado de `tienda/README.md` está incompleta.** Sigue listando `tienda/carrito.html` aunque el vigente es `web/carrito.html`, y dice que `experiencia.html` «sigue pendiente de URL» cuando ya lleva `experiencia-mura`.
4. **Los comentarios de `producto.html` prometen que `build.sh` regenera su bloque CSS «podado» con `poda-css.js`.** Ni ocurre ni existe ese script. Si se cambia una regla del bloque `sistema` en el global, la ficha no la recibe, porque el global ve `style[data-mura="sistema"]` y no inyecta el suyo. Hay que editar ese bloque a mano.
5. **Referencias a archivos que no existen:**
   - `tienda/pruebas/*.test.js` y `tienda/pruebas/fixtures/` (citados en las secciones 12, 13, 14, 15 y 8);
   - `tienda/datos/cp-es.json` (el JSON está alojado en GHL);
   - `web/cart-redireccion.html` (sección 11);
   - `web/tracking-bocadillo.html` (historia).

   Las pruebas automáticas que citan los comentarios no están en el repo.
6. **Otros comentarios desfasados:**
   - `web/global/cabecera.html` dice «EN PRUEBA, solo /prueba-cabecera».
   - El comentario de la sección 12 habla de «desde 99,99 €».
   - `legal/README.md` dice que el píxel «no está puesto».
   - El `meta` del JSON de la newsletter cita «tienda/newsletter.html».
   - El README de `plantillas/` no menciona `anuncios/`.
7. **`n8n-experiencia-workflow.json` usa el path `mura-experiencia`**, pero la página envía a `experiencia-mura`. Es intencionado (el JSON son nodos para copiar al flujo de Sonia), pero si alguien lo importa tal cual, la página no llegará a él.

### Riesgos funcionales
8. **El envío gratis del carrito no tiene en cuenta el cupón.**
   - `web/carrito.html` compara el **subtotal sin descuento** con 99 €. GHL aplica la tarifa sobre el total después del cupón (lo dice la propia sección 12).
   - Con `BLACK20` (20 %) en Black Friday, un carrito de 110 € verá «Tu envío a domicilio es gratis», pagará 88 € de mercancía y en el checkout le cobrarán 3 € de envío.
   - Conviene revisarlo antes del 26/11, o añadir «antes de descuentos».
9. **Precios con 24 h de retraso en la rejilla.**
   - El Worker guarda en caché los precios del catálogo 24 h. La ficha (`?id`) siempre los pide frescos.
   - Un cambio de precio en GHL puede tardar hasta un día en verse en /prendas, «Completa tu look» y las miniaturas de colores. Mientras tanto, rejilla y ficha discrepan.
   - Las piezas que se quedan sin precio en frío (`precio:null`) se muestran como «**0 €**»: las rejillas y la ficha hacen `Math.min` sobre valores nulos.
10. **Límites silenciosos del Worker.**
    - `/products/?limit=100` no pagina: con más de 100 productos, los que sobren desaparecen sin aviso.
    - `/collections` hace una llamada por colección; con unas 45 colecciones se agota el presupuesto, y el `catch` deja `piezaIds` vacíos sin error.
    - Las respuestas de error también salen con `max-age=60`.
11. **Coste de las flechas de `/prendas`.** Cada tarjeta que entra en pantalla pide `/products?id=`. Son 2 llamadas a GHL más la caché por pieza y por minuto, así que el tráfico a GHL escala con las visitas.
12. **CORS de n8n.** Los JSON fijan `allowedOrigins: https://stylebymura.com`, pero la web se sirve en **`https://www.stylebymura.com`** (los enlaces de `gracias-compra` y de CLAUDE.md). Si el nodo publicado tiene esa misma configuración, los preflight desde `www` fallarán. Hay que comprobarlo en el flujo real. El README dice que en la prueba del 13/11 el envío a n8n «se interceptó»: no se comprobó de punta a punta.
13. **`mura_dto='suscrita'` no lo escribe nadie del repo.** La sección 15 dice que lo deja el formulario de la home, pero `newsletter-home.html` no lo escribe, así que la pestaña del 10 % no desaparecería tras suscribirse. Quizá lo haga el bloque publicado en la home, que difiere del archivo; hay que comprobarlo en GHL.
14. **Exclusiones de Clarity incoherentes.** `CLARITY_EXCLUIR` incluye `/devoluciones` (página informativa) pero **no `/devolucion`**: el formulario con nombre, email, teléfono y número de pedido. Tampoco `/experiencia`. El argumento del propio código («datos personales en pantalla») pide excluir `/devolucion`. El píxel de Meta no excluye ninguna ruta, ni siquiera `/checkout`.
15. **La devolución no valida que el pedido sea de esa clienta**, solo que el contacto exista (sigue pendiente en CLAUDE.md). Además, «Responder datos invalidos» responde 200 `{status:'datos-invalidos'}`, y la página lo trata como éxito y redirige a gracias. Solo pasaría si alguien salta la validación del navegador.
16. **`meta-campana.sh` no debe volver a ejecutarse:**
    - crea un conjunto nuevo en cada ejecución (solo evita duplicar la campaña);
    - apunta a la campaña antigua por nombre;
    - usa la edad 25–65.

    Lo vigente es la campaña `52585971203356` con el conjunto `52588391414956`, activa desde el 10/11. CLAUDE.md todavía da como pendientes la campaña `52549695358270` y el conjunto `52549695445670`, y que falta activar: está desfasado.
17. **Los scripts de Meta pasan el token por la línea de comandos de `curl`.** `meta-subir-anuncios.py` lo pasa como argumento y `meta-campana.sh` en la URL, así que es visible con `ps` en la máquina local. No es grave en local, pero conviene saberlo.
18. **El defecto `100vw` sigue en el código** (en `.mura` del global y en todos los `web/*.html`, y en `.mura-cab`/`.mura-pie`). Es el defecto del 22/9 (8 px de scroll lateral con barra de desplazamiento) que CLAUDE.md lista como pendiente.
19. **CSS duplicado a mano.** `web/prendas.html`, `web/colecciones.html` y `web/carrito.html` traen copias del sistema `.mura-*` que no se generan; ya difieren del global (por ejemplo, `align-items` en `.mura-filtros`).
    - En /prendas, la sección 2.c del global inyecta un segundo buscador `.mura-busq` sobre las tarjetas de relleno. Queda oculto solo porque el CSS de la página pone `.mura-busq{display:none}`: es código que no se usa.
20. **Posibles cabeceras y pies duplicados.** `experiencia.html` y `suscripcion-confirmada.html` llevan cabecera y pie propios. Si esas páginas también tienen los elementos universales, saldrán dos. Hay que comprobarlo en GHL.
21. **Inventario de cookies sin actualizar.** El documento de cambios de la política (16/10) no recoge las claves añadidas después: `mura_origen` (atribución, con consentimiento), `mura_dto`, `mura_dto_visto`, `mura_punto` y `mura_cl_*`. Tampoco la API de Conversiones de GHL para `Purchase`, que según `docs/meta-campana.md` ya está activa. La revisión jurídica pendiente debería incluirlas.
22. **Coherencia de textos de anuncios.** `montar_e.py` dice «Envío en 24/48 h», mientras la ficha dice «se prepara en 1-2 días laborables» y la página de gracias, «dale unos días». Además, E_BF y G llevan «del 27 al 30 de noviembre» y hay que pausarlos el 30/11.
23. **Sobra:** `tienda/__pycache__/`. Los `web/arreglos/*.txt` ya están aplicados.
