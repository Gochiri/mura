# Anexo 2 · Registro técnico de GHL, resumido (25/11/2026)

Resumen sección a sección de `docs/2026-08-07-implementacion-ghl.md`, hecho leyendo el documento entero. Manda siempre el documento original; esto es un mapa para orientarse. Estado real de la subcuenta a 25/11 en `datos/ghl-inventario-20261125/README.md`.

He leído entero el archivo `/home/user/mura/docs/2026-08-07-implementacion-ghl.md`: 3.711 líneas y unos 199 KB, de la línea 1 a la 3.711 sin saltos. No he modificado nada. He dejado fuera teléfonos, correos, direcciones postales, nombres de clientas y de quien hizo los envíos de prueba, fechas de nacimiento, ids de contactos de personas y cualquier token. Las claves de sitio de Turnstile son públicas, pero también las he omitido porque no hacen falta.

**Aviso sobre la numeración del documento.** No sigue un orden lineal:
- Hay **dos §24**.
- Las §26–§29 aparecen en el orden 28, 29, 26, 27.
- La §27.4 está después de la §27.8.
- Existen §6b y §20b.
- Varias secciones citan «sección 13» para la regla de que los triggers creados por API son fantasma, pero la evidencia está en §12 y §21. La §13 trata del webhook de n8n.

El documento se corrige a sí mismo varias veces: la §33.2 corrige la §20b, la §25.1 corrige la §22, la §30.1 se corrige dentro de sí misma y la §35.1 corrige la §30.12. En esos casos manda siempre la sección posterior.

---

# 1. Índice de secciones

| § | Título | Fecha |
|---|---|---|
| Cabecera | Implementación GHL Mûra. Subcuenta `NxPF5fOicowujokEk5Hm` | 7/8 |
| 1 | Pipeline «Ventas / Pedidos»: etapas nuevas | 7/8 |
| 2 | Campos personalizados de OPORTUNIDAD (fieldKeys) | 7/8 |
| 3 | Tags creados | 7/8 |
| 4 | Workflows corregidos (04 envío, 08 devolución, 04 email enviado, 05 entregado) | 7/8 |
| 5 | Workflows nuevos | 7/8 |
| 6 | Otros cambios (SP01 publicado, PS02 duplicado borrado) | 7/8 |
| 6b | Número de pedido interno: arquitectura | 7/8 |
| 7 | Claves que reciben los webhooks de n8n | 7/8 |
| 8 | Pendientes y decisiones abiertas | 7/8 |
| 9 | Backups | 7/8 |
| 10 | Batería de pruebas de triggers | 7/8 noche |
| 11 | Limpieza de borradores | 8/8 madrugada |
| 12 | Veredicto final de triggers | 9/8 |
| 13 | Diagnóstico: n8n no recibía el webhook del 04a | 11/8 |
| 14 | Reunión del 11/8: webhook resuelto, consolidación del 04a (14.1–14.7) | 11/8 noche |
| 15 | Coreografía de tags, cerrada | 11/8 noche |
| 16 | Cabos sueltos de la reunión (16.1–16.3) | 11/8 |
| 17 | Compras repetidas: quitar y poner tags, y re-entrada | 11/8 noche |
| 18 | Los merge tags de GHL no admiten filtros | 13/8 |
| 19 | Confirmación de compra: número de pedido y productos no caben en el mismo correo | 13/8 |
| 20 | Migración de campos de pedido a OPORTUNIDAD | 13/8 |
| 20b | Merge tags rotos de las plantillas, «arreglados» (desmentido en §33.2) | 13/8 |
| 21 | Workflow «06b · Encuesta post-compra completada» | 13/8 |
| 22 | Custom Webhook: esquema resuelto, ejecución sin confirmar | 14/8 |
| 23 | Webhooks de aviso a Sara: tres bugs corregidos | 14/8 |
| 24 (1.ª) | Order id: resuelto, y decisión final por n8n | 14/8 |
| 24 (2.ª) | RESUELTO: dónde resuelven los campos personalizados de oportunidad | 14/8 |
| 25 | Sesión del 14/8 con Sonia: flujo completo probado (25.1–25.5) | 14/8 |
| 28 | Newsletter en /home (28, 28.b, 28.c) | 15/8 y 17/8 |
| 29 | Coreografía de tags: auditoría y cierre de dos huecos | 17/8 |
| 26 | Fusión del 04b dentro del 04a (26.1, 26.2) | 14/8 y 15/8 |
| 27 | Páginas de la tienda (27.1–27.3, 27.5–27.8, 27.4) | 15/8 y 17/8 |
| 30 | Documento de pendientes de Sonia (30.1–30.13) | 17/8 tarde |
| 31 | Dos agujeros destapados por una compra real (31.1–31.3) | 17/8 noche |
| 32 | La detección de entrega (32, 32.1) | 17/8 y 22/8 |
| 33 | Verificación: los enlaces de las plantillas seguían rotos (33.1–33.4) | 22/8 |
| 34 | Textos del checkout y del carrito vacío (34.1–34.5) | 22/8 |
| 35 | Dónde va de verdad el CSS de la tienda (35.1–35.5) | 22/8 noche |
| 36 | Por qué la ficha de producto enseña una sola foto (36.1–36.5) | 25/8 |
| 37 | El checkout va a /thank-you y Sara no ve qué se ha comprado (37.1–37.4) | 25/8 |
| 38 | El desglose del pedido, dentro del correo (38.1–38.3) | 27/8 |
| 39 | Los correos reales de una compra, leídos uno a uno (39.1–39.6) | 27/8 |
| 40 | El correo de compra sale del flujo y el recibo lleva plantilla propia (40.1–40.7) | 28/8 |
| 41 | El formulario de devolución no tenía entrada ni salida (41.1–41.10) | 29/8 |
| 42 | «Non-branching node has next as an array» (42.1–42.5) | sin fecha; por contexto, 29/8 o después |

---

# 2. Sección por sección

### Cabecera
- **Principio del sistema:** n8n solo pone etiquetas y rellena campos. GHL reacciona a las etiquetas: mueve oportunidades y envía correos.
- Cada pedido es una oportunidad, y el **nombre de la oportunidad es el número de pedido**. n8n busca por nombre con `?q=`.
- Origen: la llamada del 4/8 (Sonia, German, Henry) y el documento «Sistema Mura» del Drive.

### §1 Pipeline «Ventas / Pedidos»
- Etapas: 01 · Carrito Abandonado, 02 · Pedido Nuevo, 03 En Preparación, 04 Enviado, 05 Entregado, 06 Devolución o Cambio.
- **Nuevas:** 07 Devolución Verificada, 08 Incidencia Devolución, 09 Reembolso.
- Renumeradas: 10 Cerrado Ganado (antes 07) y 11 Cerrado Perdido (antes 08).
- Los ids internos de etapa no cambiaron. No se dan ids de etapa en el documento.

### §2 Campos de oportunidad
| Campo | fieldKey | Id |
|---|---|---|
| Número de pedido | `opportunity.numero_de_pedido` | `5p3I04zlvlct8CfuDNU5` |
| Peso | `opportunity.peso` | `MUSwk4X0oadHyO77RM5p` |
| Bultos | `opportunity.bultos` | `UjRE5P3lTXhkw8vGIVkz` |
| Albarán Nacex | `opportunity.albaran_nacex` | `gLWoB27TkBkWD4UbMADQ` |
| URL seguimiento | `opportunity.url_seguimiento` | `wQLTNRwInF8a8rmRqlQr` |
| URL etiqueta | `opportunity.url_etiqueta` | `ujglR1FPysKzsdrG9PC1` |
| URL etiqueta devolución | `opportunity.url_etiqueta_devolucion` | `csFW5GZwYzQo5A3GnGBA` |
| Motivo devolución (nuevo; lo rellena Sara) | `opportunity.motivo_devolucion` | `PFiAHPZEfOU8uYPk4AYH` |

Se borró el campo de prueba `opportunity.prueba_opp_field`.

### §3 Tags creados
- `compra-1` y `compra-2`.
- `etiqueta-por-imprimir`: la pone n8n junto a `email-04-listo`.

### §4 Workflows corregidos
- **04 Solicitud de envío realizada (`c93013cf`)**. Trigger: etapa → 04 Enviado.
  - Guard nuevo: espera 3 minutos y comprueba que siga en 04 y que peso y bultos tengan valor. Si falta algo, no hay webhook, avisa por notificación interna a Sara y devuelve la oportunidad a 03.
  - El webhook `pedido-enviado-nacex` saca peso y bultos de la **oportunidad**. Antes los sacaba del contacto y se pisaban entre pedidos. Se añade `numero_pedido`.
  - El watchdog pasa de 24 h a **48 h**. El webhook `watchdog-entrega` envía el albarán de la oportunidad y `numero_pedido`.
  - Este workflow acabó sustituido por la copia `6d73077b…` (§14.2) y se borró el 15/8.
- **08 Solicitud devolución (`6b3064f7`, luego 08a)**. Trigger: envío del Formulario Devolución v2 (`HBK7tGDlcIFN0vaXoksg`).
  - Bug: leía campos de contacto que el formulario no escribe.
  - Ahora lee `contact.n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin`, que se envía como `opportunityId` y como `numero_pedido`, y `contact.motivo_de_devolucin__cambio`.
