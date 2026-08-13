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
  `order_submission` y `payment_received` activos). Nombre de oportunidad =
  **`M{{custom_values.contador_pedidos}}`** (ver sección 6b).
- Los webhooks de "04 Solicitud de envío realizada" envían
  **`numero_pedido` = `{{opportunity.name}}`** (no el custom field): como el nombre
  de la oportunidad ES el número de pedido, este valor está garantizado siempre.
  Verificado empíricamente: los pasos `create_opportunity` de la API interna **no
  aceptan custom fields por API** (se probaron 3 esquemas de `fields[]` con contactos
  de prueba y ninguno rellenó el campo — la cuenta quedó limpia después).
- Borrado el duplicado vacío de **PS02 · Fidelización VIP / Recurrencia**.

## 6b. Número de pedido interno — arquitectura implementada (para Sonia) 🆕

**Problema**: el `orderId` de GHL mide 24 caracteres (verificado:
`6a75deb092347a71e94939e7`) y la referencia de Nacex admite máximo 20. Además, la
API interna de GHL no permite rellenar custom fields en el paso Create Opportunity
(verificado empíricamente), ni existe merge tag con padding utilizable como ID.

**Solución FINAL implementada** — contador **100% nativo en GHL** (la acción Math
Operation la configuró el equipo desde la UI el 7/8; la vía n8n `nuevo-pedido`
quedó descartada y sus pasos eliminados de SP01):

Secuencia actual de SP01 (publicado y verificado end-to-end con contactos de test):

1. **Math Operation**: custom value **"Contador Pedidos"** (id
   `9EaNa5MGCw1wHGBv4cAJ`) `+1`, guardado en el mismo custom value.
2. **Create Opportunity**: nombre = `M{{custom_values.contador_pedidos}}` →
   primer pedido real = **M100001** (7 chars ≤ 20 para Nacex ✓, 6 dígitos parejos
   sin relleno de ceros hasta 999999).
3. **Update Opportunity**: custom field `numero_de_pedido` =
   `M{{custom_values.contador_pedidos}}` — ⚠️ ver caveat abajo.
4. Email confirmación → SMS → wait 10 min → notificación a Sara → mover a
   "03 En Preparación" → tag `pedido-confirmado`.

**✅ RESUELTO (7/8 noche, prueba Stripe test):** el paso Update Opportunity solo
funciona con el patrón **Create → Wait 20s → Find Opportunity → Update (dentro de
la rama "Found")**. Sin el Find, el Update no tiene oportunidad en contexto y
falla en silencio (eso explicaba las 3 pruebas por API fallidas); sin el Wait, el
Find no encuentra la oportunidad recién creada (índice con retardo) y la ejecución
sale por la rama None. Verificado end-to-end: M100002 quedó con
`numero_de_pedido = M100002`. **El plan B de Sonia ya no es necesario** para este
campo. Patrón replicable: wait+find antes de cualquier update de oportunidad
creada en el mismo workflow.
⚠️ Pendiente menor: poner una notificación interna en la rama "Opportunity Not
Found" del Find (ahora está vacía → si fallara, salida silenciosa).

Contador reseteado a **100000** tras las pruebas (los tests consumieron 100001-3
y se limpiaron). Si el contador llega a 999999 → aviso a Sara (acordado el 29/7,
pendiente de montar la alerta).

**Hechos verificados con pruebas reales** (contactos de test, luego borrados):
- Los merge tags de custom values SÍ resuelven en el nombre de la oportunidad
  (`M{{custom_values.contador_pedidos}}` → `M100000`), por si algún día se prefiere
  el contador nativo de GHL: solo falta configurar la acción Math Operation desde la
  UI (por API no se pudo descubrir su esquema).
- `{{right_now.date}}` / `{{right_now.time}}` resuelven con ceros
  (`08/07/2026` / `10:34`); `year/month/day/hour/minute/second` resuelven sin ceros.
- La API pública SÍ escribe custom fields de oportunidad en el UPDATE (no en el
  CREATE del workflow interno).

## 7. Claves que reciben los webhooks de n8n (referencia para Sonia)

~~`nuevo-pedido`~~ — DESCARTADO: el número lo genera GHL nativamente (sección 6b);
Sonia no tiene que montar nada para la numeración.

**`pedido-enviado-nacex`**: `contactId`, `nombre`, `direccion`, `cp`, `poblacion`,
`pais`, `telefono`, `email`, `peso` (opp), `bultos` (opp),
**`numero_pedido`** = `{{opportunity.name}}` (garantizado = M1xxxxx)

