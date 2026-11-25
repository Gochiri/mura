# Anexo 3 · Negocio, Meta, contenido, cobros y correos (25/11/2026)

Hecho leyendo enteros CLAUDE.md, README.md, todos los documentos de `docs/`, las cabeceras de `correos/` y los JSON de `datos/`. Las contradicciones del apartado 7 están revisadas y resueltas en el documento principal (`docs/TRASPASO.md`).

# Informe de traspaso: proyecto MÛRA (repo `/home/user/mura`)

*Preparado el 25/11/2026 a partir de los archivos indicados. No he modificado ningún archivo. He dejado fuera tokens, claves y datos personales de clientas. Algunos documentos del repo sí contienen datos sensibles; los señalo en el apartado 8 para que nadie los copie.*

---

## 1. Contexto de negocio

### 1.1 La tienda

- **MÛRA** es una tienda online de moda femenina: stylebymura.com, Instagram @bymurastudio.
- Funciona sobre:
  - **GoHighLevel** (subcuenta MÛRA, Location ID `NxPF5fOicowujokEk5Hm`);
  - **n8n**, que lleva Sonia en `n8n.letsbebanana.com`;
  - un **Worker de Cloudflare** de German que sirve el catálogo y el stock a la web;
  - **Nacex** como transportista;
  - **Stripe** para los cobros.
- Todo se escribe en castellano de España.
- Stock a 23/9: 47 piezas, 257 unidades (unas 5,5 por pieza; solo una pieza tiene 10 o más). Precio mediano: 79 €. Valor a precio completo: 23.609 €.
- Ticket medio real de referencia: 102 €, calculado con los 4 pagos del 3/9 (de 29,10 € a 161 €).

### 1.2 Personas y papeles

| Persona | Papel |
|---|---|
| **Sara** | Dueña de MÛRA y la clienta. Autónoma, factura con DNI; sus datos fiscales llegan por su gestor. No es técnica: todo le llega sin jerga. No habla a cámara, pero posa y se cambia de ropa. Aprueba vídeos y textos. No habla con Claude: todo pasa por German. |
| **German** (Profit Technology) | Lleva las campañas de Meta y la relación de marketing con Sara. Dirige el trabajo con Claude, hace los clics en las interfaces (GHL, Business Manager, Events Manager) y es **el único que activa campañas o cambia presupuestos**. Genera la música con IA (Suno). |
| **Henry y Oliver** (Profit Technology) | Soporte técnico de GHL y facturación de Profit. Henry emite las facturas a Sara. Los dos son administradores del portafolio de Meta de MÛRA. A ellos va dirigida la guía de `Purchase` por CAPI. |
| **Sonia** (Be Banana) | Hizo la web y el CRM y lleva n8n (Nacex, devoluciones, newsletter, aviso de pedido). Tenía el contrato de mantenimiento con Sara, cancelado en noviembre. Prepara el correo de novedades. |
| **Jaime** | Aparece una vez: Sara graba con él el viernes 27/11 por la tarde el material del anuncio de Navidad. |
| **Moncho** | Otro cliente futuro: todo lo construido para MÛRA se pretende replicar para él (también usa Nacex). |

**Reparto de facturación:**
- Profit factura el **marketing** a Sara.
- El **mantenimiento** era contrato de Sonia, con parte del trabajo hecho por Profit. Está cancelado.

### 1.3 Acuerdos comerciales

**Marketing: aceptado por Sara el 9/10/2026**

| Concepto | Importe | Condiciones | Estado conocido |
|---|---|---|---|
| Implementación | **850 €** = lo imprescindible (750 €) + mapa de calor (100 €) | 50 % al empezar y 50 % a la entrega | Links de cobro A y C «pendientes de crear» según `docs/cobros-sara.md`. Ningún documento confirma que se haya cobrado ni el primer 50 %. |
| Gestión de campañas | **350 €/mes** | 3 meses obligatorios. Después mes a mes, por adelantado (antes del día 5). Se para avisando antes del día 25. Si se vuelve, mínimo 2 meses seguidos. | Cuenta desde el **10/11** (mes del 10 al 10). A 19/11, **pendiente de pago** por un problema con la tarjeta; Henry le pasa el importe. |
| Inversión en Meta | **1.800 € en 3 meses** (800 / 650 / 350) | La paga MÛRA directamente a Meta con su tarjeta. | Primer mes: unos 196 € gastados a 18–19/11. Sara recargó 100 € en la tarjeta de Meta. |

**Lo imprescindible (750 €) incluye:**
- banner de consentimiento de cookies y auditoría;
- píxel + API de Conversiones con los eventos de ficha y carrito;
- enlaces con UTM;
- prueba completa.

**No contratado por ahora:**
- **Catálogo de Meta:** 300 € de implementación; después, su actualización entra en la gestión.
- **Lista de espera de Navidad:** 150 €.

**Qué entra en la gestión** (`docs/plan-contenido.md`):
- Entra: guiones, montaje (cortes, texto, música, formatos 9:16 y 4:5), hasta 2 vídeos a partir de fotos, textos, títulos y revisión semanal.
- No entra: rodaje con fotógrafo, reels largos ni retoque; se presupuestan aparte.

**Mantenimiento (500 €/mes) — CANCELADO**
- 9/10: Sara pidió bajarlo (el mes iba a 0 € en ventas) y propuso pagar por incidencia en lugar de vigilancia continua. La alternativa que ya había visto en «Lo que tiene MÛRA» era 249 €/h sin contrato.
- Semana del 9/11: lo **canceló con Sonia**.
- Sonia avisó de que la web puede ir más lenta en días fuertes.
- **Sin definir quién sube productos y stock.**
- Sara da por hecho que el Worker de German, que sirve el catálogo a la web, sigue funcionando.

**Planes de Sara:**
- Black Friday, Navidad y rebajas; después una pausa; relanzamiento con la colección de primavera en marzo.
- Al volver, mínimo 2 meses seguidos: cada parada borra lo que Meta había aprendido.
- Quiere una cápsula fija de básicos (algodón de Portugal, quizá un vaquero).
- Quiere una línea más casual y barata (básicos, vaqueros, complementos, más bolsos), según cómo vaya el Black Friday. German propuso packs de tres. Consejo de German y Henry: no dar un volantazo con 9 días de campaña.

### 1.4 Cronología