- **04 Email pedido enviado (`873e4590`, «04b»)**. Trigger: tag `email-04-listo`. Tenía la plantilla por defecto de una barbería y pasó a «04 · envío».
  - **Retirado el 14/8 y borrado el 15/8** (backup `datos/backups/wf_old04b_pre_delete_20260815.json`).
  - Motivo: disparaba por tag y mandaba el seguimiento de otro pedido. **No reactivarlo.**
- **05 · Email pedido entregado (`8e6ccd5a`)**. Pasó de trigger por etapa a trigger por tag `pedido-entregado`: mueve a 05 y envía «05 · entrega». En §31 volvió a trigger por etapa.

### §5 Workflows nuevos
| Workflow | Trigger | Qué hace |
|---|---|---|
| 03 · Email pedido en preparación (`cc2c8b77`) | etapa → 03 | correo «03 · preparación» |
| 08 · Email etiqueta devolución (`466bbb08`, luego 08b) | tag `email-08-listo` | correo «08 · solicitud devolución» |
| 16 · Devolución no encontrada (`8b5fe6af`, luego 08c) | tag `devolucion-no-encontrada` | correo «16 · datos no coinciden» |
| 02 · Etiquetado compra 1-2 (`b5feddb8`) | tag `pedido-confirmado` | sin tags → `compra-1`; con `compra-1` → `compra-2` y correo «11 · segunda compra»; con `compra-2` → nada |
| 06-12 · Journey post-entrega (`cb923da8`) | tag `pedido-entregado` | +3 d correo 06, +10 d correo 07, +90 d correo 12 |

**Contradicción sin aclarar:** la §33.3 dice que el correo 16 «no está montado en ningún workflow», pero aquí el 08c lo envía.

### §6 y §6b Número de pedido
- **SP01 · Nueva Compra Confirmada** publicado, con triggers `order_submission` y `payment_received`. El documento no da el id de SP01.
- Nombre de la oportunidad: `M{{custom_values.contador_pedidos}}`.
- Se borró un duplicado vacío de «PS02 · Fidelización VIP / Recurrencia».
- **Problema:** el `orderId` de GHL tiene 24 caracteres y la referencia de Nacex admite como máximo 20.
- **Solución nativa:**
  - Math Operation (configurada en la interfaz) suma 1 al custom value «Contador Pedidos» (`9EaNa5MGCw1wHGBv4cAJ`).
  - Create Opportunity con nombre `M…`. El primer pedido real es M100001, y quedan 6 dígitos hasta 999999.
  - Patrón obligatorio para actualizar: **Create → Wait 20 s → Find Opportunity → Update (dentro de la rama Found)**.
  - Después: correo, SMS, espera de 10 min, notificación a Sara, mover a 03 y tag `pedido-confirmado`.
- Se descartó la vía n8n `nuevo-pedido`.
- Contador reseteado a 100000 tras las pruebas.
- **Pendiente:** notificación en la rama «Opportunity Not Found», hoy vacía. Aviso cuando el contador llegue a 999999, sin montar.
- **Hechos verificados:**
  - Los custom values resuelven en el nombre de la oportunidad.
  - `{{right_now.date}}` y `{{right_now.time}}` salen con ceros; year, month y el resto, sin ceros.
  - La API pública escribe campos personalizados de oportunidad en el UPDATE, pero no en el Create de un workflow.

### §7 Claves de los webhooks a n8n
- **`pedido-enviado-nacex`:** contactId, nombre, dirección, cp, población, país, teléfono, email, peso, bultos, `numero_pedido={{opportunity.name}}`. Desde §13 también `opportunityId`.
- **`watchdog-entrega`:** opportunityId, albarán, numero_pedido.
- **`solicitud-devolucion`:** opportunityId (el número que teclea la clienta), numero_pedido, contactId, email, nombre, dirección, cp, población, teléfono, motivo.
- `nuevo-pedido` está descartado.

### §8 Pendientes del 7/8
Casi todos se resolvieron más adelante:
1. Merge tags de contacto en los correos.
2. Rellenar `numero_de_pedido` desde la interfaz (resuelto en §6b).
3. Guard con `!= ""`; luego se pasó a `has_value` (§26.1).
4. **Multi-pedido:** mover la oportunidad por tag filtra por pipeline y no por pedido, así que con dos pedidos abiertos podría moverse el equivocado. **Abierto.**
5. Campo de motivo duplicado (resuelto en §41.1: el formulario viejo ya no existe).
6. Reembolso de Stripe, sin decidir.
7. La «taquilla» de Nacex no está activa; v1 solo hace recogida a domicilio.
8. Revisión visual del 04a y del 02.
9. Compras repetidas (resuelto en §17). Queda **dejar un solo trigger en SP01**. El documento no vuelve a confirmar si se hizo.
10. Renombrado de workflows como `01`…`08c`, y SP02/SP04 marcados como `ZZ (obsoleto)`.

### §9 Backups
- `datos/backups/pipeline_ventas_backup.json`
- `wf_envio_pre_surgery.json`
- `wf/*.json` (los 18 workflows originales)

### §10 Pruebas del 7/8
- SP01 funcionó completo con una compra de prueba en Stripe (M100002).
- 08b y 08c dispararon por tag.
- La lógica del 02 funciona.
- Checkout arreglado: moneda EUR, envío a España a 4,95 € (provisional), funnel en modo test de pago.
- Desde las 23:10 ningún trigger disparaba. Era la cola de eventos de GHL degradada (§12).
- Lista de datos de prueba por limpiar. El documento no confirma que se limpiaran.

### §11 Limpieza de borradores
- Borrados: ZZ SP02, ZZ SP04, AP01 Gestión Operativa y SP03 Encuesta Post-Entrega.
- Quedan 10 publicados y 8 borradores: LS01–03, AP01 Control de Stock, AP02 Lanzamiento Cápsula, PS01 Reseña, PS02 VIP y SP05 Reactivación.
- **Abierto:** si se activa PS01, hay que decidir con Sara quién pide la reseña, para no pedirla dos veces con el Journey.

### §12 Veredicto de triggers
- 02, 05, 08b y 08c funcionan. El Journey, «probable».
- El 03 (por etapa) **no dispara con movimientos hechos por la API pública**. Faltaba probarlo con un movimiento de workflow o un arrastre en la interfaz; más tarde funcionó en las compras reales (§24, §31).
- El correo del 05 no aparecía en la conversación. No consta que se investigara.
- Pendiente: `allowMultiple` (hecho en §17).

### §13 Webhook del 04a que no llegaba a n8n
- El lado de GHL estaba bien. URL: `/webhook/6b762db0-1c38-4dc1-b1b1-409b400cd686`.
- **Causa:** el nodo Webhook de n8n no estaba conectado a nada y el flujo estaba inactivo, así que `/webhook/` devolvía 404.
- Bug propio: faltaba `opportunityId`; se añadió.
- Ids de campos de contacto que usa n8n: `py7TEhnvdIt7XjDtWjg5` (url seguimiento), `CAN1vUcUenmvw2J0iQIJ` (albarán), `uFzLRUfvECe9q7Z47kwT` (url etiqueta).
- Por revisar:
  - El nodo que escribe en el contacto usa `{id, value}` y el de la oportunidad `{id, field_value}`.
  - La referencia de Nacex es igual a `numero_pedido`.
  - **La dirección de recogida del código de n8n no coincide con el domicilio fiscal de los textos legales.** Hay que confirmarla con Sara. No consta resolución.

### §14 Reunión del 11/8
- **14.1 Por qué no llegaba el webhook:**
  - El nodo estaba desconectado.
  - Un PUT por API dejó el 04a en borrador sin avisar, porque todo PUT tiene que volver a incluir `status`.
  - El equipo creó en la llamada «Copy - 04a», y esa copia es la que funcionó.
- **14.2 El canónico** pasa a ser `6d73077b-c9ea-4c8d-b1d5-f3167ef2cc4f`, «04a · Envio - webhook Nacex + watchdog»:
  - Espera de 3 min.
  - Watchdog de 48 h → `/webhook/watchdog-entrega`.
  - Rama «faltan datos»: notificación, vuelta a 03 y aviso por Telegram a `/webhook/db8ae6be-6621-4e34-9400-391e5d8c494c`, con la clave `mensaje`.
  - El original `c93013cf` se borró el 15/8.
  - Tags `debug-01-entro-wf` y `debug-02-webhook-ok` borrados.
  - Backups: `copy04a_pre_consolidacion_20260811.json`, `orig04a_…`, `wf05_pre_cambios_20260811.json`.
- **14.3 El 05 (v9)** quita el tag `pedido-enviado` y saca al contacto del 04a con `remove_from_workflow`, que cancela el watchdog. Se montó sin ejemplo previo. **Verificar:** no consta verificación explícita. En §33.1 el 05 ya no muestra esos pasos; solo tiene tag, correo y webhook.
- **14.4 Newsletter:** el borrador `LS02 · Opt-in Newsletter Web` (`f62a24a8`) tenía doble opt-in, el tag `newsletter-suscrita` y el formulario `Opt-in Newsletter` (`fmuHvvOjkGBAkPU2LTZN`). Se le añadió un webhook a `n8n…/webhook/newsletter-mura` (backup `ls02_pre_webhook_20260811.json`). Quedó superado por §28 y §30.
- **14.5 Formularios (solo en la interfaz):**
  - Traducir la Devolución v2.
  - Experiencia MÛRA como Survey (superado por §30.3).
  - Página de devoluciones con el formulario (superado por §41).
