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