**`watchdog-entrega`**: `opportunityId`, `albaran` (opp),
**`numero_pedido`** = `{{opportunity.name}}`

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
   ⚠️ **RESUELTO — Límite Nacex de 20 caracteres** (contexto en
   `2026-07-29-llamada-sonia-henry.md`): se confirmó que el `orderId` de GHL tiene
   **24 caracteres** → no vale como referencia Nacex. Se implementó la arquitectura
   del **número secuencial interno asignado por n8n** — ver sección 6b.
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
8. **Revisión visual recomendada** en el builder de "04a · Envio - webhook Nacex"
   y "02 · Etiquetado compra 1-2" (grafos con ramas creados por API).
9. ⚠️ **Compras repetidas:**
   (a) ✅ RESUELTO 7/8: re-entrada de SP01 activada (`allowMultiple=true` +
   `allowMultipleOpportunity=true`). **Queda por hacer**: dejar UN solo trigger
   en SP01 (recomendado: `order_submission`; desactivar `payment_received`) para
   evitar doble inscripción por compra — verificar con la próxima compra de test
   si con ambos triggers se crean dos oportunidades.
   (b) Los triggers "tag added" (pedido-confirmado, pedido-entregado,
   email-04-listo…) NO saltan si el contacto ya tenía el tag de un pedido
   anterior. Solución: quitar el tag antes de re-añadirlo (paso remove+add en
   GHL, o remove+add desde n8n), o limpiar los tags del ciclo al cerrarse cada
   pedido.
10. **Nombres de workflows reordenados el 7/8** (para carpetas): flujo operativo
   como `01`…`08c` (ver lista en GHL), drafts LS/AP/PS intactos, y los antiguos
   SP02/SP04 marcados `ZZ (obsoleto)`.

## 9. Backups

En `datos/backups/` están las copias previas a los cambios:

- `pipeline_ventas_backup.json` — pipeline "Ventas / Pedidos" antes de añadir etapas
- `wf_envio_pre_surgery.json` — "04 Solicitud de envío realizada" antes del guard
- `wf/*.json` — los 18 workflows tal y como estaban antes de tocar nada (definiciones
  + triggers)

## 10. Estado de la batería de pruebas de triggers (7/8 noche)

**Verificado FUNCIONANDO con evidencia:**
- **SP01 cadena completa** con compra Stripe test real: contador +1 → oportunidad
  M100002 → wait 20s → Find → Update (campo `numero_de_pedido` relleno ✓) →
  email confirmación → SMS → 10 min → notificación Sara → mover a "03 En
  Preparación" → tag `pedido-confirmado`. TODO OK.
- **08b Email etiqueta** y **08c No encontrada**: dispararon por tag a las 23:02.
- **Lógica de ramas del 02 Etiquetado**: verificada por inscripción directa
  (añadió `compra-1`).
- Checkout de la tienda arreglado: moneda EUR + zona de envío España (4,95 €
  provisional) + funnel en Payment Mode Test.

**Bloqueado al cierre (23:45 UTC):** desde ~23:10 NINGÚN evento de tag o etapa
dispara workflows — ni siquiera 08b que funcionó a las 23:02 sin cambios. Los
triggers recreados en UI (02, 03, 05, journey) están correctos en configuración.
Sospecha: cola de eventos atascada o throttling tras la ráfaga de pruebas.
**Reintentar por la mañana con un test limpio** (tag `pedido-confirmado` a un
contacto nuevo → debe salir `compra-1`). Si sigue muerto, revisar Enrollment
History en la UI de cada workflow y el status de HighLevel.

**Datos de test pendientes de limpiar al terminar:** contacto German
(GpHh0D2lqsdj83PFQ6AK) + M100001/M100002, contacto TestTriggers, pedido test
6a765127, tags de test en contactos, y resetear "Contador Pedidos" a 100000.

## 11. Limpieza de drafts (8/8 madrugada)

Borrados 4 drafts redundantes con el flujo vivo (revisión conjunta):
- ZZ SP02 Seguimiento Estado (arquitectura vieja por campos de contacto)
- ZZ SP04 Gestión Devolución (formulario antiguo; cubierto por 08a/b/c)
- AP01 Gestión Operativa (duplicaba watchdog, notificación y creaba oportunidades duplicadas)
- SP03 Encuesta Post-Entrega (cubierto por Journey + PS01)

