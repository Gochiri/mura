# Implementación GHL Mûra — 7 de agosto de 2026

Traspaso de los cambios aplicados en la subcuenta GHL **Mûra** (`NxPF5fOicowujokEk5Hm`),
según lo acordado en la llamada del 4 de agosto (Sonia, German, Henry) y el doc
**Sistema Mura** del Drive.

Principio del sistema: **n8n solo pone etiquetas y rellena campos; GHL reacciona a las
etiquetas** (mueve oportunidades y envía emails). Cada pedido = una oportunidad, y el
**nombre de la oportunidad es el número de pedido** (n8n busca por nombre con `?q=`).

---

## 1. Pipeline "Ventas / Pedidos" — etapas nuevas

Se añadieron las etapas de devolución acordadas:

| # | Etapa | Estado |
|---|---|---|
| 01 | · Carrito Abandonado | existente |
| 02 | · Pedido Nuevo | existente |
| 03 | En Preparacion | existente |
| 04 | Enviado | existente |
| 05 | Entregado | existente |
| 06 | Devolucion o Cambio | existente |
| **07** | **Devolucion Verificada** | **NUEVA** |
| **08** | **Incidencia Devolucion** | **NUEVA** |
| **09** | **Reembolso** | **NUEVA** |
| 10 | Cerrado Ganado | renumerada (antes 07) |
| 11 | Cerrado Perdido | renumerada (antes 08) |

Los IDs internos de las etapas existentes **no cambiaron** (solo el nombre visible de
las dos últimas), así que ningún workflow que referencie etapas se ve afectado.

## 2. Custom fields de OPORTUNIDAD (fieldKeys definitivos → para Sonia)

| Campo | fieldKey | ID |
|---|---|---|
| Numero de pedido | `opportunity.numero_de_pedido` | `5p3I04zlvlct8CfuDNU5` |
| Peso | `opportunity.peso` | `MUSwk4X0oadHyO77RM5p` |
| Bultos | `opportunity.bultos` | `UjRE5P3lTXhkw8vGIVkz` |
| Albaran Nacex | `opportunity.albaran_nacex` | `gLWoB27TkBkWD4UbMADQ` |
| URL seguimiento | `opportunity.url_seguimiento` | `wQLTNRwInF8a8rmRqlQr` |
| URL etiqueta | `opportunity.url_etiqueta` | `ujglR1FPysKzsdrG9PC1` |
| URL etiqueta devolucion | `opportunity.url_etiqueta_devolucion` | `csFW5GZwYzQo5A3GnGBA` |
| Motivo devolucion | `opportunity.motivo_devolucion` | `PFiAHPZEfOU8uYPk4AYH` — **NUEVO** (para incidencias, lo rellena Sara) |

Se eliminó el campo de prueba `opportunity.prueba_opp_field`.

## 3. Tags creados

- `compra-1` / `compra-2` — etiquetado de primera/segunda compra
- `etiqueta-por-imprimir` — la pone n8n junto a `email-04-listo` (aviso a Sara)

## 4. Workflows corregidos (publicados)

### 04 Solicitud de envío realizada (`c93013cf`)
Trigger: oportunidad movida a **04 Enviado**. Cambios:

1. **Guard nuevo al inicio**: espera **3 minutos** y comprueba que la oportunidad siga
   en "04 Enviado" **y** que `peso` y `bultos` estén rellenos.
   - Si falta algo → **no dispara el webhook**, notificación interna a Sara y la
     oportunidad **vuelve a "03 En Preparación"**.
2. **Webhook `pedido-enviado-nacex`**: `peso` y `bultos` ahora salen de la
   **oportunidad** (antes: contacto, se pisaban entre pedidos) y se añadió
   **`numero_pedido` = `{{opportunity.numero_de_pedido}}`** (requisito del doc:
   `body.customData.numero_pedido`).
3. **Watchdog**: la espera pasó de 24h a **48h** (acordado en la llamada). El webhook
   `watchdog-entrega` ahora envía `albaran` desde la oportunidad + `numero_pedido`.

### 08 Solicitud devolución (`6b3064f7`)
Trigger: envío del **Formulario Devolución v2** (`HBK7tGDlcIFN0vaXoksg`).

**Bug corregido**: el webhook leía `contact.num_pedido_devolucion` y
`contact.motivo_de_devolucion_cambio`, campos que el formulario v2 **no escribe** —
llegaba todo vacío a n8n. Ahora lee los campos reales del formulario:

- nº de pedido → `contact.n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin`
  (se envía como `opportunityId` **y** como `numero_pedido`)
- motivo → `contact.motivo_de_devolucin__cambio`

### 04 Email pedido enviado (`873e4590`)
Trigger: tag `email-04-listo`. Tenía la plantilla por defecto de barbería
("Fresh Cuts… 💈"); ahora envía la plantilla **"04 · envío"** con asunto
*"Tu pedido está en camino"*.

### 05 · Email pedido entregado (`8e6ccd5a`)
Antes: trigger por cambio de etapa (nunca dispararía, porque n8n deja de mover etapas).
Ahora: trigger por **tag `pedido-entregado`** → GHL **mueve la oportunidad a
"05 Entregado"** → envía la plantilla **"05 · entrega"** (*"Tu pedido ha llegado"*).

## 5. Workflows nuevos (publicados)

