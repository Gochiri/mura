# Inventario de la subcuenta de GHL de MÛRA (25/11/2026)

Sacado por API en solo lectura con `datos/inventario_ghl.py` (variables `MURA_GHL_PIT` y `MURA_GHL_LOCATION_ID`). 
Los JSON de esta carpeta están **limpios de datos personales** (emails, teléfonos y nombres de clientas aparecen como `<omitido>`) y de tokens. Para volver a sacarlo: `python3 datos/inventario_ghl.py datos/ghl-inventario-AAAAMMDD`.

- **Subcuenta:** MÛRA · id `NxPF5fOicowujokEk5Hm` · zona horaria Europe/Madrid · país ES · web http://stylebymura.com/
- **Usuarios:** German Emiliano Borrello (admin); Sara Dominguez (admin)
- **Contactos:** 191 en total.

## Workflows

| Estado | Versión | Nombre | Id | Última edición |
|---|---|---|---|---|
| published | 71 | 01 · Compra confirmada (SP01) | `ba5d585c-8482-4810-b2f2-6983616b81a4` | 2026-11-09 |
| published | 17 | 02 · Etiquetado compra 1-2 | `b5feddb8-3aac-4f9f-aff8-db0eb9e68270` | 2026-09-01 |
| published | 23 | 03 · Email preparacion | `cc2c8b77-a5e3-4f00-85e0-bc6900b3eb4c` | 2026-09-03 |
| published | 38 | 04a · Envio - webhook Nacex + watchdog | `6d73077b-c9ea-4c8d-b1d5-f3167ef2cc4f` | 2026-10-07 |
| published | 26 | 05 · Entrega - mover + email | `8e6ccd5a-8c90-4d41-b567-9947e61ed627` | 2026-09-18 |
| published | 15 | 06-12 · Journey post-entrega | `cb923da8-dd56-4d75-b8e4-77abf25d4e07` | 2026-09-01 |
| published | 14 | 06b · Encuesta post-compra completada | `94779fd6-15bb-4387-9af0-244409fcd671` | 2026-08-29 |
| published | 13 | 08a · Devolucion - webhook Nacex | `6b3064f7-e5e2-4b87-9863-21e6aeb1d1cf` | 2026-08-29 |
| published | 13 | 08b · Email etiqueta devolucion | `466bbb08-ae6a-448e-8cc1-9e49b77d3a84` | 2026-09-01 |
| published | 10 | 08c · Devolucion no encontrada | `8b5fe6af-0d7d-4e62-8682-cbb045400f81` | 2026-09-01 |
| published | 5 | 08d · Devolucion cerrada - limpiar tag | `2197b479-93f6-4d95-bc83-917cca391b67` | 2026-09-01 |
| draft | 3 | AP01 · Control de Stock / Inventario Bajo | `c8487fc1-1a00-4b13-b512-9b41a2aa71f6` | 2026-08-08 |
| draft | 3 | AP02 · Lanzamiento Nueva Cápsula | `603de6df-18af-48ff-8b07-508f0cb5ba87` | 2026-08-08 |
| draft | 2 | LS01 · Lead Instagram / Redes | `ab8ade85-851b-47a3-b46f-62a7e9f80ccc` | 2026-08-08 |
| published | 21 | LS02 · Opt-in Newsletter Web | `f62a24a8-0a2c-4a60-9910-d57a44e34136` | 2026-09-04 |
| published | 13 | LS03 · Recuperación Carrito Abandonado | `1e240ed6-846d-42ad-8e34-e4eecc36f67f` | 2026-11-18 |
| draft | 2 | PS01 · Solicitud de Reseña / Review | `bd86a6cc-6eb3-46a2-8295-514c2e871f46` | 2026-08-08 |
| draft | 2 | PS02 · Fidelización VIP / Recurrencia | `56f4c576-885b-4669-b70d-42ddff01fffd` | 2026-08-08 |
| draft | 2 | SP05 · Reactivación Leads Fríos | `f07f8353-d6e8-4614-a64d-4390d7e305bb` | 2026-03-25 |

La API pública solo da nombre, estado y versión; los pasos se ven en la interfaz. Copias antiguas de los pasos (agosto) en `datos/backups/wf/` y `datos/backups/wf_20260829/`.