Inventario final: **10 publicados** (flujo operativo 01→08c + Journey) y **8 drafts**
con funcionalidad única por construir: LS01-03 (captación), AP01 Control de Stock,
AP02 Lanzamiento Cápsula (renumerados tras el borrado), PS01 Reseña, PS02 VIP,
SP05 Reactivación.

Nota PS01 vs Journey: decidir con Sara quién pide la reseña (si PS01 se activa,
quitar el paso de reseña del Journey para no pedirla dos veces).

## 12. Veredicto final de triggers (9/8 mañana, cola de eventos sana)

| Trigger | Veredicto | Evidencia |
|---|---|---|
| 02 · Etiquetado (tag) | ✅ FUNCIONA | compra-1 en 1 min (test limpio contacto nuevo) |
| 05 · Entrega (tag) | ✅ FUNCIONA | movió M100002 a "05 Entregado" (el evento nocturno se procesó con 7,5h de retraso) |
| Journey (tag) | ✅ probable | comparte evento con 05; primer paso wait 3d impide verificación directa |
| 08b / 08c (tag) | ✅ FUNCIONAN | verificados la noche del 7 |
| 03 · Email preparación (etapa) | ⚠️ PENDIENTE | NO dispara con movimientos vía API pública (probado 2 veces con cola sana). Falta probar con las vías reales de producción: movimiento de SP01 (workflow) o arrastre manual en la UI (Sara). Test sugerido: arrastrar una oportunidad de test a "03 En Preparación" desde la UI |

**Conclusión de la parálisis nocturna**: era la cola de eventos de GHL degradada
(retrasos de horas); no era configuración. Los triggers recreados en UI funcionan.

**Detalle abierto**: el workflow 05 movió M100002 pero su email de entrega no
aparece en la conversación — revisar si el paso email del 05 ejecutó (posible
supresión de duplicado o fallo silencioso). Verificable en Enrollment History.

**Aviso**: German quedó inscrito en el Journey la madrugada del 8 — le llegará el
email "06 experiencia" ~el día 11 si no se limpia antes.

**Pendiente de fix (necesita OK)**: activar re-entrada (`allowMultiple`) en los 5
workflows creados por API (02, 03, 08b, 08c, journey) — sin ella, una clienta
recurrente solo dispararía cada uno UNA vez en su vida. SP01 ya la tiene activa.

**Datos de test acumulados por limpiar**: contactos German/TestTriggers/TestManana,
oportunidades M100001, M100002, TEST-TRIGGER03, pedido test, contador → 100000.

## 13. Diagnóstico: n8n no recibía el webhook de 04a (11/8)

**Estado del lado GHL: correcto.** Workflow publicado, trigger de etapa activo,
guard bien (pipeline + etapa 04 + `peso > 0` + `bultos > 0`), y M100001 en "04
Enviado" con peso=1 y bultos=1, así que el guard pasaba y el webhook se disparaba.
La URL de GHL (`/webhook/6b762db0-1c38-4dc1-b1b1-409b400cd686`) coincide con el
`path` del nodo Webhook de n8n.

**Causa raíz (lado n8n):** en el JSON del flujo, el nodo **Webhook no está
conectado a ningún nodo**. El objeto `connections` no tiene entrada `"Webhook"`:
la cadena arranca en "Construir data Nacex" y nadie la invoca. Aunque el POST
llegue, no ejecuta nada. → Sonia debe unir Webhook → Construir data Nacex y
**activar** el workflow (con el flujo inactivo, la URL de producción `/webhook/`
devuelve 404; la de pruebas es `/webhook-test/` y solo escucha con el editor
abierto).

**Bug propio corregido:** el webhook no enviaba `opportunityId`, y el nodo
"GHL: actualizar oportunidad" hace `PUT /opportunities/{{opportunityId}}` — habría
fallado con URL vacía incluso tras conectar el webhook. Añadido a `customData`
(el código de n8n ya lo lee vía `b.opportunityId`). Claves que se envían ahora:
`opportunityId`, `contactId`, `nombre`, `direccion`, `cp`, `poblacion`, `pais`,
`telefono`, `email`, `peso`, `bultos`, `numero_pedido`.

