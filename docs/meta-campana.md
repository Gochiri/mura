# La campaña en Meta (creada el 21/10, en pausa)

Creada por API con `tienda/meta-campana.sh` desde la sesión con las variables
`META_*`. Está **en pausa** y sin anuncios: se activa el 2/11 cuando estén
montados los anuncios de `plan-contenido.md` y Sara haya puesto la tarjeta.

| Qué | Nombre | ID |
|---|---|---|
| Campaña | MÛRA · Ventas · Cápsula 01 | `52549695358270` |
| Conjunto | Mujeres 28–48 · España · Advantage+ | `52549695445670` |

**Campaña:** objetivo Ventas (`OUTCOME_SALES`), subasta, presupuesto en el
conjunto (no CBO), sin categorías especiales.

**Conjunto:** 22 €/día, optimiza a **Añadir al carrito** del píxel
`1799475611078369`, puja de menor coste, destino web, inicio **2/11/2026 a las
9:00** (hora de Madrid), ubicaciones automáticas. Público: audiencia Advantage+
con los controles que la API admite (mujeres, España, 25–65). El **28–48 del
plan se pone como sugerencia** en el Administrador de anuncios → conjunto →
Audiencia → «Sugerencia de edad»; la API no lo admite como control. Anunciante y
pagador (Ley de Servicios Digitales): MÛRA.

**Dónde verla:** business.facebook.com → Administrador de anuncios → cuenta
«Mura» (`act_1650663796846832`). `./tienda/meta-campana.sh --ver` la lista por
API.

## Lo que falta para poder activarla

1. **Método de pago en la cuenta publicitaria.** El 21/10 no tiene ninguno:
   Sara lo pone en Administrador de anuncios → Facturación → Añadir método de
   pago, en la cuenta «Mura».
2. **Los anuncios** (`plan-contenido.md`): cada uno con sus 3 textos y 6 títulos
   como variantes. Se crean en pausa con el creativo subido.
3. **Purchase por GHL** (`capi-purchase-ghl.md`), para que Meta sepa qué
   anuncio vende.
4. **Dominio verificado** (`meta-api.md`).

Activar la campaña o cambiar su presupuesto, solo con el visto bueno de German.

## Avisos de la API que ya nos han costado un intento

- La campaña exige `is_adset_budget_sharing_enabled` (true/false) si no usa
  presupuesto de campaña.
- El conjunto exige `dsa_beneficiary` y `dsa_payor` (UE).
- Con `advantage_audience=1`, `age_min` no puede pasar de 25 ni `age_max` bajar de
  65: lo demás va como sugerencia en la interfaz.
- Los valores con `+` (el nombre, la zona horaria de `start_time`) van con
  `--data-urlencode`, o curl los convierte en espacios. `start_time` no se puede
  editar después: hubo que borrar y recrear el conjunto.


## Estado a 6/11/2026 (comprobado por API, solo lectura)

Los IDs de arriba son de la primera creación. Hoy lo que hay en Meta es:

| Qué | ID |
|---|---|
| Cuenta publicitaria «Mura - ES» (EUR, Madrid, activa) | `act_1141864065246239` |
| Campaña «MÛRA · Ventas · Cápsula 01» (en pausa) | `52585971203356` |
| Conjunto «Mujeres 28–48 · España · Advantage+» (en pausa, 22 €/día) | `52585971218156` |

- El conjunto optimiza a Añadir al carrito del píxel **nuevo** `1577201230843977`.
- La cuenta ya tiene método de pago (Mastercard terminada en 4000).
- No hay anuncios todavía. Copia del estado en `datos/backups/meta_estado_20261106.json`.
- **Bloqueo para crear anuncios por API:** la app `MURA Ads` está en modo desarrollo y Meta rechaza el creativo
  (error 100, subcódigo 1885183: «Debe estar en modo público para crear este anuncio»). Hay que pasarla a modo
  público en developers.facebook.com → la app → Configuración básica (pide URL de política de privacidad).
- Subidos a la biblioteca de vídeos de la cuenta, sin anunciar: A `1084761704387445`, B `1126270353704094`,
  C `3468335396670995`, D `1623330019530949` (borradores 9:16).

## Cambio de píxel (9/11/2026)

- El portafolio de MÛRA es nuevo y Meta le impide crear o reclamar cuentas publicitarias y compartir activos con
  otro negocio durante varias semanas. La cuenta de los anuncios sigue siendo «Mura - ES» (`act_1141864065246239`),
  que es del portafolio de Profit Technology; la tarjeta es de MÛRA.
- Se usó «Solicitar acceso» desde MÛRA a esa cuenta y se conectó el píxel de MÛRA, `1799475611078369`
  (propiedad de MÛRA), a la cuenta desde Conjuntos de datos → Activos conectados.