## Pipelines, etapas y oportunidades abiertas (25/11)

**Leads / Comunidad** `Y47eLa4dAIZTKLu2UpuX`

| Etapa | Id | Oportunidades |
|---|---|---|
| 01 Lead Nuevo | `7e15158e-c40d-4db4-9e0a-4e7f03f12db9` | 0 |
| 02 Interesada | `f0fe0f26-70a5-412d-8986-324f7f0234c3` | 0 |
| 03 Suscrita Newsletter | `a1fffbf6-a908-4ed5-8db7-8419db2d6ca7` | 64 |
| 04 Primera Compradora | `c4e6394b-b8e6-430a-85f9-4d8559db6fd0` | 0 |
| 05 Recurrente | `eb42208b-de79-4e1c-8239-9c4f36a95218` | 0 |
| 06 VIP | `24520481-c54f-474c-bc25-387b038e7b50` | 0 |
| 07 Baja Newsletter | `bb3d9b61-ccb8-4f38-b711-f5addcc91726` | 0 |

**Ventas / Pedidos** `X7wvJysuBVmdXXl1b8zx`

| Etapa | Id | Oportunidades |
|---|---|---|
| 01 · Carrito Abandonado | `b24a170f-281f-4596-9c1d-667f415fcd2b` | 8 |
| 02 · Pedido Nuevo | `169e313b-c8f0-47d4-956c-ff02da730fe5` | 0 |
| 03 En Preparacion | `f492640e-ddfc-4963-aaee-2b587a9065dc` | 1 |
| 04 Enviado | `a1a2f1fa-b9a2-4741-8f89-11ada366f227` | 2 |
| 05 Entregado | `789b85f8-5a2b-468a-936c-d643308340c3` | 0 |
| 06 Devolucion o Cambio | `fb63bc74-f716-4b6e-b3de-df1c24304fde` | 0 |
| 07 Devolucion Verificada | `d43b2438-8dbd-42a0-b134-01136f4fe806` | 0 |
| 08 Incidencia Devolucion | `6701274a-417f-4288-b9d1-5bc658565881` | 0 |
| 09 Reembolso | `e786e623-9862-426d-b940-bc26234e1c19` | 0 |
| Venta web | `ad78ca83-2b17-4edf-8615-994db5f1194e` | 9 |
| Venta efectivo | `146b7663-9e9f-4d9d-8af4-cfbd3297357a` | 0 |
| Venta márketing | `a156beb4-a60f-40f8-8cb6-aa8e13093381` | 0 |
| 11 Cerrado Perdido | `1caed4f0-3a9f-4ae9-a702-341bc1c44be0` | 0 |

## Tags y nº de contactos con cada uno

| Tag | Contactos |
|---|---|
| `nl-sin-confirmar` | 66 |
| `newsletter-suscrita` | 63 |
| `origen-meta` | 38 |
| `carrito-no-recuperado` | 14 |
| `feedback` | 8 |
| `nl` | 5 |
| `compra-1` | 4 |
| `pedido-enviado` | 3 |
| `etiqueta-por-imprimir` | 2 |
| `nl-prueba` | 2 |
| `experiencia` | 1 |
| `pedido-en-preparacion` | 1 |
| `pedido-entregado` | 1 |
| `abrio` | 0 |
| `add` | 0 |
| `carrito-abandonado` | 0 |
| `carrito-frio` | 0 |
| `compra-2` | 0 |
| `compradora-activa` | 0 |
| `devolucion-activa` | 0 |
| `devolucion-no-encontrada` | 0 |
| `email-04-listo` | 0 |
| `email-08-listo` | 0 |
| `encuesta-completada` | 0 |
| `follow-up` | 0 |
| `high priority` | 0 |
| `inactivo` | 0 |
| `instagram-lead` | 0 |
| `lead-frio` | 0 |
| `lead-nuevo` | 0 |
| `nueva-capsula-ready` | 0 |
| `pedido-confirmado` | 0 |
| `recurrente` | 0 |
| `reviewera` | 0 |
| `solicitud-devolucion` | 0 |
| `stock-bajo` | 0 |
| `venta-cash` | 0 |
| `venta-márketing` | 0 |
| `vip` | 0 |
| `warm lead` | 0 |