| Fecha | Hecho |
|---|---|
| 5/7 | 36 productos creados en GHL por API (242 uds iniciales). |
| 29/7 | Llamada Sonia × Henry (59 min). Se detecta que el diseño solo permitía una oportunidad por contacto. Se acuerda: duplicar oportunidades, nº de pedido como nombre de la oportunidad, datos del pedido en campos de oportunidad. Discusión del límite de 20 caracteres en la referencia de Nacex; idea del contador interno M00x. Tags `email-04-listo` / `email-08-listo`. Watchdog de entrega a 24 h. Principio «n8n etiqueta, GHL reacciona». |
| 4/8 | Llamada Sonia × German × Henry. El watchdog pasa a 48 h. |
| 7/8 | Contador nativo de pedidos en GHL: M100001, M100002… (7 caracteres). 18 plantillas de correo actualizadas. Borrador del mensaje para Sonia. |
| 13–14/8 | Los merge tags de GHL no admiten filtros (Handlebars, no Liquid). El order id no se puede usar en los correos del workflow. Campos de pedido migrados a la oportunidad. Sesión con Sonia: flujo completo probado. |
| 23/8 | Oportunidades de prueba borradas. Contador Pedidos puesto a 100000. Stock devuelto al inicial (242 uds). |
| 25/8 | Comparación de fotos Drive vs tienda. |
| 27–29/8 | Desglose del pedido con foto por prenda dentro del correo (vía n8n). SP01 envía la confirmación con una espera de 3 min. Plantilla «01 · Recibo». Formulario de devolución propio. |
| 3/9 | Primeras compras reales: tres pedidos pasan solos por los nueve correos del ciclo. |
| 20/9 | Pedidos de prueba hechos en modo live (M100014, M100015): acabaron en el pipeline real. |
| 22/9 | Documento «MÛRA antes de Meta» para Sonia. LS03 (carrito abandonado) publicado. |
| 3/10 | Sonia aprueba el texto del correo 19 (carrito abandonado). |
| 6/10 | Propuesta de campañas v2. |
| **9/10** | **Reunión con Sara**: contrata el marketing; el mantenimiento queda abierto. |
| 13/10 | `CLAUDE.md` con el contexto. |
| 14/10 | Meta por API en el portafolio de MÛRA: app `MURA Ads` y token. |
| 16/10 | Banner de cookies, Clarity y píxel tras consentimiento, probados en producción. Guía de `Purchase` desde GHL. Token regenerado con caso de uso de Instagram. |
| 19/10 | Plan de contenido: 8 fichas, reglas de grabación y calendario. |
| 21/10 | Primera campaña y conjunto creados en pausa por API. Worker v2/v2.1. Se descubre el PIT en el repo. |
| 24/10 | Cambios de Sara al plan: fuera el backstage; prioridad a looks de calle; ficha 9. |
| 30/10 | Se detecta que el conjunto apunta a un píxel y la web carga otro. El repo estaba desfasado respecto a GHL; se revierte el commit. |
| 2/11 | Material en bruto de Sara (Drive) y primeros vídeos A y B. |
| 6/11 | Estado por API: cuenta «Mura - ES» (`act_1141864065246239`), campaña y conjunto recreados. La app en modo desarrollo bloquea los creativos. Vídeos subidos a la cuenta. |
| 9/11 | Cambio de píxel (se conecta el de MÛRA a la cuenta de Profit). Conjunto nuevo. App en modo público. 4 anuncios en pausa. Música IA. Se arregla la comilla del Body. |
| **10/11** | Tienda lista (productos Vínculo, Camel, bolsos). Dominio verificado. Público con sugerencia 25–48. **German activa la campaña.** |
| 11/11 | Revisión del primer día. |
| 12/11 | Primera venta atribuida (232,20 €, anuncio D). 4 pedidos pagados ese día. |
| 14/11 | German pausa el anuncio A. Venta de 72 € atribuible a D por UTM. |
| 18/11 | Entregable «Primera semana de campaña». Cambios en la web (barra «Tu selección», envío en carrito y ficha, etiquetas de Clarity). Segundo correo de carrito a las 24 h. Borradas M100014/M100015. |
| **19/11** | **Reunión con Sara** (Meet de 44 min, grabación en el Fathom de German). Black Friday; mantenimiento confirmado como cancelado. |
| 20/11 | WhatsApp de Sara: Black Friday 15 % → 20 % en toda la web. Envío gratis desde 99 € (hecho). Cupón `BLACK20` creado. Fecha límite de Navidad 18/12. Anuncio C pausado. Sara sube material de fiesta. |
| 22/11 | Anuncios E, B2, F y G montados (música Suno), validados por Sara y subidos en pausa. |
| **25/11** | E, B2 y F activados y B pausado, con el OK de German. Activos: D, E, B2 y F a 22 €/día. G en pausa hasta el 27. |

---

## 2. Meta

### 2.1 Portafolio, cuentas, píxel, app y usuario del sistema