- **14.6 «Ver mi pedido»:** la API de Orders no expone ninguna URL para la clienta. Propuestas: A, recibos nativos; B, `order-confirmation?order_id=`.
- **14.7 Lista de tareas del 12/8:**
  - Nacex a producción.
  - Pruebas de envío, entrega y devolución, y compra de prueba.
  - Integración de Instagram con el usuario de Sara.
  - Dirección de recogida.
  - Newsletter.
  - Política de cookies.
  - Modo de pago Live con el Stripe de Sara.
  - Limpieza de datos de prueba.

### §15 Coreografía de tags
- Compra: SP01 pone `+pedido-confirmado`.
- Etiquetado: 02 pone `compra-1` o `compra-2`.
- Preparación: 03 pone `+pedido-en-preparacion`. Tag nuevo, id `tADzPMfituIfESK2oPK4`.
- Envío: el 04b quitaba `pedido-en-preparacion` y ponía `pedido-enviado`; ahora lo hace el 04a.
- Entrega: el 05 quita `pedido-enviado` y saca del 04a.
- Backups: `wf03_pre_tags_20260811.json`, `wf04b_pre_tags_20260811.json`.
- Las fases «experiencia» y «feedback» del Journey se dejaron para después; ver §29.

### §16 Cabos sueltos
- **16.1** El custom value `url coleccion` (`FBLfpmf7IrgXfx0qMHPR`) ya existía, junto con `url home`, `url contacto`, `url devoluciones` y `url politica privacidad`. Su valor `/coleccion` era un 404; se corrigió en §41.4.
- **16.2** Correo 09A de reembolso:
  - No hay merge tag de reembolso ni trigger de «pago reembolsado».
  - Se crearon `contact.importe_reembolsado` (`cgEpYFfk2E5alcTA4vLn`) y `contact.fecha_reembolso` (`izCNoYCTgZjfYUhl9pDQ`), que en §20 se movieron a oportunidad. El documento no da los ids nuevos.
  - Flujo propuesto: n8n escucha `charge.refunded`. **Sin montar; es de Sonia.**
- **16.3**
  - El correo 15 (reposición) no se usa por ahora.
  - Sonia debe buscar por **Opportunity Name** y no por id.
  - Sara puede añadir «Contact Name» en Manage Fields de su vista.
  - El código postal de prueba se corrigió.

### §17 Compras repetidas
Había dos bloqueos encadenados:
- Los tags se quedaban pegados.
- `allowMultiple` estaba en false en todo menos SP01.

Lo aplicado:
- Re-entrada (`allowMultiple` y `allowMultipleOpportunity` a true) en 02, 03, 04a, 04b, 05, 08a, 08b y 08c.
- `pedido-confirmado`: SP01 lo quita como primer paso y lo pone al final.
- `pedido-entregado`: el 05 lo quita al cabo de 1 día.
- Tags de señal que consume quien los escucha: `email-04-listo` (04b, luego 04a), `email-08-listo` (08b), `devolucion-no-encontrada` (08c).
- **El Journey se queda sin re-entrada a propósito**, para no mandar spam a las recurrentes.
- Backups: `sp01_pre_removeadd_20260811.json` y `wf{02,03,04a,04b,05,08a,08b,08c}_pre_reentry_20260811.json`.
- **Pendiente:** probar dos compras seguidas del mismo contacto. El documento no lo da por probado.
- Observación: la tabla de §33.1 ya no muestra en el 05 el paso «espera 1 día y quita `pedido-entregado`». Lo quita el Journey (paso 2), y en §31.2 se menciona que también lo quita el 08b. Las versiones cambiaron en la interfaz; la lógica final no queda descrita de forma completa.

### §18 Los merge tags no admiten filtros
- GHL usa **Handlebars**: `{{x | default:…}}` rompe el parser.
- Asuntos corregidos del 02 al 05.
- El parser también lee los comentarios HTML.
- «Ver mi pedido» apuntaba a `contact.url_pedido` y luego a `order.order_url`, que no existen; se dejó en `url_home` de forma provisional.
- En el 02, el número de pedido pasó a `{{opportunity.name}}`.

### §19 Confirmación de compra
- Sonda con 8 merge tags de pedido (`order.*`, `payment.*`, `contact.order_id`): **los 8 salieron vacíos**. El contexto del workflow no ve la orden.
- `contact.order_id` no lo rellena nadie.
- Cronología: el correo de la tienda sale 4 s antes de que exista la oportunidad.
- Opciones: 1, dos correos; 2, n8n; 3, tienda sin número.
- El correo de SP01 queda desactivado (`advanceCanvasMeta.isDisabled: true`). Se resolvió en §24, §25 y §40.

### §20 Migración a oportunidad
- Solo había 4 campos de contacto vivos: `url_seguimiento`, `url_etiqueta`, `albaran_nacex` y `url_etiqueta_devolucion`.
- Creados en oportunidad y borrados de contacto: `order_id`, `sku_comprado`, `categora_prenda` (15 opciones), `estado_pedido` (5), `talla_pedida` (6), `color_variante` (25), `importe_total`, `fecha_pedido`, `n_tracking`, `transportista` (2) y `num_pedido_devolucion`. Más `importe_reembolsado` y `fecha_reembolso`.
- Backups: `campos_contacto_migrados_20260813.json` y `campos_oportunidad_nuevos_20260813.json`.
- Siguen en contacto: `talla_habitual`, `calificacin_clienta`, `n_total_compras`, `canal_origen`, el comentario, las direcciones de facturación y los dos campos del formulario de devolución.
- **Pendiente:** los 4 campos vivos están duplicados en contacto y oportunidad. Peso y bultos de contacto son sobras.

### §20b Merge tags «arreglados»
- Tabla de cambios en 09a, 10, 06, 07, 18, 15 y 09b. Custom values nuevos:
  - `url feedback` (`2lydcv75rCemIdPUmcf7`), con la URL del widget de Encuesta Post-Compra `fvVToLx0e9pEjSRD6zq7`.
  - `url resena google` (`jgROgNVr5KtNcrMZ4dio`), vacío.
  - `url pieza` (`tlnOIT8yni1Ox7qeSZLo`), vacío.
- **La §33.2 desmiente que estos cambios se aplicaran.** El arreglo real es el de §33.4.

### §21 06b · Encuesta post-compra completada
- Id `94779fd6-15bb-4387-9af0-244409fcd671`.
- Pasos: tag `encuesta-completada` y notificación interna.
- El trigger se tuvo que crear en la interfaz porque los creados por API son fantasma.

### §22 Custom Webhook
- Esquema canónico de `custom_webhook`:
  - `authorization` es obligatorio.
  - `body` es un objeto.
  - Los parámetros van en `parameters`.
  - `saveResponse: true` expone la respuesta.
  - El validador del PUT no lo comprueba.
- Array formatter (`array_functions`): «No options available» con triggers de orden.
- Un workflow creado por API sin trigger no se ejecuta nunca.
- Es **acción premium**, con cargo por ejecución.
- En el 06b había un webhook a `/webhook-test/` (corregido en §23).

### §23 Avisos a Sara
- Corregidos: la URL de test del 06b, el prefijo `"value: "` en 06b y SP01, y SP01, que tenía en el campo URL un texto en vez de una URL. **El aviso de pedido nuevo nunca había funcionado.**
- Los tres avisos van ahora a `…/webhook/db8ae6be-6621-4e34-9400-391e5d8c494c` con la clave `mensaje`.
- Backup: `sp01_pre_fix_value_20260814.json`.
- **A confirmar con Sonia** que ese flujo está activo en producción.

### §24 (primera) Order id
- El Custom Webhook funciona al pulsar Test, pero se descartó por coste. Custom Code también es premium.
- **Contrato para n8n:**
  - `GET /payments/orders?altId=<loc>&altType=location&contactId=…&limit=1`. Sin `altId` da 422. Con `contactId` vacío da 200 con lista vacía, así que hay que cortar si `totalCount` es 0.
  - `PUT /opportunities/{id}` con `customFields:[{id:"Z5LD1nrSjYnZUGPXs3Pt", field_value}]`. Ese id es el campo Order ID de oportunidad. Se usa `field_value`, no `value`.
- **En SP01:** paso «Webhook n8n · guardar order id» → `…/webhook/b03f0adf-70f8-41b7-923a-a2a0669355e3`, con opportunityId, contactId y numero_pedido.
- Retirados los pasos de prueba; cero acciones premium.
- Backups: `sp01_pre_webhook_n8n_20260814.json` y `_v2.json`.
- `opportunity.order_array` se borró el 15/8.