## Campos personalizados de contacto

| Nombre | Clave | Tipo | Id |
|---|---|---|---|
| consentimiento_nl | `contact.consentimiento_nl` | TEXT | `1HYScKHiOauVAlb2dPo8` |
| Motivo de Devolución / Cambio | `contact.motivo_de_devolucin__cambio` | TEXT | `2GQ11kHcaUggy8K4P9U4` |
| peso | `contact.peso` | NUMERICAL | `2S3zzm3wp9AEMn1z6CXJ` |
| Origen web · página de entrada | `contact.origen_web__pgina_de_entrada` | TEXT | `2TyFnk7n80k5CTyvkPlp` |
| Origen web · anuncio | `contact.origen_web__anuncio` | TEXT | `5TnYmVZ70fLAWhHSQLvf` |
| Calificación clienta | `contact.calificacin_clienta` | NUMERICAL | `7h9By9GaacziCO9qNQXm` |
| Billing Address - Zip Code | `contact.std_billing_address_postal_code` | TEXT | `8041m8m01GLEvqkJTrrm` |
| Billing Address - Phone Number | `contact.std_billing_address_phone` | TEXT | `B2VKoIkr7i09O3hlTHZf` |
| Talla habitual | `contact.talla_habitual` | SINGLE_OPTIONS | `Bbp5n6OjbtinwrvHBUMm` |
| url pedido | `contact.url_pedido` | TEXT | `Bn7HvsQdC1jEXVIamxO0` |
| NPS | `contact.nps` | NUMERICAL | `BpEcTG8IYDXRUQNrM3h0` |
| albaran nacex | `contact.albaran_nacex` | TEXT | `CAN1vUcUenmvw2J0iQIJ` |
| Fecha Cumpleaños | `contact.fecha_cumpleanos` | DATE | `FGlE7RDztTinTetJGgWI` |
| Origen web · fecha | `contact.origen_web__fecha` | TEXT | `FpQ4DRr31zqiupKkuApY` |
| Origen web · campaña | `contact.origen_web__campaa` | TEXT | `H3Hdw340TwSgbNEu5K9i` |
| Resumen pedido html | `contact.resumen_pedido_html` | LARGE_TEXT | `LeXlAQrQGdG47mrVQNLU` |
| bultos | `contact.bultos` | NUMERICAL | `OX8ZNURwqs5rbK6TzLQ5` |
| Origen web · fbclid | `contact.origen_web__fbclid` | TEXT | `OnLq8TJNstBIn8UrURRV` |
| baja_nl | `contact.baja_nl` | TEXT | `QL0rD5nUAYa4d3MbfsSh` |
| Billing Address - Country | `contact.std_billing_address_country` | TEXT | `QsshPBfpTGXreMlAdI0c` |
| Canal origen | `contact.canal_origen` | SINGLE_OPTIONS | `Sgcf1Xxig5H77sn1lWal` |
| Origen web · fuente | `contact.origen_web__fuente` | TEXT | `TFcfrXYQEVkceLrsUwNh` |
| Origen web · medio | `contact.origen_web__medio` | TEXT | `TsWpl0Ruj14aQExe8Ymb` |
| url etiqueta devolucion | `contact.url_etiqueta_devolucion` | TEXT | `VYuoSWpYVfPwXQBlM7WD` |
| Nº total compras | `contact.n_total_compras` | NUMERICAL | `a47cYvki8JPPTIdN3dCh` |
| Billing Address - State | `contact.std_billing_address_state` | TEXT | `eoHAhHzbmQsPzd0GaVps` |
| Billing Address - Full Address | `contact.std_billing_address_address1` | TEXT | `fyJ4zckCqrFG7vpqiVyI` |
| Billing Address - Full Name | `contact.std_billing_address_full_name` | TEXT | `llmsE5Va72PuB3FwxCxG` |
| Billing Address - City | `contact.std_billing_address_city` | TEXT | `pEodloGWjxVi9KBjOUU1` |
| url seguimiento | `contact.url_seguimiento` | TEXT | `py7TEhnvdIt7XjDtWjg5` |
| Nº de pedido (lo encuentras en tu mail de confirmación) | `contact.n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin` | TEXT | `q73ODvZiPLCMqRrUkVCK` |
| url etiqueta | `contact.url_etiqueta` | TEXT | `uFzLRUfvECe9q7Z47kwT` |
| Algun comentario que nos quieras compartir ? | `contact.algun_comentario_que_nos_quieras_compartir` | LARGE_TEXT | `vkPLvFnVATmumypswMN7` |