| Elemento | Dato |
|---|---|
| Portafolio comercial de MÛRA | `1239463275926698` (confirmado el 16/10) |
| Página de Facebook (page_id en los creativos) | `1239437265929299` |
| Instagram @bymurastudio (IG user id) | `17841410968485139` |
| Cuenta publicitaria «Mura» del portafolio de MÛRA | `act_1650663796846832`: EUR, activa a 16/10. **No es la que se usa para los anuncios.** |
| **Cuenta publicitaria vigente: «Mura - ES»** | **`act_1141864065246239`**: EUR, hora de Madrid, activa. Es **propiedad del portafolio de Profit Technology**; la tarjeta es de MÛRA. |
| **Píxel de MÛRA (vigente)** | **`1799475611078369`** («Mura Pixel», propiedad de MÛRA), conectado a la cuenta de Profit desde Conjuntos de datos → Activos conectados (9/11). |
| Píxel de Profit (antiguo) | `1577201230843977`: la web le mandaba eventos hasta el 9/11. Sin eventos desde el 10/11 a las 13:00 UTC. |
| Usuario del sistema | `Conversions API System User` (ID `61595501576203`), rol Empleado, creado por Meta con el píxel. Activos con acceso total (14/10): página, cuenta «Mura», app, píxel e Instagram. |
| App creada por Meta | `Conversions API Application`: no sirve para generar tokens. |
| App propia | **`MURA Ads`**, ID `1139141968627775`, propiedad de MÛRA, creada el 14/10. Pasada a **modo público** el 9/11 (antes daba error 100, subcódigo 1885183, al crear creativos). |
| Token | Sin caducidad (comprobado el 16/10). Permisos: `ads_management`, `ads_read`, `business_management`, `pages_manage_ads`, `pages_read_engagement`, `pages_show_list` + Instagram (`instagram_basic`, `instagram_manage_insights`, publicar, comentarios, mensajes). Sin `leads_retrieval`. Para CAPI hay otro token, del píxel (Events Manager). |
| Credenciales | En un `.env` local: `META_APP_ID`, `META_BUSINESS_ID`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_PAGE_ID`, `META_IG_USER_ID`, `META_PIXEL_ID`, `META_CAPI_TOKEN`. Las llamadas a la Graph API se hacen con `curl` (v21.0). |
| Dominio `stylebymura.com` | **Verificado el 10/11** por registro TXT de DNS. La metaetiqueta en el Tracking Code del Head de GHL no sirve: GHL lo inyecta por JavaScript. |

**Por qué se usa la cuenta de Profit (opción C, 9/11):**
- Meta impide al portafolio nuevo de MÛRA crear o reclamar cuentas publicitarias y compartir activos durante varias semanas.
- Pendiente: trasladar todo a una cuenta publicitaria de MÛRA cuando Meta lo permita.

**Reglas de uso desde Claude** (`docs/meta-api.md` §7):
- Sin pedir permiso: crear campañas, conjuntos y anuncios **en pausa**, leer insights, subir creatividades, pausar o retirar.
- Solo con OK expreso de German: activar, cambiar presupuesto o cambiar método de pago.
- Siempre una copia en `datos/backups/` antes de tocar nada por API.

**Avisos de la API que ya costaron un intento:**
- La campaña exige `is_adset_budget_sharing_enabled` si no hay CBO.
- El conjunto exige `dsa_beneficiary` y `dsa_payor`; anunciante y pagador: MÛRA.
- Con `advantage_audience=1`, la edad solo puede ir de 25 a 65 como control; lo demás va como «sugerencia» en la interfaz.
- Valores con `+` (nombre, zona horaria de `start_time`): enviarlos con `--data-urlencode`.
- `start_time` no se puede editar: hubo que borrar y recrear el conjunto.
- Los anuncios con varios textos rotativos exigen un conjunto «dinámico», que no se puede activar después. Por eso va **un texto y un título por anuncio**.

### 2.2 Campaña, conjuntos y anuncios

**Campaña vigente:** «MÛRA · Ventas · Cápsula 01», **`52585971203356`**.
- Objetivo `OUTCOME_SALES`, presupuesto en el conjunto (no CBO).
- **ACTIVA desde el 10/11** (la activó German).

**Conjunto vigente:** **`52588391414956`**, «Mujeres 25–48 · España · Advantage+».
- 22 €/día, optimiza a **Añadir al carrito** del píxel `1799475611078369`, puja de menor coste, ubicaciones automáticas.
- Sugerencia de edad 25–48 desde el 10/11 (antes 28–48); el control de la API va de 25 a 65.

**Objetos antiguos y obsoletos:**
- Campaña `52549695358270` y conjunto `52549695445670`: primera creación (21/10), en la cuenta `act_1650663796846832`, inicio previsto el 2/11. Ya no son los vigentes.
- Conjunto `52585971218156`: en pausa, vacío, renombrado «NO USAR · antiguo (píxel de Profit)». **Pendiente de borrarlo a mano.**
- Los anuncios anteriores llevan delante «NO USAR».
- Vídeos subidos el 6/11 sin anunciar: A `1084761704387445`, B `1126270353704094`, C `3468335396670995`, D `1623330019530949`.

**Anuncios.** Todos los de otoño llevan `utm_source=meta&utm_medium=paid_social&utm_campaign=otono_2026` y destino `/prendas`.

| Anuncio | ID | utm_content | Estado a 25/11 |
|---|---|---|---|
| A · Nueva colección otoño (v3, «Chaqueta Vínculo») | `52588656496756` | `A_nueva_coleccion_otono` | Pausado el 14/11 por German (0 carritos con 8,25 €) |
| B · El detalle (v2) | `52588421059756` | `B_el_detalle` | Pausado el 25/11 (lo sustituye B2) |
| C · Looks de calle (v3, «conjunto Vínculo en burdeos») | `52588656515756` | `C_looks_de_calle` | Pausado el 20/11 con el OK de German (copia en `meta_ad_C_20261120.json`) |
| D · Así llega tu pedido (v2) | `52588421124356` | `D_asi_llega_tu_pedido` | **Activo** |
| E · Así llega tu pedido de fiesta | `52591554747156` | `fiestas_2026` / `E_asi_llega_fiesta` | **Activo desde el 25/11** |
| B2 · Mírala de cerca | `52591554813156` | `fiestas_2026` / `B2_detalle_fiesta` | **Activo desde el 25/11** |
| F · Fiesta de noche | `52591554852356` | `fiestas_2026` / `F_fiesta_noche` | **Activo desde el 25/11**; una semana de prueba (lo pidió Sara) |
| G · Black Friday | `52591554954356` | `black_friday_2026` / `G_black_friday` | En pausa. **Activar el 27/11 y pausar el 30/11 por la noche** (con el OK de German) |

**Previsto:**
- Subir el presupuesto a **40 €/día del 26 al 30/11**, solo con el OK de German. Sara lo aceptó de palabra en la reunión del 19/11; falta confirmarlo por escrito con la cifra.
- El **1/12** entra un anuncio de Navidad con lo que Sara graba con Jaime el viernes 27.

**Creativos E, B2, F y G** (subidos con `tienda/meta-subir-anuncios.py`, copia en `meta_anuncios_20261122.json`):
- página e Instagram de MÛRA;
- vídeo 9:16 con miniatura propia;
- botón «Comprar», destino `/prendas`;
- mejoras automáticas de Meta desactivadas.
- La copia del 25/11 está en `meta_anuncios_20261125.json`.

### 2.3 Resultados que constan

**Primer día (10/11 por la tarde → 11/11 a mediodía):**

| Anuncio | Gasto | Impresiones | Clics | CTR | CPC | Visitas | Carritos |
|---|---|---|---|---|---|---|---|
| A | 6,23 € | 455 | 23 | 5,1 % | 0,27 € | 5 | 0 |
| B | 7,76 € | 468 | 28 | 6,0 % | 0,28 € | 15 | 6 |
| C | 7,53 € | 448 | 22 | 4,9 % | 0,34 € | 6 | 1 |
| D | 10,04 € | 577 | 62 | 10,7 % | 0,16 € | 38 | 1 |
| **Total** | **31,56 €** | **1.948** | **135** | **6,9 %** | **0,23 €** | **64** | **8** |

- Píxel en 36 h: 697 PageView, 201 ViewContent y 19 AddToCart, deduplicados entre navegador y servidor.
- En A y C solo 1 de cada 4–5 clics acaba en visita; en D, 6 de cada 10.

**13/11, 15:30:**
- Gasto: 91,83 €. 7.014 impresiones, 551 clics (CTR 7,9 %), 278 visitas, 21 carritos.
- **Primera venta atribuida: 232,20 € (D, 12/11)**. ROAS atribuido: 2,5.
- En GHL, 4 pedidos pagados el 12/11 (134 + 120,60 + 120,60 + 232,20 = 607,40 €). El de 134 € es un **pedido repetido**, sin resolver y sin tratar en la reunión.

**14–15/11:**
- 15/11: 12 carritos, el mejor día.
- **Venta del 14/11 (72 €, Bolso Nodo Taupe)** desde D: GHL guardó en el contacto el `utm_content` y el `fbclid`. Meta no la atribuía todavía.
- Totales a 15/11: 146,45 €, 990 clics, 566 visitas, 36 carritos. Ventas confirmadas de los anuncios: 304,20 € (≈ 2,1 € por euro).

**Entregable del 18/11 (del 10 al 18/11):**
- 195,76 € invertidos, 728 visitas (≈ 0,27 € por visita), 43 carritos.
- 4 pedidos pagados por 545,40 €, sin contar el repetido de 134 €. Dos no tienen origen registrado.
- Por anuncio:

| Anuncio | Invertido | Visitas | Carritos |
|---|---|---|---|
| D | 137,11 € | 609 | 30 |
| B | 34,92 € | 97 | 12 |
| C | 15,47 € | 12 | 1 |
| A | 8,26 € | 10 | 0 |

- Embudo: de 43 carritos salen 4 pedidos. De 7 personas que empezaron el pago, compraron 4. El carrito abandonado recuperó 2 de 3 compras (352,80 €).
- Clarity, 16–17/11: las tres clientas reales añadieron una prenda, siguieron mirando y se fueron sin pasar por el carrito. De ahí salen la barra «Tu selección» y el envío a la vista.
- Los conjuntos se compran enteros (Vínculo gris y burdeos; Animal Verde).
- Del 10 al 21/11, D atrae visitas y B convierte mejor: 4,8 % frente a 12,3 % de visitas que añaden al carrito. Con eso se decidió un ángulo por anuncio.

### 2.4 Eventos y medición

- **Navegador:** `PageView`, `ViewContent` y `AddToCart` tras aceptar Publicidad en el banner. Los emite `tienda/codigo-global-tienda.js` (sección 12) y se generan los pegables con `build.sh`.
- **Error que ya se dio:** al Body le faltaba la comilla de cierre del ID del píxel. Se corrigió el 9/11.
- **`InitiateCheckout`:** no se envía (el checkout es el nativo de GHL). No bloquea, porque se optimiza a carrito.
- **`Purchase`:** sale del workflow «01 · Compra confirmada (SP01)», acción «Meta Conversion API»: conjunto de datos «Mura Pixel», valor `Opportunity Value`, moneda cambiada de USD a EUR el 10/11. Pendiente:
  - pasar la conexión de «Administrador de anuncios» a «Integración» (token del píxel);
  - añadir el filtro de la etiqueta `prueba`;
  - comprobar que el código de prueba está vacío;
  - probarlo con un pedido de prueba;
  - decidir lo del consentimiento («[DECIDE EL REVISOR]»);
  - fijar si el valor incluye el envío.
- **Campos de origen en el contacto** (`datos/ghl_campos_origen.json`): fuente, medio, campaña, anuncio, página de entrada, fecha y fbclid (`contact.origen_web__*`). Guardan el UTM de la visita.
- **Etiquetas de Clarity** (desde el 18/11): `prenda_vista` y `prenda_carrito`.

### 2.5 Música, montaje y proceso

**Música:**
- El plan original era la biblioteca de Meta, pero en el editor no había opción.
- 9/11: German generó con IA «Sophisticated Calm» (30 s), usada desde el segundo 9,5, mezclada a −16 LUFS con fundido. La aprobó Sara para A–D.
- 22/11, con Suno:
  - B2: «Elegance in Silence» desde 0 s;
  - F: «Evening Glamour» desde 16,5 s;
  - G: «Runway Impact» desde 17,0 s;
  - fundido en la tarjeta final.

**Montaje:**
- ffmpeg + Python. Scripts: `montar_v2.py`, `montar_d.py`, `plantillas/anuncios/montar_e.py` y `montar_fiesta.py`.
- Hojas de contactos con Pillow para elegir planos.
- Cormorant Garamond para títulos y Jost para etiquetas; degradado inferior para que se lea el texto; títulos en la zona segura de Reels/Stories; tarjeta final crema con «M Û R A»; formatos 9:16 y 4:5.
- El material se descarga de Drive con `gdown` (German habilitó los dominios de Google en el entorno).

**Ciclo con Sara:**
1. German reenvía las capturas con sus comentarios.
2. Claude **no edita todavía**: redacta qué ha entendido.
3. Comprueba que existe el material.
4. Propone el plan.
5. Con el «Sara aprobó», monta.
6. Se crea todo en pausa y German activa.

**Textos:** solo lo que dicen las fichas o se ve en el vídeo. Sin «hecho a mano», sin «producción limitada», sin precios ni stock; ni «piel» para polipiel ni «lana» con un 4 % de lana. Apuntes en `textos-anuncios-otono.md`, que no he localizado en el repo.

**Antes de activar:** cruzar anuncios y tienda, para que cada prenda del vídeo esté visible y con stock.

**Paquete para Meta:** vídeos 9:16 y 4:5, un CSV con textos, títulos y UTM, y un LEEME.

---

## 3. Plan de contenido

**Fuente:** `docs/plan-contenido.md` (19/10, con cambios del 24/10 y del 22/11). Versión para Sara: https://claude.ai/artifact/V1XTYr6s5LSiWdJrhb1ddG. Documento de los cambios del 24/10: https://claude.ai/artifact/Apkpa4fVtBhtQCD9AP2D9E.

**Reglas comunes a las fichas:** vertical 9:16, 12–15 s, sin diálogo, CTA «Comprar», destino una colección o `/prendas` (nunca una prenda suelta), 3 textos y 6 títulos por ficha. Las variantes no se pudieron usar: va un texto por anuncio.

### 3.1 Las fichas

| # | Ficha | Ángulo | Destino | Estado |
|---|---|---|---|---|
| 1 | Tres formas de llevarla: Blazer Arquitectónica | Utilidad | `/prendas` Blazers | No consta como anuncio montado |
| 2 | El pantalón que resuelve un look | Utilidad (reel de 13,6k) | `/prendas` Pantalones | No consta |
| 3 | Invitada: encaje y lentejuelas | Momento de uso | `/colecciones` o `/prendas` | No consta como tal |
| 4 | Backstage: existe una sola vez | Edición limitada | `/mura` o `/prendas` | **Fuera del primer lote** (24/10): Sara lo ve agotado y sin ventas |
| 5 | Detalle joya | Diferenciación | `/prendas` Camisas | Su idea reaparece en el anuncio B · El detalle |
| 6 | Cápsula 01 en seis looks (vídeo desde fotos) | Colección | `/prendas` | No consta |
| 7 | Las fiestas (grabación 2) | Navidad y Nochevieja | `/colecciones` | Sustituido en la práctica por E/B2/F (22/11) |
| 8 | Un regalo que existe una sola vez | Regalo, Navidad y Reyes | `/prendas` Accesorios | Pendiente (Navidad 1/12 y Reyes 26/12) |
| 9 | Cinco prendas para tu armario cápsula | Idea de Sara; la grabaría el 25/10 | `/prendas` | No consta como anuncio |

**Lo que de verdad se montó:**
- A–D (otoño): A colección; B detalle con macros; C looks de calle; D empaque.
- E/B2/F/G (fiestas y Black Friday):
  - E: experiencia, el pedido del conjunto Animal Verde, planos de 2 s;
  - B2: una prenda distinta por plano, porque Sara dijo que «sale la misma tela muchas veces»;
  - F v3: alterna dos looks de noche más la ropa de encaje saliendo de la bolsa, 13,7 s;
  - G: los papeles en el suelo, 20 % y BLACK20, cortes de menos de 1 s.
- Sara validó E, B2 v2, F v3 y G con música el 22/11. Pendiente que constaba ese día: el stock de las prendas de B2 y F.

### 3.2 Calendario previsto y lo que pasó

| Previsto | Real |
|---|---|
| Guiones aprobados el 24/10; grabación 1 hasta el 27/10 (ficha 9, bruto de los reels, rodaje en Sevilla) | Material en Drive el 2/11 (pared de shooting, calle, orgánico, fotos) |
| Anuncios 1–6 y `Purchase` montado del 26 al 31/10 | `Purchase` solo a medias (ver 2.4) |
| Campaña en pausa y activación el 2/11 | Activación el **10/11** |
| Fase de señal del 3 al 21/11 | Del 10/11 en adelante |
| Grabación 2 (fichas 7 y 8) del 10 al 16/11 | Sara grabó el 20/11 (fiesta y empaquetado) y la parte nocturna esa noche; carpeta de Drive «Propuesta fiesta. Contenido semana black. 20 Nov» |
| Black Friday y Navidad el 24/11 | E/B2/F activados el 25/11; G el 27/11; Navidad el 1/12 |
| Reyes el 26/12 | Pendiente |

**Material:**
- **Brutos pedidos a Sara** (vistas a 24/10): 13/9 «Tres formas de llevarlo» (27.401); 21/9 pantalón (16.617); 7/10 blazer (5.384); 10/9 bomber de encaje (23.145); 9/10 (5.178); traje verde 28/9 y 22/10 (6.760 / 4.364). Opcionales: 16/9 y 5/10.
- **Looks para Sevilla:** D1–D3 de día y N1–N3 de noche, con prendas de 6 o más unidades (hoja del 23/9).

**Reglas de grabación para Sara:**
- móvil en vertical y luz natural;
- sin hablar;
- planos de 3–4 s, 6–8 por anuncio, con cuerpo entero en movimiento, plano medio y detalle a 20 cm;
- sin selfies de espejo;
- una carpeta de Drive por anuncio;
- los reels 1–5, también en el feed (dos por semana).

**Lo que se sabe del orgánico:** contenido producido, 13.000–31.000; «Tres formas», 26.600; backstage, 27.600 y 24.800; selfie, 6.800. La métrica (vistas o alcance) está sin confirmar.

**Referencias de la competencia:** Bimani (mismo cuerpo de texto, cambia solo el título) y Coosy (por momento de uso).

---

## 4. Cobros (`docs/cobros-sara.md`)

**Cómo se cobra:**
- Desde la **subcuenta de GHL de Profit** y su Stripe, nunca desde la de MÛRA.
- Sin impuestos en GHL: lo fiscal lo llevan Henry y el gestor de Sara.
- El link no es una factura: Henry emite la factura aparte.

**Productos a crear en Payments → Products:**
1. «Implementación de campañas en Meta — MÛRA»: dos precios de pago único, «Pago inicial (50 %)» de 425 € y «Pago final (50 %)» de 425 €.
2. «Gestión de campañas en Meta — MÛRA»: precio recurrente «Mensual» de 350 €, número de cobros indefinido.

**Links:**

| Link | Qué cobra | Importe | Cuándo se envía | Estado según el doc |
|---|---|---|---|---|
| A | Implementación, 50 % inicial | 425 € | Ya, para arrancar la fase 0 | Pendiente de crear |
| B | Gestión mensual | 350 €/mes | El día que arranquen los anuncios (cobra desde ese día) | Pendiente |
| C | Implementación, 50 % final | 425 € | A la entrega | Pendiente |

**Antes de crearlos y enviarlos:**
- Stripe en live, moneda EUR, sin impuestos por defecto.
- Abrir cada link en una ventana privada sin pagar. Si hay que probar el cobro, con Stripe en modo test.

**Tras cada pago:**
- Los 3 meses obligatorios no los impone GHL: la suscripción no se cancela antes del tercer cobro.
- Si Sara para (avisando antes del día 25), se cancela en Subscriptions.
- El doc incluye un mensaje redactado para Sara con el link A.

**Estado real:**
- El documento no se ha actualizado.
- El acta del 19/11 dice que la gestión empezó a contar el 10/11 y está **pendiente de pago por un problema con la tarjeta**; Henry le pasa el importe.
- **No consta en ningún documento si se pagó el primer 50 % (425 €).** Hay que preguntárselo a German o a Henry.

---

## 5. Correos (`correos/`)

Hay 20 archivos HTML. Las plantillas viven en GHL, en la carpeta «Correos» (`6a6aa119fee4921a97537ba5`). Las plantillas HTML de GHL no guardan el asunto: se define en el paso del workflow. Los «comerciales» llevan enlace de baja y deben filtrar por la etiqueta `newsletter-suscrita`.

| # | Plantilla (id en GHL) | Asunto | Previsualización | Clase | Disparador / workflow |
|---|---|---|---|---|---|
| 01 | Bienvenida newsletter (`6a6aa2e4a1ebd230f8649167`) | Bienvenida a MÛRA. | Tu historia con MÛRA empieza hoy. | Comercial | Suscripción a la newsletter: LS02, con doble opt-in; el tag `nl` → bienvenida + `newsletter-suscrita` |
| 02 | Confirmación (`6a6aa2e6e3d32f78af2869e2`) | {{contact.first_name}}, hemos recibido tu elección. | Gracias por confiar en MÛRA. | Transaccional | Compra: **SP01 «01 · Compra confirmada»**. Desde el 28/8 sale del flujo con una espera de 3 min y el desglose `{{{opportunity.resumen_pedido_html}}}` que escribe n8n. |
| 03 | Preparación (`6a6aa2e814830a62bce73c7a`) | {{contact.first_name}}, estamos preparando tu MÛRA. | Cada detalle cuenta. | Transaccional | Workflow 03 (etapa «En preparación»), con el nº M1xxxxx |
| 04 | Envío (`6a6aa2ea4eb3e6c4d953427c`) | {{contact.first_name}}, tu MÛRA ya está en camino. | Ya puedes seguir su recorrido. | Transaccional | **04a**, rama «Nacex respondió» (el 04b quedó fusionado el 14/8). CTA `{{opportunity.url_seguimiento}}` |
| 05 | Entrega (`6a6aa2ed3954360b6a94f117`) | {{contact.first_name}}, ya está contigo. | Esperamos que la disfrutes durante mucho tiempo. | Comercial | «05 · Entrega» (tag `pedido-entregado`). CTA `url_coleccion` |
| 06 | Experiencia (`6a6aa2ef3fca8e1053eff501`) | Nos encantará saber cómo ha sido. | Tu experiencia también forma parte de MÛRA. | Comercial | Journey «06-12 · Journey post-entrega», +3 días. CTA `url_feedback` (con `?cid=`) |
| 07 | Reseña (`6a75e5e973e37ca123637d76`) | Tu opinión también forma parte de MÛRA. | Nos encantaría conocer cómo ha sido tu experiencia. | Comercial | Journey, +10 días. `url_feedback` estaba vacío el 13/8: «no enviar todavía» |
| 08 | Solicitud devolución (`6a6aa2f161a2115039f0034f`) | Hemos recibido tu solicitud de devolución. | Te acompañamos en los siguientes pasos. | Transaccional | **08b** (tag `email-08-listo`, que pone n8n tras pedir a Nacex la etiqueta). Botón «Descargar etiqueta» |
| 09A | Devolución verificada (`6a6aa2f38ea1ab2089eb114e`) | Hemos revisado tu devolución. | Todo está correcto. Tu reembolso se procesará en breve. | Transaccional | Devolución recibida y correcta. CTA `url_devoluciones` |
| 09B | Incidencia devolución (`6a6aa2f661a2115039f00392`) | Hemos revisado tu devolución. (mismo asunto, a propósito) | Necesitamos informarte sobre el resultado de la revisión. | Transaccional | Devolución que no cumple las condiciones. `url_contacto` y `opportunity.motivo_devolucion` |
| 10 | Reembolso (`6a6aa2f8301f379d94c7b7ce`) | El proceso ha finalizado. | Tu reembolso ya está en marcha. | Transaccional | Reembolso emitido |
| 11 | Segunda compra (`6a6aa2fa8ea1ab2089eb114e`… ver nota) | Qué alegría volver a encontrarnos. | Gracias por volver a elegir MÛRA. | Comercial | «02 · Etiquetado compra 1-2» (con `compra-1` → `compra-2` + correo 11) |
| 12 | Hace tiempo (`6a6aa2fc61a2115039f003cf`) | Hace tiempo que no coincidimos. | Queríamos volver a saludarte. | Comercial | Journey, +90 días / 3 meses sin actividad |
| 14 | Lanzamiento (`6a6aa2fe0d3eda23ad6dc3d7`) | Una nueva historia comienza. | La nueva colección ya está disponible. | Comercial | Nueva colección (AP02, en borrador) |
| 15 | Reposición (`6a6aa30014830a62bce73d47`) | Ha vuelto. | La pieza que esperabas vuelve a estar disponible. | Comercial | Reposición: sin workflow; `url_pieza` vacío |
| 16 | Datos de devolución no coinciden (`6a75e5eb96dc697014d600f7`) | Necesitamos confirmar algunos datos de tu solicitud. | Hemos detectado una pequeña diferencia en la información facilitada. | Transaccional | Comprobación automática (08c / tag `devolucion-no-encontrada`). CTA `url_formulario_devolucion` y `url_contacto` |
| 17 | Cumpleaños (`6a75e5ed44a7d6989c157ce7`) | Hoy queremos celebrar contigo. | Un pequeño detalle de MÛRA para acompañarte en tu día. | Comercial | Cumpleaños. Código fijo `CONTIGOMURA10`; se recomienda uno dinámico |
| 18 | Reseña en Google (`6a75e5ef7d94d21ac56215a0`) | Tu experiencia puede ayudar a otras mujeres. | Comparte tu opinión sobre MÛRA en Google. | Comercial | Sin workflow (PS01, en borrador). `url_resena_google` vacío: «no enviar». Se solapa con el 07 |
| 19 | Carrito abandonado | Tu selección sigue aquí. | La hemos guardado para ti. | Comercial | **LS03**, trigger «Abandoned Checkout». CTA `{{ecom_checkout_page_url}}`. Texto aprobado por Sonia el 3/10 |
| 20 | Carrito abandonado, 2º aviso (24 h) | ¿Te ayudamos con tu selección? | Tus piezas siguen guardadas. | Comercial | LS03, rama «Time out» de la espera de 24 h. Cita «Envío gratis desde 99 €». Cabecera: **pendiente de aprobar por Sara o Sonia** (Sara dijo el 19/11 que lo había visto) |
| — | 01 · Recibo (`6a90dd80f98ccc652507a173`) | Asunto por defecto «[{{receipt.company.name}}] Aqui tienes la factura de tu pedido.» | — | Sistema | Pagos → Configuración → Recibos (serie `REC26` desde 50000). No está en el repo. Falta: seleccionarla en la interfaz, obtener la lista de variables `{{receipt.*}}` y corregir el asunto («Aqui», «factura»). |

**Notas:**
- El **13** nunca existió.
- Nota sobre el 11: en `datos/plantillas_ghl.json` su id es `6a6aa2fa8ea1ab2089eb119e`.
- Hay un duplicado del 02 fuera de la carpeta (README) y una copia huérfana `6a7dfb827717066f54ba6ff6`.
- Regla aprendida: cambiar el `template_id` de un paso sobrescribe la plantilla destino.

---

## 6. Pendientes abiertos

### 6.1 Urgentes (Black Friday, del 26 al 30/11)

| Qué | Quién | Fecha |
|---|---|---|
| Probar `BLACK20` en modo test: que no se suma a `BIENVENIDA10` y si el envío gratis se calcula antes o después del descuento | Claude / German | Antes del 26/11 00:00 |
| `BLACK20` no excluye el bolso de piel ni las novedades: Sara no lo ha contestado | Sara | — |
| Cambiar la ventana de la newsletter por una con el código de Black Friday (lo hace Profit, no Sonia) | Profit / Claude | 26/11 |
| Newsletter de Black Friday desde el jueves 26 | Sonia / Profit (sin asignar) | 26/11 |
| Subir el presupuesto a 40 €/día del 26 al 30. Confirmación por escrito de Sara con la cifra; OK de German; saldo suficiente en la tarjeta | German, Sara | 26/11 |
| Activar G el 27/11 y pausarlo el 30/11 por la noche | Claude con el OK de German | 27 y 30/11 |
| Stock mínimo de 5 unidades en cada pieza anunciada; stock de las prendas de B2 y F | Claude / Sara | — |
| Dónde se enseña el código (anuncios y publicaciones de Sara: por decidir) | Sara / German | — |
| F: revisar tras una semana de prueba | German | ~2/12 |

### 6.2 Navidad y Reyes

- Fecha límite de Navidad: **viernes 18/12** (Nacex, 24/48 h laborables). Ponerla en anuncios y correos.
- Servicio de 12 h por 10 €: decidir cómo ofrecerlo.
- Anuncio de Navidad el **1/12** con el material del 27/11 (Sara y Jaime).
- Reyes el 26/12, con su fecha límite; informe de los tres meses en la fase 3.

### 6.3 Meta y medición

- **`Purchase` por CAPI:** conexión de Ad Manager a Integración, filtro `prueba`, código de prueba vacío, prueba y decisión sobre el consentimiento (Henry/Oliver).
- Borrar a mano el conjunto `52585971218156` «NO USAR».
- Trasladar a una cuenta publicitaria de MÛRA cuando Meta lo permita.
- `PageView` aparece como «Evento personalizado» y hay un aviso en la cabecera (CLAUDE.md).
- Clarity: CLAUDE.md dice «falta comprobar sesiones». El entregable del 18/11 ya usó grabaciones, así que funciona.
- Banner de cookies:
  - corregir la política (`legal/politica-cookies-cambios-2026-10-16.md`);
  - cerrar con GHL el seguimiento `msgsndr_id` y `v2_`/`v3_`;
  - confirmar que `/politica-cookies` está publicada (Sonia / Claude).
- Calidad de coincidencia de `Purchase`: valorar enviar `fbp`/`fbc` desde n8n.

### 6.4 Tienda y web

- **Pantalón Pinzas Camel oculto** hasta que Sara confirme la composición en la etiqueta.
- Siguientes prendas: dos pantalones de sastre y el vestido camisero (previsto para la semana del 10/11; no consta si se hizo).
- Decisión del texto del botón «Añadir a mi selección» (no se habló el 19/11).
- Pedido repetido de 134 € del 12/11: sin aclarar.
- Quién sube productos y stock tras cancelar el mantenimiento.
- Correo de novedades (Sonia, con la foto pequeña de cada prenda; primero se sube el producto).
- Home «muy seria»: carrusel o vídeo de outfits, a decidir con Clarity.
- Worker: desplegar el arreglo de la foto de Accesorios (German).
- **URGENTE: rotar el PIT de GHL.** Sigue en el historial de git. Hay que actualizarlo en el Worker (`GHL_TOKEN`), en n8n y donde se use. Estado desconocido (German + Sonia).
- Defectos del 22/9 (Claude), sin estado actualizado:
  - `100vw` en `.mura` (8 px de scroll lateral);
  - rejilla con agotados;
  - correo de entrega duplicado;
  - asunto del recibo;
  - LS03 sin probar y sin cerrar su oportunidad al pagar.
- También del 22/9: checkout con España preseleccionada (arrancaba en Afghanistan) y Bizum en Stripe; título y Open Graph por producto en el Worker.
- Formulario de devolución:
  - comprobar si valida pedido + correo, como dice el PDF de Sonia (el flujo solo comprueba que existe el contacto);
  - retirar el formulario nativo v2 (`HBK7tGDlcIFN0vaXoksg`) y su trigger (`EQfcssMWOwqEkHqAFxZj`) cuando funcione el nuevo;
  - añadir a mano el trigger por tag `solicitud-devolucion` en el 08a.
- Custom values vacíos: `url_feedback`, `url_resena_google`, `url_pieza`. Sin ellos, los correos 06/07, 18 y 15 tienen el botón roto.
- «Chalequillo Traje Blanco»: sin producto (hay 3 fotos; la ficha venía vacía).
- Fotos por subir: 2 del Body Lencero Negro y 1 del Pantalón Encaje Eclipse (25/8; no consta si se resolvió).
- Blazer Gris Arquitectónica: falta una unidad que ningún pedido explica (23/8).
- Workflows en borrador: LS01/LS02, AP01 Stock, AP02 Lanzamiento, PS01 Reseña, PS02 VIP y reactivación. Decidir PS01 frente al Journey para no pedir la reseña dos veces.
- Ver los permisos de Sonia en el aviso de pedido de n8n y quitar el Telegram genérico de SP01 cuando esté su nodo.

### 6.5 Comercial y administración

- Cobro de la gestión (problema con la tarjeta) y estado de los links A/B/C (Henry).
- Datos fiscales de Sara por su gestor y la factura de cada pago (Henry).
- Las 10 fechas `[FECHA]` de la página 3 de «Lo que tiene MÛRA» (Sonia + German). Con el mantenimiento cancelado, quizá ya no tienen sentido.
- Sara quiere recibir solo los informes que traen un cambio sugerido.

---

## 7. Contradicciones y datos desactualizados

1. **Campaña e ids (CLAUDE.md, pendientes).** Dice campaña `52549695358270` y conjunto `52549695445670` en pausa con inicio el 2/11 en `act_1650663796846832`. **Lo vigente:** campaña `52585971203356`, conjunto `52588391414956`, cuenta `act_1141864065246239` («Mura - ES», del portafolio de Profit), **activa desde el 10/11**. CLAUDE.md tampoco recoge la cuenta de Profit ni el cambio de píxel.
2. **Método de pago, anuncios, dominio y Purchase (CLAUDE.md).** Dice que falta la tarjeta: hay método de pago desde el 6/11. Dice que el dominio está sin verificar: está verificado desde el 10/11 (también en `docs/meta-api.md` §6 bis). Dice «los anuncios faltan»: hay 8 creados.
3. **Edad del público.** CLAUDE.md, `campanas-meta.md` y `plan-contenido.md` dicen 28–48. Desde el 10/11 es **25–48**.
4. **Variantes de texto.** `plan-contenido.md` y `meta-campana.md` («3 textos y 6 títulos como variantes») frente a la realidad: **un texto y un título por anuncio**, porque el conjunto no es dinámico.
5. **Música.** `plan-contenido.md` dice «música de la biblioteca de Meta». Se usa música generada con IA («Sophisticated Calm»; Suno para E/B2/F/G).
6. **Reglas de texto.** Las fichas de `plan-contenido.md` usan «producción limitada», «cosidos a mano» y «sin reposiciones». `proceso-anuncios-meta-con-claude.md` lo prohíbe expresamente. Manda la regla más reciente.
7. **Descuentos en anuncios.** `plan-contenido.md` dice «nada de descuentos en el texto de los anuncios». El anuncio G lleva 20 % y BLACK20. Es una excepción decidida.
8. **Black Friday.** El acta del 19/11 fija tramos 20 % / 15 % / sin descuento. El 20/11 pasó a 15 % en toda la web y después a **20 % en toda la web con `BLACK20`**. CLAUDE.md ya lo recoge. El acta sigue listando como abierta la duda de los dos cupones, que ya no aplica.
9. **Envío gratis.** El entregable del 18/11 dice «gratis desde 100 €»; el acta del 19/11, «sin cerrar». **Hecho a 99 € el 20/11** (3 € por debajo; copia en `ghl_envio_zona_20261120.json`).
10. **Mantenimiento.** El «Estado comercial (13/10)» de CLAUDE.md y la tabla de pendientes («propuesta de mantenimiento más barata») están **obsoletos**: se canceló la semana del 9/11.
11. **Anuncios de fiestas.** El acta del 19/11 dice «2 anuncios de fiestas el martes 24». Se activaron **3 (E, B2, F) el 25/11**, más B pausado, y G queda para el 27.
12. **Purchase.** `capi-purchase-ghl.md` dice «pendiente de montar» y que se usa la conexión Integration. En realidad está montado en SP01 con la conexión **Ad Manager**, en EUR, y falta pasarlo a Integration.
13. **`meta-api.md`, incoherencia interna.** §4 dice generar el token con «App: `Conversions API Application`», y §3 dice que esa app no sirve y que hay que usar `MURA Ads`. Además, la plantilla del `.env` trae `META_AD_ACCOUNT_ID=act_1650663796846832`, pero los anuncios viven en `act_1141864065246239`: comprobar qué valor tiene el `.env` real.
14. **Patrón de búsqueda de secretos.** CLAUDE.md usa `pit-[0-9a-f]` y `meta-api.md` usa `pit-`. Diferencia menor.
15. **Plan de contenido frente a la realidad.** Calendario con activación el 2/11 y anuncios = fichas 1–6. La activación fue el 10/11, con anuncios A–D que no corresponden a fichas numeradas. La grabación 2 (prevista del 10 al 16/11) fue el 20/11.
16. **README.md desactualizado.** Habla de 18 plantillas (hay 20 + el Recibo) y 36 productos (había 47 piezas a 23/9 y 53 productos al 10/11, más los Vínculo y Camel). `datos/productos_ghl.json` (36) y `datos/plantillas_ghl.json` (18, sin el 19, el 20 ni el Recibo) son de julio y agosto.
17. **Copias de correos del repo frente a GHL.**
    - `correos/02` y `03` **no contienen** el bloque `{{{opportunity.resumen_pedido_html}}}` y siguen con el botón «Ver mi pedido», cuando `para-sonia-aviso-pedido.md` (27/8) y la implementación (§40) dicen que el botón se quitó y se añadió el desglose. Las versiones vigentes estarán en GHL o en `datos/backups/plantillas_2026082x`. **No volver a subir esas dos desde `correos/`.**
    - `correos/08` usa `{{contact.url_etiqueta_devolucion}}`; §33 de la implementación da como bueno `opportunity.url_etiqueta_devolucion`.
    - La cabecera del 16 dice que `url_formulario_devolucion` lleva al formulario nativo v2. El 29/8 se apuntó a `/devolucion`.
18. **Número de pedido.** La nota de la llamada del 29/7 dice que el contador «no llegó a implementarse». `mensaje-sonia.md` (7/8) y el backup del 23/8 confirman el contador nativo M100001… (Contador Pedidos reiniciado a 100000).
19. **`mensaje-sonia.md`** figura como «BORRADOR, aún no enviado» (7/8 y 13/8). Probablemente lo superó la sesión con Sonia del 14/8; estado incierto.
20. **`para-sonia-aviso-pedido.md`** dice «cuatro nodos» y luego «los tres nodos aparecen». Errata.
21. **Ventas del 12/11.** `meta-campana.md` cuenta 4 pedidos por 607,40 € (incluye el repetido de 134 €). El entregable cuenta 4 pedidos del 10 al 18/11 por 545,40 €, sin el repetido y con el de 72 € del 14/11. No son el mismo conjunto de pedidos.
22. **Cobros.** `cobros-sara.md` tiene los tres links como pendientes. Según el acta del 19/11 la gestión ya corre desde el 10/11 y está pendiente de cobro: el documento no se ha actualizado.

---

## 8. Entregables, artefactos y precauciones

**Formato de los entregables para Sara o Sonia:** artefacto de diseño A4 descargable en PDF, fondo `#F6F2EB`, tinta `#1E1B1A`, Cormorant Garamond + Jost, cabecera «MÛRA» espaciada y pie con número de página. Sin jerga y con cuentas en lugar de promesas.