### §24 (segunda) Dónde resuelven los campos de oportunidad
- Los campos personalizados de oportunidad resuelven en un correo **cuando el trigger es por cambio de etapa**. Con trigger de orden no resuelven; `name`, que es nativo, sí.
- **Si un merge tag no resuelve dentro de un `href`, GHL borra el enlace entero** (`href=""`).
- El número de pedido llega a la clienta en el correo 03.
- Regla: cualquier correo con campos de oportunidad tiene que dispararse por etapa.
- Matizado en §39.3: resuelven en correos de workflow siempre que el campo ya esté escrito. No resuelven en los correos de la tienda.

### §25 Sesión con Sonia del 14/8
- Ciclo entero probado de punta a punta.
- **25.2 Reparto de correos:**
  - Confirmación inmediata: la tienda.
  - Recibo: la tienda.
  - 03: workflow 03, con el número de pedido.
  - 04: 04a.
  - 08: 08b.
  - El 02 de SP01 quedó en pausa (reencendido en §40).
- **25.3 Devolución:** el botón de etiqueta pasa a `opportunity.*`, y se añade Find + Update para copiar el motivo a la oportunidad.
- **25.4 Riesgo:** los correos disparados por tag con campos de oportunidad.
- **25.5 Pendientes:**
  - Telegram con la etiqueta.
  - Tags `experiencia`, `feedback`, `inactivo`, `devolucion-activa`, `dev-ok` y `dev-x`.
  - Formulario de newsletter, encuesta, baja de newsletter y páginas.
  - Iterar el Journey.
  - De Sara: Google My Business, redes, peso y bultos, stock.
  - De Sonia: migrar sus campos y Stripe (09a y 10).

### §28 Newsletter
- Formulario propio en la home: `tienda/newsletter-home.html`.
- El intento con `backend.leadconnectorhq.com/forms/submit` fracasó: el cumpleaños va con el id de campo `FGlE7RDztTinTetJGgWI`, y Turnstile daba 429. Inviable desde fuera.
- Se pasó a un **Inbound Webhook** de workflow, `services.leadconnectorhq.com/hooks/{loc}/webhook-trigger/{uuid}`, que es **premium**. Workflow «LS02a · Alta newsletter web».
- **28.b** Doble opt-in con el trigger link `TL-LS02-CONFIRMAR-OPTIN` (`K2PitLvfhgpKPvX6GeF4`):
  - El enlace estaba roto: `{{unique_confirmation_link}}` es inventado y daba `href="[object Object]"`.
  - `redirectTo` pasa a `/suscripcion-confirmada`. El botón usa `{{trigger_link.K2PitLvfhgpKPvX6GeF4}}`.
- **28.c** Verificado:
  - Tags `nl` y `newsletter-suscrita`.
  - Oportunidad en el pipeline «Leads / Comunidad» (`Y47eLa4dAIZTKLu2UpuX`), etapa 03 Suscrita Newsletter. Etapas del pipeline: 01 Lead Nuevo, 02 Interesada, 03 Suscrita Newsletter, 04 Primera Compradora, 05 Recurrente, 06 VIP.
  - Teléfono mapeado en formato E.164.
- **Ambigüedad:** el documento llama unas veces LS02a y otras LS02 al workflow que tiene el Inbound Webhook. En §30.9 se toca «LS02 v11→v13» y se le quita `Create contacto`. Parece que acabó siendo un solo workflow (LS02) con trigger por tag `nl`, pero no se dice con claridad.

### §29 Auditoría de tags
- El 02 (v9) quita `inactivo` al empezar (backup `wf02_pre_remove_inactivo_20260817.json`).
- Nuevo **08d · Devolución cerrada - limpiar tag** (`2197b479`): trigger de etapa → 09 Reembolso, quita `devolucion-activa`, `allowMultiple` a true (v4). Verificado.
- `dev-ok` y `dev-x`: pendientes de decisión.
- `reviewera`, `compradora-activa`, `recurrente` y `vip` van con PS01, PS02 y AP02.

### §26 Fusión del 04b en el 04a
- El 04b mandaba el seguimiento de otro pedido.
- Estructura nueva del 04a: webhook a Nacex → espera de 1 min → Telegram con la etiqueta → quitar el tag de preparación → ¿`opportunity.url_seguimiento` tiene valor (`has_value`)?
  - SÍ: correo 04, `+pedido-enviado`, `−email-04-listo`, espera de 48 h, ¿sigue en 04?, webhook watchdog.
  - NO: Telegram «Nacex no ha devuelto el seguimiento…».
- Borrados el 15/8 `OLD 04a`, `OLD 04b` y `ZZ TEST custom webhook`. Backups: `wf_old04a|old04b|zztest_pre_delete_20260815.json`, `wf04a_pre_fusion.json`, `wf04b_pre_fusion.json`.
- La plantilla `correos/04-envio.html` pasa a `opportunity.url_seguimiento`.
- **26.1** La fusión había dejado el correo detrás de la espera de 48 h. Corregido en la v18 (backup `wf04a_pre_orden_email_20260815.json`).
- **26.2** Prueba con M100014: el correo 04 llevó el albarán correcto. Confirma que, con trigger de etapa, los campos de oportunidad resuelven.

### §27 Páginas de la tienda
- **27.1** `tienda/gracias-compra.html`, en la página «Thank you!» (`6DEiCsQRzJ6NsbhkP43n`). Va sin número de pedido, a propósito.
- **27.2** CSS del carrito y del checkout en `tienda/codigo-global-tienda.js` (Tracking Code), con guardia de rutas. Clases reales `.hl-*`. **Nunca usar `.cstore-cart-J14MT1D5-f` ni `.cstore-checkout-sTf_Fd0JV5`.** Bug de las migas resuelto con `:not(.checkout-breadcrumb-item)`.
- **27.3**
  - «Ver carrito» iba a `/checkout`.
  - Los textos del elemento estaban en inglés.
  - `termsAndConditions` desactivado y apuntando a example.com.
  - `shipToCountries: "all"`: se aceptan pedidos de todo el mundo.
  - `defaultLocation: "none"`.
- **27.5** Se elige `/carrito` (`qsUEwHJLz2xiSulCN5jD`). `/cart` (`2FoBJpJqCmc0z0Y4xZEo`) se redirige con `location.replace`.
- **27.6** `/carrito` es código propio (`custom-code-DN8OVgnA5P`) que lee `localStorage['cart_details_rlc7iAyGF4U1nfwAJOJQ']`, con importes en euros. Mejoras: selector de cantidad, `fmt()` para la coma flotante, precio por unidad y media query a 440 px. **El stock no se valida en `/carrito`.**
- **27.7** El CSS pasa al global, dividido en 5 partes. Desaparece `.mura-nav-inject`. Lista de páginas a las que hay que vaciar su `<style>`: `/prendas`, `/producto`, `/colecciones`, `/novedades`, `/home`, `/mura`, `/contacto`, `/devoluciones` y `/gracias`. **No borrar el `<style>` de una página antes de pegar el global.**
- **27.8** Recorrido verificado. «Ver carrito» corregido en `tienda/producto.html`. Siguen abiertos las condiciones de contratación, los países de envío y vaciar los `<style>`.
- **27.4** Decisión del 17/8: la página de gracias de compra es `/gracias`. Realizado en §39.6.

### §30 Pendientes de Sonia del 17/8
- **30.1** El newsletter pasa por **n8n**, porque el Inbound Webhook es premium (corrección explícita dentro de la propia sección).
  - Flujo: n8n busca por email; si ya tiene `nl` responde `ya-suscrita`; si no, hace upsert, quita `nl` y lo vuelve a poner.
  - En LS02 hay que quitar `Create/Update Contact` y `Add Tag nl`, y cambiar el trigger a Contact Tag `nl`.
  - Archivos: `tienda/newsletter-home.html` y `tienda/n8n-newsletter-workflow.json`.
  - Riesgo: CORS (Allowed Origins en el nodo de n8n).
- **30.2** Home a dos columnas (`.mura-nl-2col`, `.mura-nl-ventajas`).
- **30.3** `tienda/experiencia.html`: 26 preguntas en 7 pasos, con lógica condicional. `?cid=` en la URL. Botón de los correos 06 y 07: `{{custom_values.url_feedback}}?cid={{contact.id}}`.
- **30.4** No se crean 30 campos. Solo el NPS y el tag. `tienda/n8n-experiencia-workflow.json`. El 06b pasa a trigger por tag `encuesta-completada`.
- **30.5** La política de cookies existía en el Drive de Sonia y nunca se publicó; `/politica-cookies` era un enlace roto. Hay que auditar las cookies, y el banner es obligatorio con el píxel de Meta.
- **30.6** Información para Sonia (cosas que daba por rotas y funcionan).
- **30.7** Bloqueos de entonces (refresh token, URLs de n8n, NPS, cookies, WhatsApp, tallas, Stripe).
- **30.8** Buscador de la rejilla en `/prendas`, `/colecciones` y `/novedades`. Clase `.mura-oculta-busq`, observer con tope de 8 s.
- **30.9** Cirugía de workflows con el API interno (ruta `/workflow/{locationId}/{workflowId}`):
  - Campo `contact.nps` (`BpEcTG8IYDXRUQNrM3h0`).
  - **LS02 v11→v13:** fuera Create y Add Tag; `allowMultiple` a true; transiciones del wait corregidas. Backup `ls02_pre_n8n_20260817.json`.
  - **06-12 v13→v14:** `if_else` el día 90 sobre `compra-2`. Si la tiene, solo quita `feedback`. Si no, pone `inactivo`, quita `feedback` y manda el correo 12. Esto va más allá de lo que pidió Sonia y hay que contárselo. Backup `wf0612_pre_inactivo_20260817.json`.
  - **06b v11→v12:** fuera el paso que ponía el tag. Backup `wf06b_pre_tag_n8n_20260817.json`.