- Conjunto nuevo con ese píxel, en pausa: `52588391414956` (22 €/día, Añadir al carrito). Mismos ajustes que el
  anterior. Copias en `datos/backups/meta_conjunto_pre_pixel_20261109.json` y `meta_conjunto_nuevo_20261109.json`.
- El conjunto anterior, `52585971218156`, sigue en pausa y vacío, renombrado «NO USAR · antiguo (píxel de Profit)».
  Pendiente de borrarlo a mano en el Administrador de anuncios.
- **Pendiente en GHL:** la web sigue mandando eventos al píxel de Profit, `1577201230843977`. Hay que poner
  `1799475611078369` en `META_PIXEL_ID`, en Head y Body, y probar los eventos.
- Cuando Meta lo permita, trasladar todo a una cuenta publicitaria de MÛRA.

## Estado a 10/11/2026: anuncios creados y tienda lista

**Píxel en la web (9/11).** `META_PIXEL_ID = '1799475611078369'` en Head y Body de GHL. El Body tenía la comilla de
cierre borrada (`'1799475611078369;`), un error de sintaxis que dejaba sin banner de cookies y sin píxel. Corregido
y comprobado: tras aceptar Publicidad llegan `PageView`, `ViewContent` y `AddToCart` (navegador y servidor,
deduplicados). El píxel de Profit ya no recibe nada. `InitiateCheckout` no se envía (el checkout es el nativo de GHL);
no bloquea porque el conjunto optimiza a Añadir al carrito.

**Purchase.** Workflow «01 · Compra confirmada (SP01)», acción «Meta Conversion API» con el conjunto de datos
«Mura Pixel», evento `Purchase`, valor `Opportunity Value`, moneda cambiada de USD a **EUR** (10/11). Pendiente:
pasar la conexión de «Administrador de anuncios» a «Integración», filtro de la etiqueta `prueba`, probarlo con un
pedido de prueba y decidir lo del consentimiento (`docs/capi-purchase-ghl.md`).

**Anuncios en pausa** en el conjunto `52588391414956`, vídeos con música (pista instrumental generada con IA,
aprobada por Sara) y títulos dentro de la zona segura de Reels/Stories. Un texto y un título por anuncio (el conjunto
no es de contenido dinámico):

| Anuncio | ID |
|---|---|
| A · Nueva colección otoño (v3, «Chaqueta Vínculo») | `52588656496756` |
| B · El detalle (v2) | `52588421059756` |
| C · Looks de calle (v3, «conjunto Vínculo en burdeos») | `52588656515756` |
| D · Así llega tu pedido (v2) | `52588421124356` |

Los anteriores llevan delante «NO USAR». La app ya permite crear anuncios por API.

**Tienda (10/11, por API, con confirmación de Sara).** Copia previa: `datos/backups/ghl_productos_20261110.json`.
- «Abrigo Pelo Animal Print» estaba oculto; vuelve a estar visible (sale en el anuncio A).
- Bolsos con el color en el nombre: Bolso Nodo Marrón Chocolate / Negro / Burdeos (agotado) / Taupe y Bolso Ánfora
  Negro / Marrón Chocolate (agotados, sin reposición).
- Creados y visibles: Chaqueta Vínculo Burdeos (S 2, M 2) y Gris (S 2, M 1), 65 €, en Blazers; Pantalón Sastre
  Vínculo Burdeos y Gris (S/M 2, M/L 2), 69 €, en Pantalones. Todos en «Colección». Ids en
  `datos/backups/ghl_productos_creados_20261110.json`. La línea `Modelo: … · Color: …` agrupa los colores en la ficha.
- Stock de las prendas de A: Arco 6, Sastre 3 (una sola S), abrigo de pelo 3, Chaqueta Vínculo burdeos 4.
- Creados el 10/11: **Chaqueta Entallada Camel** (S 3, M 3, L 3; 149 €; Blazers; visible; broche joya desmontable
  incluido) y **Pantalón Pinzas Camel** (S/M/L/XL 3 cada una; 69 €; Pantalones; **oculto** hasta que Sara confirme la
  composición en la etiqueta, que su ficha da como provisional). Ids en
  `datos/backups/ghl_productos_creados_camel_20261110.json`.
- Dominio `stylebymura.com` **verificado** en Meta (10/11).
- Público (10/11, decisión de German): sugerencia de edad **25–48** a Advantage+ (antes 28–48 en el plan), mujeres, España. Conjunto renombrado «Mujeres 25–48 · España · Advantage+».

## Activación (10/11/2026)

German activó la campaña el 10/11. Comprobado por API: campaña `52585971203356`, conjunto `52588391414956` (22 €/día, Añadir al carrito del píxel `1799475611078369`) y los 4 anuncios (A v3, B v2, C v3, D v2) en ACTIVE, sin avisos de revisión. El conjunto antiguo sigue en pausa. Gasto a la activación: 0 €.