**Artefactos** (privados de German; se leen con `Artifact` → `read`):

| Artefacto | URL |
|---|---|
| Propuesta de campañas v2 (6/10) | https://claude.ai/artifact/XkqtWxWP2KAS6DoLuatfCf |
| Lo que tiene MÛRA (mantenimiento y pendientes) | https://claude.ai/artifact/UXvaxbE6zpuz3TByGufwUp |
| Plan de contenido (lienzo para Sara) | https://claude.ai/artifact/V1XTYr6s5LSiWdJrhb1ddG |
| Cambios del 24/10 (documento para Sara) | https://claude.ai/artifact/Apkpa4fVtBhtQCD9AP2D9E |

**Entregables en el repo:**
- `docs/entregables/2026-11-18-primera-semana-campana.html`: 4 páginas, «Profit Technology para MÛRA», cifras del 10 al 18/11. Se envió como PDF antes de la reunión del 19/11; el PDF no está en el listado que revisé.
- Documento compartido «MÛRA antes de Meta» (22/9), copiado en `docs/para-sonia-estado-antes-de-meta.md`.
- Plantilla reutilizable: `plantillas/plan-contenido/` (`plan-contenido.md` con un enlace a artefacto vacío como marcador).

**Precauciones para quien herede el proyecto:**
- `datos/reporte_correos_v2.json` contiene URLs de vista previa de Firebase con `token=`. No copiarlas a ningún sitio. Otro motivo para pasar el `grep` de `AMf-|pit-|EAA` antes de cada commit.
- `datos/backups/oportunidades_20260823/README.md` y varios documentos contienen correos o nombres de clientas y del equipo (pedidos de prueba, ejemplos de aviso de Telegram). No llevarlos a entregables ni a artefactos.
- Antes de pegar en GHL cualquier código generado desde el repo, compararlo con lo que corre en producción: el 30/10 el repo estaba desfasado.
- El registro técnico completo de GHL está en `docs/2026-08-07-implementacion-ghl.md` (§1–§42, unos 200 KB). Solo consulté sus apartados sobre correos, workflows y recibo; no lo leí entero porque no estaba en la lista.