## Campos personalizados de oportunidad

| Nombre | Clave | Tipo | Id |
|---|---|---|---|
| Punto Nacex Shop · datos n8n (no editar) | `opportunity.shop_punto_json` | LARGE_TEXT | `0oi7lmUb6f6ECN486nvC` |
| Fecha reembolso | `opportunity.fecha_reembolso` | DATE | `3Cao5VyCSkRZ5nbZH7Go` |
| Fecha pedido | `opportunity.fecha_pedido` | DATE | `3M7h8oLHzTM1XqZHKEl8` |
| Numero de pedido | `opportunity.numero_de_pedido` | TEXT | `5p3I04zlvlct8CfuDNU5` |
| Transportista | `opportunity.transportista` | SINGLE_OPTIONS | `8HWNZnnXbC5EnKdgdGJG` |
| Estado pedido | `opportunity.estado_pedido` | SINGLE_OPTIONS | `9Dh4SO2mxS0KINh8mZex` |
| Punto Nacex Shop (dónde recoge) | `opportunity.shop_punto_texto` | TEXT | `9dPNHSFnw9P3bInb2xZM` |
| Categoría prenda | `opportunity.categora_prenda` | SINGLE_OPTIONS | `ABqBmrwR3zLC6gLPkkMW` |
| SKU comprado | `opportunity.sku_comprado` | TEXT | `DosPngyaNb5h105ZoneJ` |
| num pedido devolucion | `opportunity.num_pedido_devolucion` | TEXT | `KMbxDpAMSc6CVjLCxrzA` |
| Color variante | `opportunity.color_variante` | SINGLE_OPTIONS | `M5EX9iW76meVr1ykwVQM` |
| Peso | `opportunity.peso` | NUMERICAL | `MUSwk4X0oadHyO77RM5p` |
| Importe reembolsado | `opportunity.importe_reembolsado` | MONETORY | `MjYdGW27YdbNEjnQ3DuW` |
| Motivo devolucion | `opportunity.motivo_devolucion` | LARGE_TEXT | `PFiAHPZEfOU8uYPk4AYH` |
| Bultos | `opportunity.bultos` | NUMERICAL | `UjRE5P3lTXhkw8vGIVkz` |
| Order ID | `opportunity.order_id` | TEXT | `Z5LD1nrSjYnZUGPXs3Pt` |
| Importe total | `opportunity.importe_total` | MONETORY | `aphgnbrUcLUOdff3Euhj` |
| Nº tracking | `opportunity.n_tracking` | TEXT | `bKkSKrbotvcVNCgLPo0x` |
| URL etiqueta devolucion | `opportunity.url_etiqueta_devolucion` | TEXT | `csFW5GZwYzQo5A3GnGBA` |
| Albaran Nacex | `opportunity.albaran_nacex` | TEXT | `gLWoB27TkBkWD4UbMADQ` |
| Talla pedida | `opportunity.talla_pedida` | SINGLE_OPTIONS | `nUHrHuLa0g1BqGcfPMBl` |
| Resumen pedido | `opportunity.resumen_pedido` | LARGE_TEXT | `qLuRjgyMjv1rw7dRCzgA` |
| Tipo de envío | `opportunity.tipo_envio` | SINGLE_OPTIONS | `qca6ppgH03OTzSnbADej` |
| URL etiqueta | `opportunity.url_etiqueta` | TEXT | `ujglR1FPysKzsdrG9PC1` |
| URL seguimiento | `opportunity.url_seguimiento` | TEXT | `wQLTNRwInF8a8rmRqlQr` |

## Valores personalizados (custom values)