## Revisión del primer día (11/11/2026, 12:07 Madrid)

Todo activo y sin avisos de revisión (campaña, conjunto y los 4 anuncios volvieron a ACTIVE tras el renombrado).
Fase de aprendizaje: lectura prudente, no tocar nada en 2–3 días salvo error o rechazo.

Desde la activación (10/11 por la tarde → 11/11 mediodía), por anuncio:

| Anuncio | Gasto | Impr. | Clics enlace | CTR | CPC | Visitas a la web | Añadir al carrito |
|---|---|---|---|---|---|---|---|
| A · Nueva colección | 6,23 € | 455 | 23 | 5,1 % | 0,27 € | 5 | 0 |
| B · El detalle | 7,76 € | 468 | 28 | 6,0 % | 0,28 € | 15 | 6 |
| C · Looks de calle | 7,53 € | 448 | 22 | 4,9 % | 0,34 € | 6 | 1 |
| D · Así llega tu pedido | 10,04 € | 577 | 62 | 10,7 % | 0,16 € | 38 | 1 |
| **Total** | **31,56 €** | **1.948** | **135** | **6,9 %** | **0,23 €** | **64** | **8** |

- Sin compras todavía. Coste por «Añadir al carrito» atribuido: ~3,95 €.
- Píxel de MÛRA en las últimas 36 h: 697 PageView, 201 ViewContent, 19 AddToCart (navegador y servidor a partes iguales,
  deduplicados). El píxel de Profit recibió 8 eventos de un solo iPhone en la home el 10/11 (10:00 y 13:00 UTC),
  probablemente una página en caché con el código viejo; nada desde entonces.
- Para vigilar: en A y C solo 1 de cada 4–5 clics acaba en visita a la web (en D, 6 de cada 10). Puede ser carga lenta
  en el navegador de Instagram o clics accidentales; se mira de nuevo con 3–4 días de datos.
- **11/11, 14:25 Madrid:** 38,02 € gastados desde la activación, 159 clics, 76 visitas, 9 «Añadir al carrito» atribuidos y
  **0 ventas**. En GHL el último pedido es del 2/11 (antes de la campaña): ningún pedido, pagado o no, desde el 10/11.
  Ningún `InitiateCheckout` ni `Purchase` en el píxel. El píxel de Profit no recibe nada desde el 10/11 a las 13:00 UTC.
- 12/11: Chaqueta Vínculo Burdeos pasa a S 2 · M 1 · **L 1** (pedido de Sara; añadida la talla L). Copia previa en `datos/backups/ghl_chaqueta_vinculo_burdeos_20261112.json`.

## Estado a 13/11/2026 (15:30 Madrid)

- Gasto desde la activación: **91,83 €** (10/11: 18,91 · 11/11: 35,63 · 12/11: 23,45 · 13/11 hasta ahora: 13,84).
  7.014 impresiones, 4.829 personas, 551 clics (CTR 7,9 %, 0,16 €/clic), 278 visitas, 21 «Añadir al carrito».
- **Primera venta atribuida por Meta: 232,20 €** (anuncio D, 12/11). ROAS atribuido: 2,5.
- **GHL: 4 pedidos pagados el 12/11** (134 · 120,60 · 120,60 · 232,20 = 607,40 €), los primeros desde el 2/11. Meta solo
  se atribuye el de 232,20; el resto puede ser orgánico o de quien vio el anuncio sin hacer clic (no medible desde aquí).
- Por anuncio: D se lleva el 62 % del gasto (56,71 €, 419 clics, 12 carritos, 1 venta); B convierte mejor por euro
  (14,10 €, 8 carritos); A (7,83 €, 0 vistas de ficha) y C (13,19 €, 1 carrito) flojos. Meta ya les da poco presupuesto.
- Decisión: no tocar hasta el lunes 16/11 (7 días); entonces valorar pausar A.
- 14/11: anuncio A (`52588656496756`) pausado por German (0 carritos con 8,25 €). Siguen B, C y D. Totales a 14/11 21:00: 117,37 €, 757 clics, 24 carritos, 1 compra atribuida (232,20 €); sin ventas el 13 y 14/11.

## Fin de semana 14–15/11

- 14/11: 16,72 € · 160 clics · 111 visitas · 1 carrito. 15/11: 27,68 € · 211 clics · 131 visitas · 151 fichas vistas ·
  **12 carritos** (el mejor día en carritos). Meta ya da casi todo a D (35,39 € del finde) y algo a B (8,38 €); C apenas
  gasta (0,42 €).
- **Venta del 14/11, 23:03 Madrid: 72 € (Bolso Nodo Taupe), del anuncio D.** No pasó por la newsletter; GHL guardó en
  el contacto la URL de entrada con `utm_content=D_asi_llega_tu_pedido` y el `fbclid`. Meta todavía no la atribuye en
  sus informes (el píxel sí recibió el Purchase).