**Verificado además:** los 3 IDs de campos de contacto que usa n8n existen y son
los correctos (`py7TEhnvdIt7XjDtWjg5` url seguimiento, `CAN1vUcUenmvw2J0iQIJ`
albaran nacex, `uFzLRUfvECe9q7Z47kwT` url etiqueta), igual que los 3 de
oportunidad. Los tags que añade (`etiqueta-por-imprimir`, `email-04-listo`)
existen, y `email-04-listo` dispara el workflow 04b.

**A revisar en la prueba conjunta:** (a) el nodo de actualizar contacto usa
`{id, value}` y el de oportunidad `{id, field_value}` — comprobar que ambos
escriben de verdad; (b) `referencia` de Nacex = `numero_pedido` (M1xxxxx, 7
caracteres ≤ 20 ✓); (c) los datos de recogida del código (Calle Arrayan 53, Lepe,
tel 637251657, equipomura@gmail.com) no coinciden con el domicilio fiscal de los
documentos legales (Calle Huerta Romana 1, Minas de Riotinto) — confirmar con Sara
cuál es la dirección real de recogida.

## 14. Reunión 11/8 (noche) — webhook RESUELTO, consolidación 04a y estado real

### 14.1 Resolución del misterio del webhook

El POST de GHL **sí llega a n8n**: quedó demostrado en vivo. La cadena de fallos
que lo ocultaba, por orden de descubrimiento:

1. **El nodo Webhook de n8n estaba desconectado** (sección 13) → Sonia lo conectó
   y activó el flujo en producción durante la llamada.
2. **Un PUT por API dejó el 04a original en `draft` sin avisar** (bug conocido:
   todo PUT debe re-incluir `status`) → un workflow en draft ejecuta cero pasos.
   Se detectó y republicó, pero para entonces…
3. …**el equipo había creado un "Copy - 04a" en la llamada** (al sospechar del
   builder), le montaron trigger nuevo en UI, URL de producción y el webhook de
   aviso a Sara por Telegram. Los arreglos hechos sobre el original NO se
   guardaron ("Error: your version is updated"). **El Copy es el que funcionó.**

### 14.2 Consolidación hecha esta noche (por API, con backups)

- **Canónico nuevo: `6d73077b-c9ea-4c8d-b1d5-f3167ef2cc4f`** (el ex-Copy),
  renombrado a `04a · Envio - webhook Nacex + watchdog`. Limpieza aplicada:
  wait 10s (temporal de pruebas) → **3 minutos**, pasos DEBUG eliminados,
  publicado, trigger de etapa activo. Conserva: URL producción
  `/webhook/6b762db0-…`, watchdog 48h → `/webhook/watchdog-entrega`, y rama
  "faltan datos" → notificación + devolver a 03 + **aviso Telegram**
  `/webhook/db8ae6be-6621-4e34-9400-391e5d8c494c` (key `mensaje`).
- **El original `c93013cf` quedó como `OLD 04a (borrar)` en draft** →
  ⚠️ **German: borrarlo desde la UI** (no lo borro yo por seguridad). Mientras
  esté en draft no dispara, pero mejor eliminarlo para que no confunda.
- Tags `debug-01-entro-wf` y `debug-02-webhook-ok` borrados del location.
- Backups: `datos/backups/copy04a_pre_consolidacion_20260811.json`,
  `orig04a_pre_consolidacion_20260811.json`, `wf05_pre_cambios_20260811.json`.

### 14.3 Cambios en "05 · Entrega - mover + email" (acordado en la reunión)

Añadidos 2 pasos (publicado, v9): **quitar tag `pedido-enviado`** y **sacar al
contacto del 04a** (`remove_from_workflow` → cancela el watchdog de 48h de un
pedido ya entregado). El "poner entregado" no hace falta dentro: el tag
`pedido-entregado` que añade n8n ES el trigger del 05.
⚠️ `remove_from_workflow` montado por API sin ejemplo previo — **verificar en la
prueba de mañana** que realmente expulsa al contacto (Enrollment History del 04a).

### 14.4 Newsletter (acordado en la reunión)

Ya existía el draft **`LS02 · Opt-in Newsletter Web`** (`f62a24a8`) con doble
opt-in, email de bienvenida, tag `newsletter-suscrita` (el "NL" del mapa de Sonia),
oportunidad en el pipeline de Leads y **el trigger del form ya configurado**
(`Opt-in Newsletter`, `fmuHvvOjkGBAkPU2LTZN`, inactivo). Se le añadió el paso que
pidió Sonia en vez de crear un workflow nuevo:

- **Webhook al final de la rama confirmada** → POST a
  `https://n8n.letsbebanana.com/webhook/newsletter-mura` (path propuesto; Sonia
  crea ese webhook o dice el suyo) con `contactId, nombre, apellidos, email,
  telefono, fecha_nacimiento, fecha_alta` → de ahí a su Excel.
- Backup: `datos/backups/ls02_pre_webhook_20260811.json`.

**Falta (UI, no se puede por API):** completar el form "Opt-in Newsletter" con los
campos acordados — nombre, apellidos, email, teléfono, fecha de nacimiento y
**checkbox de consentimiento** con link a la política de privacidad — activar el
trigger y publicar LS02. Decidir también si se mantiene el doble opt-in (está
montado pero no se habló en la reunión).

### 14.5 Formularios pendientes (specs para UI — el builder de forms no es accesible por API)

- **Devolución v2** (`HBK7tGDlcIFN0vaXoksg`): traducir labels al español:
  First Name → **Nombre** · Last Name → **Apellidos** · Email → **Correo
  electrónico** · Phone → **Teléfono** · (Address → Dirección · City → Población ·
  Postal Code → Código postal, si aparecen) · botón Submit → **"Solicitar
  devolución"**. Los 2 campos custom ya están en español.
- **Experiencia MÛRA (Mail 06)**: spec completa en el doc del Drive
  "NEW -- 04 · FORMULARIO DE EXPERIENCIA MÛRA (Mail 06)". Son 6 bloques con
  **lógica condicional** ("¿Has comprado?" No → ocultar bloques 3-5), valoraciones
  de estrellas y NPS 0-10 → construirlo como **Survey de GHL** (multi-paso con
  conditional logic), no como Form simple. El email 07 tiene marcado "AÑADIR
  ENLACE" para cuando exista la URL.
- **Página Devoluciones**: añadir el form Devolución v2 (botón/página
  `devoluciones-form`) — funnel builder, manual.

### 14.6 Botón "Ver mi pedido" (emails 02/03) — investigación cerrada

- El objeto Order de la API **no trae ninguna URL de cara al cliente** (ni recibo
  ni página de pedido), y la vista Payments → Orders → View Order es **solo del
  admin** (app.gohighlevel.com) — no sirve para el email de la clienta.
- **Propuesta A (recomendada, cero riesgo):** activar los **recibos nativos**
  (Settings → Payments → Receipts): GHL manda desglose del pedido automático, y el
  botón del email 02/03 puede apuntar a la tienda o eliminarse.
- **Propuesta B (si Sara quiere botón):** apuntar a la página de confirmación del
  funnel con el order id (`https://stylebymura.com/order-confirmation?order_id=…`).
  Requiere confirmar en la compra test de mañana (1) qué merge tag resuelve el id
  en SP01 — candidatos: `{{order.id}}`, `{{payment.order_id}}` — y (2) que esa
  página existe y acepta el parámetro.
- Los cambios de Sonia en vivo (nº de pedido = `{{opportunity.name}}` en 02/03)
  quedan **por verificar** con la compra test.

### 14.7 Checklist para la sesión de mañana (12/8)

1. Sonia llama a **Nacex → cuenta a producción** (bloqueante de la prueba real).
2. German **borra `OLD 04a (borrar)`** en la UI.
3. Prueba envío completa: mover pedido test a "04 Enviado" → POST (3 min) → Nacex
   albarán/etiqueta/URL seguimiento → n8n escribe en GHL → tag `etiqueta-por-imprimir`
   + `email-04-listo` → email 04. Verificar los DOS nodos de escritura de n8n
   (contacto `{id, value}` vs oportunidad `{id, field_value}`).
4. Prueba entrega: tag `pedido-entregado` → 05 mueve + email + quita
   `pedido-enviado` + **sale del 04a** (verificar 14.3).
5. Prueba devolución: rellenar Formulario Devolución v2 (Sonia busca por
   **Opportunity Name**) — y de paso traducirlo (14.5).
6. Compra test Stripe: verificar plantillas 02/03 (nº pedido) + merge tag del
   order id (14.6-B) + si con los 2 triggers de SP01 se duplica la oportunidad
   (sección 8.9a).
7. **Instagram**: integración en GHL con login de Sara (2 clics, Settings →
   Integrations).