| Nombre | Clave | Valor |
|---|---|---|
| Marketing - New Booking Thank You Page URL | `{{ custom_values.new_booking_ty_url }}` | — |
| Hours of Operation | `{{ custom_values.hours_of_operation }}` | — |
| Marketing - Website Booking Page URL | `{{ custom_values.marketing__website_booking_page_url }}` | — |
| Promotion Name | `{{ custom_values.promotion_name }}` | — |
| url devoluciones | `{{ custom_values.url_devoluciones }}` | https://www.stylebymura.com/devoluciones |
| url coleccion | `{{ custom_values.url_coleccion }}` | https://www.stylebymura.com/colecciones |
| url home | `{{ custom_values.url_home }}` | https://www.stylebymura.com |
| url politica privacidad | `{{ custom_values.url_politica_privacidad }}` | https://www.stylebymura.com/politica-privacidad |
| url contacto | `{{ custom_values.url_contacto }}` | https://www.stylebymura.com/contacto |
| Contador Pedidos | `{{ custom_values.contador_pedidos }}` | 100023 |
| url pieza | `{{ custom_values.url_pieza }}` | — |
| url feedback | `{{ custom_values.url_feedback }}` | https://api.leadconnectorhq.com/widget/form/fvVToLx0e9pEjSRD6zq7 |
| url resena google | `{{ custom_values.url_resena_google }}` | — |
| url formulario devolucion | `{{ custom_values.url_formulario_devolucion }}` | https://www.stylebymura.com/devolucion |
| unsuscribe | `{{ custom_values.unsuscribe }}` | https://www.stylebymura.com/cancelar_suscripcion |

## Plantillas de correo

Carpeta **Correos** (`6a6aa119fee4921a97537ba5`):

| Nombre | Id |
|---|---|
| 00 - Confirmación de mail | `6a832d2b49311439952464f9` |
| 01 · Recibo | `6a90dd80f98ccc652507a173` |
| 01 · bienvenida newsletter | `6a6aa2e4a1ebd230f8649167` |
| 02 · confirmación | `6a6aa2e6e3d32f78af2869e2` |
| 03 · preparación | `6a6aa2e814830a62bce73c7a` |
| 04 · envío | `6a6aa2ea4eb3e6c4d953427c` |
| 04b envio punto nacex | `6abae15c9ed784b5dffb0cc2` |
| 05 · entrega | `6a6aa2ed3954360b6a94f117` |
| 06 · experiencia | `6a6aa2ef3fca8e1053eff501` |
| 07 · reseña | `6a75e5e973e37ca123637d76` |
| 08 · solicitud devolución | `6a6aa2f161a2115039f0034f` |
| 09A · devolución verificada | `6a6aa2f38ea1ab2089eb114e` |
| 09B · incidencia devolución | `6a6aa2f661a2115039f00392` |
| 10 · reembolso | `6a6aa2f8301f379d94c7b7ce` |
| 11 · segunda compra | `6a6aa2fa8ea1ab2089eb119e` |
| 12 · hace tiempo | `6a6aa2fc61a2115039f003cf` |
| 14 · lanzamiento | `6a6aa2fe0d3eda23ad6dc3d7` |
| 15 · reposición | `6a6aa30014830a62bce73d47` |
| 16 · Incidencia devolucon | `6a75e5eb96dc697014d600f7` |
| 17 · cumpleaños | `6a75e5ed44a7d6989c157ce7` |
| Carrito abandonado | `6ac0b45072c7ea37606e3028` |

Fuera de la carpeta:

| Nombre | Id |
|---|---|
| Haircuts | `69962f2009f2424a822b4267` |
| Beard Trims | `69962f2009f242516d2b4263` |
| Hot Towel Shaves | `69962f2009f242d0ef2b4269` |
| Hair Styling | `69962f2009f242c3ad2b4265` |
| Default - Abandoned Cart | `69c450d6846596a59766a0cb` |
| Default - Order Template | `6a7df505b5bddfdb01df51f1` |
| Default - Order Fulfillment Template | `6a7df5a5b5bddfdb01df62ac` |
| Default - Order Template | `6a7dff32b5bddfdb01e0700d` |
| Default - Abandoned Cart | `6a90c17a3b0434e93e72da3e` |
| 20 · Carrito abandonado · 2 | `6afdf8e9218912ba8f1fbbbc` |

