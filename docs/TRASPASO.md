# TRASPASO · MÛRA · estado a 25/11/2026

Documento para que **una sesión nueva de Claude Code** continúe el proyecto sin el contexto de la conversación anterior.
Léelo entero antes de tocar nada. Después, `CLAUDE.md` (reglas permanentes) y los anexos de `docs/traspaso/`.

| Documento | Qué tiene | Cuándo abrirlo |
|---|---|---|
| **este archivo** | Estado real hoy, lo que hay que hacer y cuándo, ids vigentes, trampas, cómo se trabaja | Siempre, primero |
| `CLAUDE.md` | Reglas del proyecto, personas, acuerdos. Actualizado el 25/11 con lo vigente | Siempre |
| `docs/traspaso/01-codigo-web.md` | Cada archivo de `tienda/`, `web/`, `plantillas/`, `legal/`: dónde se pega, secciones del código global, Worker, n8n, riesgos | Antes de tocar la web o el Worker |
| `docs/traspaso/02-registro-ghl-resumido.md` | Las §1–§42 del registro técnico de GHL resumidas, mapa de workflows y tags, 35 trampas de GHL | Antes de tocar un workflow, plantilla o campo |
| `docs/traspaso/03-negocio-meta-contenido.md` | Negocio, cronología, Meta (cuentas, anuncios, resultados), plan de contenido, cobros, correos, contradicciones | Antes de hablar de dinero, anuncios o contenido |
| `datos/ghl-inventario-20261125/README.md` | Foto de la subcuenta de GHL sacada por API hoy: workflows, pipelines con oportunidades, tags con contactos, campos, valores, plantillas, páginas, tienda, cupones, pedidos | Para saber qué hay en GHL sin abrirlo |
| `docs/2026-08-07-implementacion-ghl.md` | Registro técnico original (200 KB). Manda sobre el resumen | Cuando el resumen no baste |

Las cifras de este documento salen de la API de Meta y de GHL consultadas el 25/11 o de los documentos del repo; cada una lleva su fuente.

---

## 1. Qué es esto, en cinco líneas