8. **Dirección de recogida Nacex**: confirmar con Sara (Lepe vs Minas de Riotinto).
9. Newsletter: campos + trigger + publicar (14.4); Sonia monta el flujo n8n → Excel.
10. Pendientes que siguen vivos: re-entrada `allowMultiple` en 02/03/08b/08c/journey
    (sección 12), un solo trigger en SP01, tag re-add en compras repetidas (8.9b),
    formulario Experiencia (14.5), Política de Cookies, Payment Mode → Live +
    Stripe live de Sara, limpieza de datos de test (secciones 10 y 12).

## 15. Coreografía de tags — cerrada (11/8 noche)

El mapa de Sonia asigna un tag por fase para que **Sara sepa en qué punto está cada
clienta buscando por tag** (las oportunidades muestran M1xxxxx, no el nombre). Al
repasar la reunión contra la cuenta apareció un agujero: **nadie añadía
`pedido-enviado`**, y la fase "preparación" no tenía tag. Es decir, el paso que se
añadió al 05 estaba quitando un tag que nunca llegaba a ponerse, y Sara no tenía
forma de ver qué pedidos estaban en tránsito. Corregido:

| Fase | Workflow | Tags |
|---|---|---|
| Compra | 01 · SP01 | `+pedido-confirmado` |
| Etiquetado | 02 | `+compra-1` / `+compra-2` |
| Preparación | 03 | `+pedido-en-preparacion` 🆕 |
| Envío | 04b | `−pedido-en-preparacion` 🆕 · `+pedido-enviado` 🆕 |
| Entrega | 05 | `−pedido-enviado` · sale del 04a (mata el watchdog) |

- Tag nuevo creado: **`pedido-en-preparacion`** (`tADzPMfituIfESK2oPK4`).
- `pedido-entregado` lo sigue poniendo n8n — es el trigger del 05 y del Journey.
- Backups: `datos/backups/wf03_pre_tags_20260811.json`, `wf04b_pre_tags_20260811.json`.

⚠️ Interacción con el bug de compras repetidas (8.9b): en la segunda compra el tag ya
está puesto y el trigger por tag no vuelve a saltar. Con esta coreografía el ciclo se
autolimpia en parte (preparación y enviado se quitan solos), pero `pedido-confirmado`
y `pedido-entregado` siguen quedándose pegados. Pendiente de decidir el patrón
remove+add.

**Pendiente aparte (no tocado a propósito):** las fases `experiencia` y `feedback` del
mapa de Sonia viven en el Journey, que tiene gente inscrita — tocarlo puede reordenar
las esperas. Se hace después del lanzamiento.

## 16. Cabos sueltos de la reunión — resueltos

### 16.1 "URL de la última colección" (pregunta de Sonia) — ya existía

No hay que crear nada: el custom value **`url coleccion`** (`FBLfpmf7IrgXfx0qMHPR`)
→ `https://www.stylebymura.com/coleccion` ya está, junto con `url home`,
`url contacto`, `url devoluciones` y `url politica privacidad`. Los botones de los
emails usan `{{custom_values.url_coleccion}}`; cuando Sara suba colección nueva se
cambia **el valor en un sitio** y se actualizan todos los emails a la vez.
→ Verificar en la UI que las plantillas usan la variable y no una URL escrita a mano
(el HTML de las plantillas no es accesible por API).

### 16.2 Mail 09A (reembolso) — datos disponibles y propuesta

Investigado en la API de Payments: las transacciones traen `amount`, `currency`,
`status`, **`amountRefunded`** y el `chargeSnapshot` completo de Stripe. Pero **no
hay merge tag nativo de reembolso** para las plantillas de email, y GHL no ofrece un
trigger "pago reembolsado" (el de pagos es `payment_received`).

Preparado para la vía viable: creados dos campos de contacto —
**`contact.importe_reembolsado`** (`cgEpYFfk2E5alcTA4vLn`, monetario) y
**`contact.fecha_reembolso`** (`izCNoYCTgZjfYUhl9pDQ`, fecha).

Flujo propuesto: Sara reembolsa en Stripe → n8n escucha `charge.refunded` (o lo hace
en el mismo flujo de devolución) → escribe esos dos campos en el contacto y añade el
tag que dispare el email 09A → la plantilla usa
`{{contact.importe_reembolsado}}` y `{{contact.fecha_reembolso}}`.
Alternativa sin cifras: email 09A remitiendo al justificante que manda Stripe.

### 16.3 Otros detalles de la reunión