«Haircuts», «Beard Trims», «Hot Towel Shaves» y «Hair Styling» son restos de la plantilla de barbería con la que se creó la subcuenta (también hay calendarios con esos nombres). No se usan.

## Web (sitio «MÛRA», id `rlc7iAyGF4U1nfwAJOJQ`)

| Página | Ruta | Id del paso |
|---|---|---|
| Home | `/home` | `5b8cdc7c-c65d-4583-9fcc-d86a50f8cd57` |
| prendas | `/prendas` | `7ae2e388-a635-4a5e-94a2-1c325935fe11` |
| producto | `/producto` | `0ff62be3-ddbd-4155-b8fc-9d8915b9e43a` |
| novedades | `/novedades` | `e012a41d-113f-45a2-bb09-24574c969d96` |
| colecciones | `/colecciones` | `76a20796-4660-4b7c-a832-ff1e62a7b2aa` |
| mura | `/mura` | `84a99082-cc34-485d-87d5-1dfccf5b25e4` |
| carrito | `/carrito` | `546b488d-49ee-4bde-aaef-524c5f7519be` |
| contacto | `/contacto` | `89b58817-d312-46d1-8040-c84c64bd13d1` |
| devoluciones | `/devoluciones` | `5cec5ea7-bd8c-41d1-bd48-47e78262dc6e` |
| gracias | `/gracias` | `bb1db404-da6a-4671-b14d-f45aa0b22a1e` |
| Products List | `/products-list` | `81589785-c1ae-442a-b3b8-674d6d9197c4` |
| Product details | `/product-details` | `7a307be0-dcfc-474a-91f6-8a08f54b5bb7` |
| Cart | `/cart` | `a47742ae-8644-4fc3-b8c1-16583446b6b1` |
| Checkout | `/checkout` | `486f410f-8dbc-473b-b5a4-4806dbf0bd5c` |
| Thank you! | `/thank-you` | `768eab2c-5b7f-4745-b3e4-11ac4b89311f` |
| aviso-legal | `/aviso-legal` | `f47889f7-bd63-4049-b778-f791f9dfbee0` |
| politica-privacidad | `/politica-privacidad` | `040a59eb-9e64-44ca-adf7-92473851b176` |
| politica-cookies | `/politica-cookies` | `5452ae93-0f13-4ece-8909-b69a26ccad62` |
| condiciones-contratacion | `/condiciones-contratacion` | `e1a378b5-ed47-4395-abe7-535172955387` |
| devolucion | `/devolucion` | `a377e648-77b1-472f-87fd-8247590ba76a` |
| suscripcion confirmada | `/suscripcion-confirmada` | `eb3118a2-3f1f-47b9-9fc5-959ffdfd397e` |
| experiencia | `/experiencia` | `89345d2d-539a-4ab0-854d-1f65473acbad` |
| Gracias devolución | `/gracias-devolucion` | `a5c6a142-5b68-4f72-9922-d7815d87ef58` |
| Baja suscripción | `/cancelar_suscripcion` | `e6947c5f-87cf-43f7-a967-b002d911e07d` |
| cabecera | `/cabecera` | `50a2920e-11b3-46a8-89ff-8f930cfd7c15` |
| Pie | `/pie` | `115be1f1-6c06-454f-a11a-8ee3eabc5c1c` |
| Enviar newsletter  | `/enviar-newsletter` | `c277a174-7e08-4521-8a4f-b1d91cf4abe4` |

La clave del carrito en `localStorage` es `cart_details_rlc7iAyGF4U1nfwAJOJQ` (lleva el id del sitio).

## Formularios, calendarios y enlaces de seguimiento

- **Formularios:** Formulario Devolución v2 `HBK7tGDlcIFN0vaXoksg`; Opt-in Newsletter `fmuHvvOjkGBAkPU2LTZN`; Form 1 `a9TsRb4XPYYWJBIrHCif`; Encuesta Post-Compra `fvVToLx0e9pEjSRD6zq7`
- **Calendarios:** Hair Styling `9yMgHXmOLajxswoUmbDw` (inactivo); Schedule an Appointment `GJVV2GNeHU3I0ERHRPhN` (activo); Haircuts `K1nutLQcizCLrECahBGk` (inactivo); Beard Trims `O1eMdbZfKi3Z6FCJwbhW` (inactivo); Hot Towel Shaves `d85sbxOpOSqrES7LDaAd` (inactivo) — ninguno se usa en MÛRA.
- **Enlaces de seguimiento (trigger links):** TL-SP03-EXPERIENCIA-POSITIVA → www.google.com; TL-LS02-CONFIRMAR-OPTIN → https://www.stylebymura.com/suscripcion-confirmada