- **30.10** Triggers creados por German en la interfaz y verificados:
  - LS02: `contact_tag nl`.
  - 06b: `form_submission fvVToLx0e9pEjSRD6zq7` (el viejo, se mantiene) y `contact_tag encuesta-completada`.
  - **Borrar el `form_submission` cuando `/experiencia` esté publicada.**
- **30.11** El flujo `experiencia-mura` de Sonia recibe desde GHL. La página nueva iba a usar su propio path, `mura-experiencia`. Trampa: con el trigger por tag, el webhook del 06b manda filas vacías a la hoja de Sonia. **Hay que retirar a la vez el trigger viejo y ese webhook, y avisar a Sonia.**
  - **Contradicción:** la §41.6 dice que `tienda/experiencia.html` hace POST a `/webhook/experiencia-mura`. Habría que comprobarlo en el archivo.
- **30.12** Separación HEAD/BODY con `MURA_PARTE`, `build.sh` y `estilo()`. **Hay que pegar los dos.**
- **30.13** Se retiró de la caja Custom CSS de `/checkout` un skin viejo duplicado. Se pasaron al global reglas con `!important` sobre `.hl-cart-summary-container`, `.hl-divider` y compañía. Queda cambiar el texto del carrito vacío («plantas rodadoras»).

### §31 Compra real del 17/8 (M100018)
- **31.1** El correo 03 salía dos veces porque la rama «sin peso/bultos» del 04a devuelve a 03. Se añadió un `if_else` en el 03: si ya tiene `pedido-en-preparacion`, no hace nada; si no, correo 03, `+pedido-en-preparacion` y `−pedido-confirmado`. v14 (backup `wf03_pre_duplicado_20260817.json`).
- **31.2** **Ningún paso ponía `pedido-entregado`.** El 05 lo pone ahora como primer paso, v16 (backup `wf05_pre_duplicado_20260817.json`). Su trigger pasó a etapa → 05 Entregado.
- **31.3** Verificado por API:
  - 05: `pipeline_stage_updated` → 05.
  - 03: etapa → 03.
  - 06-12: tag `pedido-entregado`.
  - La interfaz subió versiones: 05 a v18 y 03 a v15. La rama del 03 se renombró a «Branch».
  - **Pendiente:** prueba en vivo de mover a 05.

### §32 Detección de entrega
- El watchdog del 04a ya existía: a las 48 h, si sigue en 04, POST a `/webhook/watchdog-entrega` con opportunityId, albarán y numero_pedido.
- `/opportunities/search?q=` no busca en campos personalizados.
- **32.1 (22/8, Sonia):** no hay aviso push de Nacex. n8n pregunta a Nacex: si consta entregado, PUT a la etapa 05; si no, aviso a Sara, que mueve la tarjeta a mano.
- Mejora sugerida: que ese aviso lleve número de pedido, enlace de seguimiento y el estado literal de Nacex.
- **Stripe sigue pendiente; es de Sonia.**

### §33 Verificación del 22/8
- **33.1** Estado de los workflows:
  - 05 (v19, `allowMultiple` true): pone `pedido-entregado`, correo 05, webhook n8n `/avisos-sara`.
  - 06b (v13): ver §30.10.
  - 06-12 (v14): espera 3 d → correo 06 → quita `pedido-entregado` → pone `experiencia` → espera 7 d → correo 07 → quita `experiencia` → pone `feedback` → espera 80 d → `if_else`.
- **33.2** Las plantillas no estaban arregladas. Señales: `lastUpdated`, el render `previewUrl` y que no existen esos campos de contacto (hay 23).
- **33.4 Arreglo por API:**
  - Leer: `previewUrl` de `GET /emails/builder?locationId=…&parentId=6a6aa119fee4921a97537ba5` (carpeta *Correos*).
  - Escribir: `POST /emails/builder/data` con `editorType:"html"` obligatorio.
  - Borrar: `DELETE /emails/builder/{loc}/{id}`.
  - Script `datos/fix_tpl.py`.
  - Nueve plantillas cambiadas: 06, 07, 18, 09A, 10, 15, 16, 03 y 08.
  - **Cada botón tiene dos `href`:** el `<a>` y el `<v:roundrect>` de Outlook.
  - El 07 va al mismo formulario que el 06 a propósito; el 18 va a Google.
  - Backups: `datos/backups/plantillas_20260822/` y `…_despues/`.

### §34 Textos del checkout
- Lectura: `GET /funnels/page/{pageId}` con `token-id` (el PIT da 401) más `pageDataUrl` en Firebase.
- Cart: 6 textos en inglés. Checkout: 42 textos, con restos en inglés y en español de América.
- **No hay ruta de escritura para páginas** («Cannot POST»).
- La traducción pasa al HEAD (sección 9 del global): un observer que solo mira nodos insertados, con placeholders y coincidencia por prefijo. Verificado: el primer frame ya sale traducido.
- Es mejor poner los textos en los ajustes del elemento; la lista está al final del global.

### §35 CSS en la caja de la página
- **GHL no sirve el Tracking Code del HEAD dentro del `<head>`**: lo sube por JavaScript después. La verificación del 17/8 estaba mal hecha.
- Nuevo `tienda/css-paginas-tienda.css`, que genera `build.sh` ejecutando el global. Va en la caja Custom CSS de `/checkout`, `/products-list`, `/product-details` y `/thank-you`.
- **Se coló en el editor:** se acotó todo a `.hl_page-preview--content` con `acotar()`.
- Pendiente de confirmar en vivo que ya no hay parpadeo.

### §36 La ficha muestra una sola foto
- El Worker `mura-productos` (en workers.dev) construía las imágenes desde el **listado**, que no trae `medias`.
- Arreglo: con `?id=` se pide el detalle más los precios (2 subpeticiones). Pedir el detalle de las 36 piezas haría 73 subpeticiones, por encima del tope de 50 del plan gratuito.
- Archivos `tienda/worker-productos.js` y `tienda/producto.html`.
- La foto destacada va primera y un `Set` quita su duplicado.
- **36.4** Desplegable «Talla y ajuste» con enlace de WhatsApp (número omitido).
- **Abierto:** desapareció la frase «Los artículos adquiridos con descuento no admiten reembolso». **Hay que confirmar** si fue a propósito.

### §37 Thank-you y avisos a Sara
- **37.1** No hay ajuste que cambie la redirección del checkout (resuelto con redirección en §39.6).
- **37.2** Ningún aviso dice qué se ha comprado. La notificación de la tienda (`storeOrderNotification.enabled: true`) usa nuestra «02 · confirmación» (`6a6aa2e6…`) y no la `Default - Order Template` (`6a7dff32…`).
- **37.3** Los artículos están en `GET /payments/orders/{orderId}`, en `items[]`. Telegram con desglose: cambio en n8n.
- **37.4** SP01 usa una copia huérfana de plantilla, `6a7dfb827717066f54ba6ff6`.

### §38 Desglose en el correo
- Nada de mandar al portal de la tienda: sale en inglés, con OTP en inglés, y no se puede traducir; las rutas de su configuración dan 404.
- Campo `contact.resumen_pedido` (`CHLDDgPFzUyQUsMkeNwV`), borrado después en §39.
- Plantillas 02 y 03: fuera el botón, con sus dos `href`, y dentro un bloque «TU SELECCIÓN» con `white-space:pre-line`. Backup `plantillas_20260827/`.
- n8n: `tienda/n8n-aviso-pedido-nodos.json`.
- **38.2** No se puede desactivar la notificación de la tienda por API: `POST /store/store-setting` exige que `shippingOrigin.state` sea un estado de EE. UU. y la cuenta tiene «Huelva». **Se hace en la interfaz.**
- **38.3** Carrera de tiempos entre n8n y el correo.

### §39 Correos reales de la compra del 27/8
- Lectura del cuerpo enviado: `GET /conversations/search`, `/conversations/{id}/messages` y `/conversations/messages/{id}`. La ruta `…/messages/email/{id}` da 400.
- La plantilla 02 de la tienda salió con el enlace vacío, porque la oportunidad nace después. La 03 del workflow salió con el enlace resuelto. **Los campos de oportunidad resuelven en correos de workflow.**
- Campo `opportunity.resumen_pedido` (`qLuRjgyMjv1rw7dRCzgA`).
- **39.4** El correo de SP01 no se envió: estaba desactivado y con plantilla huérfana (§40). Los dos correos duplicados eran los dos de la tienda.
- **39.5** `opportunity.imagen_pedido` (`iD7d3mDjPgprfh4cqvhz`), borrado en §40.
- **39.6** Redirecciones `REDIRECCIONES = {'/cart':'/carrito','/thank-you':'/gracias'}` en las dos partes del global, conservando los parámetros. **El píxel de compra va en `/gracias`.**