| Workflow | Trigger | Acción |
|---|---|---|
| **03 · Email pedido en preparación** (`cc2c8b77`) | etapa → 03 En Preparación | email "03 · preparación" |
| **08 · Email etiqueta devolución** (`466bbb08`) | tag `email-08-listo` | email "08 · solicitud devolución" (enlace etiqueta) |
| **16 · Devolución no encontrada** (`8b5fe6af`) | tag `devolucion-no-encontrada` | email "16 · datos no coinciden" |
| **02 · Etiquetado compra 1-2** (`b5feddb8`) | tag `pedido-confirmado` | sin tags → `compra-1` · con `compra-1` → `compra-2` + email "11 · segunda compra" · con `compra-2` → nada |
| **06-12 · Journey post-entrega** (`cb923da8`) | tag `pedido-entregado` | +3d email "06 · experiencia" → +10d email "07 · reseña" → +90d email "12 · hace tiempo" |

## 6. Otros cambios

- **SP01 · Nueva Compra Confirmada** — **PUBLICADO y activado** (triggers
  `order_submission` y `payment_received` activos). El nombre de la oportunidad pasa
  de `{{contact.name}}` a **`{{contact.order_id}}`** — imprescindible para que las
  búsquedas de n8n funcionen (nombre de oportunidad = nº de pedido).
- Los webhooks de "04 Solicitud de envío realizada" envían
  **`numero_pedido` = `{{opportunity.name}}`** (no el custom field): como el nombre
  de la oportunidad ES el número de pedido, este valor está garantizado siempre.
  Verificado empíricamente: los pasos `create_opportunity` de la API interna **no
  aceptan custom fields por API** (se probaron 3 esquemas de `fields[]` con contactos
  de prueba y ninguno rellenó el campo — la cuenta quedó limpia después).
- Borrado el duplicado vacío de **PS02 · Fidelización VIP / Recurrencia**.

## 7. Claves que reciben los webhooks de n8n (referencia para Sonia)

**`pedido-enviado-nacex`**: `contactId`, `nombre`, `direccion`, `cp`, `poblacion`,
`pais`, `telefono`, `email`, `peso` (opp), `bultos` (opp), **`numero_pedido`** (opp)

**`watchdog-entrega`**: `opportunityId`, `albaran` (opp), **`numero_pedido`** (opp)

**`solicitud-devolucion`**: `opportunityId` (= nº tecleado por la clienta),
**`numero_pedido`** (ídem), `contactId`, `email`, `nombre`, `direccion`, `cp`,
`poblacion`, `telefono`, `motivo`

## 8. ⚠️ Pendientes / decisiones abiertas

1. **Merge tags de los emails**: las plantillas usan campos de **contacto**
   (`{{contact.url_seguimiento}}`, `{{contact.url_etiqueta_devolucion}}`,
   `{{contact.url_pedido}}` en el 03). n8n debe seguir escribiendo también los campos
   de contacto, o hay que retocar las plantillas. Ojo: los triggers por tag no siempre
   llevan contexto de oportunidad, por eso los campos de contacto son el camino seguro
   para los emails (la oportunidad es la fuente de verdad para la lógica).
2. **SP01 ya está publicado y activo.** Queda un detalle opcional: rellenar el custom
   field `opportunity.numero_de_pedido` desde la UI del builder (añadir el campo en el
   paso "Create Opportunity" con valor `{{contact.order_id}}`) — por API no se puede.
   No es bloqueante: los webhooks y las búsquedas usan `{{opportunity.name}}`, que ya
   lleva el número. Si algún email quiere pinear `{{opportunity.numero_de_pedido}}`,
   puede usar `{{opportunity.name}}` en su lugar.
   **Verificar además que `contact.order_id` se rellena de verdad al confirmarse un
   pedido en la tienda** — si no, el nombre de la oportunidad saldrá vacío (probar
   con un pedido real de test).
3. **Guard peso/bultos**: la condición usa el operador `!= ""` (no había ejemplo de
   "is not empty" que copiar). Revisar en el builder que la condición se muestre bien.
4. **Multi-pedido**: mover la oportunidad por tag filtra por pipeline, no por número de
   pedido. Si una clienta tiene 2 pedidos en curso podría moverse la equivocada.
   Mitigación posible: que n8n siga moviendo la etapa en el caso entrega (conoce la
   oportunidad exacta) y GHL solo envíe el email.
5. **Motivo duplicado en contacto**: hay dos campos "Motivo de Devolución / Cambio";
   el formulario v2 usa `contact.motivo_de_devolucin__cambio` y el formulario antiguo
   ("Formulario Devolución / Cambio") usa el otro. Retirar el formulario antiguo y
   después borrar su campo.
6. **Reembolso Stripe (paso 10)**: sin decidir si va por API de Stripe desde n8n o
   manual desde el dashboard.
7. **Nacex "taquilla"**: no activa en la cuenta; v1 = solo recogida a domicilio.
8. **Revisión visual recomendada** en el builder de "04 Solicitud de envío realizada"
   y "02 · Etiquetado compra 1-2" (grafos con ramas creados por API).

## 9. Backups

En `datos/backups/` están las copias previas a los cambios:

- `pipeline_ventas_backup.json` — pipeline "Ventas / Pedidos" antes de añadir etapas
- `wf_envio_pre_surgery.json` — "04 Solicitud de envío realizada" antes del guard
- `wf/*.json` — los 18 workflows tal y como estaban antes de tocar nada (definiciones
  + triggers)