## Tienda

- **Productos:** 60 (59 visibles en tienda). **Variantes:** 130; stock total 298 unidades; 7 variantes a 0.
- **Colecciones:** Fiesta `6b057443982fac50b3bcff51`; Abrigos `6ae24b53335a134b88e7f51a`; Colección `6a5f9fcbb76fa2ad6a2418f0`; Accesorios `6a5f9945a57249176eb9bdd7`; Faldas `6a5f9945b76fa22b9e23f3bb`; Vestidos `6a5f99458dc97c8b7a17921b`; Pantalones `6a5f99452f4e2589555a18e1`; Tops `6a5f99457d768b21b3416989`; Camisas `6a5f9945427180270bf47339`; Blazers `6a5f993d79dea6c886c15366`; Prendas del día `69c45a90f029ce4f96127a72`; Prendas Especiales `69c45a7f38aa3cfc7481715a`; Últimas Unidades `69c45a6b549ec6feb2921bdc`; Outle / Sale `69c45a4f5fbbff8adb626ead`; Sastrería `69c457e19dac49526c621fd7`; Nueva Cápsula `69c457ccc331eda6fe4098cb`
- **Envío (zona «España», `6a764f72df6bb6cc8e548c29`):** Envío a tu puerta (Nacex): 3 € (de 0 a 98.99); Envío a tu puerta (Nacex): 0 € (de 99 a 0); Recogida en punto Nacex Shop: 0 € (siempre). Es decir: domicilio 3 € hasta 98,99 € y gratis desde 99 €; recogida en punto Nacex siempre gratis.
- **Cupones:** `BLACK20` 20 % (scheduled, desde 2026-11-25 hasta 2026-11-30, usos 0); `BIENVENIDA10` 10 % (active, desde 2026-08-28, usos 8, 1 por clienta)
- **Aviso de pedido nativo de la tienda:** desactivado (los correos los mandan los workflows).

## Pedidos y pagos (resumen, sin datos de clientas)

| Fecha (UTC) | Importe | Estado | Pago | Modo |
|---|---|---|---|---|
| 2026-11-23 09:32 | 120.6 € | completed | paid | real |
| 2026-11-19 22:08 | 134 € | pending | unpaid | real |
| 2026-11-19 21:49 | 134 € | pending | unpaid | real |
| 2026-11-19 21:43 | 69 € | pending | unpaid | real |
| 2026-11-19 20:42 | 102 € | pending | unpaid | real |
| 2026-11-19 16:10 | 69 € | pending | unpaid | real |
| 2026-11-14 22:03 | 72 € | completed | paid | real |
| 2026-11-12 19:43 | 232.2 € | completed | paid | real |
| 2026-11-12 18:31 | 120.6 € | completed | paid | real |
| 2026-11-12 03:04 | 120.6 € | completed | paid | real |
| 2026-11-12 03:01 | 134 € | completed | paid | real |
| 2026-11-02 14:46 | 151.2 € | completed | paid | real |
| 2026-11-01 21:03 | 159 € | cancelled | unpaid | real |
| 2026-09-29 08:49 | 58 € | completed | paid | real |
| 2026-09-27 00:37 | 134 € | completed | paid | real |
| 2026-09-23 15:51 | 133.2 € | pending | unpaid | real |
| 2026-09-20 07:44 | 72 € | completed | paid | prueba |
| 2026-09-20 07:40 | 773 € | completed | paid | prueba |
| 2026-09-20 07:32 | 72 € | pending | unpaid | real |
| 2026-09-03 20:38 | 145.2 € | completed | paid | real |

Total en la cuenta: 53 pedidos (incluidos los de prueba). Detalle de transacciones en `transacciones_resumen.json`.