- Total desde el 10/11: 146,45 € · 990 clics · 566 visitas · 36 carritos. Ventas confirmadas de los anuncios:
  232,20 + 72 = **304,20 €** (≈ 2,1 € por euro).

## Pipeline «Ventas / Pedidos» (18/11)

- **«Venta web» es el archivo de ventas web cerradas**, no una cola: Sara mueve ahí a mano los pedidos ya enviados
  (M100019 el 14/11, M100022 el 18/11). No sirve para contar ventas de un periodo: se filtra por fecha de creación.
- No mover pedidos antiguos a «05 Entregado»: dispara el workflow 05 (correo «Tu pedido ha llegado», Telegram a Sara
  y el recorrido de experiencia y reseña).
- Borradas el 18/11 las oportunidades de prueba M100014 y M100015 (copia en `datos/backups/ghl_oportunidades_prueba_20261118.json`).
- **20/11:** anuncio C · Looks de calle pausado por API con el OK de German (copia en `datos/backups/meta_ad_C_20261120.json`). Activos: D y B.

## Anuncios de fiestas y Black Friday (22/11)

Subidos **en pausa** por API con `tienda/meta-subir-anuncios.py` (misma estructura que D: página e Instagram de MÛRA,
vídeo 9:16 con miniatura propia, botón «Comprar», destino `/prendas`, mejoras automáticas de Meta desactivadas).
Copia previa en `datos/backups/meta_anuncios_20261122.json`.

| Anuncio | Id | utm_campaign / utm_content | Plan |
|---|---|---|---|
| E · Así llega tu pedido de fiesta | 52591554747156 | fiestas_2026 / E_asi_llega_fiesta | Activar 24/11 |
| B2 · Mírala de cerca | 52591554813156 | fiestas_2026 / B2_detalle_fiesta | Activar 24/11; pausar B |
| F · Fiesta de noche | 52591554852356 | fiestas_2026 / F_fiesta_noche | Activar 24/11; una semana de prueba (Sara) |
| G · Black Friday | 52591554954356 | black_friday_2026 / G_black_friday | Activar 27/11; pausar el 30/11 por la noche |

Activar, pausar y subir el presupuesto (40 €/día del 26 al 30) solo con el OK de German. El 1/12 entra un anuncio de
Navidad con lo que Sara graba con Jaime el viernes 27 por la tarde.

- **25/11:** E, B2 y F activados y B pausado, con el OK de German (copia en `datos/backups/meta_anuncios_20261125.json`).
  Activos: D, E, B2 y F, a 22 €/día. G sigue en pausa hasta el viernes 27.

- **28/11 (07:15 UTC):** con el OK de German, **G · Black Friday activado** y **presupuesto del conjunto a 40 €/día**
  (copias en `datos/backups/meta_anuncios_20261128.json` y `meta_conjunto_presupuesto_20261128.json`). Activos: D, E, B2,
  F y G. Pendiente: **lunes 30 por la noche, pausar G y volver a 22 €/día** (`tienda/meta-presupuesto.sh 22 --ejecutar`),
  con OK de German.

- **28/11:** con el OK de German, tras mirar la competencia (`docs/competencia-anuncios-20261128.md`):
  - **B2 y F ahora llevan a la colección «Fiesta»** (`https://stylebymura.com/prendas?coleccion=6b057443982fac50b3bcff51`,
    filtro ya puesto en `/prendas`). Creatividades nuevas `2913051639077878` (B2) y `1622952689515392` (F); copia previa en
    `datos/backups/meta_B2_F_antes_enlace_20261128.json`.
  - **H · Carrusel looks de fiesta** (`52593036744356`, creatividad `1322948396624366`) creado **en pausa**: 8 fotos del 20/11
    en 1:1 (`anuncios/carrusel_fiesta/`), todas a la colección «Fiesta», `utm_content=H_carrusel_fiesta`. Falta el OK de
    Sara y el de German para activarlo.
  - **H v2 (28/11):** German avisó de fotos de baja calidad y frías. Fuera las de 1027 px (pasillo) y la de 939 px;
    ahora 7 fotos de 2585 px o más, con tono cálido igualado (rojo/azul 1,22) y algo de nitidez. Creatividad nueva.
- **28/11 (15:30 UTC):** con el OK de German, **E pausado hasta el lunes 30** para que Meta reparta el gasto hacia G
  (en 8 h, G había recibido 1,96 € de ~21 €, con 3 carritos de 4 visitas). Activos: D, B2, F y G. Reactivar E el 1/12
  junto con el cierre del Black Friday (copia en `datos/backups/meta_anuncios_20261128_antes_pausar_E.json`).