- **Mail 07 (reseña)**: tiene un `AÑADIR ENLACE` pendiente → se rellena cuando exista
  la URL del formulario de experiencia (depende de 14.5).
- **Mail 15 (reposición)**: existe pero **no se usa por ahora** (decisión de Sonia).
- **Watchdog 5A y devolución en n8n**: Sonia debe buscar por Opportunity **Name**, no
  por Opportunity ID (lado n8n; el payload de GHL ya manda `numero_pedido`).
- **Vista de oportunidades para Sara**: en Oportunidades → *Manage Fields* se pueden
  mostrar hasta 7 columnas; añadir "Contact Name" para no ver solo M1xxxxx. Es
  configuración por usuario — la hace ella en su sesión.
- **Dato de test corregido**: el CP del contacto de test era `B1646` (argentino) y por
  eso Nacex daba dirección inválida; Henry lo dejó en `28710` ✓ verificado.

## 17. Compras repetidas — remove+add y re-entrada (11/8 noche)

Cierra el pendiente 8.9b. Eran **dos bloqueos encadenados**, y arreglar uno solo no
sirve de nada:

**(a) Los tags se quedaban pegados.** Un trigger "tag added" solo dispara en la
transición *no lo tiene → lo tiene*. En la segunda compra el contacto ya arrastraba
`pedido-confirmado`, así que añadirlo era un no-op y el 02 nunca arrancaba.

**(b) Ningún workflow del ciclo permitía re-entrada.** Verificado: todos tenían
`allowMultiple = false` salvo SP01 — o sea que aunque el tag disparase, la clienta
recurrente **no podía volver a inscribirse**. Incluido el **04a**: un segundo pedido
movido a "04 Enviado" no habría pedido etiqueta a Nacex.

### Lo aplicado

**Re-entrada activada** (`allowMultiple` + `allowMultipleOpportunity` = true) en
02, 03, 04a, 04b, 05, 08a, 08b, 08c. Todos siguen publicados y con su trigger activo.

**Patrón remove+add en los dos tags de estado:**
- `pedido-confirmado` → **SP01 lo quita como primer paso** y lo añade al final. Entre
  medias hay 20 s + 10 min de espera, así que la quita y la puesta nunca se solapan
  y el evento de alta siempre se emite.
- `pedido-entregado` → lo pone n8n (no podemos quitarlo antes), así que **el 05 lo
  consume**: espera **1 día** y lo quita. Se deja ese día para que Sara siga viendo
  el pedido como entregado; pasado ese plazo la fuente de verdad es la etapa del
  pipeline ("05 Entregado"), que no se borra.

**Tags de señal** (pulsos que manda n8n, sin valor informativo para Sara): los
consume el workflow que los escucha, para que el siguiente pedido vuelva a
dispararlos — `email-04-listo` en el 04b, `email-08-listo` en el 08b,
`devolucion-no-encontrada` en el 08c.

### Decisión consciente: el Journey NO se repite

`06-12 · Journey post-entrega` se queda con `allowMultiple = false` a propósito:
pide reseña y manda "experiencia" / "hace tiempo", y repetir eso en cada pedido de
una clienta recurrente es spam. Cada clienta lo recibe una vez. Si Sara lo quiere en
cada compra, es cambiar ese flag.

### Estado final del ciclo de tags

| Workflow | Re-entrada | Tags |
|---|---|---|
| 01 · SP01 | ✅ | `−pedido-confirmado` … `+pedido-confirmado` |
| 02 · Etiquetado | ✅ | `+compra-1` / `+compra-2` |
| 03 · Preparación | ✅ | `+pedido-en-preparacion` |
| 04a · Envío Nacex | ✅ | — |
| 04b · Email enviado | ✅ | `−pedido-en-preparacion` `+pedido-enviado` `−email-04-listo` |
| 05 · Entrega | ✅ | `−pedido-enviado` · sale del 04a · (1 día) `−pedido-entregado` |
| 08a/b/c · Devolución | ✅ | `−email-08-listo` · `−devolucion-no-encontrada` |
| Journey | ❌ a propósito | — |

Backups: `datos/backups/sp01_pre_removeadd_20260811.json` y
`wf{02,03,04a,04b,05,08a,08b,08c}_pre_reentry_20260811.json`.

**Verificación pendiente (prueba real):** hacer **dos compras seguidas con el mismo
contacto** y comprobar que la segunda recorre el ciclo entero — es el único escenario
que no se ha probado nunca y el que rompía antes.