- **MÛRA** ([stylebymura.com](https://www.stylebymura.com), Instagram @bymurastudio) es una tienda de moda femenina de **Sara** (autónoma, España). Piezas de producción corta: ~5 unidades por prenda.
- La web y el CRM están en **GoHighLevel** (subcuenta `NxPF5fOicowujokEk5Hm`, zona horaria Europe/Madrid). El catálogo lo sirve a la web un **Worker de Cloudflare** de German. **n8n** (de Sonia, `n8n.letsbebanana.com`) hace Nacex, newsletter, devoluciones, avisos por Telegram. Cobros con **Stripe** (y PayPal).
- **Profit Technology** (German, con Henry y Oliver) lleva desde el 10/11 las **campañas de Meta** de MÛRA: 350 €/mes de gestión; la inversión en Meta la paga Sara con su tarjeta.
- Quien te habla en la sesión es **German** (escribe en rioplatense; todo lo que va a Sara o Sonia, en **castellano de España**, sin jerga).
- Tú haces: código de la web, cambios por API en GHL y Meta (con reglas), montaje de anuncios con ffmpeg, informes y mensajes para Sara.

---

## 2. Antes de empezar: entorno y credenciales

### 2.1 Variables de entorno (nombres; los valores nunca se escriben en el repo)

En la sesión anterior existían estas variables. **Comprueba que la sesión nueva las tiene** (`env | grep -oE '^(META|MURA|GHL)[A-Z_]*'`); si faltan, pídeselas a German para que las configure en el entorno (no en el repo).

| Variable | Para qué | Ojo |
|---|---|---|
| `MURA_GHL_PIT` | Token PIT de la subcuenta de MÛRA | **La buena para GHL** |
| `MURA_GHL_LOCATION_ID` | `NxPF5fOicowujokEk5Hm` | |
| `GHL_API_KEY`, `GHL_LOCATION_ID` | **Otra subcuenta** (`cuYGsE1t8wdILMeIbGgz`), no MÛRA | **No usarlas para MÛRA** |
| `META_ACCESS_TOKEN` | Token del usuario del sistema (app `MURA Ads`), sin caducidad | Ver permisos en `docs/meta-api.md` |
| `META_AD_ACCOUNT_ID` | `act_1141864065246239` («Mura - ES»), la cuenta donde viven los anuncios | Correcta |
| `META_PIXEL_ID` | Vale `1577201230843977`, **el píxel viejo de Profit** | **El píxel de MÛRA es `1799475611078369`**. No uses la variable para nada de MÛRA |
| `META_BUSINESS_ID` | `885279100130262` (portafolio de Profit, dueño de la cuenta publicitaria) | El de MÛRA es `1239463275926698` |
| `META_PAGE_ID` | `1239437265929299` (página de MÛRA) | |
| `META_APP_ID` | `1139141968627775` (`MURA Ads`) | |
| `META_CAPI_TOKEN` | Token del píxel para la API de Conversiones | |

### 2.2 Red y herramientas

- GHL: `https://services.leadconnectorhq.com`, cabecera `Version: 2021-07-28` (conversaciones: `2021-04-15`). **Siempre con `curl`**: `urllib` da 403 por Cloudflare.
- Meta: Graph API `v21.0` con `curl`, valores con `+` o espacios con `--data-urlencode`.
- Drive: el material de Sara está en Drive; se baja con `gdown` (`pip install gdown`). Hace falta que el entorno permita `drive.google.com`, `docs.google.com`, `drive.usercontent.google.com`.
- Montaje: `ffmpeg`, Python con Pillow; fuentes en `anuncios/fuentes/`.
- Web: `node` para `tienda/build.sh` y `tienda/worker-test.mjs`. Playwright/Chromium para probar páginas.

### 2.3 Repositorio

- `Gochiri/mura`, rama de trabajo **`claude/brave-lamport-gpdb1g`**. No crear PR salvo que German lo pida.
- Antes de cada commit: `grep -rE 'AMf-|pit-[0-9a-f]|EAA[A-Za-z0-9]' . --exclude-dir=.git` y revisar. **Falsos positivos conocidos**: el color `#EAAA08` en `datos/ghl-inventario-*/tags.json`, `EFA7AB2B…` (nombre de imagen) en `datos/backups/ghl_productos_20261110.json`, el propio patrón en `CLAUDE.md`/`docs/meta-api.md`, y binarios PDF/MP4.
- Cola de commits: `Co-Authored-By` con el modelo que corra + `Claude-Session`.
- **El PIT de GHL sigue en el historial de git** (desde agosto). Rotarlo es un pendiente urgente de German + Sonia (§8).

---

## 3. Estado a 25/11/2026 (consultado por API ese día)

### 3.1 Meta

- **Cuenta publicitaria** «Mura - ES» `act_1141864065246239` (EUR, Madrid). Es del portafolio de **Profit**, con la tarjeta de MÛRA; Meta no dejaba al portafolio nuevo de MÛRA tener cuenta propia. Pendiente: pasarla a MÛRA cuando se pueda.
- **Píxel de MÛRA** `1799475611078369`, conectado a esa cuenta. Dominio `stylebymura.com` verificado (10/11).
- **Campaña** «MÛRA · Ventas · Cápsula 01» `52585971203356`, OUTCOME_SALES, **activa desde el 10/11**.
- **Conjunto** «Mujeres 25–48 · España · Advantage+» `52588391414956`, **22 €/día**, optimiza a **AddToCart** del píxel de MÛRA, Advantage+ audiencia (control 25–65, sugerencia 25–48; el nombre engaña), mujeres, España.

| Anuncio | Id | Ángulo | Estado 25/11 | Del 10 al 25/11: gasto · visitas · carritos |
|---|---|---|---|---|
| D · Así llega tu pedido | `52588421124356` | Experiencia (empaque) | **Activo** | 222,03 € · 928 · 44 · 1 compra atribuida (232,20 €) |
| E · Así llega tu pedido de fiesta | `52591554747156` | Experiencia, conjunto Animal Verde | **Activo desde 25/11** | recién activado |
| B2 · Mírala de cerca | `52591554813156` | Detalle (una prenda distinta por plano) | **Activo desde 25/11** | recién activado |
| F · Fiesta de noche | `52591554852356` | Ocasión (dos looks de noche + encaje) | **Activo desde 25/11**, «una semana de prueba» pedida por Sara | recién activado |
| G · Black Friday | `52591554954356` | Oferta: 20 %, código BLACK20 | **En pausa**: activar el 27/11, pausar el 30/11 noche | — |
| B · El detalle | `52588421059756` | Detalle (otoño) | Pausado 25/11 (lo sustituye B2) | 102,77 € · 263 · 24 |
| C · Looks de calle | `52588656515756` | Prenda puesta de día | Pausado 20/11 | 17,37 € · 13 · 1 |
| A · Nueva colección otoño | `52588656496756` | Novedad | Pausado 14/11 | 8,26 € · 10 · 0 |

Totales del conjunto del 10 al 25/11 (Meta): **358,09 €**, 27.751 impresiones, 2.084 clics, 1.228 visitas a la web, **69 carritos**, 1 compra atribuida por Meta.
Lectura que se hizo el 22/11 con datos 10–21/11: **D atrae** (mucha visita barata, 4,8 % añade al carrito) y **B convierte** (12,3 % añade). De ahí el plan de **un ángulo por anuncio**.

UTM: `utm_source=meta&utm_medium=paid_social&utm_campaign=<otono_2026|fiestas_2026|black_friday_2026>&utm_content=<A_…|B_…|D_…|E_asi_llega_fiesta|B2_detalle_fiesta|F_fiesta_noche|G_black_friday>`. Todos llevan a `/prendas`.

Objetos viejos que **no se usan**: campaña `52549695358270` y conjunto `52549695445670` (cuenta `act_1650663796846832`, octubre); conjunto `52585971218156` «NO USAR · antiguo (píxel de Profit)» (pendiente de borrarlo a mano). **`tienda/meta-campana.sh` está desfasado: no ejecutarlo** (crea conjuntos nuevos).

### 3.2 Tienda y ventas (GHL, 25/11)

- **Pedidos reales pagados**: 13 desde septiembre (1.552,60 € en la cuenta, incluidos los luego reembolsados). En noviembre:
  - 2/11 151,20 €; 12/11 134 € (**duplicado, reembolsado el 12/11**), 120,60 €, 120,60 €, 232,20 € (atribuido a D); 14/11 72 € (por UTM, de D); **23/11 120,60 € (Chaqueta + Pantalón Vínculo Burdeos con BIENVENIDA10) reembolsado el 24/11 — motivo desconocido, preguntar a Sara**.
- **Pagos que no se completan**: el 19/11 hubo 5 intentos sin pagar (4 por PayPal «pendiente», 1 tarjeta rechazada) de 3 personas; 4 llevaban el **Vestido Mini Camisero Asimétrico**. En todo el historial, PayPal: 7 intentos reales, **1 pagado**. **Hay que revisar la integración de PayPal en GHL y hacer una compra de prueba** (pendiente desde el 20/11, nadie lo ha hecho).
- **Productos**: 60 (59 visibles), 130 variantes, 298 unidades, 7 variantes a 0. Colección nueva «Fiesta» (`6b057443982fac50b3bcff51`).
- **Envío** (zona «España»): domicilio Nacex **3 € hasta 98,99 €, gratis desde 99 €** (cambiado el 20/11 por API, copia en `datos/backups/ghl_envio_zona_20261120.json`); recogida en punto Nacex Shop **siempre gratis**.
- **Cupones**: `BIENVENIDA10` (10 %, newsletter, 1 por clienta, 8 usos) y **`BLACK20`** (20 % en toda la tienda, programado del 26/11 00:00 al 30/11 23:59 hora peninsular, sin límite, sin exclusiones).
- **Contactos**: 191. Con `newsletter-suscrita`: 63. `nl-sin-confirmar`: 66. `origen-meta`: 38. `carrito-no-recuperado`: 14.
- **Oportunidades abiertas**: «Ventas / Pedidos»: 8 en 01 Carrito Abandonado, 1 en 03 En Preparación, 2 en 04 Enviado, 9 en **Venta web** (el archivo manual de Sara de ventas cerradas). «Leads / Comunidad»: 64 en 03 Suscrita Newsletter.

### 3.3 Web (lo último que se cambió y está publicado y verificado)

Verificado comparando lo servido en `stylebymura.com` con el repo (método en §6.2):
- `tienda/producto.html` (ficha): etiquetas de Clarity `prenda_vista`/`prenda_carrito`, evento `anadir_carrito`, línea «Envío gratis desde 99 € · Recogida gratis en punto Nacex».
- `web/carrito.html` (`/carrito`): subtotal, envío 3 € o gratis desde 99 €, «Te faltan X €» con barra.
- `web/global/cabecera.html` (elemento universal «Cabecera MURA»): barra móvil «Tu selección» y evento de Clarity `barra_carrito`.
- Plantilla «20 · Carrito abandonado · 2» con «desde 99 €».

### 3.4 Correo de carrito abandonado (LS03)

Workflow `1e240ed6-846d-42ad-8e34-e4eecc36f67f`: Abandoned Checkout (10 min) → crea oportunidad en 01 → correo 1 «Tu selección sigue aquí.» → espera 1 h o pago → espera 24 h o pago → **correo 2** «¿Te ayudamos con tu selección?» (plantilla `6afdf8e9218912ba8f1fbbbc`, `correos/20-carrito-abandonado-2.html`) → espera 48 h → tag `carrito-no-recuperado`. Recuperó 2 de 3 abandonos en noviembre. Defecto conocido: la oportunidad de carrito abandonado de quien luego compra se queda abierta en 01.

---

## 4. Calendario de los próximos días (lo que está acordado)

| Cuándo | Qué | Quién / condición |
|---|---|---|
| **Antes del 26/11 00:00** | **Revisar el riesgo del carrito con el cupón** (§5.1). Probar `BLACK20` en modo test: que no se suma a `BIENVENIDA10` y si el envío gratis se calcula antes o después del descuento | Claude + German |
| Jue 26/11 | Empieza `BLACK20` para la newsletter. **Subir presupuesto 22 → 40 €/día** del 26 al 30 | **Solo con OK de German**; Sara lo aceptó de palabra el 19/11, falta su confirmación por escrito. Comprobar saldo de la tarjeta |
| Jue 26/11 | Cambiar la ventana de la newsletter de la web por una con el código de Black Friday (lo hace Profit) y newsletter de Black Friday | Sin hacer; sin asignar quién envía la newsletter |
| Vie 27/11 mañana | **Activar G** (`52591554954356`) | Con OK de German |
| Vie 27/11 tarde (España) | Sara graba con **Jaime** el contenido de **Navidad** (vertical, sin música ni texto, regalo/caja/bolsa, luces cálidas, 3–4 looks) y lo sube a Drive enseguida | Sara |
| Sáb 28–dom 29/11 | Montar el anuncio de Navidad, subirlo **en pausa** el domingo | Claude |
| Lun 30/11 noche | **Pausar G**, volver a **22 €/día** | Con OK de German |
| Mar 1/12 | Activar el anuncio de Navidad (ocupa el hueco de G) | Con OK de German |
| ~2/12 | Revisar F tras su semana de prueba; si funciona, Sara grabaría más looks de noche | German + Sara |
| 18/12 (viernes) | **Fecha límite de pedido para Navidad** (Nacex, 24/48 h laborables; lo pedido antes de las 16 h sale el mismo día). Ponerla en anuncios y correos desde el 1/12. Nacex ofrece un servicio de 12 h por 10 € — decidir si se ofrece para el 21–22/12 | |
| 26/12 | Anuncio de Reyes (plan de contenido) | |

---

## 5. Riesgos abiertos que hay que mirar ya

### 5.1 El carrito promete envío gratis que el checkout puede cobrar (Black Friday)
`web/carrito.html` compara el **subtotal sin descuento** con 99 €. Si GHL calcula la tarifa **después** del cupón, un carrito de 110 € con `BLACK20` (88 €) verá «Tu envío es gratis» y pagará 3 € en el checkout. **No está comprobado** cuál de las dos cosas hace GHL. Opciones: (a) probarlo en modo test antes del 26; (b) cambiar el texto del carrito a «antes de descuentos»; (c) bajar temporalmente el umbral de la tarifa a 79,20 € (= 99 × 0,8) del 26 al 30. Decide German.

### 5.2 PayPal
Ver §3.2. Si está roto, se pierden ventas justo con el presupuesto subido.

### 5.3 CORS de n8n con `www`
Los JSON de n8n del repo tienen `allowedOrigins: https://stylebymura.com`, y la web se sirve también en `https://www.stylebymura.com`. Si el flujo publicado tiene lo mismo, la newsletter y la devolución pueden fallar desde `www`. Comprobar en n8n (es de Sonia).

### 5.4 Clarity graba `/devolucion`
`CLARITY_EXCLUIR` excluye `/devoluciones` (informativa) pero no `/devolucion` (formulario con datos personales) ni `/experiencia`. Corregir en `tienda/codigo-global-tienda.js`, `build.sh`, y que German pegue Head y Body.

### 5.5 Más en el anexo 1, §8 (23 puntos: precios con 24 h de caché en la rejilla, piezas sin precio salen a «0 €», Worker sin paginar más de 100 productos, `mura_dto` que nadie escribe, `100vw`, etc.).

---

## 6. Cómo se trabaja aquí (procedimientos que funcionan)

### 6.1 Reglas que no se negocian
1. **Activar campañas, cambiar presupuesto o método de pago: solo con OK expreso de German** en ese momento. Crear en pausa, leer, subir creatividades y pausar: sí.
2. **Copia antes de tocar**: antes de cualquier cambio por API (GHL o Meta), guardar el estado en `datos/backups/<qué>_<AAAAMMDD>.json`.
3. **Pruebas en modo test**. Nunca pedidos de prueba en live (en septiembre acabaron en el pipeline real; con el píxel serían compras falsas).
4. **Datos personales**: ni nombres de clientas, ni emails, ni teléfonos, ni ids de contacto en nada que salga del equipo (entregables, artefactos, mensajes a Sara).
5. **Cifras solo con fuente** (API, lo que diga German, aritmética explicada). Nada de prometer ROAS ni resultados.
6. **Textos de anuncios**: solo lo que dicen las fichas de producto o se ve en el vídeo. Sin «hecho a mano», «producción limitada», «sin reposiciones», «piel» para polipiel. Un texto y un título por anuncio (el conjunto no es dinámico).
7. **Creatividades a nivel de colección o ángulo, nunca de prenda suelta**, y **mínimo 5 unidades** de cada prenda que salga como protagonista.
8. **Nada de formularios nativos de GHL embebidos**: HTML propio con `fetch` a n8n.
9. **Tags**: se quitan antes de ponerlos (si no, no vuelven a disparar).
10. **Triggers de workflow: se crean en la interfaz** (por API dan un id y no guardan nada).

### 6.2 Cambiar código de la web (ficha, carrito, cabecera, global)
1. **Partir de lo publicado**, no solo del repo. Bajar la página con `curl -sL -A "Mozilla/5.0" "https://stylebymura.com/<ruta>?nc=$RANDOM"`, extraer la cadena JSON que contiene un marcador del elemento (`md-added` para `/producto`, `mcar-list` para `/carrito`, `CABECERA COMO ELEMENTO` para la cabecera; quedarse con la más corta de >2000 caracteres), `json.loads`, y comparar línea a línea con el archivo del repo. Si difiere, pedir a German que pegue el código actual y rehacer el repo primero.
2. Editar en el repo. El global: editar `tienda/codigo-global-tienda.js` y ejecutar `cd tienda && ./build.sh`.
3. Probar en local con Playwright (enrutar `https://stylebymura.com/...` — sin `www`, por el CORS del Worker — a un HTML de prueba; emular móvil).
4. Mandar el archivo a German (con la herramienta de enviar archivos) para que lo pegue en GHL. Él dice «ya lo pegué, verificá» → repetir el paso 1 y confirmar que es idéntico.
5. Commit + push + nota en `tienda/README.md`.

Dónde va cada cosa: anexo 1 §1. Lo esencial: Tracking Code Head y Body del sitio (los dos generados), Custom CSS de `/checkout` (`css-paginas-tienda.css`), `custom-code-oM1HT_mKKm` en `/producto`, elemento de código de `/carrito` (`web/carrito.html`, el vigente), elementos universales «Cabecera MURA» y «Pie MURA».

### 6.3 Anuncios de Meta
1. **Material**: Sara sube a Drive. Listar la carpeta con `gdown.download_folder(id=…, skip_download=True)`; bajar uno a uno, pasar a 1080×1920 sin audio, sacar hojas de contactos (fotogramas por segundo en mosaico) y **mirarlas** antes de elegir planos. Cuidado: en miniatura se confunden prendas (pasó con el Animal Verde).
2. **Montaje**: `plantillas/anuncios/montar_e.py` (anuncio E) y `plantillas/anuncios/montar_fiesta.py` (B2, F, G; movimiento afín con Pillow, `xfade`, textos con banda, tarjeta final crema). Fuentes en `anuncios/fuentes/`. Revisar siempre la duración final (`ffprobe`) y unos fotogramas: un fallo de redondeo cortaba el vídeo con cortes secos (ya corregido con un fotograma de margen).
3. **Música**: German la genera en **Suno** a partir de prompts que le pasas (instrumental, BPM, «sin intro» si el vídeo es corto). Tú eliges el tramo midiendo el volumen (`astats`) para que el ritmo entre al primer plano; fundido de salida en la tarjeta; `loudnorm I=-16`. Pistas en `anuncios/musica/`.
4. **Validación**: German le pasa los vídeos a Sara; ella responde por WhatsApp (German reenvía capturas). Sara pide variedad de prendas: en B2 y F se rehízo porque «sale la misma tela» / «el mismo outfit».
5. **Subida**: `tienda/meta-subir-anuncios.py <anuncios.json>` con `META_DOF` = el `degrees_of_freedom_spec` de D (todo `OPT_OUT`). Crea vídeo, miniatura, creatividad (página e Instagram de MÛRA, botón Comprar, `/prendas`, UTM) y anuncio **en pausa** en el conjunto `52588391414956`. Después leer el estado y anotar ids en `docs/meta-campana.md`.
6. **Activar**: solo con OK. `curl -X POST graph.facebook.com/v21.0/<ad_id> -d status=ACTIVE`. Copia previa en `datos/backups/`.

Vídeos finales de E, B2, F, G (con música) en `anuncios/finales/` (9×16 y 4×5). Los de A–D están en Meta (ids de vídeo en `docs/meta-campana.md`).

### 6.4 GHL por API
- Inventario completo de solo lectura: `python3 datos/inventario_ghl.py datos/ghl-inventario-AAAAMMDD` (limpia datos personales).
- Plantillas de correo: están en la carpeta «Correos» `6a6aa119fee4921a97537ba5` (listar con `parentId`); escribir con `POST /emails/builder/data` y `editorType:"html"`. **Cambiar el `template_id` de un paso sobrescribe la plantilla destino.**
- Workflows: la API pública solo da nombre y estado; los pasos se ven en la interfaz (o pidiendo capturas a German). Las trampas, en el anexo 2 §5.
- Tienda: `/store/shipping-zone` (tarifas, se pueden editar por API), `/payments/coupon` (crear cupones; `startDate`/`endDate` en UTC), `/payments/orders` y `/payments/transactions` (con `altId` y `altType=location`).
- Oportunidades: **no mover pedidos antiguos a «05 Entregado»**: dispara el workflow 05 (correo «Tu pedido ha llegado», Telegram a Sara, journey post-entrega). «Venta web» es el archivo manual de Sara.

### 6.5 Clarity
Proyecto `yyrkyipd10`. Claude no tiene acceso: German mira el panel y pasa capturas o exportaciones. Se carga solo tras aceptar Análisis en el banner. Filtros útiles: etiqueta `prenda_carrito` (qué prendas se añaden), evento `anadir_carrito`, `barra_carrito`. Sesiones casi todas en el navegador de Instagram en Android.

### 6.6 Entregables para Sara o Sonia
Artefacto A4 descargable en PDF: fondo `#F6F2EB`, tinta `#1E1B1A`, Cormorant Garamond + Jost, cabecera «MÛRA» espaciada, pie con número de página. Último: `docs/entregables/2026-11-18-primera-semana-campana.html` (+ PDF). Mensajes de WhatsApp: formato WhatsApp (negrita con un asterisco, listas con `-`), dentro de un bloque de texto para copiar.

---

## 7. Mapa de ids vigentes (chuleta)

| Qué | Id |
|---|---|
| Subcuenta GHL | `NxPF5fOicowujokEk5Hm` |
| Sitio web GHL «MÛRA» | `rlc7iAyGF4U1nfwAJOJQ` (clave del carrito: `cart_details_rlc7iAyGF4U1nfwAJOJQ`) |
| Pipeline Ventas / Pedidos | `X7wvJysuBVmdXXl1b8zx` — 01 Carrito Abandonado `b24a170f-281f-4596-9c1d-667f415fcd2b`, 05 Entregado `789b85f8-5a2b-468a-936c-d643308340c3`, Venta web `ad78ca83-2b17-4edf-8615-994db5f1194e` (resto en el inventario) |
| Pipeline Leads / Comunidad | `Y47eLa4dAIZTKLu2UpuX` |
| Workflow SP01 Compra confirmada | `ba5d585c-8482-4810-b2f2-6983616b81a4` (dispara `Purchase` a Meta por CAPI) |
| Workflow LS03 Carrito abandonado | `1e240ed6-846d-42ad-8e34-e4eecc36f67f` |
| Workflow LS02 Newsletter | `f62a24a8-0a2c-4a60-9910-d57a44e34136` |
| Workflow 04a Envío Nacex | `6d73077b-c9ea-4c8d-b1d5-f3167ef2cc4f` |
| Workflow 05 Entrega | `8e6ccd5a-8c90-4d41-b567-9947e61ed627` |
| Zona de envío «España» | `6a764f72df6bb6cc8e548c29` (tarifas `6a764f7ad2a595a78307f718` 3 €, `6aae4dd8a3e65b12c464df47` gratis ≥99, `6abe01f9264fb342282f59f9` punto Nacex) |
| Cupón BLACK20 | `6b0093a258c2da9f4fc5df77` |
| Carpeta de plantillas «Correos» | `6a6aa119fee4921a97537ba5` |
| Plantilla 20 · Carrito abandonado · 2 | `6afdf8e9218912ba8f1fbbbc` |
| Página `/producto` · elemento | `cmPhl3N0IF3smLo8Oy8x` · `custom-code-oM1HT_mKKm` |
| Página `/carrito` · elemento | `qsUEwHJLz2xiSulCN5jD` · `custom-code-DN8OVgnA5P` |
| Worker | `https://mura-productos.germanborrello-d78.workers.dev` (`/products`, `/products?id=`, `/collections`) |
| Meta: portafolio MÛRA / Profit | `1239463275926698` / `885279100130262` |
| Meta: cuenta publicitaria | `act_1141864065246239` |
| Meta: píxel de MÛRA | `1799475611078369` |
| Meta: página / Instagram | `1239437265929299` / `17841410968485139` |
| Meta: campaña / conjunto | `52585971203356` / `52588391414956` |
| Clarity | `yyrkyipd10` |
| WhatsApp de MÛRA | `34637681234` |
| Drive, carpeta del 20/11 (fiesta y Black Friday) | `1b6dkKN88Bom5klRRSu1bi5k1bQbVAJyX` |

---

## 8. Pendientes, por prioridad

**Esta semana**
1. Riesgo carrito/cupón (§5.1) y prueba de `BLACK20` en modo test.
2. PayPal (§5.2).
3. Presupuesto 40 €/día 26–30 (OK de German y de Sara por escrito), G el 27, pausar G y bajar presupuesto el 30.
4. Ventana de Black Friday en la web y newsletter del 26.
5. Anuncio de Navidad (material el 27, montaje 28–29, en pausa el 29, activo el 1/12).
6. Preguntar a Sara por el reembolso del pedido del 23/11 (120,60 €).

**Meta y medición**
7. `Purchase` por CAPI desde SP01: pasar la conexión de «Administrador de anuncios» a «Integración», filtro para pedidos de prueba, código de prueba vacío, decidir el consentimiento (Henry/Oliver; guía en `docs/capi-purchase-ghl.md`).
8. Borrar a mano el conjunto «NO USAR» `52585971218156`. A futuro, pasar la cuenta publicitaria al portafolio de MÛRA.
9. Recuento en Clarity de prendas añadidas y comparación antes/después de la barra y el envío en el carrito (se hizo el 18/11; repetir con más datos).

**Web y GHL**
10. **URGENTE desde octubre: rotar el PIT de GHL** (está en el historial de git) y actualizarlo en el Worker (`GHL_TOKEN`), n8n y el entorno.
11. Clarity no debe grabar `/devolucion` ni `/experiencia` (§5.4). CORS `www` (§5.3).
12. Quién sube productos y stock ahora que Sara canceló el mantenimiento de Sonia. Novedades pendientes de subir: vestido camisero (ya está) y dos pantalones; Pantalón Pinzas Camel oculto hasta confirmar composición.
13. LS03: oportunidad de carrito abandonado que no se cierra al pagar; decidir si filtrar por `newsletter-suscrita`.
14. Defectos del 22/9 aún abiertos: `100vw` (8 px de scroll lateral), rejilla con agotadas (en `/prendas` propia ya se filtran), asunto del recibo («Aqui», «factura»).
15. Etiqueta `compra-1` no se ponía a las compradoras del 12/11 (workflow 02) y el SMS «Gracias por tu compra» falla: revisar.
16. Devolución: el flujo de n8n no comprueba que el pedido sea de esa clienta; pasos pendientes en la interfaz (anexo 2, §41.10).
17. Custom values vacíos `url_resena_google` y `url_pieza` (botones rotos en correos 18 y 15, que hoy no se envían).

**Comercial**
18. Cobro de la gestión (350 €/mes desde el 10/11; problema con la tarjeta de Sara; Henry). Estado de los links de cobro A/B/C en `docs/cobros-sara.md` sin actualizar; no consta si se cobró el primer 50 % de la implementación.
19. Pedido duplicado de 134 € del 12/11: reembolsado el 12/11. Falta reponer el stock de la Chaqueta Vínculo Gris S y el Pantalón Sastre Vínculo Gris S/M si no se hizo (copia antes).
20. Sara quiere una línea más casual y barata más adelante; German propuso packs de básicos. Nada que hacer aún.

---

## 9. Qué dice cada documento viejo que ya no es verdad

| Documento | Dice | Lo vigente |
|---|---|---|
| `CLAUDE.md` (pendientes de octubre) | Campaña `52549695358270`/conjunto `52549695445670` en pausa, falta tarjeta, anuncios y dominio | Campaña `52585971203356`/conjunto `52588391414956` activos desde 10/11, cuenta `act_1141864065246239`, dominio verificado (actualizado en `CLAUDE.md` el 25/11) |
| `CLAUDE.md`, `campanas-meta.md`, `plan-contenido.md` | Público 28–48 | Sugerencia 25–48, control 25–65 |
| `plan-contenido.md` | 3 textos y 6 títulos como variantes; música de la biblioteca de Meta; «producción limitada» | Un texto y un título; música propia (Suno); esas expresiones están prohibidas |
| `docs/2026-11-19-reunion-sara.md` (cuerpo) | Black Friday por tramos 20/15/0 y duda de dos cupones | 20 % en toda la web con `BLACK20` (al final del acta) |
| Entregable 18/11 | Envío gratis desde 100 € | Desde 99 € (20/11) |
| `CLAUDE.md` «Estado comercial (13/10)» | Mantenimiento abierto | Cancelado por Sara con Sonia (semana del 9/11) |
| `docs/capi-purchase-ghl.md` | `Purchase` pendiente de montar | Montado en SP01 con conexión Ad Manager, falta pasar a Integración |
| `docs/meta-api.md` | `.env` con `act_1650663796846832`; token con `Conversions API Application` | Cuenta `act_1141864065246239`; token de la app `MURA Ads` |
| `README.md` | 18 plantillas, 36 productos | 21 plantillas en la carpeta + 20 · Carrito 2; 60 productos |
| `tienda/README.md` | Banner/Clarity/píxel en secciones 10/11/12; carrito en `tienda/carrito.html` | Secciones 16/17/18 del global; carrito vigente `web/carrito.html` |
| `correos/02` y `correos/03` | Botón «Ver mi pedido», sin desglose | En GHL llevan el desglose `{{{opportunity.resumen_pedido_html}}}`. **No volver a subir esas dos desde `correos/`** |
| `tienda/gracias-compra.html` | Va en `/thank-you` | Va en `/gracias` (el global redirige) |
| `web/global/cabecera.html` (comentario) | «En prueba en /prueba-cabecera» | Publicada como elemento universal |

Más contradicciones menores en el anexo 3 §7 y en el anexo 2 (numeración de secciones del registro).

---

## 10. Personas y tono

- **German** (Profit): con quien trabajas; decide; hace los clics en GHL/Meta/Business Manager; único que autoriza gasto. Prefiere respuestas directas y que se avance sin preguntar lo que no hace falta.
- **Sara** (dueña de MÛRA): no técnica, cercana, decide sobre producto, descuentos, envíos, textos y vídeos; responde por WhatsApp al grupo «Mura Ads» (German reenvía). Está en España (hora peninsular; German en Buenos Aires, 4 h menos).
- **Henry y Oliver** (Profit): soporte de GHL, facturación, administradores del portafolio de Meta de MÛRA.
- **Sonia** (Be Banana): hizo la web y el CRM, lleva n8n. Ya no tiene contrato de mantenimiento con Sara; prepara un correo de novedades.
- **Jaime**: graba con Sara el contenido de Navidad (27/11).

Con Sara: castellano de España, sin jerga, las decisiones de dinero con cuentas, nunca promesas; admitir los errores propios en claro (pasó con la fecha «jueves 27»).

---

## 11. Índice del repo (qué hay y para qué)

| Ruta | Contenido |
|---|---|
| `CLAUDE.md`, `README.md` | Contexto y reglas; resumen del repo |
| `docs/TRASPASO.md`, `docs/traspaso/` | Este traspaso y sus anexos |
| `docs/2026-08-07-implementacion-ghl.md` | Registro técnico de GHL §1–§42 |
| `docs/2026-07-29-…`, `docs/2026-10-09-…`, `docs/2026-11-19-reunion-sara.md` | Llamada técnica de julio, reuniones con Sara (la del 19/11 con las respuestas del 20/11 al final) |
| `docs/campanas-meta.md`, `docs/meta-api.md`, `docs/meta-campana.md`, `docs/capi-purchase-ghl.md` | Plan de campañas, Meta por API, bitácora de la campaña con ids y resultados, guía de `Purchase` |
| `docs/plan-contenido.md` | Fichas de anuncios, reglas de grabación, ángulos y anuncios de fiestas/Black Friday (22/11) |
| `docs/proceso-anuncios-meta-con-claude.md` (+PDF) | Cómo se hicieron los anuncios A–D con Claude, paso a paso |
| `docs/cobros-sara.md`, `docs/para-sonia-*.md`, `docs/mensaje-sonia.md` | Cobros; entregas a Sonia |
| `docs/entregables/` | Informe «Primera semana de campaña» (18/11) |
| `tienda/` | Código de la web (fuente del global, ficha, páginas propias, Worker, nodos de n8n, scripts de Meta). Ver anexo 1 |
| `web/` | Páginas propias más nuevas: `/prendas`, `/colecciones`, `/carrito` (vigente), cabecera y pie universales |
| `correos/` | Plantillas HTML de correo 01–20 (ver la advertencia de 02 y 03) |
| `legal/` | Aviso legal, privacidad, condiciones, gracias-devolución; cambios pendientes de la política de cookies |
| `datos/` | Mapas, stock, `inventario_ghl.py`, `ghl-inventario-20261125/` (foto de GHL), `backups/` (copias antes de cada cambio por API) |
| `anuncios/` | Vídeos finales E/B2/F/G con música, pistas de música, fuentes |
| `plantillas/` | Plan de contenido reutilizable para otros clientes; scripts de montaje de anuncios |