### §40 Correo de compra desde SP01 y recibo propio
- El paso estaba desactivado; German lo encendió.
- La espera de 1 min pasa a **3 min**.
- `template_id` reapuntado de la huérfana a `6a6aa2e6e3d32f78af2869e2`. **Al guardar, GHL sobrescribió la 02 con el HTML de la copia**; se restauró.
- Desglose con foto por prenda: n8n compone el HTML en `opportunity.resumen_pedido_html` (`wq6dRJdf6jLfWwreqAR5`) y la plantilla lo inserta con triple llave `{{{…}}}` **dentro del `<td>`**. Se añadió el `</td>` que faltaba y el nodo escapa el HTML. La plantilla 03 lleva el mismo bloque.
- **40.5** Plantilla `01 · Recibo` (`6a90dd80f98ccc652507a173`), sin ningún merge field.
  - Los recibos están activos con la serie `REC26` desde 50000, numeración distinta de la de pedidos (M…).
  - El asunto lleva variables `{{receipt.*}}`.
  - **Falta la lista de variables del recibo.** El asunto dice «Aqui» sin tilde y «factura».
- **40.6 Pendiente en la interfaz:** elegir `01 · Recibo` y desactivar la notificación de pedido de la tienda.
- **40.7 Pendiente:** compra de prueba con 4 comprobaciones, y confirmar si la triple llave escapa el HTML. «Send test email» no sirve para esto.

### §41 Formulario de devolución
- Formulario Devolución v2 (`HBK7tGDlcIFN0vaXoksg`), con 3 envíos reales. La cuenta tiene 4 formularios: este, Opt-in Newsletter, Encuesta Post-Compra y «Form 1». El formulario viejo ya no existe.
- Custom value `url_formulario_devolucion` (`2S2b9lrVpft9p1adZxN5`). Primero apuntaba al widget; después a `https://www.stylebymura.com/devolucion`.
- `/devolucion` era la página de gracias de Sonia del 14/8.
- **41.3 Inventario del funnel** `Mura` (`rlc7iAyGF4U1nfwAJOJQ`, dominio `c8MNhJTKbRFUshtryQ3C`), 23 pasos:

| URL | pageId |
|---|---|
| /home | `jCl0erpmUk8Os4AGnx7M` |
| /prendas | `s5fa5bucD6xe6IHXumRf` |
| /producto | `cmPhl3N0IF3smLo8Oy8x` |
| /novedades | `RL1DrjCiiqGEgDMKfV70` |
| /colecciones | `3t6UDEyhxmRJCMgeGHLW` |
| /mura | `2j3lWbVzAl8btZDuTcny` |
| /carrito | `qsUEwHJLz2xiSulCN5jD` |
| /contacto | `IAQR8eOiAWObBSeesnH4` |
| /devoluciones | `ep1EkcwisLfPZwloPsoN` |
| /gracias | `Y1YEzfjU3JNDkTBCZiSo` |
| /products-list | `6sb8InLCPWUaexCqrDQc` |
| /product-details | `ekVq2EDJNGlMxOPFuF9t` |
| /cart | `2FoBJpJqCmc0z0Y4xZEo` |
| /checkout | `qSiwg2brakjiGqpIaCmN` |
| /thank-you | `6DEiCsQRzJ6NsbhkP43n` |
| /aviso-legal | `UhAG3g54WF3NypfU16lJ` |
| /politica-privacidad | `RNZg6K76ULbIn5o4d703` |
| /politica-cookies | `oX6ieI7lEruoTE97I9Yy` |
| /condiciones-contratacion | `L9r6MRtIIYI1vF8BK2XF` |
| /devolucion | `wZTcQ5OQx8ffWhHkdkoK` |
| /suscripcion-confirmada | `rGNlVDb91GoTnWQD9Wh8` |
| /experiencia | `UyeQYFnQv8CsRBa2D4hQ` |
| /gracias-devolucion | `fkkFrnjWY72XvbsdJomU` |

  Volcado en `datos/backups/paginas_20260829/pasos_del_funnel.json`. Ojo: `/carrito` (`qsUE…`) y `/checkout` (`qSiw…`) se confunden al leer.
- **41.4** `url_coleccion` apuntaba a `/coleccion`, un 404. Afectaba a los correos 05, 11, 14 y 17. Corregido a `/colecciones`.
- **41.5** Correo 16 (`6a75e5eb96dc697014d600f7`): el botón «Realizar solicitud» va a `url_formulario_devolucion` en los dos `href`.
- **41.6** **En este proyecto no se embeben formularios nativos de GHL.** Nuevo `tienda/devoluciones-form.html`, que reutiliza `.mura-nl-*` y añade `.mura-dev-*`. El trigger `form_submission` no es premium. Trampas: `box-sizing` y el viewport de Chromium fijo en 485 px (usar iframes para probar responsive).
- **41.7** Reparto: `/devoluciones` son las instrucciones, `/devolucion` el formulario y `/gracias-devolucion` la confirmación.
  - Nuevo tag `solicitud-devolucion` (`k1wdT7fvuRS5ilFgHDZl`).
  - El trigger del 08a **no se puede crear por API**: `isTriggerBucketMigrated: true`; el POST devuelve un id y no guarda nada.
  - El trigger viejo `form_submission` (`EQfcssMWOwqEkHqAFxZj`) se mantiene hasta que el nuevo funcione.
- **41.8** HEAD pegado y comprobado (hojas `sistema` y `bocadillo`). Trampas al contar copias. **El BODY en producción no coincide con el del repo**: habrá que volver a pegarlo cuando se toque la parte del DOM.
- **41.9** Auditoría de 20 plantillas: los enlaces están bien. Los rótulos de 09A («Ver mi devolución») y 10 («Ver detalles») pasan a «Consultar el proceso». El correo 05 no menciona las devoluciones; es decisión de Sara.
- **41.10 Pendiente en la interfaz** (documentado en `docs/para-sonia-formulario-devolucion.md`):
  1. Pegar el formulario en `/devolucion`.
  2. Completar `/gracias-devolucion`.
  3. Trigger del 08a: Contact Tag `solicitud-devolucion`.
  4. Después, desactivar el Form Submitted y archivar el formulario viejo.
  5. Publicar las dos páginas.
  - n8n: `/webhook/devolucion-web`, en `tienda/n8n-devolucion-web-nodos.json` (10 nodos). Escribe por id: `q73ODvZiPLCMqRrUkVCK` (número de pedido) y `2GQ11kHcaUggy8K4P9U4` (motivo).
  - El checkbox `terms_and_conditions` del formulario nativo traía el texto por defecto de GHL de consentimiento de SMS. No pinta nada en una devolución (cuestión de RGPD).

### §42 `next` en array
- 16 de 19 workflows tienen nodos con `next` como lista. Los 19 tienen `creationSource: builder`.
- Origen: `scratchpad/fix04a.py` escribía siempre una lista; el helper bueno es `ghl_build.chain()`.
- No rompe la ejecución; es el editor el que ahora lo valida.
- `next` vacío o con un solo elemento es un error claro. Con varios elementos en nodos que ramifican no está claro.
- El botón «How to fix» de la interfaz lo arregla. **Ojo:** tras usarlo, el nodo Webhook del 04a quedó con `next:[2]`; hay que revisarlo.
- No se escribe por API mientras alguien edita. Script preparado `datos/backups/wf_20260829/fix_next.py` (en seco por defecto). Copia de los 19 en `datos/backups/wf_20260829/`.

---

# 3. Mapa de workflows (estado final según el documento)

| Workflow | Id | Trigger | Pasos | Tags | Correos | Integraciones |
|---|---|---|---|---|---|---|
| **01 · SP01 Compra confirmada** | no figura | `order_submission` + `payment_received` (¿quitar uno? sin confirmar) | quita `pedido-confirmado` → Math +1 en el contador → Create Opp `M{{contador}}` → espera 20 s → Find → (Found) Update `numero_de_pedido` → webhook a n8n para guardar el order id → espera 3 min (antes 1) → correo 02 → SMS «pedido Nº {{opportunity.name}}» → espera 10 min → notificación a Sara + Telegram → mover a 03 → pone `pedido-confirmado` | −/+ `pedido-confirmado` | 02 · confirmación (`6a6aa2e6e3d32f78af2869e2`), con el bloque `{{{opportunity.resumen_pedido_html}}}` | n8n `b03f0adf-…` (order id, resumen y resumen_html), n8n `db8ae6be-…` (Telegram). `allowMultiple` true. Rama Not Found vacía |
| **02 · Etiquetado compra 1-2** | `b5feddb8` | tag `pedido-confirmado` | quita `inactivo` → `if_else`: sin tags → `compra-1`; con `compra-1` → `compra-2` + correo 11; con `compra-2` → nada | `compra-1`/`compra-2`, −`inactivo` | 11 · segunda compra | — |
| **03 · Email preparación** | `cc2c8b77` | etapa → 03 En Preparación | `if_else` sobre `pedido-en-preparacion`: si lo tiene, nada; si no, correo 03 → +`pedido-en-preparacion` → −`pedido-confirmado` | ídem | 03 · preparación (número de pedido y bloque de desglose) | — |
| **04a · Envío webhook Nacex + watchdog** | `6d73077b-c9ea-4c8d-b1d5-f3167ef2cc4f` | etapa → 04 Enviado | espera 3 min → guard (pipeline, etapa 04, peso y bultos > 0). **Sin datos:** notificación «sin peso/bultos» → devolver a 03 → Telegram. **Con datos:** webhook `pedido-enviado-nacex` → espera 1 min → Telegram con la etiqueta → quita `pedido-en-preparacion` → ¿`url_seguimiento` `has_value`? SÍ: correo 04 → +`pedido-enviado` → −`email-04-listo` → espera 48 h → ¿sigue en 04? → webhook `watchdog-entrega`. NO: Telegram «Nacex no ha devuelto el seguimiento» | ídem | 04 · envío | n8n `/webhook/6b762db0-…`, `/webhook/watchdog-entrega`, `/webhook/db8ae6be-…` |
| **05 · Entrega - mover + email** | `8e6ccd5a` | etapa → 05 Entregado (desde el 17/8) | +`pedido-entregado` → (mover a 05, no-op; en §33.1 ya no aparece) → correo 05 → webhook | +`pedido-entregado` | 05 · entrega | n8n `/avisos-sara` (§33.1). **No queda claro** si es un path distinto de `db8ae6be`. Los pasos de §14.3 (quitar `pedido-enviado`, `remove_from_workflow` del 04a) no aparecen en §33.1 |
| **06-12 · Journey post-entrega** | `cb923da8` | tag `pedido-entregado` | espera 3 d → correo 06 → −`pedido-entregado` → +`experiencia` → espera 7 d → correo 07 → −`experiencia` → +`feedback` → espera 80 d → `if_else` `compra-2`: SÍ → −`feedback`; NO → +`inactivo` → −`feedback` → correo 12 | ídem | 06 experiencia, 07 reseña (las dos a `url_feedback?cid=`), 12 hace tiempo | `allowMultiple` **false a propósito** |
| **06b · Encuesta post-compra completada** | `94779fd6-15bb-4387-9af0-244409fcd671` | `form_submission` (`fvVToLx0e9pEjSRD6zq7`) + `contact_tag encuesta-completada` | notificación interna → webhook de aviso a Sara → webhook a `experiencia-mura` (el de Sonia) | ninguno (el tag lo pone n8n) | — | retirar el trigger viejo **junto con** el webhook a `experiencia-mura` |
| **08a · Solicitud devolución** | `6b3064f7` | `form_submission` (Devolución v2, trigger `EQfcssMWOwqEkHqAFxZj`). Pendiente añadir tag `solicitud-devolucion` | webhook `solicitud-devolucion` a n8n → Find Opp + Update `motivo_devolucion` | — (el documento no detalla quién pone `devolucion-activa`) | — | n8n (el path no figura) |
| **08b · Email etiqueta devolución** | `466bbb08` | tag `email-08-listo` | correo 08 → −`email-08-listo` (también quita `pedido-entregado`, según §31.2) | ídem | 08 · solicitud devolución | — |
| **08c · Devolución no encontrada** | `8b5fe6af` | tag `devolucion-no-encontrada` | correo 16 → −`devolucion-no-encontrada` | ídem | 16 · datos no coinciden (`6a75e5eb96dc697014d600f7`) | — |
| **08d · Devolución cerrada - limpiar tag** | `2197b479` | etapa → 09 Reembolso | −`devolucion-activa` | ídem | — | `allowMultiple` true |
| **LS02 · Opt-in Newsletter Web** | `f62a24a8` | `contact_tag nl` | correo de doble opt-in → espera al trigger link (48 h) → si confirma: bienvenida + `newsletter-suscrita` + oportunidad «Leads / Comunidad» en 03; si no: rama de timeout | +`newsletter-suscrita` | doble opt-in y bienvenida | el alta la hace n8n (quita y pone `nl`); `allowMultiple` true |
| **LS02a · Alta newsletter web** | no figura | Inbound Webhook (premium) | Create/Update Contact + tag `nl` | `nl` | — | ver la ambigüedad en §28 |
| Borradores | — | — | LS01, LS03, AP01 Control de Stock, AP02 Lanzamiento Cápsula, PS01 Reseña, PS02 VIP, SP05 Reactivación | — | — | — |
| Borrados | `c93013cf` (OLD 04a), `873e4590` (04b), ZZ TEST custom webhook, ZZ SP02, ZZ SP04, AP01 Gestión Operativa, SP03 | — | — | — | — | — |

**Flujos de n8n mencionados:** `pedido-enviado-nacex` (`6b762db0-…`), `watchdog-entrega`, avisos por Telegram (`db8ae6be-6621-4e34-9400-391e5d8c494c`), guardar el order id y el resumen (`b03f0adf-70f8-41b7-923a-a2a0669355e3`), `alta-newsletter`, `experiencia-mura` (de Sonia; ver contradicción con `mura-experiencia`), `devolucion-web` y `/avisos-sara`. Archivos: `tienda/n8n-newsletter-workflow.json`, `n8n-experiencia-workflow.json`, `n8n-aviso-pedido-nodos.json` y `n8n-devolucion-web-nodos.json`.

---

# 4. Tags y campos

**Tags**
- **Ciclo de pedido:** `pedido-confirmado` (SP01), `compra-1` y `compra-2` (02), `pedido-en-preparacion` (`tADzPMfituIfESK2oPK4`, del 03), `pedido-enviado` (04a), `pedido-entregado` (05; lo consume el Journey), `etiqueta-por-imprimir` (n8n, aviso a Sara).
- **Señales de n8n:** `email-04-listo`, `email-08-listo`, `devolucion-no-encontrada`. Se consumen para que el siguiente pedido vuelva a disparar.
- **Devolución:** `devolucion-activa` (lo quita el 08d), `solicitud-devolucion` (`k1wdT7fvuRS5ilFgHDZl`, futura entrada del 08a). `dev-ok` y `dev-x`, sin decidir.
- **Post-entrega:** `experiencia`, `feedback`, `inactivo` (lo quita el 02), `encuesta-completada` (marca permanente; la pone n8n).
- **Newsletter:** `nl` (alta) y `newsletter-suscrita` (confirmada).
- **Futuros:** `reviewera`, `compradora-activa`, `recurrente`, `vip`.
- **Borrados:** `debug-01-entro-wf` y `debug-02-webhook-ok`.

**Campos de oportunidad:** los de §2, los de §20 (`order_id` es `Z5LD1nrSjYnZUGPXs3Pt`), `importe_reembolsado`, `fecha_reembolso`, `resumen_pedido` (`qLuRjgyMjv1rw7dRCzgA`, texto para la oportunidad y Telegram) y `resumen_pedido_html` (`wq6dRJdf6jLfWwreqAR5`, para los correos). Borrados: `order_array`, `imagen_pedido` y `prueba_opp_field`.

**Campos de contacto:**
- `url_seguimiento` (`py7TEhnvdIt7XjDtWjg5`), `albaran_nacex` (`CAN1vUcUenmvw2J0iQIJ`), `url_etiqueta` (`uFzLRUfvECe9q7Z47kwT`) y `url_etiqueta_devolucion`: duplicados heredados.
- `url_pedido`: existe, pero ya no se usa.
- `n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin` (`q73ODvZiPLCMqRrUkVCK`) y `motivo_de_devolucin__cambio` (`2GQ11kHcaUggy8K4P9U4`): del formulario de devolución.
- `nps` (`BpEcTG8IYDXRUQNrM3h0`).
- `calificacin_clienta` y `algun_comentario_que_nos_quieras_compartir`: de la encuesta vieja, no se reutilizan.
- Cumpleaños: campo `FGlE7RDztTinTetJGgWI`, o Date of Birth nativo. No queda claro cuál es el definitivo.
- `talla_habitual`, `n_total_compras`, `canal_origen`, direcciones de facturación.
- Peso y bultos: sobras.
- `contact.order_id`: nadie lo rellena.
- Borrado: `contact.resumen_pedido`.
- **No existen** `url_feedback`, `url_devolucion` ni `url_pieza` como campos de contacto.

**Custom values:**
- Contador Pedidos (`9EaNa5MGCw1wHGBv4cAJ`).
- `url coleccion` (`FBLfpmf7IrgXfx0qMHPR`, ahora `/colecciones`).
- `url home`, `url contacto`, `url devoluciones`, `url politica privacidad`.
- `url feedback` (`2lydcv75rCemIdPUmcf7`, todavía apunta al formulario viejo).
- `url resena google` (`jgROgNVr5KtNcrMZ4dio`, vacío).
- `url pieza` (`tlnOIT8yni1Ox7qeSZLo`, vacío).
- `url_formulario_devolucion` (`2S2b9lrVpft9p1adZxN5`, apunta a `/devolucion`).

**Otros ids**
- **Formularios:** Devolución v2 `HBK7tGDlcIFN0vaXoksg`, Opt-in Newsletter `fmuHvvOjkGBAkPU2LTZN`, Encuesta Post-Compra `fvVToLx0e9pEjSRD6zq7`, «Form 1».
- **Trigger link:** `K2PitLvfhgpKPvX6GeF4`.
- **Pipeline Leads / Comunidad:** `Y47eLa4dAIZTKLu2UpuX`.
- **Plantillas:** carpeta Correos `6a6aa119fee4921a97537ba5`, 02 `6a6aa2e6e3d32f78af2869e2`, huérfana `6a7dfb827717066f54ba6ff6`, Default Order `6a7dff32…`, 01 · Recibo `6a90dd80f98ccc652507a173`, 16 `6a75e5eb96dc697014d600f7`.
- **Elementos de la tienda:** `store-cart-J14MT1D5-f`, `store-checkout-sTf_Fd0JV5`, `custom-code-DN8OVgnA5P`.

---

# 5. Trampas y reglas aprendidas

1. **Los triggers creados por API son fantasma.** El POST devuelve un id y no guarda nada. En workflows con `isTriggerBucketMigrated: true` pasa siempre. Los triggers se crean en la interfaz y se leen con `GET /workflow/{loc}/trigger?workflowId=`.
2. **Todo PUT de workflow tiene que volver a incluir `status`**, o lo deja en borrador sin avisar.
3. **Todo workflow nuevo nace con `allowMultiple: false`.** Hay que comprobarlo siempre.
4. **Un tag que ya está puesto no vuelve a disparar.** Siempre se quita antes de ponerlo; los tags de señal los consume quien los escucha.
5. **Nunca un workflow que se ponga a sí mismo el tag que lo dispara**: es un bucle.
6. Una oportunidad creada en el mismo workflow necesita **espera de 20 s, Find y Update en la rama Found**.
7. Los campos personalizados de oportunidad **resuelven en correos de workflow** si ya están escritos. **No resuelven en correos de la tienda**, porque la oportunidad nace después.
8. **Un merge tag que no resuelve dentro de un `href` borra el enlace entero.**
9. GHL usa **Handlebars**: sin filtros `|`. Lee también los comentarios HTML. La triple llave `{{{ }}}` va dentro de un `<td>`. Si escapa o no el HTML está **pendiente de comprobar** con una compra real.
10. **Un botón son dos `href`:** el `<a>` y el `<v:roundrect>` de Outlook.
11. **Cambiar el `template_id` de un paso sobrescribe la plantilla de destino** con la anterior. Copia del HTML antes de reapuntar. Un guardado normal no lo hace.
12. Los pasos de correo de los workflows pueden apuntar a **copias huérfanas** de plantilla que no están en la carpeta.
13. **Premium:** Custom Webhook, Custom Code e Inbound Webhook se cobran por ejecución; puede cargarse en el monedero de la agencia. Se comprueba **mirando la corona en la interfaz**, no por el comportamiento. El webhook clásico y `form_submission` no son premium.
14. Una inscripción lanzada por API no ejecuta acciones premium. Un workflow sin trigger no se ejecuta nunca.
15. `/webhook-test/` solo escucha con el editor de n8n abierto. En producción, `/webhook/` y con el flujo activado.
16. **API interna de workflows:** la ruta lleva el `locationId` (`/workflow/{loc}/{id}`). Sin él da un 401 engañoso.
17. **Plantillas:** listar con `parentId` de la carpeta. Escribir con `POST /emails/builder/data` y `editorType:"html"` (sin él, 422).
18. **`urllib` recibe 403 / Cloudflare 1010:** usar `curl`.
19. **Páginas del funnel:** solo lectura, con `token-id` + `pageDataUrl`. No hay ruta de escritura («Cannot POST»). `GET /funnels/page` pagina de 20 en 20 y exige `offset`.
20. **Ajustes de la tienda:** no se pueden escribir por API (el validador exige un estado de EE. UU.). No mandar el cuerpo sin `shippingOrigin`, porque podría borrar la dirección de origen.
21. `/opportunities/search?q=` no busca en campos personalizados.
22. Para escribir un campo de oportunidad por API se usa `field_value`; los nodos de contacto usan `value`. En los campos con acentos, escribir **por id** y no por key.
23. `GET /payments/orders`: `altId` obligatorio, y cortar si `totalCount` es 0.
24. **El checkout de GHL siempre acaba en `/thank-you`.** Se redirige desde el global, y el píxel de compra va en `/gracias`.
25. **El Tracking Code del HEAD no llega en el `<head>` servido.** El CSS crítico va en la caja Custom CSS de cada página de tienda, acotado a `.hl_page-preview--content` para que no tiña el editor. Verificar sobre el HTML servido (`fetch(location.href)`), no sobre el DOM.
26. **Hay que pegar el HEAD y el BODY**, y volver a pegar el BODY cuando cambie la parte del DOM.
27. Las hojas de GHL (`CartSummary.css` y compañía) cargan después que la nuestra: hace falta `!important`.
28. Nunca usar selectores con el id del elemento (`.cstore-…`).
29. **No embeber formularios nativos de GHL:** HTML propio con `fetch` a n8n. `/forms/submit` es inviable desde fuera por Turnstile.
30. Cuidado con la estructura de `if_else` (contenedor, ramas, `else`, `parentKey`, `next`): copiarla de uno que funcione. **`next` va como texto, no como array, en nodos que no ramifican.** Que la API la acepte no significa que sea correcta.
31. No escribir por API un workflow que alguien está editando en la interfaz. Editar en la interfaz sube la versión y puede renombrar ramas.
32. «Send test email» no lleva oportunidad en el contexto.
33. Chromium en el entorno fija el viewport en 485 px: para probar responsive, usar iframes.
34. Al fusionar pasos, comprobar que no queden detrás de una espera larga.
35. Plan gratuito de Cloudflare Workers: tope de 50 subpeticiones por petición.

---

# 6. Pendientes y defectos conocidos según el documento

**Interfaz de GHL (German, Sonia o Sara)**
- Seleccionar `01 · Recibo` y **desactivar la notificación de pedido de la tienda** (§40.6). Conseguir la lista de variables `{{receipt.*}}` y decidir el asunto «Aqui… factura».
- Devolución (§41.10): pegar el formulario en `/devolucion`, completar `/gracias-devolucion`, trigger del 08a por tag `solicitud-devolucion`, y después retirar el Form Submitted y archivar el formulario viejo. Publicar. Montar n8n `/webhook/devolucion-web`.
- 06b: cuando `/experiencia` esté publicada, retirar a la vez el trigger `form_submission` y el webhook a `experiencia-mura`, cambiar `url feedback` y avisar a Sonia de que su hoja deja de llenarse.
- Rellenar `url resena google` y `url pieza`.
- Checkout: condiciones de contratación desactivadas (decisión legal o de Sonia), `shipToCountries: all` a acotar a la cobertura de Nacex, España preseleccionada (`defaultLocation`), formato de moneda (`isCurrencyFormattingEnabled`). Textos en los ajustes del elemento (lista al final del global) y texto del carrito vacío.
- Vaciar el `<style>` duplicado de las páginas propias (§27.7).
- Revisar en el 04a el nodo Webhook con `next:[2]` después de «How to fix» (§42.4), y los `next` en array del resto de workflows.

**Pruebas pendientes**
- Compra real (§40.7): dos correos y no cuatro, desglose, recibo en castellano, `resumen_pedido_html` escrito antes del correo, y si la triple llave escapa el HTML.
- Dos compras seguidas del mismo contacto (§17).
- Mover una oportunidad de prueba a 05 y comprobar correo, Telegram y Journey (§31.3).
- Que no quede parpadeo en `/checkout` con el CSS en la caja de la página (§35.5).
- Dejar un solo trigger en SP01 (§8.9a); sin confirmación.
- Verificar `remove_from_workflow` del 05 (§14.3); no aparece en el estado de §33.1.

**De diseño o abiertos**
- Multi-pedido: mover por tag puede mover la oportunidad equivocada (§8.4).
- Rama «Opportunity Not Found» de SP01 vacía. Alerta del contador en 999999 sin montar.
- Duplicados de contacto y oportunidad en los 4 campos de Nacex. Sonia tiene que migrar.
- El aviso a Sara del watchdog debería llevar número de pedido, seguimiento y estado de Nacex (§32.1).
- Telegram de pedido nuevo con desglose: cambio en n8n (§37.3); por §40 parece hecho en el JSON, pero no se confirma en producción.
- **Stripe** (reembolsos, correos 09a y 10, modo Live, claves de Sara): de Sonia, sin empezar.
- `dev-ok` y `dev-x` sin decidir. PS01 frente al Journey para la reseña.
- La frase de reembolso con descuento retirada de la ficha (§36.4): confirmar.
- El correo 05 no habla de devoluciones: copy pendiente de Sara.
- Política de cookies: auditoría y banner (§30.5). En el CLAUDE.md consta como avanzado después.
- `/carrito` no valida stock.
- El BODY de producción difiere del repo.
- Datos de prueba por limpiar (§10, §12): no consta que se hiciera.
- La dirección de recogida de Nacex no coincide con el domicilio fiscal: confirmar con Sara (§13).

**Contradicciones internas que conviene resolver al leer el código**
- Path del webhook de `experiencia.html`: `mura-experiencia` (§30.11) frente a `experiencia-mura` (§41.6).
- LS02 frente a LS02a.
- El correo 16 «sin workflow» (§33) frente a 08c enviándolo (§5).
- El webhook del 05 a `/avisos-sara` frente a `db8ae6be`.
- Qué campo de cumpleaños es el definitivo.
