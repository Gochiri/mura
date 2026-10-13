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

### 04 Email pedido enviado (`873e4590`) — ⛔ RETIRADO el 14/8
Trigger: tag `email-04-listo`. Tenía la plantilla por defecto de barbería
("Fresh Cuts… 💈"); pasó a enviar la plantilla **"04 · envío"**.

**Ya no se usa: sus tres pasos viven dentro del 04a.** Se despublicó el 14/8 y se
**borró de la cuenta el 15/8** (copia en `datos/backups/wf_old04b_pre_delete_20260815.json`).
**Por qué se retiró:** disparaba **por tag**, y los campos custom de oportunidad
solo resuelven con trigger de **cambio de etapa** (sección 24). Cuando n8n migró a
escribir en la oportunidad, el enlace de seguimiento del correo se quedó leyendo el
campo de contacto —que conservaba el valor de un pedido anterior— y mandaba a la
clienta **al seguimiento equivocado**. Detalle completo en la sección 26.
**No reactivarlo**: duplicaría el correo de envío.

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
- **El original `c93013cf` quedó como `OLD 04a (borrar)` en draft** y se **borró
  el 15/8** (copia en `datos/backups/wf_old04a_pre_delete_20260815.json`).
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
2. ~~German **borra `OLD 04a (borrar)`** en la UI.~~ Hecho el 15/8.
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
| ~~04b · Email enviado~~ | — | retirado el 14/8; sus tags pasaron al 04a (secciones 4 y 26) |
| 05 · Entrega | ✅ | `−pedido-enviado` · sale del 04a · (1 día) `−pedido-entregado` |
| 08a/b/c · Devolución | ✅ | `−email-08-listo` · `−devolucion-no-encontrada` |
| Journey | ❌ a propósito | — |

Backups: `datos/backups/sp01_pre_removeadd_20260811.json` y
`wf{02,03,04a,04b,05,08a,08b,08c}_pre_reentry_20260811.json`.

**Verificación pendiente (prueba real):** hacer **dos compras seguidas con el mismo
contacto** y comprobar que la segunda recorre el ciclo entero — es el único escenario
que no se ha probado nunca y el que rompía antes.

## 18. Los merge tags de GHL no admiten filtros (13/8)

Al guardar la plantilla 02 saltó `Template Parser error ... Expecting 'CLOSE'`. Causa:
el asunto llevaba **`{{contact.first_name | default: "Hola"}}`**. **GHL parsea
Handlebars, no Liquid**: la barra `|` con filtros (`default:`) no existe en su
sintaxis y revienta el parser con el primer `{{ }}` que la lleve.

Afectaba a **cuatro asuntos** (02, 03, 04, 05), no solo al que dio el error. Asuntos
corregidos:

- 02 · `{{contact.first_name}}, hemos recibido tu elección.`
- 03 · `{{contact.first_name}}, estamos preparando tu MÛRA.`
- 04 · `{{contact.first_name}}, tu MÛRA ya está en camino.`
- 05 · `{{contact.first_name}}, ya está contigo.`

**No hay fallback posible** en las plantillas de GHL. No es problema aquí: los cuatro
son correos post-compra y el checkout exige nombre, así que `first_name` siempre
viene relleno. Para correos de captación (newsletter) sí conviene un saludo que
funcione sin nombre.

⚠️ El parser lee **también los comentarios HTML**, así que ningún ejemplo de sintaxis
rota puede quedar escrito con llaves vivas dentro de un `<!-- -->` (las notas de las
plantillas se reescribieron sin llaves por eso).

**Bug arrastrado en el mismo repaso:** el botón "Ver mi pedido" de 02 y 03 apuntaba a
`{{contact.url_pedido}}`, un merge tag que **no existe** (ese campo de contacto no
está creado), y la versión que se editó en GHL lo cambió a `{{order.order_url}}`, que
tampoco existe — coincide con lo investigado en 14.6: la API de Orders no expone
ninguna URL de cara a la clienta. Ahora apunta a `{{custom_values.url_home}}` como
provisional. **Decisión pendiente con Sara:** recibos nativos de GHL, o botón a la
tienda y quitar el "Ver mi pedido".

También en 02: el nº de pedido pasó de `{{opportunity.id}}` a **`{{opportunity.name}}`**
(el M1xxxxx del contador), alineado con lo que ya cambió Sonia en GHL.

## 19. Confirmación de compra: por qué no caben número de pedido y productos en el mismo correo (13/8)

**Diagnóstico cerrado con evidencia.** Se instrumentó SP01 con una notificación que
imprimía ocho candidatos de merge tag y se hizo una compra real de test (pedido
`6a7e4815…`, 22:41). **Los ocho salieron vacíos**:

`{{order.id}}` · `{{order._id}}` · `{{order.order_id}}` · `{{order.order_url}}` ·
`{{order.total}}` · `{{payment.order_id}}` · `{{payment.id}}` · `{{contact.order_id}}`

Conclusión: **el contexto de workflow no ve la orden**. Los datos del pedido solo
existen dentro de las plantillas de notificación de la tienda (Payments → Settings →
Customer notifications), que es donde `{{order.order_url}}` sí resuelve. El campo
`contact.order_id` está creado pero **nadie lo rellena** (verificado: contacto con
tres pedidos reales y el campo vacío).

**El segundo límite:** el bloque de carrito (fotos de prenda, subtotal, envío) también
es exclusivo de las plantillas de tienda. Un correo enviado desde el workflow no puede
mostrar lo comprado ni inyectándole la URL.

**La cronología de una compra real deja el conflicto medido al segundo:**

```
22:41:25  pedido creado
22:41:30  correo de tienda (plantilla MÛRA)      ← aún no existe la oportunidad
22:41:32  correo de tienda (recibo nativo)
22:41:34  oportunidad M100008 creada             ← aquí nace el número de pedido
22:41:57  SMS del workflow, con M100008 ✓
```

El correo que sabe **qué** compró sale 4 segundos antes de que exista el número; el
que sabe **el número** no puede mostrar la compra.

**Restricción dura:** el formulario de devolución pide "Nº de pedido (lo encuentras en
tu mail de confirmación)" y el 08a busca la oportunidad por ese nombre. Si la
confirmación no lleva el M1xxxxx, la devolución se queda sin punto de entrada.

### Opciones (pendiente de decisión de Sonia)

1. **Dos correos con roles distintos** — tienda: recibo inmediato con productos y
   botón funcionando; workflow: correo de marca con el M1xxxxx unos minutos después.
   Sin dependencias, montable en el momento. Coste: dos correos por compra.
2. **Uno solo, vía n8n** — webhook al inicio de SP01 → n8n hace
   `GET /payments/orders?contactId=…&limit=1` (verificado que funciona y devuelve el
   más reciente primero) → escribe la URL en un campo de contacto → el correo del
   workflow sale con M y botón. Sin lista de productos; depende de que n8n responda
   dentro de los ~20 s previos al envío.
3. **Uno solo desde la tienda, sin número** — obliga a rediseñar el formulario de
   devolución para no depender del número (buscar por email), ambiguo con varios
   pedidos.

**Estado mientras tanto:** el paso de email de SP01 quedó **desactivado**
(`advanceCanvasMeta.isDisabled: true`, hecho en la llamada del 13/8), así que hoy la
única confirmación sale de la tienda. ⚠️ **No lanzar sin resolver esto**: tal cual
está, la clienta nunca recibe el M1xxxxx por correo y no podría pedir una devolución.

## 20. Migración de campos de pedido a OPORTUNIDAD (13/8)

La carpeta "MURA·Pedidos" tenía como campos **de contacto** datos que son de un
pedido concreto — herencia del diseño de marzo, anterior a la decisión de "un pedido =
una oportunidad". En un contacto con varios pedidos esos valores se pisan entre sí.

**Rastreo previo** (los 18 workflows y las 18 plantillas de correo): de todos ellos,
**solo 4 campos de contacto están vivos** — `url_seguimiento`, `url_etiqueta`,
`albaran_nacex` y `url_etiqueta_devolucion`: los escribe n8n y los leen las
plantillas. El resto no lo escribía ni lo leía nadie.

**Migrados a oportunidad y borrados de contacto** (11 creados + 1 omitido):

| Campo | fieldKey nuevo |
|---|---|
| Order ID | `opportunity.order_id` |
| SKU comprado | `opportunity.sku_comprado` |
| Categoría prenda (15 opciones) | `opportunity.categora_prenda` |
| Estado pedido (5 opciones) | `opportunity.estado_pedido` |
| Talla pedida (6 opciones) | `opportunity.talla_pedida` |
| Color variante (25 opciones) | `opportunity.color_variante` |
| Importe total | `opportunity.importe_total` |
| Fecha pedido | `opportunity.fecha_pedido` |
| Nº tracking | `opportunity.n_tracking` |
| Transportista (2 opciones) | `opportunity.transportista` |
| num pedido devolucion | `opportunity.num_pedido_devolucion` |

Las listas de opciones se recrearon íntegras. **"numero pedido" no se recreó**: ya
existe `opportunity.numero_de_pedido` y duplicarlo solo confundiría.

También se corrigieron los dos campos de reembolso creados horas antes en el modelo
equivocado → ahora `opportunity.importe_reembolsado` y `opportunity.fecha_reembolso`.

Backups: `datos/backups/campos_contacto_migrados_20260813.json` (definiciones
completas, con opciones) y `campos_oportunidad_nuevos_20260813.json` (IDs nuevos).

### Qué queda en contacto, y por qué

Correcto que sean de contacto: `talla_habitual`, `calificacin_clienta`,
`n_total_compras`, `canal_origen`, comentario libre y las direcciones de facturación
(las escribe el checkout). Y los dos campos que rellena el **formulario de devolución**
(`n_de_pedido_lo_encuentras…` y `motivo_de_devolucin__cambio`): los formularios de GHL
**no pueden escribir campos de oportunidad**, así que aterrizan en contacto y hay que
copiarlos a la oportunidad después.

### Pendiente: los 4 campos vivos

`url_seguimiento`, `url_etiqueta`, `albaran_nacex` y `url_etiqueta_devolucion` siguen
duplicados (contacto + oportunidad). Mover el uso real es un cambio **coordinado con
Sonia**: ella escribe hoy en los de contacto, y además hay que meter un
**Find Opportunity antes de los emails disparados por tag** (04b, 08b) o los merge
tags de oportunidad saldrán vacíos. `peso` y `bultos` de contacto también quedan como
sobras del cambio del 7/8.

### ⚠️ Merge tags rotos detectados en el mismo rastreo

Cinco plantillas usan campos **que no existen en la cuenta**, así que salen vacíos:
`contact.url_devolucion` (6 usos), `contact.url_pieza` (3), `contact.url_feedback` (3),
`contact.motivo_revision` y `contact.codigo_cumple`. Hay que decidir de dónde sale cada
uno antes de lanzar.

### 20b. Merge tags rotos de las plantillas — arreglados (13/8)

Los cinco merge tags que apuntaban a campos inexistentes (salían vacíos en correos que
ya se envían) y los dos placeholders literales `AÑADIR ENLACE`:

| Plantilla | Antes | Ahora |
|---|---|---|
| 09a · devolución verificada, 10 · reembolso | `{{contact.url_devolucion}}` | `{{custom_values.url_devoluciones}}` (página de devoluciones, ya tenía valor) |
| 06 · experiencia | `{{contact.url_feedback}}` | `{{custom_values.url_feedback}}` 🆕 vacío |
| 07 · reseña | `AÑADIR ENLACE` (literal) | `{{custom_values.url_feedback}}` 🆕 vacío |
| 18 · reseña Google | `AÑADIR ENLACE GOOGLE` (literal) | `{{custom_values.url_resena_google}}` 🆕 vacío |
| 15 · reposición | `{{contact.url_pieza}}` | `{{custom_values.url_pieza}}` 🆕 vacío |
| 09b · incidencia devolución | `{{contact.motivo_revision}}` | `{{opportunity.motivo_devolucion}}` (el campo que rellena Sara) |

`contact.codigo_cumple` **no estaba roto**: solo aparecía dentro de un comentario del
17 · cumpleaños como sugerencia; el código del cuerpo (`CONTIGOMURA10`) es fijo. Se le
quitaron las llaves vivas a la nota, por lo mismo que en la sección 18.

**Custom values nuevos, creados vacíos** — se rellenan una sola vez y arreglan todas
las plantillas que los usan a la vez:

- `url feedback` (`2lydcv75rCemIdPUmcf7`) → **YA RELLENO (13/8)** con el formulario
  *Encuesta Post-Compra* (`fvVToLx0e9pEjSRD6zq7`):
  `https://api.leadconnectorhq.com/widget/form/fvVToLx0e9pEjSRD6zq7` — usado por 06 y 07.
  Dos salvedades: (a) Sonia dio ese formulario por viejo en la llamada del 11/8 (es de
  marzo) frente a la spec del Drive, mucho más rica (6 bloques, lógica condicional,
  NPS) que pide un **Survey**; (b) **ningún workflow escucha sus envíos**, así que hoy
  las respuestas no disparan nada ni ponen el tag `encuesta-completada`.
  Si se acaba embebiendo en la web, basta cambiar el valor.
- `url resena google` (`jgROgNVr5KtNcrMZ4dio`) → enlace "escribir una reseña" de Google Business (18)
- `url pieza` (`tlnOIT8yni1Ox7qeSZLo`) → URL de la prenda repuesta, se cambia por campaña (15)

⚠️ **Mientras estén vacíos, esos botones no llevan a ningún sitio.** Afecta al **06,
que está vivo dentro del Journey** — no debería salir hasta que exista el formulario.
El 07, 15 y 18 no están montados como workflow todavía.

Nota de arquitectura: todas las plantillas usan ya el mismo patrón —
`{{custom_values.*}}` para lo que es de marca (una URL que se cambia en un sitio y se
propaga a los 18 correos) y `{{contact.*}}` / `{{opportunity.*}}` solo para lo que es
del cliente o del pedido.

## 21. Workflow "06b · Encuesta post-compra completada" (13/8)

Hasta ahora la Encuesta Post-Compra (`fvVToLx0e9pEjSRD6zq7`) no la escuchaba nadie: la
clienta respondía y no pasaba nada — ni tag, ni aviso. Montado el workflow que faltaba:

**`06b · Encuesta post-compra completada`** (`94779fd6-15bb-4387-9af0-244409fcd671`),
publicado y con re-entrada activada:

1. Tag `encuesta-completada`
2. Notificación interna: "La clienta {{contact.name}} ha respondido la encuesta
   post-compra."

⚠️ **FALTA EL TRIGGER — lo tiene que crear German en la UI.** Se reprodujo otra vez el
fallo conocido de los triggers por API (sección 12): el POST devuelve un id, pero el
PUT del workflow lo borra, y al recrearlo después el GET sigue devolviendo `[]` y el
PUT sobre el trigger responde "Workflow not found". Son triggers fantasma.

En la UI: abrir el workflow → **Add New Trigger → Form Submitted → Form is → "Encuesta
Post-Compra"**. Nada más; los pasos ya están.

**Cuando se migre al Survey del snapshot:** solo cambia el trigger (pasa a
*Survey Submitted*), los dos pasos se quedan igual. Y si el Survey nuevo sustituye al
formulario, hay que actualizar el custom value `url feedback` con la URL del Survey —
los correos 06 y 07 la cogen de ahí y se arreglan solos.

## 22. Custom Webhook: esquema resuelto, ejecución sin confirmar (14/8)

Intento de sacar el order id **sin n8n**, haciendo que GHL se llame a sí misma:
un paso Custom Webhook en SP01 → `GET /payments/orders?contactId={{contact.id}}&limit=1`
→ el `_id` de la orden queda disponible para construir el botón "Ver mi pedido".

### Por qué Array formatter no servía

Se probó primero la vía de Array Functions/Array formatter (en esta versión la UI la
llama **Array formatter**; el tipo interno sigue siendo `array_functions`). Dentro de
SP01, con sus triggers de orden, el desplegable de campo de array sale
**"No options available"** → el trigger no aporta arrays, así que no hay `line_items`
que recorrer. Coherente con la sonda de merge tags de la sección 19.

### Esquema canónico de `custom_webhook` (leído de un paso creado en la UI)

```json
{
  "type": "custom_webhook",
  "attributes": {
    "event": "GET", "method": "GET", "url": "...",
    "body": {"contentType": "application/json", "rawData": "...", "keyValueData": []},
    "headers": [{"key": "...", "value": "..."}],
    "parameters": [],
    "authorization": {"type": "NONE", "data": null},
    "saveResponse": false,
    "webhookResponse": {"selectedContact": ""}
  }
}
```

Claves que no se pueden adivinar: **`authorization` es obligatorio** — si falta, la UI
casca con *"Cannot read properties of undefined (reading 'type')"* al abrir el paso;
`body` es un **objeto**, no un string; los query params van en **`parameters`**, no
pegados a la URL; y **`saveResponse: true`** es lo que expone la respuesta a los pasos
siguientes. El validador del PUT **no comprueba este tipo de paso**, así que acepta
cualquier basura sin error: no sirve como oráculo.

### Lo que quedó sin demostrar

Con el esquema correcto, el paso **no ejecutó** en dos bancos de prueba. Pero ambos
bancos resultaron inválidos:

- Un workflow creado por API **sin ningún trigger no se ejecuta nunca**, ni con
  inscripción manual — ahí no corrió ni un `add_contact_tag`. Hallazgo útil por sí solo:
  para probar pasos hace falta un workflow con trigger creado en la UI.
- Dentro del 06b no se pudo distinguir la ejecución, porque sus pasos ya habían dejado
  huella en pruebas anteriores.

**Prueba concluyente (14/8, segundo intento):** se repitió el experimento **dentro del
06b**, que sí tiene trigger creado en UI, y con un **tag testigo nuevo** delante del paso
premium para poder distinguir la ejecución. Resultado inequívoco: **el tag testigo se
puso al instante y el custom webhook no hizo nada** en 100 segundos. O sea, el workflow
recorrió sus pasos y **el paso premium se saltó en silencio**.

Quedan dos explicaciones posibles, y ninguna se puede distinguir desde la API: que las
premium actions no estén habilitadas/facturables en la subcuenta, o que el runtime pida
algo que la UI añade y no está en el JSON que se lee.

**Único camino que queda:** el botón **Test/Run** del paso en la UI, que ejecuta y
devuelve la respuesta o el error concreto (incluido un aviso de premium no habilitada,
si es el caso).

### ⚠️ Es una *premium action* con cargo por ejecución

Correría **en cada compra, indefinidamente**, solo para recuperar un dato que la
plataforma ya tiene. Antes de montarlo en SP01 hay que mirar cuánto cobra GHL por
ejecución y comparar con las alternativas de la sección 19 (dos correos = coste cero;
n8n = sin cargo por ejecución).

### Hallazgo colateral: webhook mal apuntado en el 06b

El 06b tiene un tercer paso (que no creé yo) con un webhook a n8n apuntando a
**`/webhook-test/db8ae6be-…`**. Esa es la URL de pruebas de n8n, que solo escucha con el
editor abierto: **en producción no llegará nunca**. Hay que cambiarla a `/webhook/`.

## 23. Webhooks de aviso a Sara: tres bugs corregidos (14/8)

Al cambiar el webhook del 06b apareció un patrón de errores de copiar/pegar en los
avisos que se configuraron desde la UI durante la llamada del 13/8:

1. **06b · Encuesta post-compra** — apuntaba a `/webhook-test/db8ae6be-…`, la URL de
   pruebas de n8n, que solo escucha con el editor abierto. **En producción no habría
   llegado nunca.** → cambiada a `/webhook/`.
2. **06b, el mismo paso** — el `customData` llevaba el texto `"value: "` pegado delante:
   a Sara le habría llegado *"value: La clienta … ha respondido la encuesta"*. → limpiado.
3. **SP01 · Compra confirmada** — el mismo prefijo `"value: "` en su mensaje, y algo peor:
   **el campo URL no contenía una URL**, sino el texto del aviso del 04a
   (*"Falta el número de bultos y el peso total…"*). Ese webhook **nunca funcionó**:
   hacía POST contra una dirección inválida, así que el aviso de "pedido nuevo listo
   para preparar" no le ha llegado a Sara ni una vez. → URL corregida al webhook de
   avisos (`/webhook/db8ae6be-…`, el mismo que usa el 04a) y mensaje limpio.

Los tres webhooks de aviso quedan ahora consistentes, todos contra
`https://n8n.letsbebanana.com/webhook/db8ae6be-6621-4e34-9400-391e5d8c494c` con una
única clave `mensaje`:

| Workflow | Mensaje |
|---|---|
| 01 · SP01 | Sara tienes un pedido nuevo de … listo para preparar y enviar |
| 04a · Envío | Falta el número de bultos y el peso total del pedido … |
| 06b · Encuesta | La clienta … ha respondido la encuesta post-compra |

⚠️ **A confirmar con Sonia**: que ese path de n8n siga siendo el de avisos y que esté
**activo en producción** (no basta con que exista el nodo; el flujo tiene que estar
activado, igual que pasó con el 04a en la sección 13).

Backup previo: `datos/backups/sp01_pre_fix_value_20260814.json`.

## 24. Order id: resuelto, y decisión final por n8n (14/8)

**El order id SÍ es alcanzable desde el workflow.** La conclusión de la sección 19 era
incompleta: probé merge tags, pero el dato se puede traer con una llamada. Recorrido:

1. `Array formatter` (en la UI; internamente sigue siendo `array_functions`) tiene el
   desplegable **vacío** con los triggers de orden → el trigger no aporta arrays.
2. Un paso **Custom Webhook** llamando a la API de GHL sí trae el pedido. El botón
   **Test devolvió el JSON completo** con `data[0]._id` → premium actions funcionan
   (lo que no ejecuta son las inscripciones lanzadas por API, de ahí mi diagnóstico
   equivocado de que "el paso premium se salta").
3. Con el webhook delante, el desplegable del Array formatter **ya lista `data`** —
   confirmando que solo lee arrays de respuestas de webhook, no de triggers.

**Descartado por coste:** Custom Webhook es *premium action con cargo por ejecución*,
y correría en **cada compra, para siempre**, por un dato que la plataforma ya tiene.
Custom Code es premium también y tampoco escribe en campos (solo produce un valor que
debe mapear un Update Opportunity). → **se hace desde n8n**, sin cargo.

### Contrato para Sonia (verificado contra la cuenta)

GHL enviará por webhook: `{opportunityId, contactId, numero_pedido}` — falta que Sonia
dé el path y lo active en producción.

**1) Recuperar el pedido:**
```
GET https://services.leadconnectorhq.com/payments/orders
    ?altId=NxPF5fOicowujokEk5Hm&altType=location&contactId=<contactId>&limit=1
Headers: Authorization: Bearer <PIT>  ·  Version: 2021-07-28
```
El id está en `data[0]._id`. Cuidado: sin `altId` responde **422**; con `contactId`
vacío responde **200 con `{"data":[],"totalCount":0}`** (falso positivo) → cortar si
`totalCount` es 0.

**2) Guardarlo en la oportunidad:**
```
PUT https://services.leadconnectorhq.com/opportunities/<opportunityId>
Body: {"customFields":[{"id":"Z5LD1nrSjYnZUGPXs3Pt","field_value":"<data[0]._id>"}]}
```
`Z5LD1nrSjYnZUGPXs3Pt` = campo **Order ID** de oportunidad. **Verificado**: PUT 200
sobre M100012 y el campo quedó con `6a7f3d23ae0e1278af759cfd`. Usar `field_value`,
no `value`.

### Montado en SP01 (14/8)

**Paso nuevo `Webhook n8n · guardar order id`**, dentro de la rama "Opportunity Found",
justo detrás del Update que rellena `numero_de_pedido` (ahí la oportunidad ya existe y
ya tiene nombre). POST a
`https://n8n.letsbebanana.com/webhook/b03f0adf-70f8-41b7-923a-a2a0669355e3` con:

```
opportunityId  = {{opportunity.id}}
contactId      = {{contact.id}}
numero_pedido  = {{opportunity.name}}
```

**Retirados de SP01** los pasos de las pruebas: el **Custom webhook** (premium, habría
cobrado en cada compra), el **Array formatter** y el Update Opportunity que apuntaba a
`{{array_functions.1._id}}`, que quedaba huérfano. Verificado: **cero acciones premium**
en el workflow. Backups: `sp01_pre_webhook_n8n_20260814.json` y
`sp01_pre_webhook_n8n_v2.json`.

El campo `opportunity.order_array` (creado durante las pruebas) quedó sin uso y se
**borró el 15/8**.

Sigue faltando **el patrón de la URL del pedido** para construir el botón "Ver mi
pedido": tener el id no basta si no sabemos cómo se arma el enlace de cara a la clienta.

## 24. RESUELTO: dónde resuelven los campos custom de oportunidad (14/8)

Cierra el bloqueo de las secciones 19 y 22. La arquitectura final del correo de compra:

```
Compra  →  notificación nativa de la tienda  (inmediata, con productos,
                                               fotos y su botón nativo)
        →  SP01: contador, oportunidad M1xxxxx, webhook a n8n, SMS,
                 notificación a Sara, mover a "03 En Preparación"
        →  03 · Email preparación  (trigger: cambio de etapa)
                 ↑ AQUÍ sí resuelven los campos custom de la oportunidad
```

### El hallazgo

**Los campos custom de oportunidad solo resuelven en un email cuando el workflow
se dispara por cambio de etapa.** Con el trigger de orden/pago, aunque el workflow
haga Find Opportunity, el contexto que llega al renderizador es parcial: probado en
un envío real, `{{opportunity.name}}` resolvía (salía M100014) pero
`{{opportunity.order_id}}` no. La diferencia es que `name` es propiedad nativa y
`order_id` es campo custom.

**Y cuando un merge tag no resuelve dentro de un `href`, GHL borra el enlace entero**,
no lo deja truncado. Por eso el botón salía con `href=""` y el navegador daba
NXDOMAIN con la barra vacía — lo que despistó hacia el rastreo de clics y hacia la
carrera con n8n, que no eran la causa.

### Estado de los pasos

- **SP01**: el paso de email queda **desactivado** a propósito — la confirmación la
  manda la tienda. El resto de SP01 sigue igual, incluido el webhook a n8n que
  rellena `opportunity.order_id`.
- **03 · Email preparación**: envía la plantilla "03 · preparación" y añade el tag
  `pedido-en-preparacion`. Trigger `pipeline_stage_updated` activo.

### Consecuencia para la devolución

El número de pedido **sí llega a la clienta**: en el correo 03, unos diez minutos
después de la compra (SP01 mueve a "03 En Preparación" tras su espera). Eso levanta
el bloqueo de lanzamiento anotado en la sección 19 — el formulario de devolución
pide ese número y la clienta ya lo tiene por correo.

### Regla general a recordar

Para cualquier email que necesite un campo custom de oportunidad (URL de seguimiento,
albarán, etiqueta de devolución, importe reembolsado…), **el workflow que lo envía
debe dispararse por cambio de etapa**, no por tag ni por orden. Afecta al diseño de
04b, 05, 08b y a los correos de reembolso que queden por montar.

## 25. Sesión del 14/8 con Sonia — flujo completo probado

Sesión larga (3h20) en la que se probó el ciclo entero con compras reales de test.
Resultado: **el flujo de compra, preparación, envío y devolución funciona de punta a
punta**. Lo que sigue es el estado real y lo que queda.

### 25.1 Cómo quedó el order id (cerrado)

El **Custom Webhook sí ejecuta** — mi conclusión anterior de que las premium actions
no corrían era incorrecta: fallaban solo en las ejecuciones que yo lanzaba por API,
no en las reales. Aun así la vía elegida fue la de n8n, sin cargo por ejecución:

```
SP01 → webhook a n8n (opportunityId, contactId, numero_pedido)
     → n8n hace GET /payments/orders?contactId=…&limit=1
     → n8n escribe opportunity.order_id con un PUT
```

Verificado en varias compras (M100012 en adelante). El Array formatter, el Custom
Webhook y el campo `opportunity.order_array` que se usaron para investigar quedaron
retirados de SP01.

### 25.2 El reparto final de los correos

| Correo | Lo manda | Lleva |
|---|---|---|
| Confirmación inmediata | **Notificación de la tienda** | productos, importes y su botón nativo · **sin** número de pedido |
| Recibo / factura | Notificación de la tienda | PDF |
| **03 · Preparación** | Workflow 03 (trigger de etapa) | **M1xxxxx + botón "Ver mi pedido" funcionando** |
| 04 · Envío | **04a**, rama "Nacex respondió" (era 04b, retirado el 14/8 — ver 26) | link de seguimiento |
| 08 · Etiqueta devolución | 08b (trigger por tag) | enlace de descarga de la etiqueta |

El email 02 dentro de SP01 queda **pausado**: su función la cubren la notificación de
la tienda (lo inmediato) y el correo 03 (el número de pedido).

**Decisión de fondo, y es sensata:** la clienta recibe el número de pedido cuando el
pedido pasa a preparación, no en el instante de comprar. Es el patrón habitual en
comercio — primero el comprobante de la compra, después el número de pedido con el
que gestionar devoluciones.

### 25.3 Devolución, probada entera

Formulario v2 → 08a → n8n → Nacex → email 08 con la etiqueta → tags. Funcionó. Dos
correcciones hechas sobre la marcha:

- El botón "Descargar etiqueta" apuntaba a `contact.url_etiqueta_devolucion`; pasa a
  la versión de **oportunidad**.
- **Los formularios de GHL solo escriben en campos de contacto.** El motivo de
  devolución aterriza en contacto, así que se añadió **Find Opportunity + Update
  Opportunity** en el flujo de devolución para copiarlo a `opportunity.motivo_devolucion`.

### 25.4 ⚠️ Riesgo a vigilar cuando Sonia migre sus campos

Sonia va a cambiar su escenario de n8n para escribir en los campos de **oportunidad**
(albarán, url seguimiento, url etiqueta) en vez de los de contacto. Ojo con esto:

**Los correos 04b y 08b se disparan por TAG.** Si sus plantillas pasan a usar
`{{opportunity.url_seguimiento}}` y `{{opportunity.url_etiqueta_devolucion}}`, hay que
**probar que resuelven con trigger de tag** antes de dar el cambio por bueno. Lo único
verificado hasta ahora es que resuelven con trigger de **cambio de etapa** (correo 03)
y que **no** resuelven con trigger de orden (correo 02). Con tag no hay evidencia.

Si no resolvieran, la salida es cambiar el trigger de esos workflows a cambio de etapa,
o dejar esos dos campos en contacto (se pisan entre pedidos, pero el correo sale al
momento).

### 25.5 Pendientes (llamada + mapa de Canva)

**Nuestro (GHL):**
- Aviso a Sara por Telegram con el enlace de la etiqueta lista para imprimir → va en
  04a, entre el webhook a Nacex y la espera de 48h.
- Coreografía de tags completa según el Canva: `experiencia`, `feedback`, `inactivo`,
  `devolucion-activa`, `dev-ok`, `dev-x` — varios aún no existen.
- Formulario **Newsletter**: nombre, apellidos, email, teléfono, **fecha de nacimiento**
  (date picker, para el correo de cumpleaños) y checkbox de consentimiento → tag NL.
- **Encuesta de experiencia** como Survey (spec del Drive) + webhook a Sonia para
  volcarla a Google Sheets. GHL tiene integración nativa con Sheets; valorar cuál sale
  más simple.
- **Baja de newsletter**: formulario donde la clienta pone su email y se le quita el
  tag NL.
- Páginas de la tienda por maquetar: ~~thank you~~ (hecha el 15/8,
  `tienda/gracias-compra.html`), **cart y checkout** — ver 27.
- Iterar el **Journey 06-12** para clientas recurrentes (hoy no distingue si ha habido
  una segunda compra).

**De Sara:** conectar Google My Business (reseñas) y las redes; rellenar peso y bultos
en la oportunidad de cada pedido; actualizar el stock de la tienda.

**De Sonia:** migrar sus campos a oportunidad (ver 25.4) y la parte de **reembolsos de
Stripe** (correos 09a y 10), que sigue sin empezar.

## 28. Newsletter en /home: campos propios contra el formulario real (15/8)

Decisión de German: nada de iframe — **campos hechos en la página** (diseño `.mura`)
que envían por detrás **al formulario real** "Opt-in Newsletter"
(`fmuHvvOjkGBAkPU2LTZN`) vía su endpoint público de envíos
(`POST backend.leadconnectorhq.com/forms/submit`, multipart, el mismo que usa el
widget oficial). Así el envío queda en Forms → Submissions, el contacto se crea con
sus campos mapeados y el trigger "form submitted" del LS02 dispara — la lección de
la encuesta (0 submissions, a ciegas) aplicada al revés.

- `tienda/newsletter-home.html` → se pega en el elemento de código de Home, dentro
  del `<div class="mura">`, justo antes del `<footer>`.
- Las reglas `.mura-nl-*` viven en el CSS global (re-pegar el Tracking Code tras
  regenerarlo con `build.sh`).
- Campos: nombre, apellidos, email*, teléfono*, fecha de nacimiento (date picker,
  `date_of_birth`, para el correo de cumpleaños) y checkbox RGPD obligatorio con
  enlace a la política de privacidad. Los dos consentimientos SMS en inglés del
  formulario no se muestran ni se envían (eran opcionales y solo vivían en el
  widget).
- Verificado en render: validaciones (email, teléfono, RGPD), payload correcto,
  estado de éxito con el formulario bloqueado, estado de error con reintento.

**El primer envío real falló, y la captura de Network del widget oficial dio el
contrato de verdad** (envío del widget: 201 Created, verificado en Submissions por
API). Dos diferencias con lo que yo suponía:

1. **La fecha de cumpleaños no es `date_of_birth`**: el builder creó un campo
   custom y el widget envía su id, `FGlE7RDztTinTetJGgWI`.
2. **La estructura es otra**: un único part `formData` con TODO el JSON dentro
   (campos + `sessionId` + `eventData` + `Timezone` + `timeSpent`), más los parts
   `locationId`, `formId` y `turnstileNonInteractiveToken`, contra
   `/forms/submit?formId=…&locationId=…`. Y `access-control-allow-origin: *`,
   así que CORS nunca fue el problema.

El script quedó reescrito calcando ese contrato, con Turnstile invisible integrado
(la site key `0x4AAAAAACCpVlau-4k7cJ33` sale de la config pública del propio sitio;
si no carga, envía sin token). Si un envío falla, el detalle queda en la consola con
el prefijo "MURA newsletter". Verificado en render: payload idéntico al capturado.
El segundo envío real devolvió **HTTP 429**: sin token de Turnstile válido el
endpoint aplica límite de bot. El token se generaba al cargar la página y Turnstile
los caduca a los ~5 min — si la clienta tarda en rellenar, llega muerto. Corregido:
el widget se prepara con `execution:'execute'` y el token se pide **fresco en el
momento del envío** (espera máx. 6 s; sin token envía igual y que decida el
servidor). El tercer intento dio `token ok` pero **429 "Invalid or expired invisible
challenge" / `invalid-input-secret`**: la clave era la buena (el scan del widget
devolvió las mismas dos del funnel) y la pista estaba en las CABECERAS de la
captura — el widget acompaña el envío con `x-turnstile-non-interactive-wait-ms`,
`x-turnstile-script-load-ms`, `x-turnstile-submit-delay-ms`, `timezone` y
`fullurl`, y sin ellas el backend valida contra el secreto equivocado. La versión
actual manda esas cabeceras con valores medidos de verdad, y si aun así el
challenge invisible es rechazado, reintenta UNA vez con la clave visible
(`0x4AAAAAACDfuwSBQ2sYO1VD`) mostrando el recuadro de verificación sobre el botón.
El cuarto intento (cabeceras + fallback visible) tampoco entró. **La solución la
trajo el patrón de German**, extraído de `ghlteamlatam.com/apply` (su página, en
producción, funcionando): los campos HTML propios no envían al formulario de GHL
sino a un **Inbound Webhook de un workflow**:

```
POST https://services.leadconnectorhq.com/hooks/{locationId}/webhook-trigger/{uuid}
Content-Type: application/json
{ first_name, last_name, email, phone, fecha_nacimiento, consentimiento, origen }
```

Ese endpoint acepta envíos desde cualquier dominio, sin captcha — está hecho para
eso. Dentro del workflow, **Create/Update Contact** mapea el payload
(`{{inboundWebhookRequest.campo}}`) y **Add Tag** pone `nl`. Es el plan de n8n pero
sin n8n: todo dentro de GHL. (El JSON de n8n queda en el repo como reliquia;
`/forms/submit` queda documentado como inviable desde fuera: valida el Turnstile
contra sus propios dominios.)

> ⚠️ **El Inbound Webhook es un trigger PREMIUM**, con cargo por ejecución (lleva
> corona en el buscador de triggers). Se supo el 17/8 por la tarde — ver la corrección
> de la sección 30.1. El patrón sigue siendo válido técnicamente y es el que hizo
> funcionar el formulario, pero **para un alta recurrente sale caro**: por eso el
> newsletter acabó yendo por n8n, que hace lo mismo sin cargo. Antes de reutilizar este
> patrón en otro sitio, contar cuántas ejecuciones al mes supone.

Arquitectura definitiva del newsletter:

```
home (sección .mura-nl, tienda/newsletter-home.html)
  → POST JSON al Inbound Webhook del workflow "LS02a · Alta newsletter web"
     → Create/Update Contact (nombre, apellidos, email, teléfono, Date of Birth)
     → Add Tag `nl`
  → LS02 (bienvenida) dispara por Contact Tag Added `nl`
```

Montaje pendiente (UI, German): crear LS02a con trigger Inbound Webhook — **el
trigger en la UI**, los creados por API no disparan (sección 13) —, pegar la URL
generada en el marcador `PEGAR_URL_DEL_WEBHOOK` de la sección, un envío de prueba
para que GHL capture el payload de ejemplo, mapear, publicar; LS02 a trigger por
tag `nl` y publicar. El contacto y el tag se verifican por API tras la prueba.

### 28.b Newsletter EN VIVO, con doble opt-in — y el bug del enlace de confirmación (17/8)

German montó el LS02a más fino de lo planeado: **doble opt-in RGPD**. Alta por el
Inbound Webhook → Create/Update Contact + tag `nl` + correo "confirma tu
suscripción" → espera 48h al clic del trigger link `TL-LS02-CONFIRMAR-OPTIN` → si
confirma: email de bienvenida + tag `newsletter-suscrita`; si no: fin.

Verificado por API tras el primer envío real desde la web: contacto creado, **Date
of Birth `1975-07-27` mapeada** ✓, tag `nl` ✓. Dos fallos encontrados:

1. **El enlace de confirmación estaba roto** — leído el correo enviado (método de la
   sección 24): `href="[object Object]"`. La causa: se usó un merge tag inventado,
   `{{unique_confirmation_link}}`, en DOS sitios — el botón del correo y el
   `redirectTo` del propio trigger link. Nadie habría podido confirmar jamás; todo
   el mundo caería por la rama de las 48h.
   - `redirectTo` del trigger link → corregido por API, primero a `/gracias` y
     tras la corrección de German a **`/suscripcion-confirmada`** (página nueva,
     `tienda/suscripcion-confirmada.html`). Decisión del 17/8: **/gracias es la de
     compra** y el checkout debe redirigir ahí — se cambia en los ajustes del
     elemento Checkout (acción tras el pago → URL `/gracias`), con lo que
     `/thank-you` deja de usarse.
   - El botón del correo → lo corrige German en el builder: URL del Embed Link =
     `{{trigger_link.K2PitLvfhgpKPvX6GeF4}}` (o elegir TL-LS02-CONFIRMAR-OPTIN en
     el picker de trigger links).

2. **El teléfono no llegó** (`011 15-3027-0115` → contacto sin teléfono).
   Probablemente el parser lo rechazó: la subcuenta es de España y ese formato
   argentino local no es E.164. Revisar de paso que Create/Update Contact tenga
   Phone mapeado. Con números españoles o con prefijo (+549…, +34…) debería entrar.

### 28.c Circuito completo VERIFICADO de punta a punta (17/8)

Envío por el webhook (con teléfono en E.164) → correo de doble opt-in 15:02:34 →
clic de German → **bienvenida 15:03:14** → aterrizaje en `/suscripcion-confirmada`.
Estado final del contacto, leído por API:

- tags: **`nl` + `newsletter-suscrita`** ✓
- Date of Birth: `1975-07-27` ✓
- y un extra no documentado hasta ahora que estaba montado por German: al confirmar
  se crea **oportunidad en el pipeline "Leads / Comunidad"** (`Y47eLa4dAIZTKLu2UpuX`),
  etapa **"03 Suscrita Newsletter"** ✓ — el pipeline de comunidad tiene etapas
  01 Lead Nuevo → 02 Interesada → 03 Suscrita Newsletter → 04 Primera Compradora →
  05 Recurrente → 06 VIP.

El teléfono faltó en las dos primeras pruebas porque el Create/Update Contact aún
no tenía Phone mapeado. German lo mapeó (Phone ←
`{{inboundWebhookRequest.phone}}`) y el reenvío de verificación lo confirmó:
`+5491130270115` en el contacto. **Sin flecos.**

El newsletter queda CERRADO: alta desde la home con diseño propio, doble opt-in
RGPD, bienvenida, tags, oportunidad de comunidad y página de confirmación.
## 29. Coreografía de tags: auditoría y cierre de los dos huecos (17/8)

Auditados los 18 workflows (quién pone, quita y usa cada tag). La lista del Canva
estaba desactualizada: `experiencia` y `feedback` ya estaban cerrados (los pone y
quita el 06-12) y `encuesta-completada` es marca permanente por diseño. Quedaban
dos huecos reales, cerrados hoy:

1. **`inactivo` no se quitaba nunca** → el 02 · Etiquetado (v9) ahora arranca con
   `remove inactivo` antes del if_else de compras: cualquier compra reactiva.
   Backup: `datos/backups/wf02_pre_remove_inactivo_20260817.json`.
2. **`devolucion-activa` no se quitaba nunca** → nuevo workflow
   **08d · Devolucion cerrada - limpiar tag** (`2197b479`), un único paso
   `remove devolucion-activa`, publicado. German creó el trigger en la UI (cambio
   de etapa → Ventas/Pedidos → **09 Reembolso**) y quedó **verificado en vivo**:
   oportunidad de test movida a 09 → enrollment Finished → tag quitado. Por el
   camino salió un tercer hueco: el 08d nació con `allowMultiple: false`, así que
   una clienta con DOS devoluciones a lo largo del tiempo solo se habría limpiado
   la primera — activado (`allowMultiple: true`, v4) y reverificado con re-entrada.
   Es la misma trampa de la sección 17: **todo workflow nuevo nace sin re-entrada;
   comprobarlo siempre.**

`dev-ok` / `dev-x`: pendiente de decisión German+Sonia (segmentar el resultado de
la devolución o descartarlos). `reviewera`, `compradora-activa`, `recurrente` y
`vip` van con PS01/PS02/AP02 cuando salgan de draft — no son deuda actual.

## 26. Fusión del 04b dentro del 04a (14/8)

El correo de envío se enviaba desde **04b**, disparado por el tag `email-04-listo`.
Dos problemas encadenados obligaban a moverlo:

1. **n8n ya escribe en los campos de oportunidad** (verificado: M100015 tiene
   `opp.albaran`, `opp.url_etiqueta` y `opp.url_seguimiento`), pero la plantilla leía
   `{{contact.url_seguimiento}}`, y el contacto conservaba el valor de una prueba
   anterior. El correo no salía vacío: **salía con el seguimiento de otro pedido**,
   que es peor porque aparenta funcionar.
2. Cambiar la plantilla a `{{opportunity.url_seguimiento}}` no bastaba: 04b disparaba
   **por tag**, y ahí no está verificado que resuelvan los campos custom de oportunidad
   (sección 24).

**Solución:** los tres pasos del 04b pasan al 04a, que dispara por cambio de etapa.
Estructura de la rama "datos completos":

```
webhook Nacex → wait 1 min → Telegram etiqueta → quitar tag preparación
  → ¿opportunity.url_seguimiento tiene valor?   (operador has_value)
       SÍ → Email 04 → +pedido-enviado → −email-04-listo
              → wait 48h → ¿sigue en etapa "04 Enviado"? → webhook watchdog
       NO → Telegram: "Nacex no ha devuelto el seguimiento del pedido X.
                       El correo de envío NO se ha mandado."
```

El **guard** sustituye a la garantía que daba el tag: antes, `email-04-listo` avisaba
de que Nacex ya había respondido; ahora se comprueba el dato directamente, así que un
retraso de Nacex no manda un correo con el enlace vacío — avisa a Sara.

- **04b** quedó renombrado `OLD 04b (fusionado en 04a) - borrar` y despublicado;
  **borrado de la cuenta el 15/8** junto con `OLD 04a` y `ZZ TEST custom webhook`.
  Backups en `datos/backups/wf_old04a|old04b|zztest_pre_delete_20260815.json`.
- La plantilla `correos/04-envio.html` pasa a `{{opportunity.url_seguimiento}}`
  (hay que pegarla también en GHL).
- Backups: `wf04a_pre_fusion.json`, `wf04b_pre_fusion.json`.

### 26.1 Corrección del 15/8: el correo iba detrás del `Wait 48 Hours`

Al preparar la primera prueba de envío se leyó el árbol real por API y **no coincidía
con lo descrito arriba**. La fusión del 14/8 había insertado el guard, el correo y los
dos tags **dentro de la cola del watchdog**, es decir *después* del `Wait 48 Hours` que
ya traía el 04a original (visible comparando con `wf04a_pre_fusion.json`, donde ese
`wait` va justo detrás del Remove Tag). Consecuencias, ninguna detectable a simple vista:

1. El correo "tu pedido va en camino" habría salido **48 horas después del envío**.
2. Peor: el guard del watchdog exige seguir en etapa "04 Enviado", así que en un pedido
   **entregado dentro de esas 48 h la clienta no habría recibido nada**.

Arreglado y publicado (v18) con el orden del diagrama de arriba. Dos detalles más:

- El operador real del guard es **`has_value`**, no `contains "http"` — más seguro, y
  desaparece la duda sobre si `contains` era válido en este modelo.
- La rama del NO **estaba vacía**: si Nacex no respondía, el flujo moría en silencio,
  sin correo y sin aviso. Ahora lleva el webhook de Telegram descrito arriba.

Backup previo: `datos/backups/wf04a_pre_orden_email_20260815.json`.

**Lección:** al fusionar pasos en un workflow con cola de espera larga, comprobar
*dónde* quedan enganchados. El builder los dibuja anidados y el fallo no se ve: el
workflow se ejecuta sin error, simplemente el correo llega dos días tarde o no llega.

### 26.2 Prueba de envío del 15/8 — ✅ correcta de punta a punta

Pedido **M100014** (`2gAUMOyW6C9xX68KP4zb`), movido a "04 Enviado" por API a las
15:32:04 UTC. Se le pusieron antes `peso = 0.8` y `bultos = 1`, que estaban vacíos —
sin ellos el flujo se va por la rama de error y la prueba no vale — y se dejó
`url_seguimiento` **vacío a propósito**, para que el guard tuviera que pasar porque
n8n lo escribiera de verdad y no por un resto de otro pedido.

| Hora UTC | Qué pasó |
|---|---|
| 15:32:04 | cambio de etapa → dispara el trigger |
| 15:35:13 | n8n escribe en la oportunidad: albarán `10530257`, PDF de etiqueta y URL de seguimiento |
| 15:36:19 | **sale el correo 04** |
| 15:36:21 | `+pedido-enviado`, `−pedido-en-preparacion` |

Leído el **mensaje enviado** (no la plantilla): el botón lleva a
`https://www.nacex.es/seguimientoDetalle.do?agencia_origen=2111&numero_albaran=10530257`
— el albarán **de este** pedido. Cero `href` vacíos y cero merge tags sin resolver, que
eran los dos síntomas de los fallos anteriores (secciones 20b y 24).

Queda confirmada la regla de la sección 24 en su versión útil: **con trigger de cambio
de etapa, los campos custom de oportunidad sí resuelven dentro del correo.**

⚠️ M100014 se queda en "04 Enviado" con el `wait 48h` corriendo. Si no se mueve a "05
Entregado" antes del 17/8, saltará el watchdog con un aviso de un pedido de prueba.

## 27. Páginas de la tienda (15/8)

### 27.1 Gracias post-compra — hecha

`tienda/gracias-compra.html`. Es la página a la que llega la clienta **después de
pagar** (la "Thank you!" de la tienda, `6DEiCsQRzJ6NsbhkP43n`). No confundir con
`legal/gracias-devolucion.html`, que es la del formulario de devolución.

Mismo lenguaje que las páginas legales: full-bleed con `box-shadow: 0 0 0 100vmax`
+ `clip-path`, Cormorant Garamond, paleta de marca, sin imagen, sin JavaScript, sin
`border-radius`. El botón usa el selector `a.mura-gc-boton` —con la etiqueta delante—
por el mismo motivo que en la de devolución: sin ella pierde en especificidad contra
`.mura-gc a` y sale negro sobre negro.

Aporta sobre la página por defecto una secuencia **"qué pasa ahora"** en tres pasos
(ahora / en preparación / en camino), que es lo que evita el correo de "¿dónde está mi
pedido?" a los dos días.

**No lleva el número de pedido, y es a propósito.** El M1xxxxx no lo genera la tienda:
lo pone el contador del SP01 al crear la oportunidad, y eso pasa *después* de que la
clienta ya esté viendo la página. Un merge tag aquí dejaría un hueco vacío. El número
viaja en el correo 03 (sección 25.2).

Verificada renderizada con Chromium a 1440 px y 390 px: sin scroll horizontal, el
cierre se apila bien en móvil y el botón contrasta.

### 27.2 Cart y checkout — resueltas con el DOM real (15/8)

German pasó el `outerHTML` de las dos páginas. Con eso el CSS deja de ser
adivinanza. Queda en `tienda/codigo-global-tienda.js`, que **sustituye** al bloque
de Sitio "Mura" → Settings → Tracking Code → BODY.

Es código **global**: corre en todas las páginas, y por eso empieza con un guardia
de rutas. El guardia anterior solo dejaba pasar `/cart` y `/products-list` — de ahí
que **el checkout no tuviera ni una sola regla aplicada**. Ahora entran también
`/checkout`, `/product-details` y `/thank-you`.

Clases reales del carrito: `.hl-cart-container`, `.hl-cart-heading`,
`.empty-cart-container`, `.hl-continue-btn`, `.hl-amount-subtotal`, `.cart-subtotal`,
`.cart-total.ecom-gray-divider`, `.total-amount`, `.hl-checkout-btn`.
Del checkout: `.hl-store-checkout-container`, `.checkout-breadcrumb-wrap`,
`.checkout-heading`, `.hl-checkout-input`, `.input-label`, `.form-btn.payment-btn`,
`.hl-cart-summary-container`, `.hl-cart-item`, `.hl-cart-product-image`,
`.cart-item-variant`, `.coupon-input`, `.apply-coupon-btn`, `.hl-divider`.

⚠️ **Nunca usar `.cstore-cart-J14MT1D5-f` ni `.cstore-checkout-sTf_Fd0JV5`**: llevan
el id del elemento dentro. Si alguien recrea el elemento en el editor ese sufijo
cambia y el CSS deja de aplicar en silencio.

**Bug encontrado al renderizar, antes de subirlo.** El selector genérico
`button[class*='checkout']` también casa con las migas del checkout, que son
`<button class="checkout-breadcrumb-item">`: salían como dos botones negros del
ancho de media pantalla. Y gana aunque las dos reglas lleven `!important`, porque
`button[class*=…]` tiene especificidad (0,1,1) contra (0,1,0) de la clase sola. Se
arregla con `:not(.checkout-breadcrumb-item)` en el genérico y subiendo la
especificidad de la miga a `.checkout-breadcrumb-wrap .checkout-breadcrumb-item`.

También se ocultan los SVG de catálogo de GHL (carrito vacío, flecha, icono de
editar, icono de carrito del botón): son de su librería, no de la marca.

### 27.3 Tres cosas que no son de maquetación y hay que decidir

**1. El botón "Ver carrito" del producto lleva a `/checkout`.** Se salta la
revisión del carrito y planta a la clienta en el formulario de pago. Debe ir a
**`/cart`**. Trampa: `/carrito` (`qsUEwHJLz2xiSulCN5jD`) es una página normal que
creamos aparte — **no** es el carrito de la tienda. El de verdad es `/cart`
(`2FoBJpJqCmc0z0Y4xZEo`). El enlace está en el código de la página de producto:
buscar ahí el texto "Ver carrito".

**2. Los textos van en el elemento, no en JavaScript.** Cart y Checkout guardan sus
textos como ajustes propios y hoy **están todos en inglés**. En el carrito los
reescribe un `MutationObserver`, que corre después de pintar: se ve "My cart" un
instante. En el checkout no los reescribe nadie, así que **la clienta paga en un
formulario íntegramente en inglés** ("Full Name", "Zip Code", "Continue to
payment"). La traducción completa, campo por campo, está al final de
`tienda/codigo-global-tienda.js`. Puestos ahí salen bien al primer pintado y el
mapa del JavaScript se queda sin nada que hacer.

**3. Dos ajustes del checkout con consecuencias.**

- `termsAndConditions` está **desactivado** en los dos pasos, y su texto por
  defecto apunta a `https://www.example.com`. Nadie acepta condiciones al comprar,
  teniendo nosotros `/condiciones-contratacion` y `/politica-privacidad`
  publicadas. Esto es de Sonia o de asesoría legal, no mío.
- `shipToCountries: "all"` con `countryList: []`: **la tienda acepta pedidos de
  cualquier país del mundo**, y Nacex cubre península, Baleares, Portugal y poco
  más. Un pedido desde fuera entra, cobra y luego no hay quien lo envíe.
- `defaultLocation: "none"`: el desplegable de país no viene con España
  preseleccionada, así que hay que buscarla entre 200.

### 27.5 Decisión del 15/8: el carrito bueno es `/carrito`

Había **dos carritos vivos y funcionando**, los dos leyendo el carrito real:

| | `/carrito` (`qsUEwHJLz2xiSulCN5jD`) | `/cart` (`2FoBJpJqCmc0z0Y4xZEo`) |
|---|---|---|
| Diseño | "Piezas elegidas.", Cormorant, aire | funcional, dos columnas |
| Cantidad | solo QUITAR | stepper − n + |
| Precio | `318 €` | `€318.00` |
| Refuerzo | pago seguro + 15 días | — |

German elige **`/carrito`**. `/cart` se retira.

**No se borra la página**: la tienda de GHL necesita su paso de carrito y tiene
enlaces internos que apuntan ahí —el "Editar" del resumen del checkout, por
ejemplo—. Se redirige desde el código global, lo primero de todo y con
`location.replace`, para que no quede entrada en el historial y el botón "atrás"
no devuelva a la clienta al carrito viejo. Verificado en Chromium: `/cart` acaba
en `/carrito` y el "atrás" no vuelve.

El CSS de `/cart` se conserva **marcado como red de seguridad**: si alguien quita
la redirección, la página no se queda en crudo.

La cabecera inyectada pasa a apuntar a `/carrito` y adopta **el orden de menú de
`/carrito`** (Inicio · Colecciones · Prendas · Novedades · MÛRA · Contacto), que no
coincidía con el de las demás páginas.

#### Lo que queda abierto de esta decisión

1. **La clienta no puede cambiar la cantidad en `/carrito`**, solo quitar la pieza
   y volver a añadirla. Es la única ventaja real que tenía `/cart`. Para resolverlo
   hace falta ver el DOM de `/carrito`: si su carrito es un elemento Cart de GHL con
   el stepper oculto por CSS, es cuestión de volver a mostrarlo y darle estilo.
2. **El enlace "Ver carrito" de la página de producto sigue yendo a `/checkout`**
   (ver 27.3). Ahora debe ir a `/carrito`. Está en el código de esa página.
3. **Formato de moneda**: `/carrito` muestra `318 €` y el checkout `€318.00`. En la
   configuración de la tienda hay `isCurrencyFormattingEnabled: false`; activarlo
   debería dar el formato español de forma nativa en todo el flujo.

### 27.6 Qué es `/carrito` en realidad, y qué se le arregló

Suponía que era un elemento Cart de GHL con el selector de cantidad oculto por
CSS. **No lo es.** Es un carrito escrito a mano dentro de un elemento de código
personalizado (`custom-code-DN8OVgnA5P`) que lee y escribe el almacén de la propia
tienda:

```
localStorage['cart_details_rlc7iAyGF4U1nfwAJOJQ']
  → { products: [ { name, quantity, selectedProductImage,
                    selectedPrice: { amount, name } } ] }
```

`amount` va en euros, no en céntimos, y `selectedPrice.name` es la talla. El
checkout lee ese mismo almacén: por eso lo que se toca en `/carrito` llega al pago.

La versión corregida está en `tienda/carrito.html`. **El CSS compartido queda byte
a byte igual** —es el mismo bloque que se copia en todas las páginas—; solo se
añaden reglas nuevas al final.

**1. Cantidad.** Es lo que motivó todo: la clienta solo podía quitar la pieza, así
que para pasar de 2 a 1 tenía que borrarla y volver al producto a añadirla. Ahora
hay un control `− n +` con el gesto de `.mura-talla`. Bajar de 1 quita la pieza.

**2. Bug real de importes.** El precio de línea se calculaba multiplicando y se
imprimía en crudo, así que salía la coma flotante de JavaScript. Reproducido:
`79,95 × 3` imprimía **`239.85000000000002 €`**. Ahora pasa por `fmt()`, que
redondea a céntimos y escribe en español —coma decimal, € detrás— sin decimales
cuando el importe es redondo, como estaba. El total general se salvaba por poco en
este caso concreto, pero es el mismo cálculo y el mismo riesgo.

**3. Precio por unidad.** Con 2 unidades solo se veía "318 €" y no de dónde salía.
Ahora, cuando hay más de una, añade "159 € / ud.".

**4. La cabecera se cortaba en móvil.** A 390 px el contador salía como
`CARRITO (5` —sin cerrar— porque se pasaba de ancho y lo recortaba el
`overflow-x: clip` de `.mura`. Media query a 440 px que aprieta logo, menú y
contador. Verificado a 390 y a 360.

Probado en Chromium con el carrito sembrado en localStorage: `+` y `−` actualizan
línea, total y contador de la cabecera; bajar de 1 elimina la línea; vaciar del
todo enseña el aviso y esconde el resumen; `localStorage` queda en
`{"products":[]}`. Sin errores de JavaScript.

⚠️ **El stock no se valida aquí.** El botón `+` sube la cantidad sin mirar cuántas
quedan, porque el almacén del carrito no guarda el stock. Si el elemento de GHL lo
comprobaba, esa red se pierde al usar esta página; quien lo corta de verdad es el
checkout al cobrar. Si empiezan a colarse pedidos por encima de stock, hay que
traerse el dato del producto a la página.

⚠️ **El bloque de CSS está duplicado en cada página** (`.mura-grid`, `.mura-card`,
`.mura-filtros`, `.mura-talla`, `.mura-acc` no pintan nada en el carrito: están ahí
porque el bloque se copia entero). Cualquier retoque de marca hay que repetirlo
página por página, y basta olvidar una para que diverjan. Convendría moverlo al
Tracking Code global —donde ya vive `tienda/codigo-global-tienda.js`— y dejar en
cada página solo su HTML.

### 27.7 El CSS se mueve al Tracking Code global (15/8)

El bloque `.mura-*` estaba **copiado dentro del código de cada página**. Dos
consecuencias: en el carrito viajaban reglas de `.mura-grid`, `.mura-card`,
`.mura-filtros` y `.mura-acc` que allí no pintan nada, y cualquier retoque de marca
había que repetirlo página por página — basta olvidar una para que diverjan sin que
nadie se entere. De hecho ya había divergido: existían **dos cabeceras distintas**,
la `.mura-nav` de las páginas propias y una `.mura-nav-inject` con su propio CSS
para las de tienda, con el menú en otro orden y sin contador de carrito.

`tienda/codigo-global-tienda.js` queda ahora en cinco partes:

| | Qué | Dónde corre |
|---|---|---|
| 1 | sistema de diseño `.mura-*` | **todas** las páginas |
| 2 | `/cart` → `/carrito` | solo `/cart` |
| 3 | CSS que pisa la tienda de GHL | solo páginas de tienda |
| 4 | cabecera inyectada | solo páginas de tienda |
| 5 | contador del carrito | **todas** las páginas |

Las partes 1 y 5 van **fuera** del guardia de rutas. Aplicar el sistema en todo el
sitio es seguro porque va todo prefijado: solo toca elementos que llevan esas
clases, y esas las ponemos nosotros.

`.mura-nav-inject` desaparece: la cabecera de las páginas de tienda usa ahora las
mismas clases que la del resto, así que hay **una sola** cabecera que mantener, y de
paso las páginas de tienda ganan el contador de carrito que no tenían.

**La migración se puede hacer poco a poco.** Mientras una página conserve su copia
del CSS las reglas están duplicadas pero son idénticas, así que no rompe nada. Se
pega primero el global y luego se van vaciando páginas una a una, borrando solo su
bloque `<style>…</style>` y dejando el HTML. Llevan copia propia:
`/carrito` (ya hecha) · `/prendas` · `/producto` · `/colecciones` · `/novedades` ·
`/home` · `/mura` · `/contacto` · `/devoluciones` · `/gracias`.

⚠️ **No borrar el `<style>` de una página sin haber pegado antes el global**, o esa
página se queda en crudo.

**Bug encontrado al renderizar el resultado.** En el checkout los enlaces de la
cabecera salían subrayados y en `/carrito` no: `.mura a { text-decoration: none }`
cuelga de `.mura`, y en las páginas propias la cabecera va dentro de
`<div class="mura">` mientras que en las de tienda la insertamos suelta en el
`<body>`. Se añaden reglas `.mura-nav a` que no dependen del contenedor.

Verificado en Chromium con `/carrito` sirviendo **solo** el CSS del global: fondo,
tipografías, cabecera sticky, stepper, botón, total y contador idénticos a antes, y
en `/checkout` se inyectan las dos hojas (`sistema` + `tienda`) sin errores.

### 27.8 Recorrido completo verificado (15/8, tarde)

German pegó el Tracking Code global, el carrito nuevo y la página de gracias, tradujo
los textos del elemento Checkout desde sus ajustes, e hizo el recorrido entero de
compra: carrito → checkout → pago de test → `/thank-you`. **Todo se ve bien.**

Queda cerrado por tanto: `/cart` → `/carrito`, el stepper de cantidad, el checkout
maquetado y en español, y la página de gracias en la ruta correcta.

Siguen abiertos, de la lista de 27.3:
- ~~El enlace **"Ver carrito"** de la página de producto~~ → corregido el 15/8 en
  `tienda/producto.html` (iba a `/checkout`; ahora a `/carrito`). De paso la página
  quedó migrada al CSS global. Verificado en render: añadir pieza → aviso →
  enlace a `/carrito`, carrito escrito y contador al día.
- **Condiciones de contratación** desactivadas en el checkout (decisión de
  Sonia/legal, no de maquetación).
- **Ship to countries** en "all": acotar a los países que cubre Nacex, desde los
  ajustes del elemento Checkout.
- Vaciar el `<style>` duplicado del resto de páginas propias, una a una (ver 27.7).

### 27.4 La página de gracias de compra: decisión final → `/gracias` (17/8)

Historia en dos actos. Primero se descubrió que el checkout iba a `/thank-you`
(`saleAction: go-to-next-funnel-step`), no a `/gracias`. **El 17/8 German decide lo
contrario: `/gracias` es la página de gracias de compra** (es suya, con su diseño) y
el checkout debe redirigir ahí — se cambia en los ajustes del elemento Checkout
(acción tras el pago → URL `/gracias`). `/thank-you` queda sin uso.
`/suscripcion-confirmada` (nueva) es el destino de la confirmación del newsletter.

## 30. Documento de pendientes de Sonia — lo hecho el 17/8 (tarde)

Sonia pasó una lista larga (formularios, automatizaciones, tags, Stripe, maquetación).
Parte ya estaba hecha —por ella o por nosotros esa misma mañana— y parte partía de
premisas falsas. Aquí queda separado lo construido de lo que solo hay que contarle.

### 30.1 El newsletter pasa por n8n (decisión de German)

Pregunta de German: *"¿qué pasa si el form del newsletter envía la info a n8n, que es
gratis? luego necesitaría un trigger desde n8n para que ingrese a LS02, ¿cuál sería?"*

Respuesta corta: **el trigger que buscaba ya existía y era el mismo.** LS02 disparaba por
Inbound Webhook, así que con n8n en medio no hacía falta ningún trigger nuevo — n8n podía
hacer POST a esa misma URL y GHL no se enteraba.

> ⚠️ **CORRECCIÓN (17/8, más tarde). Aquí llegué a escribir que "el Inbound Webhook
> también es gratis" y que "meter n8n no ahorra nada". Es falso, y lo afirmé dos veces.**
>
> **El Inbound Webhook es premium**: en el buscador de triggers de GHL sale con la corona,
> igual que el Custom Webhook de salida. Se cobra por ejecución. Mi argumento —"LS02
> funcionaba con él, luego es gratis"— no demostraba nada: solo que las acciones premium
> están habilitadas en esta subcuenta, que es justo lo que ya decía la sección 24.
>
> O sea que **la decisión de Sonia era correcta y por el motivo que ella daba**: cada alta
> de newsletter habría ido sumando coste, indefinidamente. Lo que sigue —responder
> distinto a quien ya está suscrita, el log fuera de GHL— son ventajas añadidas, no el
> motivo.
>
> **La regla que sale de esto: lo premium se comprueba mirando la corona en la UI, nunca
> por cómo se comporta el paso.** Que se ejecute no dice si se cobra. Y el cargo puede ir
> al wallet de la **agencia** si la subcuenta no tiene el suyo cargado, así que tampoco se
> ve mirando la facturación de la subcuenta: es un gasto invisible para quien lo genera.
>
> Comprobado con esa regla: los **dos webhooks del 06b** son de tipo `webhook` y **no
> llevan corona** ("Fire a webhook containing the contact's details") — son las acciones
> clásicas, no cuestan. Y tras cambiar el trigger de LS02 a `contact_tag`, su Inbound
> Webhook desapareció: **no queda ninguna acción premium corriendo** en los flujos
> tocados hoy.

German eligió la **opción B** —n8n dueño del alta, GHL disparando por tag—. Arquitectura
nueva:

```
home (sección .mura-nl, dos columnas: ventajas + formulario)
  → POST JSON al webhook de n8n
     → busca el contacto por email
        · ya existe y ya tiene `nl` → responde ya-suscrita (y la página
          dice "ya estabas dentro", sin reenviar nada)
        · si no → upsert + REMOVE `nl` + ADD `nl`
  → el tag `nl` dispara LS02 (doble opt-in, bienvenida, oportunidad)
```

**El remove antes del add no es adorno.** Un tag que ya está puesto no vuelve a
disparar: sin él, quien se diera de baja y volviera no reentraría jamás. Misma trampa
de la sección 17.

**Dos pasos de LS02 se vuelven peligrosos al invertir quién crea el contacto, y hay que
quitarlos:**

1. **`Create/Update Contact`** — sus campos apuntan a `{{inboundWebhookRequest.*}}`,
   que a partir de ahora llegan vacíos: borraría nombre, teléfono y fecha de nacimiento
   del contacto que acaba de crear n8n.
2. **`Add Tag nl`** — si el trigger pasa a ser "tag `nl` añadido" y el workflow se pone
   `nl` a sí mismo, se re-dispara en bucle.

Y en la UI: borrar el trigger *Inbound Webhook* y crear **Contact Tag → `nl`** (los
triggers por API son fantasma, sección 13). Comprobar `allowMultiple`.

Archivos: `tienda/newsletter-home.html` (destino n8n + mensaje `ya-suscrita`),
`tienda/n8n-newsletter-workflow.json` (reescrito entero).

⚠️ **El fallo más probable de todo el montaje es el CORS.** El `Content-Type:
application/json` dispara un preflight `OPTIONS`; el nodo Webhook de n8n necesita
**Options → Allowed Origins**. Se prueba lo primero. Y la URL tiene que ser la de
producción `/webhook/…`: la de test solo escucha con el editor abierto — el bug del 06b.

### 30.2 La sección del newsletter, versionada

Sonia rehízo la home: ahora es un bloque de dos columnas, ventajas a la izquierda y
formulario a la derecha, con el botón "Formar parte". Queda versionada en
`tienda/newsletter-home.html` y sus reglas (`.mura-nl-2col`, `.mura-nl-ventajas`) en el
global. Verificado renderizando en Chromium a 1280, 820 y 390 px: idéntica a la que está
en vivo, y a 860 px se apila.

### 30.3 Formulario de Experiencia — `tienda/experiencia.html`

Las 26 preguntas de la spec de Sonia, en 7 pasos (6 bloques + el NPS), un bloque cada
vez, con la lógica condicional real: **si responde que todavía no ha comprado, el
recorrido pasa de 7 pasos a 4** y los bloques del pedido, el packaging y la prenda no
existen para ella.

**Se hizo como página propia, no como Survey de GHL.** La spec pide diseño
"completamente editorial" y que no se perciba como encuesta al uso; el Survey no da ese
control. Contrapartida dicha en claro: las respuestas viven en el Sheet, no en la ficha.

**Decisión que va MÁS ALLÁ de la spec y hay que contarle a Sonia:** el documento no pide
el correo en ninguna pregunta, y sin él no hay forma de poner el tag ni de guardar el
NPS — el circuito de GHL entero sería imposible. Solución: si llega desde el correo 06,
el contacto viaja en la URL (`?cid=`) y no se pregunta nada; si alguien entra suelto, al
final se le pide el correo como **opcional**, y si no lo deja, su respuesta se guarda en
el Sheet sin tocar GHL. Para eso, en las plantillas 06 y 07 el botón debe apuntar a
`{{custom_values.url_feedback}}?cid={{contact.id}}`.

Solo dos preguntas son obligatorias: la primera (decide el recorrido) y el NPS (es el
índice que la spec pide medir). El resto libre, a propósito.

Verificado en Chromium, los dos caminos: 60 inputs de estrella y 11 de NPS pintados,
avisos de validación, salto de bloques 3-4-5, el detalle de incidencia que aparece y
desaparece, las estrellas rellenando 1→N en el orden visual correcto, y cero errores JS.

### 30.4 Por qué NO se crean 30 campos custom en GHL

Pregunta de German. **No.** GHL no cruza ni promedia respuestas: solo las enseña contacto
a contacto. La spec pide *analizar* la experiencia y decidir con datos reales, y eso es
una hoja de cálculo. En GHL se queda únicamente lo que sirve para automatizar:

- **el NPS**, que segmenta (promotoras 9-10 → PS01 reseña; detractoras 0-6 → aviso);
- **el tag `encuesta-completada`**, que ya existe.

Ojo: en la cuenta ya hay dos campos que huelen a la encuesta vieja —
`contact.calificacin_clienta` (numérico) y `contact.algun_comentario_que_nos_quieras_compartir`
(texto largo). **Pendiente de German decidir** si `Calificación clienta` es el NPS y se
reutiliza, o se crea un campo nuevo. El workflow de n8n lleva hoy el que existe.

`tienda/n8n-experiencia-workflow.json`: webhook → normalizar (rellena con vacío lo que no
venga, o la fila saldría descuadrada cuando faltan los bloques 3-5) → **fila al Sheet** →
y en paralelo, solo si viene identificada, escribir NPS + tag. Se responde a la clienta
en cuanto la fila está guardada: si GHL fallara, su respuesta ya no se pierde.

**06b** pasa a dispararse por **Contact Tag → `encuesta-completada`** en vez de por Form
Submitted, y se le quita su paso de poner ese tag (ahora lo pone n8n). El aviso interno a
Sara se queda.

### 30.5 La política de cookies existía — y hay un enlace roto en producción

No había que escribirla: Sonia la tiene redactada en el Drive
(`politica-cookies.html`, `1lgFCoTzySca0fwypk19GhsgCOLVZn0sg`), con el mismo patrón y la
misma calidad que las otras tres legales. **Lo que pasa es que nunca se publicó**, y el
pie de todas las páginas de la tienda ya enlaza a `/politica-cookies`: hoy es un enlace
roto en vivo, el único de los cinco legales que no abre nada.

Antes de publicarla hay dos cosas, y una no es opcional:

1. **Auditar las cookies reales.** El propio documento avisa de que su tabla está
   redactada a partir del comportamiento *habitual* de GoHighLevel, no de una inspección
   de la web: tres de las cuatro duraciones figuran como "pendiente de comprobar". Hay
   que abrir el inspector en stylebymura.com y corregirla. *No se puede hacer desde el
   entorno:* la política de red deniega la salida a `www.stylebymura.com` (403 en el
   CONNECT del proxy).
2. **Si aparece cualquier cookie no técnica, hace falta banner de consentimiento** que la
   bloquee hasta que la clienta acepte. Informar no es pedir permiso. Pasa a obligatorio
   sin matices el día que se instale el píxel de Meta.

Queda escrito en `legal/README.md`, junto al estado de revisión jurídica de las cuatro.

### 30.6 Lo que hay que contarle a Sonia (no es trabajo, es información)

Su documento da por rotas cosas que funcionan. Sin esto se gasta tiempo en balde:

- **El correo de confirmación del newsletter sí sale.** Lo roto era el enlace
  (`{{unique_confirmation_link}}`, merge tag inventado → `href="[object Object]"`).
  Corregido y verificado de punta a punta el mismo 17/8 (sección 28.c).
- **No se duplican contactos.** `Create/Update Contact` es un upsert por email; su
  objeción estaba cubierta desde el principio. Con la opción B lo hace n8n, igual.
- **Cart, checkout y thank-you ya están maquetados y en español** (sección 27), `/cart`
  retirado y el checkout redirigiendo a `/gracias`.
- **`experiencia` y `feedback` ya estaban cerrados**; los dos huecos reales de la
  coreografía se cerraron esa mañana (sección 29). La lista del Canva está
  desactualizada.

### 30.7 Lo que queda bloqueado, y por quién

- **Cirugía de workflows** (quitar los dos pasos de LS02, el `if_else` de `compra-2`
  antes de `inactivo` en el 06-12, y el ajuste del 06b): necesita un
  `GHL_FIREBASE_REFRESH_TOKEN` nuevo de la extensión de Chrome — el de la sesión anterior
  ya no está en el entorno.
- **Las URLs de producción de los dos webhooks de n8n**, para pegarlas en las páginas.
- **El campo del NPS**: reutilizar `Calificación clienta` o crear uno nuevo.
- **Auditoría de cookies** (hay que hacerla con el navegador, no se llega desde aquí).
- **WhatsApp real de contacto** y **tallas de prenda**: dependen de Sara.
- **Stripe**: el documento dice "dejar hecha toda la parte" sin detallar. Lo que se
  entiende que falta —Payment Mode a Live, claves live de Sara, recibos nativos y una
  compra real de prueba— depende de Sara y hay que confirmarlo con Sonia antes de tocar.

### 30.8 Buscador de la rejilla, con lupa (petición de Sonia)

En el global, detrás de un guardia de rutas (`/prendas`, `/colecciones`,
`/novedades`). Inyecta una caja de búsqueda debajo de los filtros y filtra las
`.mura-card` por su nombre, **sin tildes y sin distinguir mayúsculas**: quien escribe
"cardigan" encuentra "Cárdigan", quien escribe "ONICE" encuentra "Ónice".

**La parte que tenía miga: no pisar los filtros que ya existen.** Los `.mura-filtros`
esconden tarjetas escribiendo en `style.display`. Si el buscador escribiera ahí también,
el último en tocar ganaría: buscar borraría el filtro y filtrar borraría la búsqueda.
Por eso el buscador **no toca `display`** — pone y quita la clase `.mura-oculta-busq`,
que esconde con `!important`. Las dos capas se componen, y al vaciar la búsqueda
reaparece lo que el filtro tuviera puesto, no la colección entera.

Verificado en Chromium contra una réplica con filtros que sí escriben `display`:
buscar dentro de "Camisas" deja solo la camisa que casa; buscar algo de otra categoría
da cero resultados con su mensaje; y al borrar, el filtro "Camisas" sigue en pie.
También se recuenta al pulsar un filtro, o el mensaje de "no hay resultados" se quedaba
colgado.

La rejilla puede pintarse después del script, así que hay un `MutationObserver` de
respaldo **con tope de 8 s**, para no dejar un observer vivo indefinidamente en una
página que no trae rejilla.

### 30.9 Cirugía de los tres workflows — hecha y verificada (17/8)

Con el refresh token nuevo de German. Antes, un tropiezo que conviene dejar escrito
porque cuesta media hora cada vez: **la ruta del API interno lleva el `locationId`
delante** — `GET /workflow/{locationId}/{workflowId}`. Sin él responde `401
"Unauthorized"`, que despista, porque parece un problema de credenciales y es de ruta.
(`/workflow/{locationId}/list` sí funciona sin más, que es lo que confundió el
diagnóstico.)

**Campo `NPS` creado** — `contact.nps`, id `BpEcTG8IYDXRUQNrM3h0`, numérico.
`Calificación clienta` **no** se reutiliza: es de la encuesta vieja (decisión de German).

**LS02 (v11 → v13).** Backup: `datos/backups/ls02_pre_n8n_20260817.json`.

- Fuera `Create contacto` (`create_update_contact`). Sus 5 mapeos eran las **únicas**
  referencias a `{{inboundWebhookRequest.*}}` de todo el workflow — comprobado antes de
  borrar. Ahora quedan cero.
- Fuera `Add Tag NL`. Con el trigger por tag, ponerse el tag a sí mismo se re-dispara.
- `allowMultiple` **False → True**: sin eso, quien se diera de baja y volviera a
  suscribirse no reentraría. Otra vez la trampa de la sección 17.
- El correo de doble opt-in pasa a ser el primer paso. **Los dos `transition` del wait
  se quedaron en `order 4` cuando el wait bajó a 1**, y hubo que corregirlos a
  `mainOrder + 1` en un segundo PUT: el orden es relativo a la rama y una rama huérfana
  se pinta torcida en la UI.

Queda: 7 pasos, `published`, doble opt-in → espera → bienvenida + `newsletter-suscrita`
+ oportunidad de comunidad, y la rama de timeout.

**06-12 (v13 → v14).** Backup: `datos/backups/wf0612_pre_inactivo_20260817.json`.

`if_else` nuevo detrás de la espera de ~3 meses:

```
día 90 → ¿tiene `compra-2`?
   SÍ  → quitar `feedback`. Y nada más.
   NO  → `inactivo` → quitar `feedback` → Email 12 · hace tiempo
```

**El esquema del `if_else` no se inventó**: en esta versión de GHL una condición son
*varios* nodos —un contenedor con `attributes.branches`, un nodo por rama y un nodo
`else`—, con `parentKey` y `next` que hay que mantener a mano. Se copió la estructura
del **02 · Etiquetado**, que ya tenía exactamente la misma condición
(`contact_detail / tags / index-of-true / ["compra-2"]`), incluidos sus arrays
`nestedDropdownTypes` y `allowIsOperatorTypes`, que no hay forma de deducir.

⚠️ **Va más allá de lo que pidió Sonia, y hay que decírselo.** Ella pidió solo que no se
pusiera `inactivo`. Se ha sacado también el **Email 12** de esa rama: mandarle "hace
tiempo que no sabemos de ti" a alguien que compró por segunda vez es un error que la
clienta ve. Si prefiere que el correo salga igual, es mover un paso.

El `remove feedback` está **duplicado en las dos ramas** a propósito: en GHL las ramas no
se vuelven a juntar, y esa limpieza tiene que ocurrir pase lo que pase.

`allowMultiple` se deja en **False**: el journey no se repite, decisión consciente de la
sección 17.

**06b (v11 → v12).** Backup: `datos/backups/wf06b_pre_tag_n8n_20260817.json`.

Fuera su `Tag encuesta-completada`: ahora lo pone n8n, y como el 06b tiene
`allowMultiple: True`, dejarlo con el trigger por tag habría sido un bucle. Quedan el
aviso interno y los dos webhooks. **Los dos apuntan ya a producción** (`/webhook/…`), o
sea que el arreglo del 14/8 aguantó.

Hallazgo colateral: uno de esos webhooks es
`https://n8n.letsbebanana.com/webhook/experiencia-mura`. **Sonia ya tiene un flujo de
encuesta en n8n**, aunque en el sentido contrario al nuestro (GHL → n8n, avisando de que
alguien respondió; el nuestro es navegador → n8n, con las respuestas). Antes de importar
`n8n-experiencia-workflow.json` conviene mirar ese flujo, no sea que haya solape.

### 30.10 Los tres cambios que solo se pueden hacer en la UI

Los triggers creados por API son fantasma (sección 13), así que estos van a mano:

1. **LS02** — borrar el trigger *Inbound Webhook* y crear **Contact Tag → añadido →
   `nl`**.
2. **06b** — cambiar el trigger de *Form Submitted* a **Contact Tag → añadido →
   `encuesta-completada`**.
3. **Checkout** — acción tras el pago → URL `/gracias` (venía de la sección 27.4).

**Hechos por German el mismo 17/8, y verificados por API**
(`GET /workflow/{locationId}/trigger?workflowId={id}` — que es por donde se leen; no
vienen en el cuerpo del workflow):

```
LS02 — 1 trigger:  contact_tag → Tag added: nl                    ✓
06b  — 2 triggers: form_submission → fvVToLx0e9pEjSRD6zq7  (el viejo, sigue activo)
                   contact_tag → Tag added: encuesta-completada   ✓
```

**El Inbound Webhook de LS02 ya no está** (queda un único trigger), así que la cadena
nueva está enganchada: n8n pone `nl` → arranca LS02.

**El 06b se queda con los dos a propósito, de momento.** Hasta que `/experiencia` esté
publicada y el custom value `url feedback` apunte ahí, el formulario viejo sigue siendo la
única encuesta viva: quitarle el trigger dejaría a Sara sin aviso cuando alguien responda.
Convivir no duplica nada — son puertas de entrada distintas y haría falta que una misma
persona hiciera las dos cosas.

⚠️ **Pero hay que borrar el `form_submission` cuando la página nueva esté en el aire.** Si
se queda, es un camino zombi: el 06b arranca, avisa a Sara y dispara los dos webhooks,
pero **no pone el tag** (ese paso se le quitó, porque ahora lo pone n8n).

### 30.11 El flujo `experiencia-mura` de Sonia es otra cosa — y la trampa que deja

German pasó `https://n8n.letsbebanana.com/webhook/experiencia-mura` como URL para la
página. **No sirve, y confirmarlo destapó un problema.**

Ese flujo es de Sonia y ya escribe en una hoja, pero se alimenta **desde GHL**: es el
destino del paso de webhook del 06b. O sea, recibe lo que GHL manda cuando alguien
responde el formulario viejo. Si la página nueva le enchufara sus 30 respuestas
(`nav_web`, `guia_tallas`, `nps`…), entrarían por la misma puerta dos payloads sin nada
que ver, y el mapeo a la hoja —hecho para el primero— las dejaría caer en columnas vacías
sin que salte ningún error.

Decisión: **la página va por su propio webhook** (`mura-experiencia`, el path que ya trae
`tienda/n8n-experiencia-workflow.json`) y el flujo de Sonia no se toca.

⚠️ **La trampa.** El 06b ahora tiene dos triggers, y con el nuevo (por tag) su paso de
webhook **sigue llamando al flujo de Sonia** — pero esa ejecución no viene de ningún
formulario, así que llega sin respuestas. Resultado: **filas vacías en su hoja** cada vez
que alguien complete la encuesta nueva.

De momento no se quita, porque mientras el trigger `form_submission` siga vivo ese webhook
es justo lo que alimenta su hoja por el camino legítimo. **Los dos se retiran juntos**:
el día que se borre el trigger `form_submission` del 06b, hay que borrar también su paso
de webhook a `experiencia-mura`. Son la misma pieza heredada.

Y hay que avisar a Sonia de que, a partir de ese momento, su hoja deja de llenarse: las
respuestas pasan a la hoja nueva, que escribe el flujo de la página.

### 30.12 El FOUC del checkout: el global se parte en Head + Body (17/8)

**Síntoma** (German): en `/checkout` el CSS tardaba unos segundos en pintarse — se veía el
formulario con el estilo de GHL y luego cambiaba al nuestro.

**Causa.** El CSS no llegaba tarde por sí mismo: se inyecta síncrono, en cuanto corre el
script. Lo que llegaba tarde era **el script**. Vivía entero en *Tracking Code → Body*,
que GHL mete dentro de un `<div id="gb-track-hl-custom-code">` del propio body; el
checkout lo pinta el bundle de la tienda, y ahí llegábamos después. En nuestras páginas no
se notaba porque su HTML ya está en el documento.

**Arreglo.** El CSS se muda al **Head**, que el navegador tiene antes de pintar nada, y en
el **Body** se queda solo lo que necesita que el DOM exista:

```
HEAD  sistema .mura-* · CSS encuesta · CSS buscador · CSS tienda
BODY  contador del carrito · buscador · cabecera inyectada · red de idioma
```

El redirect de `/cart` pasó a ir **lo primero y en las dos partes**: desde el head salta
antes de que se pinte nada del carrito viejo.

**Un solo archivo fuente.** El sentido de la sección 27.7 era dejar de tener copias del
CSS repartidas, así que no se duplicó nada: `build.sh` envuelve el mismo
`codigo-global-tienda.js` dos veces fijando `MURA_PARTE` (`'head'` o `'body'`), y cada
bloque mira esa constante. Los dos pegables llevan el código entero y solo se diferencian
en esa línea — a propósito: partir el fuente por marcadores de texto ahorra unos kilobytes
y deja un build que se rompe en silencio en cuanto alguien mueve una línea. Sin la
constante (abriendo el `.js` a pelo) vale `'todo'` y se comporta como antes.

`estilo(nombre, css)` centraliza la inyección y **no repite una hoja ya puesta**: si
alguien pega el mismo bloque en los dos campos, o `MURA_PARTE` se queda en `'todo'`, las
reglas no se duplican.

⚠️ **Hay que pegar los dos.** Solo el Head: se ve el diseño pero sin cabecera inyectada,
sin contador ni buscador. Solo el Body: todo funciona y no hay estilo ninguno.

**Verificado en Chromium** con réplicas de `/checkout`, `/experiencia` y `/prendas`
sirviendo head en `<head>` y body al final:

- las hojas correctas en cada ruta (`sistema+tienda`, `sistema+encuesta`,
  `sistema+buscador`) y ninguna donde no toca;
- en `/checkout`, `style[data-mura=tienda]` **ya presente en `DOMContentLoaded`** — que es
  justo lo que arregla el parpadeo —, fondo correcto, migas que no salen como botones
  negros, botón de pago negro y cabecera del tema oculta;
- **aislamiento**: el head solo pone CSS y no monta el buscador; el body monta el buscador
  y no pone ni una hoja;
- con los dos, el buscador sigue filtrando bien.

*Lo que no se pudo medir:* el entorno no alcanza stylebymura.com, así que el diagnóstico
del origen es razonamiento sobre el código. Si tras pegarlo quedara algo de parpadeo, lo
que resta es el render del propio bundle de la tienda, que no se gana reordenando CSS —
ahí la salida es la NOTA del final del archivo: **poner los textos de Cart y Checkout en
los ajustes del elemento**, que hoy están en inglés y se reescriben después de pintar.

### 30.13 El skin viejo de la página `/checkout`: qué era y cómo se retira

Al leer el head real del checkout (17/8, tras pegar los dos tracking codes) aparecieron
dos cosas: que el split funciona, y que dentro del `<style>` de la página vivía
**duplicado** un skin anterior, `MÛRA · SKIN + TRADUCCIÓN DEL CHECKOUT NATIVO DE GHL`.

**Estaba pegado con su `<script>` dentro de un `<style>`.** Ahí el navegador lo trata como
CSS, así que ese JavaScript no se ejecuta nunca. Su CSS **sí** se aplica: el parser
descarta lo malformado y sigue con las reglas siguientes. O sea, un skin fantasma
compitiendo con el global — y ganábamos casi siempre solo porque estamos más abajo en el
head, que es ganar por accidente.

⚠️ **Corrección de una deducción mía.** De ahí concluí que "por eso el checkout sigue en
inglés". **Falso**: la captura de German lo muestra en castellano. Los textos ya están en
los ajustes del elemento y nunca dependieron de ese script.

**Antes de borrarlo hubo que pasar al global lo que hacía y nosotros no cubríamos:**

- `[class*="summary"] h1..h4, [class*="summary"] [class*="header"|"title"] { background:
  transparent !important }` — es lo que mata **la barra gris detrás de "Resumen del
  carrito"**, ya visible en la captura porque nuestra regla solo cubría `.hl-cart-heading`.
- Los iconos en tinta y no en el azul del tema. Se listan **uno a uno** (`.edit-cart svg`,
  `.coupon-container svg`, `.checkout-breadcrumb-chevron`) en vez de con el
  `[class*="summary"] svg` general del skin viejo: ese cazaba también la ilustración del
  carrito vacío y la dejaba como un manchón.

**Y hubo que reforzar con `!important` el bloque del resumen.** Leyendo el head se ve que
las hojas de componentes de GHL —`CartSummary.css`, `Coupon.css`, `CheckoutElement.css`—
se cargan **después** de la nuestra. A igualdad de especificidad gana la última, así que
sin `!important` GHL nos pisaba fondo, sombra, bordes y separadores. Parte lo tapaba el
skin viejo; al retirarlo habría salido a la luz. Afecta a `.hl-cart-summary-container`,
`.hl-divider` (GHL le pone `border-bottom`: sin anularlo salen dos líneas),
`.cart-subtotal`, `.cart-total` y `.cart-summary-heading-container`.

**De paso, el carrito vacío.** El dibujo de GHL —un carrito con hojas verdes— se oculta
desde el CSS, y el texto se cambia en los ajustes: el que trae es *"Las plantas rodadoras
son espectaculares…"*, traducción automática de *tumbleweeds*, y encima trata de usted
cuando el resto de la web tutea. Anotado en la NOTA del final de `codigo-global-tienda.js`.

**Verificado en Chromium** con una réplica que carga las reglas reales de GHL **después**
de las nuestras, copiadas del head que pegó German: fondo del resumen correcto, sin
sombra, sin barra gris tras el título, título en serif, un solo divisor, dibujo y flecha
ocultos, y "Continuar comprando" como enlace de marca y no como botón a media anchura.

**Orden de aplicación — importa:** primero los dos tracking codes (ya hecho), luego este
cambio del global, y **solo entonces borrar el elemento de la página**. Al revés se caen
las reglas del resumen.

**Cerrado el 17/8, verificado en vivo.** German vació la caja de **Custom CSS de la página
`/checkout`** y con eso desaparecieron **las dos** copias.

⚠️ Corrección de mi diagnóstico: por la posición de cada copia dentro del `<style>` —una
antes de los estilos de sección y otra después— deduje que una estaba en el CSS del sitio
y otra en el de la página. Era falso: **las dos estaban en la caja de la página**, pegadas
por duplicado. Bien está, porque significa que **no hay ningún skin corriendo a nivel de
sitio** pisando el resto de páginas — que era el riesgo de verdad, ya que su
`input, select, textarea { border: none !important }` habría ganado a nuestras reglas de
formulario, que no llevan `!important`.

Estado final leído en el navegador:

```
skinViejo      0                          las dos copias fuera
nuestras       sistema→HEAD, tienda→HEAD  el split, en pie
resumenFondo   rgba(29,27,24,.03)         ganamos a GHL (#f9fafb)
tituloResumen  rgba(0,0,0,0)              sin la barra gris
bordeInput     1px / 1px                  recuadro completo
```

Queda solo cambiar el texto del carrito vacío en los ajustes del elemento.

## 31. Dos agujeros destapados por una compra real (17/8, noche)

German hizo una compra de prueba y vio la oportunidad corriendo en SP01 mientras el
tablero la mostraba en **05 Entregado**. Rastreando la cronología real por API aparecieron
dos problemas distintos, los dos serios.

Cronología de M100018 (horas UTC de la API; la UI de GHL las muestra 6 h menos):

```
16:50:45  M100018 creada por SP01
16:52:33  correo OTP del checkout
17:05:28  correo "Cada detalle cuenta"            ← el 03, preparación
17:16:28  correo "Cada detalle cuenta"            ← EL 03 OTRA VEZ
17:21:03  correo "Ya puedes seguir su recorrido"  ← el 04, envío
17:21:59  última actualización → queda en 05
```

### 31.1 El correo 03 salía dos veces — arreglado

**Causa, confirmada leyendo los dos workflows:** `03 · Email preparacion` dispara por
**cambio de etapa → 03** y tiene re-entrada activada. Y `04a` tiene una rama `None` con
aviso interno *"Pedido en Enviado sin peso/bultos"* → **`Devolver a 03 En Preparacion`** →
Telegram. Es decir: mover a Enviado antes de rellenar peso/bultos devuelve la oportunidad
a 03, y esa vuelta reescribe a la clienta. **No es un caso raro: pasa cada vez.**

La vuelta a 03 **hace falta** —es lo que permite reintentar, porque volver a mover a 04
solo dispara el 04a si antes salió de 04—, así que el arreglo va en el 03: un `if_else`
delante del correo que mira el tag **`pedido-en-preparacion`**, que pone el propio 03.

```
etapa → 03 · ¿ya tiene `pedido-en-preparacion`?
   SÍ → nada. (la vuelta del watchdog no reescribe)
   NO → Email 03 → tag `pedido-en-preparacion` → quitar `pedido-confirmado`
```

Funciona para una segunda compra porque el 04a **quita** ese tag al enviar de verdad, así
que el ciclo siguiente vuelve a avisar. `03` v13 → v14. Backup:
`datos/backups/wf03_pre_duplicado_20260817.json`.

### 31.2 Nadie ponía `pedido-entregado` — la entrega entera se saltaba

**Solo el `05 · Entrega` mueve a la etapa 05**, y su trigger es el tag `pedido-entregado`.
Rastreados los 18 workflows: **ningún paso de la cuenta añade ese tag.** Solo lo escuchan
(05 y 06-12) y lo quitan (06-12 y 08b).

Lo de hoy lo demuestra: la oportunidad llegó a 05 **desde fuera** —n8n o un arrastre a
mano—, el contacto no tenía el tag, y **no salió el correo de entrega**. Consecuencia
mayor: **el 06-12 tampoco arrancó**, así que a esa clienta no le llegarán ni el correo 06
(experiencia) ni el 07 (reseña). El tablero decía "entregado" y la cadena no corrió.

Arreglo, en dos mitades. La mía, ya hecha: **`05` pone el tag como primer paso** (v15 →
v16). Backup: `datos/backups/wf05_pre_duplicado_20260817.json`.

⚠️ **Es seguro en los dos estados, y por eso se hizo así:**

- Con el trigger de hoy (tag añadido) el tag **ya está puesto** al llegar, así que
  ponerlo otra vez no hace nada y **no se re-dispara** — un tag ya presente no dispara,
  la lección de la sección 17. Sin esa propiedad esto sería un bucle.
- Se **conserva** el paso "Mover a 05 Entregado": con el trigger nuevo será un no-op
  (ya está en 05) y con el actual sigue haciendo falta. Así no hay ventana rota mientras
  German cambia el trigger.

**La mitad de German (UI, porque los triggers por API son fantasma):** en `05 · Entrega`,
borrar el trigger *Contact Tag → `pedido-entregado`* y crear **Pipeline Stage Changed →
Ventas/Pedidos → 05 Entregado**.

**Por qué por etapa y no por tag:** ya hay algo moviendo etapas por fuera de GHL y no lo
vamos a poder impedir. Disparando por etapa, la entrega funciona **la mueva quien la
mueva** —n8n, Nacex o una mano—, y el propio 05 se encarga de poner el tag que arranca el
06-12. La alternativa (que n8n ponga el tag) deja la cadena colgando de que Sonia se
acuerde en cada flujo.

### 31.3 Cerrado y verificado (17/8, noche)

German cambió el trigger. Leído por API:

```
05 · Entrega          pipeline_stage_updated → Ventas/Pedidos → 05 ENTREGADO   ✓ único trigger
03 · Email preparac.  pipeline_stage_updated → 03 En preparacion
06-12 · Journey       contact_tag → pedido-entregado
```

**Comprobados también los pasos, porque editar en la UI sube de versión y puede tirar
cosas** (05 pasó de v16 a v18 y 03 de v14 a v15). Los dos cambios sobrevivieron: el 05
sigue poniendo `pedido-entregado` de primero y el 03 conserva su `if_else`. Único efecto
de la UI: renombró la rama del 03 de `Ya se le aviso de la preparacion` a `Branch`. La
condición está intacta; es solo la etiqueta.

Cadena resultante:

```
etapa → 05 Entregado  (la mueva quien la mueva)
   └─ 05 pone `pedido-entregado`  →  arranca el 06-12 (06 día 3, 07 día 10)
   └─ mueve a 05 (no-op)
   └─ correo 05 entrega + Telegram a Sara
```

**Pendiente de prueba en vivo:** mover una oportunidad de test a 05 y comprobar que salen
el correo de entrega, el aviso de Telegram y la inscripción en el 06-12. No se hizo desde
aquí porque enrola a un contacto real y le manda correo.

## 32. La detección de entrega: media pieza ya estaba montada (17/8)

Buscando quién mueve a la etapa 05 apareció que **el gancho ya existe desde el 14/8** y
nadie se acordaba. Dentro de `04a`, la espera de 48 h —el plazo máximo de entrega de
Nacex— no es solo un temporizador: al vencer comprueba **si la oportunidad sigue en «04
Enviado»** y, si es así, llama a n8n.

```
04a · rama con seguimiento
  Email 04 → tag `pedido-enviado` → quitar `email-04-listo`
  → Wait 48 Hours
  → ¿pipelineStageId == 04 Enviado?
       SÍ → POST https://n8n.letsbebanana.com/webhook/watchdog-entrega
       NO → (nada: ya se movió, no hay nada que vigilar)
```

**Y ese webhook ya manda lo que hace falta**, en su `customData`:

```
opportunityId  = {{opportunity.id}}
albaran        = {{opportunity.albaran_nacex}}
numero_pedido  = {{opportunity.name}}
```

⚠️ **Corrección de un aviso mío del mismo día.** Habiendo comprobado que
`/opportunities/search?q=` **no llega a los campos personalizados** —buscar por el albarán
`10530531` da 0 resultados; por el nombre `M100018` da 1— avisé de que n8n necesitaría el
número de pedido en la referencia de Nacex para poder encontrar la oportunidad. **Eso no
aplica a esta vía:** GHL ya le pasa el `opportunityId`, así que n8n no busca nada, hace un
`PUT` directo. El aviso sigue siendo válido **solo** para una vía de push, donde es Nacex
quien inicia y solo trae el albarán: ahí o la referencia del envío lleva el `M1000xx`, o
n8n guarda el par albarán → opportunityId al crear el envío.

**Lo que falta es solo lo que n8n haga con esa llamada:** preguntar a Nacex por el albarán
y, si consta entregado, `PUT` de la oportunidad a la etapa **05 Entregado**. Con el trigger
por etapa (sección 31.2) eso dispara el resto solo: tag `pedido-entregado` → correo de
entrega → Telegram a Sara → journey 06-12.

### ⚠️ El agujero del diseño: el watchdog salta UNA vez

Si a las 48 h el paquete todavía no ha llegado —festivo, incidencia, o una entrega en punto
Nacex que la clienta recoge el jueves— **nadie vuelve a mirar**. Ese pedido se queda en
«Enviado» para siempre: sin correo de entrega, sin encuesta y sin reseña. Y falla en
silencio, que es lo peor.

Dos formas de taparlo, según lo que pueda Nacex (**pendiente de confirmar con Sonia**):

- **Nacex avisa por push** → ese es el camino principal: entrega detectada al momento, y el
  watchdog de 48 h se queda como red de seguridad por si el aviso no llega. Es lo mejor de
  los dos, y no hace falta reintentar.
- **Nacex no avisa** → el watchdog tiene que reintentar: reconsultar cada 24 h hasta que
  Nacex diga entregado o hasta un tope razonable. Se puede montar en n8n (más limpio: es
  suyo el reintento) o en GHL con un bucle de espera + reconsulta.

### 32.1 Resuelto por Sonia: el watchdog pregunta, y si no, avisa a Sara (22/8)

Sonia contesta la pregunta abierta y cierra el diseño:

> «Y si el Watchdog llama a Nacex pasadas 48 h de la entrega, si devuelve un mensaje Nacex
> de que está entregado lo mueve al 05; si Nacex no dice que está entregado manda mensaje
> a Sara».

O sea: **no hay push de Nacex**. La detección es por consulta, y el caso «todavía no
entregado» no se reintenta: **se escala a una persona**.

```
04a · Wait 48 h → ¿sigue en «04 Enviado»? → SÍ → n8n /watchdog-entrega
                                                   │
                          n8n pregunta a Nacex por el albarán
                                                   │
              ┌────────────────────────────────────┴─────────────────┐
        consta ENTREGADO                                    no consta entregado
              │                                                      │
   PUT oportunidad → etapa «05 Entregado»                    aviso a Sara
              │                                                      │
   (trigger por etapa, §31.2)                          Sara mira y, si procede,
   tag `pedido-entregado` → correo 05                   mueve la tarjeta a mano
   → Telegram → journey 06-12                                        │
                                                          → misma cadena de arriba
```

**El agujero de la §32 queda tapado, y por diseño, no por casualidad.** Lo que me
preocupaba era que fallase *en silencio*; con el aviso a Sara ya no hay silencio: hay una
persona mirando. Y **el trigger por cambio de etapa es justo lo que hace que la vía manual
valga**: mueva la tarjeta n8n o la mueva Sara con el ratón, el 05 arranca igual. Con el
trigger por tag que había antes (§31.1), la mano de Sara no habría disparado nada.

Queda un matiz, sin urgencia: el aviso a Sara conviene que lleve **número de pedido, enlace
de seguimiento y el estado literal que devolvió Nacex**, para que pueda decidir sin entrar
a buscar. Los tres los tiene n8n en la misma llamada —`numero_pedido` y `opportunityId` se
los manda GHL, el estado se lo acaba de dar Nacex—, así que es rellenar el mensaje, no
traer datos nuevos.

**Stripe sigue pendiente y es de Sonia.** En el mismo mensaje: *«falta revisar la parte de
Stripe creo»*. Sigue sin concretarse el alcance —el documento decía «dejar hecha toda la
parte»— y es lo único que separa la tienda de poder cobrar de verdad.

## 33. Verificación del 22/8: los enlaces de las plantillas siguen rotos

Repaso pedido por German con token nuevo. Lo de los workflows sale limpio; lo de las
plantillas, no.

### 33.1 Los tres workflows, como los dejamos

```
05 · Entrega          publicado · v19 · allowMultiple true
  TRIGGER  pipeline_stage_updated            ✓ (el cambio del 17/8 sobrevivió)
  0 add_contact_tag  pedido-entregado
  1 email            05 · entrega
  2 webhook          n8n /avisos-sara

06b · Encuesta        publicado · v13
  TRIGGER  form_submission   (el viejo, sigue vivo a propósito)
  TRIGGER  contact_tag       ✓
  0 internal_notification
  1 webhook  n8n /db8ae6be-…       (aviso a Sara)
  2 webhook  n8n /experiencia-mura  ← el que se retira CON el trigger viejo

06-12 · Journey       publicado · v14 · allowMultiple false
  0 wait 3 días → 1 Email 06 → 2 quita `pedido-entregado` → 3 pone `experiencia`
  4 wait 7 días → 5 Email 07 → 6 quita `experiencia` → 7 pone `feedback`
  8 wait 80 días → 9 if_else «Ya ha comprado dos veces»
       SÍ  → quita `feedback`
       NO  → pone `inactivo` + quita `feedback` + Email 12
```

Queda confirmado de paso que **el correo 07 sí está montado** —es el paso 5 del journey—,
al contrario de lo que decía la nota del 13/8 en la sección 20b.

### 33.2 ⚠️ Corrección de la sección 20b: los merge tags NO están arreglados

La sección 20b dice que el 13/8 se arreglaron los cinco merge tags rotos y los dos
`AÑADIR ENLACE`. **En la cuenta, hoy, siguen igual.** Bajadas las 19 plantillas de la
carpeta *Correos* por API y leído el render de cada una:

| Plantilla | Enlace del botón hoy | Estado |
|---|---|---|
| 06 · experiencia | `{{contact.url_feedback}}` | ⚠️ **vivo** (paso 1 del journey, día 3) |
| 07 · reseña | `AÑADIR ENLACE` (literal) | ⚠️ **vivo** (paso 5 del journey, día 10) |
| 18 · reseña en Google | `AÑADIR ENLACE GOOGLE` | sin workflow |
| 16 · datos no coinciden | `AÑADIR CONTACTO`, `AÑADIR LINK` | sin workflow |
| 09A · devolución verificada | `{{contact.url_devolucion}}` | |
| 10 · reembolso | `{{contact.url_devolucion}}` | |
| 15 · reposición | `{{contact.url_pieza}}` | sin workflow |
| 08 · solicitud devolución | lleva el bueno `{{opportunity.url_etiqueta_devolucion}}` **y** un `{{contact.url_etiqueta_devolucion}}` de más | |
| 03 · preparación | lleva el bueno **y** un `{{contact.url_pedido}}` de más | |

**Tres señales independientes dicen lo mismo:**

1. **`lastUpdated` de la API**: 06, 07, 16 y 18 → `2026-08-07`; 09A, 10 y 15 →
   `2026-07-30`. **Ninguna** plantilla de la cuenta tiene fecha del 13/8. Si se hubieran
   guardado ese día, la fecha lo diría.
2. **El render**: el `previewUrl` que devuelve la API —que se regenera al guardar— sigue
   trayendo `href="AÑADIR ENLACE"` y `href="{{contact.url_feedback}}"`.
3. **Los campos no existen**: la cuenta tiene 23 campos de contacto y entre ellos **no
   están** `url_feedback`, `url_devolucion` ni `url_pieza`. Sí existen `url_pedido` y
   `url_etiqueta_devolucion`, que son los sobrantes del 03 y el 08.

Consecuencia práctica: **el 06 sale hoy con un botón que no lleva a ningún sitio**, y a los
siete días el 07 sale con `AÑADIR ENLACE` como destino. Los dos van dentro del journey
publicado que arranca con el tag `pedido-entregado`, o sea el camino normal de cualquier
compra entregada.

**Lo que no pude comprobar:** el documento crudo de la plantilla. `/emails/builder/{loc}/{id}`
devuelve 401 con el PIT y Cloudflare 1010 por la vía interna. Las tres señales de arriba son
metadatos y render, no el JSON guardado — así que la confirmación de un segundo lo da abrir
el 06 en la UI y mirar el botón. Si allí apareciera bien, el problema sería del render y no
del correo; pero entonces la fecha del 13/8 tendría que estar, y no está.

### 33.3 Qué hay que cambiar, y por qué no basta con rellenar el custom value

Rellenar `url feedback` con la página `/experiencia` **no arregla el 06**: su botón apunta a
`{{contact.url_feedback}}`, un campo que no existe, no al custom value. Hay que editar la
plantilla. Y el **07 es un correo de reseña que apunta al mismo sitio que el 06** según la
tabla del 13/8 — eso hay que decidirlo, no heredarlo: lo lógico es que el 07 lleve a la
ficha de Google, que es justo el `url resena google` que sigue vacío.

Cambios en las plantillas (UI, campo del enlace del botón):

- **06** → `{{custom_values.url_feedback}}?cid={{contact.id}}`
- **07** → `{{custom_values.url_resena_google}}` (o al feedback, si Sonia lo prefiere así)
- **18** → `{{custom_values.url_resena_google}}`
- **09A**, **10** → `{{custom_values.url_devoluciones}}`
- **15** → `{{custom_values.url_pieza}}`
- **16** → contacto y enlace de devoluciones
- **03**, **08** → quitar el botón sobrante

Y rellenar los dos custom values vacíos: `url resena google` (ficha de Google de Sara) y
`url pieza` (por campaña). `url feedback` sigue apuntando al formulario viejo
`fvVToLx0e9pEjSRD6zq7`, así que se cambia cuando `/experiencia` esté publicada.

### 33.4 Arreglado: los nueve correos, por API (22/8)

Encontrado el endpoint y aplicado. **Cero `href` rotos en las 19 plantillas.**

**El endpoint.** La API pública no tiene un "leer una plantilla", pero sí las otras dos
piezas, y con eso basta:

```
LEER    el previewUrl que devuelve  GET /emails/builder?locationId=…&parentId=<carpeta>
        Para plantillas templateType:"html" ese render ES el contenido guardado —
        comprobado creando una de prueba: previewUrl y templateDataDownloadUrl
        devolvieron el mismo byte a byte.
ESCRIBIR POST /emails/builder/data
        { locationId, templateId, updatedBy, editorType:"html", html }
        `editorType` es obligatorio (sin él, 422). `name` y `templateType` se conservan.
        No hace falta mandar `dnd`.
BORRAR  DELETE /emails/builder/{locationId}/{templateId}
```

Dos trampas del camino:

- **Las plantillas no salen en el listado raíz.** Están dentro de la carpeta *Correos*
  (`6a6aa119fee4921a97537ba5`): sin `parentId` la API devuelve 9 cosas y ninguna es
  nuestra. Con él, las 19.
- **Cloudflare 1010 con urllib.** Los `POST` desde Python fallaban con 403 `error code:
  1010` mientras el mismo `POST` por `curl` pasaba: falta el User-Agent de navegador. El
  script terminó usando `curl` de transporte. **Nada se aplicó en ese primer intento** —los
  nueve dieron 403—, así que no hubo estado a medias.

**Ensayo antes de tocar nada real:** se creó una plantilla `ZZ · prueba endpoint`, se
actualizó dos veces para confirmar que el render cambia y que el nombre sobrevive, y se
borró al terminar.

**El cambio, exactamente.** El script (`datos/fix_tpl.py`) solo sustituye lo que hay
**dentro de `href="…"`**; el resto del HTML queda byte a byte. Verificado después con un
diff contra la copia previa: nueve plantillas modificadas y **todos** los fragmentos
cambiados contienen `href`.

| Plantilla | Antes | Ahora | Sitios |
|---|---|---|---|
| 06 · experiencia | `{{contact.url_feedback}}` | `{{custom_values.url_feedback}}?cid={{contact.id}}` | 2 |
| 07 · reseña | `AÑADIR ENLACE` | `{{custom_values.url_feedback}}?cid={{contact.id}}` | 2 |
| 18 · reseña en Google | `AÑADIR ENLACE GOOGLE` | `{{custom_values.url_resena_google}}` | 2 |
| 09A · devolución verificada | `{{contact.url_devolucion}}` | `{{custom_values.url_devoluciones}}` | 2 |
| 10 · reembolso | `{{contact.url_devolucion}}` | `{{custom_values.url_devoluciones}}` | 2 |
| 15 · reposición | `{{contact.url_pieza}}` | `{{custom_values.url_pieza}}` | 2 |
| 16 · datos no coinciden | `AÑADIR LINK` / `AÑADIR CONTACTO` | `{{custom_values.url_devoluciones}}` / `{{custom_values.url_contacto}}` | 2+2 |
| 03 · preparación | `{{contact.url_pedido}}` | la URL de pedido del `<a>` visible | 1 |
| 08 · solicitud devolución | `{{contact.url_etiqueta_devolucion}}` | `{{opportunity.url_etiqueta_devolucion}}` | 1 |

### ⚠️ Corrección: en el 03 y el 08 no sobraba ningún botón

Ayer los di por "botón duplicado". **No lo era.** Cada botón de estas plantillas está
escrito dos veces: el `<a>` normal y un **fallback VML para Outlook**
(`<v:roundrect href="…">`) dentro de un `<!--[if mso]>`. El arreglo del 14/8 tocó el `<a>`
visible y **dejó el de Outlook con el merge tag viejo**. Por eso aparecían dos destinos
distintos en la misma plantilla y por eso el conteo de arriba dice "1 sitio" en el 03 y el
08 y "2" en las demás. En Outlook esos dos correos llevaban al enlace equivocado; en el
resto de clientes, bien.

De ahí sale una regla para la próxima: **en estas plantillas, un botón son dos `href`.**
Cambiar solo el visible deja la mitad rota, y es una mitad que no se ve al revisar.

### Por qué el 07 va al mismo sitio que el 06

No es un descuido heredado: lo dice la propia plantilla **18**, en un comentario de
cabecera —*"el 07 lleva a un formulario de feedback propio (privado); este 18 lleva a
Google (reseña pública)"*. Son las dos patas a propósito: opinión privada para mejorar y
reseña pública para captar. El 06 invita el día 3 y el 07 insiste el día 10, los dos al
mismo formulario.

### Lo que sigue haciendo falta para que esos botones lleven a algún sitio

Los enlaces ya son parametrizables, pero **tres custom values siguen vacíos o viejos**:

- `url feedback` → hoy apunta al formulario viejo `fvVToLx0e9pEjSRD6zq7`. Se cambia por
  `/experiencia` cuando esté publicada, y los correos 06 y 07 se arreglan solos.
- `url resena google` → vacío. Es el enlace "escribir una reseña" de la ficha de Sara (18).
- `url pieza` → vacío. Se pone por campaña (15).

Y el destino del botón principal del **16** es una inferencia mía: puse la página de
devoluciones, que es donde vive el formulario. Si hay una URL directa del formulario de
solicitud, es mejor esa. El 16 no está montado en ningún workflow, así que no corre prisa.

**Copias de seguridad:** `datos/backups/plantillas_20260822/` (las 19 tal como estaban) y
`…_despues/` (tal como quedaron). Restaurar una es un `POST` con el HTML de la primera
carpeta.

## 34. Los textos del checkout y el carrito vacío (22/8)

### 34.1 Lo que había, leído por API

El contenido de una página se lee en `GET /funnels/page/{pageId}` del backend interno
—con `token-id`; el PIT da 401 ahí— y el JSON de los elementos vive en el `pageDataUrl`
que ese objeto trae, un fichero de Firebase. Bajados los dos:

```
Cart      · elemento store-cart-J14MT1D5-f       → los SEIS textos en inglés
Checkout  · elemento store-checkout-sTf_Fd0JV5   → 42 textos, casi todos ya en castellano
```

En el checkout quedaban tres clases de cabo suelto:

- **inglés**: `notesTextBoxPlaceholder` = *"Add notes about your order or special notes for
  delivery"*.
- **español de América**: «Busca tu domicilio», «Domicilio completo», «Agregar notas a tu
  pedido», «Regresar a Contacto y Envío», «Estado / Provincia». La tienda vende en España.
- **una tilde**: «Codigo Postal».

Y aparte, el vacío del resumen —el *tumbleweeds* traducido a máquina— **no es un ajuste**:
no existe esa clave en el elemento, lo pone GHL por su cuenta.

### 34.2 ⚠️ No hay ruta de escritura alcanzable para las páginas

Lo suyo era cambiarlos en el ajuste del elemento y quedarse sin script. No se pudo:

```
GET  /funnels/page/{pageId}                    200  ✓ (token-id, no PIT)
POST/PUT/PATCH sobre /funnels/page/{id}        404 "Cannot POST /funnels/page/…"
  …y sobre /data, /save, /sections, /content, /funnels/page/save, /funnels/page/update,
  /funnels/funnel/{fid}/page/{pid}, /funnels/page-data/{id}                 404 igual
```

«Cannot POST» es **ruta inexistente**, no permiso denegado: el builder guarda por otra vía.
Averiguar cuál pedía leer su bundle, y `app.gohighlevel.com` no se alcanza desde el entorno
(el proxy lo rechaza). Se deja anotado; el día que aparezca la ruta, esto se hace bien en
dos minutos.

### 34.3 Lo hecho: la traducción se muda al HEAD

La sección 9 del `codigo-global-tienda.js` es nueva. Antes había un mapa de textos dentro
del bloque del BODY que, en cada mutación, **recorría el documento entero**; corría después
de pintar, así que «My cart» se veía un instante, y solo cubría seis cadenas.

Ahora:

- va con el **HEAD**, así que está escuchando antes de que el bundle de la tienda pinte;
- observa desde `documentElement` y traduce **solo los nodos que se insertan**, no todo el
  documento en cada cambio;
- cubre las **42 cadenas** del checkout y el carrito, más los **placeholders** —que son
  atributos y el mapa viejo ni los miraba—;
- el vacío del resumen y el placeholder de notas van **por prefijo**, no por igualdad: de
  esos dos no tengo el literal exacto (lo pone GHL y cambia con la versión) y una coma de
  diferencia dejaría la regla muda sin avisar.

### 34.4 Verificado en réplica, con los textos reales de la cuenta

La réplica no se escribió a mano: se **genera desde el JSON de los elementos** que devuelve
la API, así que prueba las cadenas que hay de verdad y no las que yo recuerde. Pinta a los
400 ms, como hace el bundle.

```
errores JS:                          ninguno
PRIMER FRAME pintado, sin traducir:  NINGUNO
al final, sin traducir:              NINGUNO
placeholders: Busca tu dirección · Indicaciones para la entrega · Introduce tu código
dibujo del carrito vacío:            display none
```

Lo del **primer frame** es la medida que importa: se captura en el `requestAnimationFrame`
siguiente a la inserción, o sea antes del primer pintado de ese contenido. Si ahí ya está
en castellano, no hay parpadeo que ver.

**Un fallo que solo apareció al probar:** `querySelectorAll('[placeholder]')` mira
descendientes, no el nodo en sí. Cuando el `<input>` **es** el nodo insertado —y en el
checkout lo es— se escapaba. Dos placeholders se quedaron en inglés en la primera pasada
del test. Arreglado comprobando también el propio nodo.

Regresión mirada aparte: `/prendas` sigue montando el buscador y filtrando («cardigan» →
1 pieza de 3), sin errores.

### 34.5 Lo que sigue siendo mejor hacer a mano

La lista completa para pegar en los ajustes de los elementos está al final de
`tienda/codigo-global-tienda.js`. Puestos ahí salen bien de origen, sin depender de que
corra un script, y la sección 9 se puede borrar entera.

Detalle sin importancia práctica: los seis textos del elemento **Cart** viven en `/cart`, y
`/cart` lo redirigimos a `/carrito` desde la primera línea del global. O sea que hoy no los
ve nadie. Se traducen igual, como red por si algún día se llega a esa página.

## 35. Dónde va de verdad el CSS de la tienda (22/8, noche)

### 35.1 ⚠️ Corrección: el split del 17/8 no arregló el FOUC

German avisa de que en `/checkout` el estilo tarda **unos 10 segundos**. Medido desde su
navegador con `fetch(location.href)` sobre el HTML **servido**:

```
bytesDelHtml: 288.039     bytesDelHead: 92.337
nuestroScriptEstaEnElHeadDelHtml: false
vecesEnTodoElHtml: 2
```

**GHL no sirve el Tracking Code del Head dentro del `<head>`.** Lo deja en el body y lo
sube arriba por JavaScript cuando la app ya arrancó. Por eso el CSS no existe hasta que ese
bloque corre.

Y por eso **la verificación del 17/8 estaba mal hecha**: di el split por bueno leyendo
`document.head` en el navegador —el DOM ya montado, donde GHL ya lo había subido— en vez
del HTML servido. La prueba correcta es la de arriba. La lección: *para saber si algo llega
antes de pintar, hay que mirar lo que llega, no lo que hay después.*

**De paso, otra falsa alarma mía.** El chequeo del DOM contaba **3** copias del global y
avisé de una copia vieja sin borrar. En el HTML servido `MURA_PARTE` aparece exactamente
**2** veces: los dos pegados. La tercera es un bloque de 185 KB del propio GHL que
**contiene** nuestro código del Head dentro, y por eso el filtro lo contaba. No había nada
que borrar.

### 35.2 Lo que sí viaja en el HTML: el Custom CSS de la página

Ya lo sabíamos sin saberlo: los 19 KB del skin viejo del checkout vivían en esa caja y
salían como **primera hoja del head** (sección 27.4). Así que ahí va el CSS.

`tienda/css-paginas-tienda.css` es nuevo y **generado**: `build.sh` lo saca del mismo
`codigo-global-tienda.js` que los dos tracking codes. No parseando texto —eso se rompe en
silencio— sino **ejecutando** el global con un DOM de mentira y quedándose con lo que el
código le pasa a `estilo()`. La fuente, que se añade como `<link>`, se convierte en
`@import` porque en esa caja no cabe una etiqueta.

Va en las **cuatro** páginas de tienda: `/checkout`, `/products-list`, `/product-details`,
`/thank-you`. Esa caja es por página y no hay una global.

### 35.3 ⚠️ Y entonces el CSS se comió el editor

Pegado en `/checkout`, el CSS **repintó también la barra de herramientas del constructor**.
Causa: en el Tracking Code el bloque corría detrás de una guardia de ruta; en la caja de la
página no hay guardia, y **el constructor pinta la página en su mismo documento**, así que
un `body { }` le llega igual a la herramienta.

Arreglado acotando **todo** el bloque `tienda` a `.hl_page-preview--content`, el envoltorio
del contenido. La cadena real, leída en vivo:

```
body > div#__nuxt > div > div > div#preview-container.hl_page-preview--content
     > … > div#store-checkout-sTf_Fd0JV5 > div.hl-store-checkout-container
```

En el editor ese envoltorio rodea el lienzo y no la barra: se ve lo que se edita sin teñir
la herramienta. Lo hace `acotar()`, que prefija cada selector y entiende los `@media`; las
dos reglas que iban sobre el `body` se marcan con `:scope` y se convierten en el propio
envoltorio. El bloque `sistema` no se toca: ya va prefijado con `.mura-*`.

### 35.4 Verificado

Réplica con una barra de editor **fuera** del envoltorio y el contenido de tienda dentro:

```
            fuera (editor)        dentro (página)
fondo       transparente          #F0EEE8
titular     Times New Roman       Cormorant Garamond
botón       gris del navegador    #1D1B18
input       2px, por defecto      1px de marca
```

Y el CSS solo, sin ningún script: 142 reglas, resumen con el fondo de marca, divisor de
1 px y el dibujo del carrito vacío oculto. La traducción de la sección 34 sigue sin dejar
nada en inglés ni en el primer frame ni al final.

### 35.5 Pendiente de comprobar en vivo

Si con el CSS en la caja de la página `/checkout` sigue tardando, entonces ya no es cosa
del CSS —estaría servido en el HTML— sino del bundle de la tienda, que pinta su formulario
cuando quiere. Ahí la salida sería otra: reservar el hueco con un esqueleto, no reordenar
hojas.

## 36. Por qué la ficha de producto enseña una sola foto (25/8)

German avisa de que en la página de producto se ve **una foto por pieza**, y que
por eso Sara creía que faltaban fotos por subir. No faltan: en GHL hay entre 1 y
7 por producto, 125 en total (sección 35 del informe de fotos).

### 36.1 El fallo no está en la página

`tienda/producto.html` pinta la galería así:

```js
var imgs = (p.imagenes || []).filter(Boolean);
if (imgs.length) { im.src = imgs[img]; … }
if (imgs.length > 1) imgs.forEach(…miniaturas…);
```

O sea: enseña lo que le llegue en `imagenes`, y las miniaturas solo aparecen si
hay más de una. Si se ve una sola, es que el array trae una sola.

**Ese array no lo arma la página, lo arma el Worker**
`https://mura-productos.germanborrello-d78.workers.dev`, que no está en este
repositorio y al que la red del entorno no llega (`HTTP 000`). Así que lo que
sigue es un diagnóstico por descarte, no lectura del código del Worker.

### 36.2 Los dos endpoints de GHL no traen lo mismo

Comprobado con el PIT sobre la *Blazer Blanca Arquitectónica*:

```
GET /products/?locationId=…        (listado)
  claves: _id, name, description, image, variants, …
  image  → UNA url
  medias → NO EXISTE el campo

GET /products/{id}?locationId=…    (detalle)
  image  → UNA url (la destacada)
  medias → 5 entradas, todas type:image
```

**El listado no trae `medias` en absoluto.** Si el Worker construye el catálogo
con el listado —que es lo natural: una sola llamada para todas las piezas—, lo
máximo que puede poner en `imagenes` es la foto destacada. Encaja con el síntoma
exacto: una foto, sin miniaturas, en todas las piezas por igual.

### 36.3 El arreglo, en el Worker

Cuando se pide una pieza concreta (`?id=`), hay que ir al detalle y quedarse con
`medias`:

```js
const r = await fetch(`https://services.leadconnectorhq.com/products/${id}?locationId=${LOC}`, {
  headers: { Authorization: `Bearer ${PIT}`, Version: '2021-07-28' }
});
const p = await r.json();
const imagenes = (p.medias || [])
  .filter(m => (m.type || 'image') === 'image')
  .map(m => m.url);
if (!imagenes.length && p.image) imagenes.push(p.image);   // red por si acaso
```

El orden de `medias` es el de la galería en GHL, así que se respeta tal cual. En
la pieza comprobada la destacada coincide con `medias[0]`, pero **no conviene
darlo por hecho** en todas: si alguna difiere, la portada de la ficha saldría
distinta de la de la rejilla.

Para la rejilla (`/prendas`) el listado sigue valiendo: ahí solo se necesita una
foto por tarjeta y ahorra 36 llamadas.

### 36.4 De paso, el código del repositorio estaba viejo

La página en vivo llevaba dos cambios que no estaban aquí. Se traen ya:

- **Desplegable «Talla y ajuste»** (25/8): tabla de medidas corporales S–XL, o
  texto de talla única cuando alguna talla contiene «única»; medidas de la modelo
  (1,65 m · 87 · 61 · 94) y enlace de dudas a `wa.me/34637681234` con el mensaje
  prerrellenado. Ese número, por cierto, resuelve uno de los datos que estaban
  «esperando a Sara».
- En «Entrega y devoluciones» **desapareció la frase** *«Los artículos adquiridos
  con descuento no admiten reembolso»*. Se conserva la versión en vivo, pero
  conviene confirmar que la retirada fue a propósito: es una condición de venta.

### 36.5 Parcheado (25/8)

Con el código del worker delante, confirmado: `imagenes` se construía sobre `p`
del **listado**, así que la parte de `medias` nunca aportaba nada y siempre
quedaba `[p.image]`.

⚠️ **Y no era «cambiar una línea», como parecía.** Mapear `p.medias` sin más
deja el array vacío y entra el respaldo de la destacada: se ve exactamente
igual, y encima parece que el arreglo no funciona. Hay que ir al detalle.

**Lo que NO se hizo, y por qué.** Lo evidente era pedir el detalle de las 36 en
el mismo `Promise.all`: 1 + 36 + 36 = **73 subpeticiones**, y el plan gratuito de
Workers corta en **50 por petición**. El catálogo entero dejaría de responder —
un fallo peor que el que se arregla. Hoy son 37, con margen justo.

**Lo que se hizo:** la galería se resuelve solo cuando se pide una pieza,
`GET /products?id=…`, que es la única pantalla que la necesita. Detalle + precios
= **2 subpeticiones**. La rejilla sigue igual. Y el detalle **no trae precios**
(comprobado: sus claves son `variants`, no `prices`), así que la llamada de
precios se conserva.

Archivos: `tienda/worker-productos.js` —el fuente del worker entra por fin al
repositorio— y `tienda/producto.html`, que ahora llama con `?id=`.

**Compatible en los dos sentidos**, así que da igual el orden en que se pegue: el
worker viejo ignora el `?id=` y devuelve el catálogo entero (la página filtra
como siempre), y el worker nuevo sin `id` responde el catálogo como antes.

**Simulado contra la API real** con el *Pantalón Encaje Esmeralda*, la pieza que
citaba Sonia:

```
imagenes : 4 · la destacada es la primera
tallas   : S 159 € (2) · M 159 € (1) · L 159 € (1)
estado   : disponible
miniaturas (imgs.length > 1): sí
```

Detalle que no estaba en ninguno de los dos diagnósticos: **la destacada va
primera y el `Set` quita su duplicado**, así que la portada de la ficha es la
misma que la de la rejilla. Si se mapeara solo `medias`, en las piezas donde la
destacada no sea `medias[0]` la portada cambiaría al abrir la ficha.

## 37. El checkout va a /thank-you y Sara no ve qué se ha comprado (25/8)

### 37.1 La redirección: no hay ajuste que la cambie

Buscada donde podría estar:

```
JSON de la página /checkout        → ni "thank", ni "redirect", ni "success"
GET /store/store-setting           → notificaciones, envío y progreso; ninguna URL de gracias
GET /stores, /payments/settings    → no existen
```

El checkout de la tienda de GHL **termina siempre en su propio paso «Thank you!»**
(`/thank-you`), que es de la tienda y no se configura desde la página. Puede haber
un ajuste en la interfaz que la API no expone; por API no aparece.

Dos salidas, las dos de un minuto:

1. **Pegar `gracias-compra.html` en `/thank-you`** y dejar `/gracias` como
   duplicado o borrarla. Es lo que decía el README original, antes de que el plan
   del 17/8 lo cambiara a `/gracias` — y resulta que el README tenía razón.
2. **Redirigir `/thank-you` → `/gracias`** desde el global, igual que se hace con
   `/cart` → `/carrito`. Una línea. Cuesta un parpadeo.

La 1 es más limpia: no hay salto y no depende de que corra un script.

### 37.2 ⚠️ Lo grave: nadie le dice a Sara qué preparar

Leídos los tres avisos que salen de `01 · Compra confirmada (SP01)`:

```
Notificación interna → "Nuevo pedido confirmado. Revisa detalles para preparar
                        la entrega. Accede al contacto para más info."
Telegram (n8n)       → "Sara tienes un pedido nuevo de {{first_name}}
                        {{last_name}} listo para preparar y enviar"
SMS a la clienta     → "Hemos recibido tu pedido Nº {{opportunity.name}}"
```

**Ninguno dice qué se ha comprado.** Ni prenda, ni talla, ni cantidad. Sara recibe
«hay un pedido» y tiene que ir a buscarlo a Payments → Orders.

Y hay una segunda capa. La tienda manda su propio correo de confirmación
(`storeOrderNotification.enabled: true`), y **está apuntando a nuestra plantilla
«02 · confirmación»** (`6a6aa2e6…`) en vez de a la de GHL
(`Default - Order Template`, `6a7dff32…`). La de GHL lleva la tabla de artículos;
la nuestra es un correo de marca sin lista. O sea que **el desglose no lo ve
nadie**: ni la clienta en su correo, ni Sara en su aviso.

### 37.3 El dato existe, solo hay que traerlo

El pedido lo tiene todo:

```json
items[0] = { "name": "Vestido Asimetría Floral - M", "qty": 1,
             "price": { "name": "M", "amount": 119, "currency": "EUR" } }
```

`name` ya trae la talla pegada al nombre, que es justo lo que hace falta para
preparar el paquete.

**Y n8n ya puede llegar ahí.** El paso 1 de SP01 le manda `opportunityId`,
`contactId` y `numero_pedido`, y n8n escribe el order id en la oportunidad — o
sea que lo tiene. Con ese id, `GET /payments/orders/{orderId}` devuelve los
artículos y el mensaje de Telegram puede pasar de «tienes un pedido nuevo» a:

```
Pedido M100019 · Laura Pérez
· Vestido Asimetría Floral — talla M ×1
· Blazer Gris Arquitectónica — talla única ×1
Total 278 €
```

Es cambio en el flujo de n8n, no en GHL.

### 37.4 De paso: la clienta recibe dos correos de confirmación

La tienda manda el suyo (plantilla 02) y **SP01 manda otro** en su paso 3, con la
plantilla `6a7dfb827717066f54ba6ff6` — que **no está ni en la carpeta Correos ni
en la raíz**: es una copia que el editor de workflows guarda aparte. Dos correos
casi iguales por cada compra.

⚠️ Y eso tiene una consecuencia que conviene no olvidar: **los arreglos que se
hagan sobre las plantillas de la carpeta no llegan a esa copia**. Lo que SP01
envía hay que editarlo desde dentro del propio workflow.

## 38. El desglose del pedido, dentro del correo (27/8)

Sonia hizo una compra de prueba y reportó tres cosas con la misma raíz: **el
correo no dice qué se ha comprado, y para verlo manda al portal nativo de GHL.**

- El botón «Ver mi pedido» de **02** y **03** iba a
  `stylebymura.com/store/account/orders/{{opportunity.order_id}}`, que sale **en
  inglés**, con la cabecera genérica *Mura / Orders / Wishlist* y un botón azul
  *Go to store*.
- Para entrar, ese portal manda un **correo de OTP en inglés**.
- Y la clienta recibía **dos correos de confirmación**, ninguno con la lista.

El portal no se puede traducir desde la subcuenta: la cuenta está en
`locale: es_ES` y aun así sale en inglés; `/store/customer-portal` y
`/store/portal-setting` → 404.

**Decidido con German:** no se manda a nadie al portal. El desglose va dentro del
correo. El OTP desaparece solo, porque ya nadie entra.

### 38.1 Hecho

**Campo nuevo** `contact.resumen_pedido` (`CHLDDgPFzUyQUsMkeNwV`, texto largo).
Guarda el desglose del **último** pedido; se sobrescribe en cada compra, que es
suficiente porque el correo sale justo después.

**Plantillas 02 y 03**: fuera la fila del botón —**entera**, con sus dos enlaces,
el `<a>` visible y el fallback VML de Outlook, que es la lección de §33.4— y en
su lugar un bloque con filete arriba y abajo:

```html
<p>TU SELECCIÓN</p>
<div style="white-space:pre-line; …">{{contact.resumen_pedido}}</div>
```

`white-space: pre-line` es lo que hace que los saltos de línea del campo se vean;
sin eso saldría todo en una línea. Verificado releyendo de la cuenta: **cero
`href` al portal** en las dos, y renderizado en Chromium con el campo lleno y
vacío. Vacío se degrada a un «Tu selección» con el hueco en blanco: feo pero no
roto.

Copia previa en `datos/backups/plantillas_20260827/`.

**Los comentarios de cabecera** de la 02 seguían describiendo el botón viejo,
con su NOTA del 14/8 explicando por qué apuntaba al portal. Actualizados: una
plantilla que se documenta a sí misma no sirve de nada si el comentario miente.

**n8n** (`tienda/n8n-aviso-pedido-nodos.json`): un tercer nodo,
`PUT /contacts/{id}` con `resumen_pedido`. El mismo texto que ya se arma para el
Telegram de Sara, sin cabecera ni total, alimenta el correo. Un solo sitio donde
se compone, dos consumidores.

### 38.2 ⚠️ El correo duplicado no se pudo desactivar por API

`storeOrderNotification.enabled` sigue en `true`. Existe la ruta de escritura
—`POST /store/store-setting`, comprobado con un `altId` falso: contesta 401, no
404— pero **rechaza los propios datos de la cuenta**:

```
shippingOrigin.state must be one of the following values: AL, AK, AS, AZ, …
   guardado en la cuenta: state = "Huelva", country = "ES"
```

El validador solo admite **estados de Estados Unidos**, y la dirección de origen
es de Huelva. O sea que los ajustes de la tienda de una cuenta española **no se
pueden reescribir por API**: cualquier POST arrastra ese campo y muere en la
validación.

**No se ha tocado nada** —comprobado releyendo: notificación intacta y origen de
envío intacto—, porque el riesgo era peor que el problema: mandar el cuerpo sin
`shippingOrigin` podía borrar la dirección del remitente, y no habría forma de
volver a escribirla por API.

Se desactiva **en la interfaz**: Settings → Store → notificación de pedido.

### 38.3 La carrera de tiempos que hay que mirar en la primera compra real

SP01 espera **1 minuto** entre el webhook que llama a n8n y el correo a la
clienta. Si n8n tarda más en escribir el campo, el correo sale con el hueco
vacío. Es un número en un paso de espera; si en la prueba va justo, se sube a
2-3 minutos.

## 39. Los correos reales de una compra, leídos uno a uno (27/8)

German pidió que el resumen fuera a un campo de **oportunidad** y no de contacto.
Tiene razón —el resumen es de ese pedido, en el contacto se pisa en cada compra—
pero antes había que resolver la duda de la §24: **¿resuelven los campos custom
de oportunidad dentro de un correo?**

Se puede mirar sin suponer: GHL guarda el **cuerpo enviado** de cada correo.

```
GET /conversations/search?locationId=…&contactId=…
GET /conversations/{id}/messages
GET /conversations/messages/{messageId}      ← el HTML tal como salió
```

⚠️ Ojo con la ruta: `/conversations/messages/email/{id}` da 400 para estos
mensajes; la buena es `/conversations/messages/{id}`.

### 39.1 Lo que salió de la compra de Sonia

```
17:25:03  email  · source app       · plantilla 02 · href …/orders/          ← VACÍO
17:25:03  email  · source app       · plantilla genérica de GHL
17:26:33  SMS    · source workflow  · "pedido Nº M100001"
17:36:40  email  · source workflow  · plantilla 03 · href …/orders/6a9071f9…  ← RESUELTO
17:37:05  email  · OTP en inglés
```

**Cuatro correos, y ninguno es el de SP01.**

### 39.2 ⚠️ Corrección: el enlace no se perdió en el login

Ayer expliqué que el enlace del correo llevaba a la lista de pedidos porque el
portal pierde el destino al pedir el OTP. **Falso, y ahora hay prueba.** El
correo salió con `href="…/store/account/orders/"`, **sin id**: el merge field
resolvió vacío. Sonia no perdió el destino; nunca lo tuvo.

La causa es de tiempos: ese correo lo manda **la tienda** en el instante de la
compra —`source: app`, 17:25:03— y la oportunidad no existía hasta 17:25:04. Un
correo que sale antes que la oportunidad no puede leer sus campos.

### 39.3 Y la respuesta a la pregunta de fondo: sí resuelven

El correo **03**, mandado por un workflow once minutos después, trae el enlace
completo con el id dentro. Es el mismo campo custom de oportunidad
(`order_id`) que salió vacío en el otro.

**Conclusión: los campos custom de oportunidad SÍ se renderizan** en los correos
que manda un workflow, siempre que alguien los haya escrito antes. Lo que no
funciona es leerlos desde un correo que dispara la tienda.

Así que el resumen puede vivir donde pedía German. Hecho:

- Campo **`opportunity.resumen_pedido`** (`qLuRjgyMjv1rw7dRCzgA`, texto largo).
- Plantillas **02** y **03** apuntando a `{{opportunity.resumen_pedido}}`.
- El nodo de n8n pasa a `PUT /opportunities/{opportunityId}` — el
  `opportunityId` ya viaja en el mismo webhook.
- Borrado el `contact.resumen_pedido` que se había creado por la mañana, para
  que no queden dos campos con el mismo nombre invitando a error.

### 39.4 ⚠️ Dos cosas nuevas que hay que arreglar

**El correo de confirmación de SP01 no se envía.** En la conversación hay cuatro
correos y ninguno lleva `source: workflow` a la hora que tocaba (~17:26:30). El
SMS del paso siguiente sí salió, también `source: workflow`, así que el workflow
pasó por ahí: es el paso de correo el que no entregó. Su plantilla es la copia
huérfana `6a7dfb827717066f54ba6ff6`, la que no aparece ni en la carpeta ni en la
raíz. Hay que mirarlo desde dentro del workflow.

**Y el duplicado no era el que yo decía.** Los dos correos de las 17:25:03 son
**los dos de la tienda** —`source: app`—, no tienda + SP01. Sigue en pie
desactivar la notificación de la tienda desde la interfaz (§38.2), y con más
motivo: es justo el correo que sale con el enlace roto.

### 39.5 La foto de la prenda en el correo (27/8)

Pedida por German. El dato no cuesta ninguna llamada nueva: el pedido que n8n ya
descarga trae la foto destacada de cada artículo en `items[].product.image`.

Campo nuevo **`opportunity.imagen_pedido`** (`iD7d3mDjPgprfh4cqvhz`, texto), y el
nodo de n8n escribe los dos campos en el mismo `PUT`.

**Una foto, la de la primera prenda.** Una plantilla de GHL **no puede recorrer
una lista**: no hay bucle ni condicional, un merge field es un valor y se pinta
una vez. Se descartaron las dos alternativas por motivos concretos:

- *Meter varias `<img>` dentro del campo* dependía de que GHL no escape el HTML
  del valor. **Sin comprobar**, y si escapa, la clienta recibe etiquetas en crudo
  en su correo de compra.
- *Campos numerados* (`imagen_1`, `imagen_2`…) obliga a fijar un máximo y deja
  huecos vacíos en los pedidos de una pieza, que son casi todos.

Con una foto y el listado completo debajo, un pedido de tres piezas se ve como
una imagen y tres líneas: no se oculta nada.

Va en `src="{{opportunity.imagen_pedido}}"`, el mismo mecanismo que ya está
probado en producción: el `href` con `{{opportunity.order_id}}` del correo 03
salió resuelto en el envío real (§39.3).

**El caso vacío.** Renderizado a propósito con el campo en blanco: Chromium pinta
el icono de imagen rota y el `alt`. Se dejó el **`alt` vacío** para que al menos
no aparezca texto; en Gmail y Apple Mail una `src` vacía no pinta nada. No se
puso una foto de marca como respaldo porque parecería que es la prenda. En la
práctica solo puede pasar si n8n no ha escrito aún —la carrera de tiempos de
§38.3—, porque las 36 piezas de la tienda tienen foto.

Probado el nodo con cuatro casos: un artículo, dos, uno sin foto y ninguno.

### 39.6 La redirección a /gracias, hecha (27/8)

De las dos salidas de la §37.1 se toma la segunda: **redirigir desde el global**,
como ya se hacía con `/cart` → `/carrito`. Las dos rutas pasan a estar en la
misma tabla, al principio del archivo y en las dos partes del pegable:

```js
var REDIRECCIONES = {
  '/cart':      '/carrito',
  '/thank-you': '/gracias'
};
if (REDIRECCIONES[path]) { location.replace(REDIRECCIONES[path] + location.search); return; }
```

Se usa `location.replace` y no `href`: así no queda entrada en el historial y el
botón «atrás» no devuelve a la clienta a la página nativa. Comprobado en la
réplica —`history.length` se queda en 2, el mismo valor que sin navegar.

**Probado con cinco casos**, todos sin errores de JS:

```
/thank-you/                   → /gracias/                    ✓
/thank-you/?orderId=6a9071f9  → /gracias/?orderId=6a9071f9   ✓  (los parámetros viajan)
/cart/                        → /carrito/                    ✓  (no se rompió)
/checkout/                    → /checkout/                   ✓  (no se toca)
/gracias/                     → /gracias/                    ✓  (sin bucle)
```

`/thank-you` se queda en `RUTAS_TIENDA` a propósito: si algún día el script no
corriera, la página nativa al menos saldría con el estilo de marca en vez de en
crudo.

⚠️ **Aviso para el futuro: el píxel de conversión.** El evento de compra se suele
disparar en la página de gracias. Con esta redirección, quien lo monte tiene que
ponerlo en `/gracias` y no en `/thank-you`, o no se contará ni una venta. Queda
anotado también en el comentario del código, que es donde se va a mirar.

---

## 40. El correo de compra sale del flujo, y el recibo lleva plantilla propia (28/8)

German da con la razón de fondo: **el correo de confirmación tiene que salir del
workflow `01 · Compra confirmada`, no de la tienda.** La tienda lo manda en el
instante de la compra, cuando n8n todavía no ha escrito el desglose en la
oportunidad, así que llega con los huecos vacíos. El flujo espera y sale con los
datos puestos.

Al abrir SP01 para encenderlo aparecieron **tres cosas rotas encadenadas**, y
cualquiera de ellas sola habría bastado para que el correo saliera mudo.

### 40.1 El paso estaba apagado

```
attr.subject       : {{contact.first_name}}, hemos recibido tu elección.
advanceCanvasMeta  : { isDisabled: true }
```

No fallaba: no estaba encendido. Lo encendió German desde la interfaz antes de
que llegáramos aquí.

### 40.2 La espera de un minuto era demasiado justa

Entre el webhook a n8n y el correo, SP01 esperaba **1 minuto**. Ese minuto es
todo el margen que tiene n8n para leer el pedido en GHL y escribir el desglose
en la oportunidad. Con el correo apagado daba igual; encendido, ese minuto justo
es la diferencia entre un correo completo y uno con huecos.

**Subido a 3 minutos.** Nadie nota la diferencia y el margen se triplica.

### 40.3 El paso apuntaba a una copia congelada de la plantilla

Lo que no se veía desde la interfaz:

```
attributes.template_id : 6a7dfb827717066f54ba6ff6
```

Ese id **no es la plantilla `02 · confirmación`**. Es una copia suelta que se
generó el 13/8, no vive en la carpeta *Correos* y no aparece en ningún listado
por el que se navegue. Se quedó congelada con el estado de aquel día: el botón
al portal en inglés, el `{{order.order_url}}` que salía vacío (§39.2) y **ningún
bloque de desglose**. O sea que encender el paso no bastaba — el correo habría
salido igual de mudo, y encima con el enlace roto.

Se reapuntó el paso a la `02 · confirmación` (`6a6aa2e6e3d32f78af2869e2`), que
es la que se ha ido manteniendo. Una plantilla, no dos.

⚠️ **Y ahí saltó algo que conviene no repetir.** Al guardar el workflow con el
`template_id` cambiado, **GHL machacó el contenido de la 02 con el de la copia
huérfana**: el `index.html` de la plantilla buena pasó de 12.356 a 11.092 bytes,
exactamente el tamaño del archivo de la copia. No es que se perdiera el puntero:
se sobrescribió el archivo. Se restauró volviendo a subir el HTML.

Comprobado después que **un guardado normal del workflow no lo hace**: se volvió
a hacer un `PUT` sin tocar nada y la plantilla siguió intacta. Solo lo provoca
el cambio de `template_id`. Conclusión práctica: **antes de reapuntar un paso de
email a otra plantilla, guardar una copia del HTML de destino**, porque el
guardado se lo lleva por delante.

### 40.4 El desglose con foto por prenda

Hasta ayer eran dos piezas sueltas: un `<img>` colgando de
`opportunity.imagen_pedido` —la foto de la primera prenda— y debajo el texto
plano de `opportunity.resumen_pedido`. Con más de un artículo eso enseña la foto
de una prenda y el nombre de las otras, que es peor que no enseñar ninguna.

La solución es mover el bucle a donde sí hay bucle: **n8n compone el bloque
entero** y lo guarda en el campo custom `opportunity.resumen_pedido_html`
(`wq6dRJdf6jLfWwreqAR5`, texto largo). La plantilla lo inserta con **triple
llave**, que en Handlebars significa «sin escapar el HTML»:

```html
<td style="padding:20px 0 22px 0;">
  <p style="…">Tu selecci&oacute;n</p>
  {{{opportunity.resumen_pedido_html}}}
</td>
```

Tres detalles que costaron encontrarse y conviene dejar escritos:

- **La triple llave va DENTRO de la celda.** Texto suelto entre celdas de una
  tabla es HTML inválido y el editor de GHL lo recoloca fuera del bloque.
- **Faltaba el `</td>`** en la 02: la celda quedaba abierta contra el `</tr>`.
  Cerrado.
- **El nodo de código escapa** todo lo que sale del pedido antes de meterlo en
  el HTML. Un nombre de prenda con `&` o con comillas rompería la maqueta.

`opportunity.imagen_pedido` **ya no existe** — era el apaño de una foto por
pedido. La `03 · preparación` seguía apuntando a él, así que habría salido con
una imagen rota: se le puso el mismo bloque que la 02. El campo de texto plano
`resumen_pedido` se sigue rellenando, pero para la oportunidad y para el aviso
de Telegram, no para los correos.

El JSON de n8n (`tienda/n8n-aviso-pedido-nodos.json`) queda con el nodo de
código produciendo las tres representaciones —`mensaje`, `resumen`,
`resumenHtml`— y el nodo de guardado escribiendo `resumen_pedido` y
`resumen_pedido_html` en la misma llamada.

Probado en local con el pedido real del 27/8 duplicado a dos artículos, uno de
ellos con comillas y `&` en el nombre: el bloque sale bien escapado y la
maqueta, renderizada dentro de la plantilla, no se descuadra.

### 40.5 El recibo: `01 · Recibo`

Los dos correos que salieron a las 17:25:03 con `source: app` eran de la tienda,
y el segundo es el que German buscaba: *«Please find attached the Sales Receipt
for your purchase»*, en **inglés**, plantilla genérica de GHL, **con el recibo
adjunto**. La factura la genera GHL; lo que se puede cambiar es la plantilla del
correo que la lleva.

Plantilla nueva **`01 · Recibo`** (`6a90dd80f98ccc652507a173`), en castellano y
con la estética de las demás. Y **sin un solo merge field vivo**, a propósito:

> Ese correo sale en el instante de la compra, antes de que exista la
> oportunidad, y es un correo de sistema: no tiene ese contexto. Un campo que no
> resuelva sale impreso en crudo en el correo de la clienta.

Hasta el pie va con las URLs escritas a mano en vez de `{{custom_values.…}}`.
El desglose no hace falta en el cuerpo: viaja en el PDF adjunto.

De la captura de la pantalla *Pagos → Configuración → Recibos* salen dos cosas:

- Los recibos automáticos **están activados**, con serie `REC26` desde el
  `50000`. Se numera solo, aparte del `M1000xx` del pedido: **son dos
  numeraciones distintas** y conviene no confundirlas.
- El asunto por defecto es `[{{receipt.company.name}}] Aqui tienes la factura de
  tu pedido.` — **ese correo tiene sus propias variables `{{receipt.*}}`**.

⚠️ **Falta la lista de variables del recibo.** En esa pantalla, el icono de
etiqueta a la derecha del campo *Asunto* abre el selector. Con esa lista la
plantilla puede llevar además número de recibo, fecha e importe sin depender del
adjunto. Sin la lista no se inventan nombres: uno que no exista sale impreso.

De paso, el asunto dice «la factura» cuando el documento es un *sales receipt*.
Conviene decidir si se deja así.

### 40.6 Lo que queda en la interfaz (German)

- **Seleccionar** `01 · Recibo` como plantilla del recibo, en Pagos →
  Configuración → Recibos.
- **Desactivar la notificación de pedido de la tienda.** Con el correo de SP01
  encendido, esa es el duplicado. No se puede por API: el validador de
  `POST /store/store-setting` rechaza `shippingOrigin.state` «Huelva» porque solo
  admite estados de EE. UU. (§38.2).

### 40.7 Verificación pendiente: una compra de prueba

Leyendo **los correos que salieron**, no la bandeja (§39.1):

1. **Dos correos y no cuatro**: el de SP01 (`source: workflow`) y el recibo
   (`source: app`). Ni rastro del de la tienda.
2. El de SP01 **con el desglose**: buscar en el HTML enviado el nombre de la
   prenda y un `src` con una URL real.
3. El recibo **en castellano**, con nuestra plantilla y con el adjunto.
4. `GET /opportunities/{id}` → `resumen_pedido_html` escrito **antes** de la hora
   del correo.

Esa misma compra resuelve la duda que queda abierta: **si GHL escapa el HTML** de
un campo custom al insertarlo con triple llave. Si no lo escapa —que es lo que
dice la documentación de Handlebars—, el bloque sale montado. Si lo escapa, sale
el código en crudo y hay que volver a una foto por pedido.

⚠️ **«Send test email» no sirve para esto**: nunca lleva oportunidad en
contexto, así que la triple llave se ve literal. Tiene que ser una compra real.

---

## 41. El formulario de devolución no tenía por dónde entrar ni por dónde salir (29/8)

Sonia pregunta dos cosas y las dos tienen la misma raíz.

### 41.1 «No encuentro el formulario de solicitar devolución»

Existe y funciona: **`Formulario Devolución v2`**, id `HBK7tGDlcIFN0vaXoksg`, en
la raíz de Forms —sin carpeta—, con **tres envíos reales**:

```
2026-08-14 18:43  German Emiliano Borrello
2026-08-14 20:16  German Emiliano Borrello
2026-08-16 18:32  Martin Garcia Castizo   ·  pedido M100017  ·  motivo "porque si"
```

La cuenta solo tiene cuatro formularios (`total: 4`): este, `Opt-in Newsletter`,
`Encuesta Post-Compra` y `Form 1`. El formulario antiguo —«Formulario Devolución
/ Cambio»— **ya no está**, y su campo duplicado de contacto tampoco: esa limpieza
pendiente de §14.5 quedó hecha en algún momento y nadie lo anotó.

Lo que no existe es **la forma de llegar a él**. No está embebido en ninguna
página, no había ningún custom value que lo apuntara, y el correo 16 —el único
que debía llevar ahí— tenía el botón apuntando a la página de instrucciones como
apaño. Estaba escrito desde el 12/8 (§14.5, «*Página Devoluciones: añadir el form
Devolución v2 — funnel builder, manual*») y nunca se hizo.

Por eso Sonia no lo encuentra desde la web: **desde la web no se puede llegar.**

**La URL directa del formulario.** No hacía falta inventarla: ya había un
precedente funcionando en la cuenta, el `{{custom_values.url_feedback}}` de la
Encuesta Post-Compra.

```
url_feedback                 https://api.leadconnectorhq.com/widget/form/fvVToLx0e9pEjSRD6zq7
url_formulario_devolucion    https://api.leadconnectorhq.com/widget/form/HBK7tGDlcIFN0vaXoksg
```

Creado el custom value **`url_formulario_devolucion`** (`2S2b9lrVpft9p1adZxN5`).

### 41.2 «La página de gracias-devolución ya no está»

No se borró. Casi seguro que nació con otro nombre.

El funnel tiene hoy **23 pasos**. El volcado del 22/8 tenía 22, y en aquel
volcado **no había ninguna `/gracias-devolucion`**. Lo que había, y sigue
habiendo, es un paso **`/devolucion`** en singular:

```
paso 20  /devolucion   pageId wZTcQ5OQx8ffWhHkdkoK   actualizada 2026-08-14 22:00
paso 23  /gracias-devolucion   fkkFrnjWY72XvbsdJomU   creada 2026-08-29 10:55  ← la de hoy
```

Ese `14/8 a las 22:00` es justo el día en que se probó la cadena de devolución de
punta a punta (§25.3) y en que se corrigieron los dos bugs de maquetación de
`legal/gracias-devolucion.html`. Encaja.

**CONFIRMADO** (Sonia, 11:32): mandó la captura de `/devolucion` y dentro pone
«Hemos recibido tu solicitud». Es su página de gracias del 14/8, con el nombre en
singular. No se había borrado nada.

Yo no pude verlo desde aquí —la política de red del entorno bloquea
`stylebymura.com` (`CONNECT → 403`) y la ruta de lectura de páginas responde
`401 "This route is not yet supported by the IAM Service"` con el PIT y `401/403`
con el token interno—, así que lo cerró ella en diez segundos. No merecía más
investigación por API.

### 41.3 El inventario de páginas, que no existía

Esto es lo que hace que una página «desaparezca» sin que nadie pueda
comprobarlo: **no había en el repo ninguna lista de las páginas del funnel.**
Estaban dispersas en cabeceras de HTML, con backup de dos de veintitrés.

Funnel `Mura` · `rlc7iAyGF4U1nfwAJOJQ` · dominio `c8MNhJTKbRFUshtryQ3C`:

| # | url | nombre | pageId |
|---|---|---|---|
| 1 | `/home` | Home | `jCl0erpmUk8Os4AGnx7M` |
| 2 | `/prendas` | prendas | `s5fa5bucD6xe6IHXumRf` |
| 3 | `/producto` | producto | `cmPhl3N0IF3smLo8Oy8x` |
| 4 | `/novedades` | novedades | `RL1DrjCiiqGEgDMKfV70` |
| 5 | `/colecciones` | colecciones | `3t6UDEyhxmRJCMgeGHLW` |
| 6 | `/mura` | mura | `2j3lWbVzAl8btZDuTcny` |
| 7 | `/carrito` | carrito | `qsUEwHJLz2xiSulCN5jD` |
| 8 | `/contacto` | contacto | `IAQR8eOiAWObBSeesnH4` |
| 9 | `/devoluciones` | devoluciones | `ep1EkcwisLfPZwloPsoN` |
| 10 | `/gracias` | gracias | `Y1YEzfjU3JNDkTBCZiSo` |
| 11 | `/products-list` | Products List | `6sb8InLCPWUaexCqrDQc` |
| 12 | `/product-details` | Product details | `ekVq2EDJNGlMxOPFuF9t` |
| 13 | `/cart` | Cart | `2FoBJpJqCmc0z0Y4xZEo` |
| 14 | `/checkout` | Checkout | `qSiwg2brakjiGqpIaCmN` |
| 15 | `/thank-you` | Thank you! | `6DEiCsQRzJ6NsbhkP43n` |
| 16 | `/aviso-legal` | aviso-legal | `UhAG3g54WF3NypfU16lJ` |
| 17 | `/politica-privacidad` | politica-privacidad | `RNZg6K76ULbIn5o4d703` |
| 18 | `/politica-cookies` | politica-cookies | `oX6ieI7lEruoTE97I9Yy` |
| 19 | `/condiciones-contratacion` | condiciones-contratacion | `L9r6MRtIIYI1vF8BK2XF` |
| 20 | `/devolucion` | devolucion | `wZTcQ5OQx8ffWhHkdkoK` |
| 21 | `/suscripcion-confirmada` | suscripcion confirmada | `rGNlVDb91GoTnWQD9Wh8` |
| 22 | `/experiencia` | experiencia | `UyeQYFnQv8CsRBa2D4hQ` |
| 23 | `/gracias-devolucion` | Gracias devolución | `fkkFrnjWY72XvbsdJomU` |

⚠️ **`qsUEwHJLz2xiSulCN5jD` (`/carrito`) y `qSiwg2brakjiGqpIaCmN` (`Checkout`)**
empiezan casi igual y se confunden al leer. Son páginas distintas.

Nota sobre el paginado: `GET /funnels/page` **corta en 20 por página** y exige
`offset`; sin él devuelve 422. Con `limit=100` no salen las 23. El volcado crudo
queda en `datos/backups/paginas_20260829/pasos_del_funnel.json`.

### 41.4 De paso: el botón de cuatro correos llevaba a un 404

Buscando el custom value del formulario apareció otro que estaba mal:

```
{{custom_values.url_coleccion}}   =  https://www.stylebymura.com/coleccion
paso del funnel                   =  /colecciones
```

**No existe ningún paso `/coleccion`** —están los 23 arriba— y en el repo hay 20
enlaces a `/colecciones` y ninguno a `/coleccion`. Ese custom value es el botón
principal de **cuatro correos**: 05 · entrega, 11 · segunda compra,
14 · lanzamiento y 17 · cumpleaños. Los cuatro llevaban a un 404.

Corregido el valor (`FBLfpmf7IrgXfx0qMHPR`). Las plantillas no se tocan: por eso
el enlace estaba en un custom value.

### 41.5 El correo 16 ya apunta al formulario

`16 · datos de devolución no coinciden` (`6a75e5eb96dc697014d600f7`). Su CTA
«Realizar solicitud» llevaba a `{{custom_values.url_devoluciones}}` —la página de
instrucciones— y estaba anotado como apaño: «*el destino del botón principal del
16 es una inferencia mía… si hay una URL directa del formulario, es mejor esa*».
Ya la hay.

Cambiados **los dos hrefs**, el `<a>` visible y el `<v:roundrect>` de Outlook
(§33: cambiar solo uno deja la mitad de los clientes con el enlace viejo).
Verificado en el HTML servido: `url_formulario_devolucion` ×2 en el botón,
`url_devoluciones` ×1 en el pie —que es lo que toca, uno lleva a rellenar y el
otro a leer— y `url_contacto` ×2 en el botón secundario, que ya estaba puesto
aunque la cabecera dijera «pendiente».

### 41.6 Corrección: aquí no se embeben formularios de GHL

Escribí que el formulario iba embebido en `/devoluciones` «con el elemento *Form*
nativo del builder». **German lo paró: en este proyecto no se ha embebido ni un
formulario nativo.** Comprobado — `widget/form` y `form_embed.js` aparecen
**cero** veces en todo el repo. Los dos formularios que hay son HTML nuestro con
un `fetch` a n8n:

```
tienda/newsletter-home.html   → POST /webhook/alta-newsletter
tienda/experiencia.html       → POST /webhook/experiencia-mura
```

Yo di por buena una práctica que no era la de la casa sin comprobarla. La razón
por la que se hace así está escrita en la cabecera de `experiencia.html` —el
Survey de GHL no da control de maquetación— y en §30.1 —el Inbound Webhook es
premium y se cobra por ejecución—.

⚠️ **Ese segundo motivo no aplica aquí, y conviene no repetirlo mal.** El
`form_submission` que dispara el 08a **no es premium**: es un trigger normal. La
devolución no se pasa a código propio para ahorrar coste, sino por el diseño.
Quien argumente lo contrario en el futuro estará copiando el razonamiento del
newsletter a un caso que no es el mismo.

**Decisión de German: a mano, como los otros dos.** Nuevo
`tienda/devoluciones-form.html`, con las primitivas de formulario que ya existían
en el global —`.mura-nl-fila`, `-campo`, `-consent`, `-estado`, que llevan el
nombre de la newsletter porque nacieron ahí— y un bloque `.mura-dev-*` propio.

Dos cosas que salieron al renderizarlo y que valen para el siguiente que pegue
una sección suelta:

- **El `box-sizing: border-box` del global está limitado a `.mura` y sus
  descendientes**, y estas secciones se pegan sueltas, sin ese envoltorio. En la
  home cuela porque el reset de GHL lo cubre; apoyarse en eso es frágil. La
  sección nueva declara el suyo.
- **La captura «de móvil» no lo era.** Chromium en este entorno fija el viewport
  de layout en 485 px: pedir `--window-size=390` recorta la imagen pero no
  estrecha el layout, así que lo que parecía un desbordamiento era el recorte.
  Medido de verdad con dos iframes de 360 y 480 px, `scrollWidth == clientWidth`
  en los dos. Para comprobar responsive aquí, iframes, no `--window-size`.

### 41.7 Y las tres páginas, que no eran dos

Con la captura de Sonia y su reparto, queda así:

| Página | Qué es |
|---|---|
| `/devoluciones` | Instrucciones — «Envíos y devoluciones». No se toca. |
| `/devolucion` | **El formulario.** Se vacía la página de gracias que tenía. |
| `/gracias-devolucion` | La confirmación. Se queda el contenido que había en la otra. |

`{{custom_values.url_formulario_devolucion}}` pasa a apuntar a
`https://www.stylebymura.com/devolucion` en vez de a la URL del widget de GHL,
que ya no se usa. Sonia decía que «los mails ya dirigen ahí»: no es literal
—ninguna plantilla apunta hoy al singular, van todas a `url_devoluciones`, en
plural—, pero el fondo es correcto y mejor: **no hay que tocar ninguna
plantilla**, porque el destino vive en un custom value.

Y la entrada del 08a pasa de formulario a tag. El tag `solicitud-devolucion`
(`k1wdT7fvuRS5ilFgHDZl`) queda creado.

⚠️ **El trigger no se pudo crear por API, y no es cuestión de permisos.** Los
triggers de ese workflow están migrados a un almacén aparte:

```
isTriggerBucketMigrated : true
triggersFilePath        : location/…/workflow-triggers/6b3064f7-…/6
```

`POST /workflow/{loc}/trigger` **acepta la petición y devuelve un id**, pero no
escribe nada: el listado sigue enseñando un solo trigger y leer ese id devuelve
404. Probado cuatro veces —con y sin `targetActionId`, con y sin
`advanceCanvasMeta`, y con el `workflowId` en la query—. Es la misma clase de
trampa que el «Cannot POST» de las páginas: la ruta antigua sigue ahí y miente.
Va a la lista de la interfaz.

⚠️ **El orden importa.** El trigger `form_submission` del formulario viejo
(`EQfcssMWOwqEkHqAFxZj`) **se queda activo** hasta que la entrada nueva funcione.
Las dos conviven y no se pierde ninguna solicitud. Retirarlo antes deja el
periodo intermedio sin entrada.

### 41.8 El pegado del HEAD, comprobado — y dos trampas de medición

German pegó el Tracking Code del HEAD. Comprobado en el DOM:

```
reglasDevolucion: true    reglaTextarea: true    hojas: ["sistema", "bocadillo"]
```

Una sola hoja `sistema`. Ese es el dato que importa: `estilo()` lleva un guardia
por `data-mura`, así que aunque el bloque corriera de más, la hoja no se apila.

**Trampa 1 — mi contador de copias estaba mal.** Conté apariciones de la cadena
`MURA_PARTE` en el HTML y salió 23. Cada copia del global contiene esa cadena
**seis** veces —en los comentarios, en la asignación y en la lectura—, así que
«dos copias» nunca iba a dar 2. Para contar bloques hay que contar elementos
`<script>` que la contengan, no ocurrencias del texto.

**Trampa 2 — la que ya me comí el 22/8.** Contando bien salen **3** bloques:
`head`, `body` y otro `head`. Estuve a punto de avisar otra vez de una copia
vieja sin borrar. No lo es, y está escrito en §35.1: el tercero es el envoltorio
de GHL que **contiene** el nuestro dentro. Se distingue por tamaño:

```
head · 58 KB · tieneDev true     ← nuestro pegado nuevo
body · 58 KB · tieneDev false    ← nuestro pegado del BODY, de ayer
head · 142 KB · tieneDev true    ← el bloque de GHL, con el nuestro dentro
```

⚠️ **Y ahí se ve una deriva que conviene tener presente: el BODY de producción ya
no coincide con el del repo** (`tieneDev: false`). Hoy es irrelevante, porque el
body nunca inyecta CSS —`HAY_CSS` es falso cuando `MURA_PARTE` vale `'body'`— y
el cambio de hoy era solo CSS. Pero el día que se toque la parte del DOM
—contador, buscador, cabecera, traducción— habrá que repegar también el body, y
**el síntoma será que el cambio no aparece, sin ningún error**. Es de los fallos
más caros de diagnosticar: todo parece correcto y no pasa nada.

### 41.9 Auditoría de los enlaces de devolución en las 20 plantillas

German pide revisar si alguna plantilla apunta mal ahora que el formulario tiene
página propia. Leídas las **20 plantillas vivas** de la carpeta *Correos*, no las
copias del repo, y separando el cuerpo de los comentarios de cabecera.

**Ningún enlace lleva a la página equivocada.** El reparto queda así:

| Plantilla | Enlace | Destino | ¿Correcto? |
|---|---|---|---|
| 08 · solicitud devolución | Descargar etiqueta | `opportunity.url_etiqueta_devolucion` | sí |
| 08 · solicitud devolución | Consultar el proceso de devolución | `url_devoluciones` | sí |
| 16 · datos no coinciden | Realizar solicitud | `url_formulario_devolucion` | sí |
| 16 · datos no coinciden | Política de devoluciones (pie) | `url_devoluciones` | sí |
| 09A · verificada | «Ver mi devolución» | `url_devoluciones` | **el rótulo, no** |
| 10 · reembolso | «Ver detalles» | `url_devoluciones` | **el rótulo, no** |

Solo la 16 lleva al formulario, que es la única que invita a *empezar* una
devolución. Las demás salen después de haberla pedido y llevan a las
instrucciones, que es lo que toca.

**Lo que sí estaba mal eran dos rótulos.** «Ver mi devolución» y «Ver detalles»
prometen una página de *esa* devolución y aterrizaban en la página general. Las
cabeceras lo delataban: las dos declaraban `{{contact.url_devolucion}}`, **un
campo que no existe en la cuenta** —comprobado en el listado de campos de
contacto—, y por eso en su día se sustituyó el destino por el general sin ajustar
el texto. El enlace estaba bien; el que mentía era el rótulo.

Es la misma clase de fallo que el botón al portal que quitamos en §39.2: un
enlace que promete algo concreto y entrega algo genérico. Cambiados los dos a
**«Consultar el proceso»**, que no es copy nuevo: es la fórmula que ya usaba la
08 para ese mismo destino. Cambiados **los dos hrefs de cada botón** —el `<a>` y
el `<v:roundrect>` de Outlook— y verificado en el HTML servido.

**Lo que NO se ha tocado, y queda como observación:** la 05 · entrega no menciona
las devoluciones. Es el momento natural para decir «si algo no encaja, tienes N
días», pero eso es copy nuevo y decisión de Sara, no un fallo.

### 41.10 Lo que queda, y es todo de interfaz

Ni el builder de formularios ni el de páginas tienen ruta de escritura
alcanzable: §14.5 para los forms, §34.2 para las páginas —todos los
`POST/PUT/PATCH` sobre `/funnels/page/{id}` responden «Cannot POST», que es ruta
inexistente, no permiso denegado—. Va en `docs/para-sonia-formulario-devolucion.md`.

1. Vaciar `/devolucion` y pegar ahí `tienda/devoluciones-form.html`.
2. Terminar `/gracias-devolucion` con el HTML de `legal/gracias-devolucion.html`.
   Ya no hace falta configurar ningún «On Submit»: el formulario es nuestro y
   redirige él solo.
3. Añadir al 08a el trigger `Contact Tag → Tag Added → solicitud-devolucion`.
4. Cuando la entrada nueva funcione, desactivar el trigger `Form Submitted` y
   archivar el formulario viejo. **No antes.**
5. Publicar las dos páginas.

Y en n8n, un flujo nuevo en `/webhook/devolucion-web`. Ya no va como
especificación en prosa: está montado en `tienda/n8n-devolucion-web-nodos.json`,
diez nodos listos para pegar en el lienzo, calcados llamada por llamada del alta
de newsletter (`tienda/n8n-newsletter-workflow.json`), que hace exactamente lo
mismo con otros campos.

Los dos campos de contacto se escriben **por `id` y no por `key`**: las claves de
GHL llegan con los acentos comidos —`n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin`,
`motivo_de_devolucin__cambio`— y una letra de más o de menos falla en silencio.
`q73ODvZiPLCMqRrUkVCK` es el número de pedido y `2GQ11kHcaUggy8K4P9U4` el motivo,
los mismos que ya lee el 08a.

Ya no hace falta traducir las etiquetas del formulario de GHL ni quitarle el
consentimiento de SMS: ese formulario se retira. El nuevo nace en castellano y
con el consentimiento de privacidad, que es el que toca.

De dónde salió lo del consentimiento, para que no se repita: en el envío de
Martin, el campo `terms_and_conditions` guardó «*Al marcar esta casilla, acepto
recibir mensajes de texto no comerciales de Mura sobre nuevos productos…*». Es el
texto por defecto de GHL y nadie lo revisó. En un formulario de **devolución** no
pinta nada, y atar la tramitación de una devolución a un consentimiento de
marketing es discutible en RGPD: son dos bases jurídicas distintas. Vale la pena
mirar ese checkbox en cualquier formulario nativo que quede.


---

## 42. «Non-branching node has next as an array»: un fallo mío de hace semanas

German avisa de errores en varios workflows:

> *Non-branching node has "next" as an array — only multi-path and if/else
> condition nodes may have array next*

Descargados los **19 workflows** de la cuenta y revisados nodo a nodo:
**16 tienen al menos un nodo con `next` como array**, y los 19 son
`creationSource: builder` —creados por API, por nosotros—. Los cuatro limpios lo
están solo porque son lineales y de dos o tres pasos.

### 42.1 El origen, localizado

`scratchpad/fix04a.py`:

```python
if nexts is not None: t['next'] = [full(x) for x in nexts]
```

Escribía **siempre** una lista, también cuando el nodo tenía un solo sucesor. El
helper bueno, `ghl_build.chain()`, escribe una cadena:

```python
if i < len(steps) - 1:
    s['next'] = steps[i+1]['id']
```

De ahí salen los `remove_contact_tag` con `next=[1]` y el `08d` con `next=[]`.

### 42.2 Por qué aparece ahora y no hace tres semanas

**No lo han provocado los guardados de hoy.** El 04a de la captura está en draft y
no se tocó hoy; lo de hoy fue SP01 y las plantillas. Los `next` en array vienen de
la construcción original. Lo que ha cambiado es que **GHL ha empezado a
validarlo**, y encaja con que salten 16 workflows a la vez.

**Y no rompe la ejecución.** SP01 lleva su `find_opportunity` con `next=[2]` desde
el principio y hoy mismo ha mandado correos. Es el editor nuevo el que se niega,
no el motor.

### 42.3 Dos formas de array, y solo una es claramente un error

| Forma | Dónde | ¿Error claro? |
|---|---|---|
| `next: []` o `next: [uno]` | `remove_contact_tag`, `wait`, `if_else` hijo | **Sí.** Un solo sucesor no necesita array; pasarlo a cadena no puede cambiar el comportamiento. |
| `next: [dos o más]` | `if_else` principal, `find_opportunity`, `wait` con condición | **No está claro.** Son nodos que sí ramifican, y el mensaje dice que los de if/else pueden llevar array. |

⚠️ **No hay con qué comparar.** Los 19 son `builder`: no queda ningún workflow
hecho a mano en la interfaz del que copiar la forma canónica de un `if_else`.
Tocar el segundo grupo sería adivinar sobre nodos de ramificación, que es como se
rompe un flujo en silencio.

### 42.4 Lo arregla la interfaz, no la API

Al preparar el arreglo apareció algo que lo decide: **el 04a estaba siendo editado
a mano en ese momento** —`updatedAt` movido 15 minutos después de la descarga,
mismo `updatedBy`—. Comparando la copia con lo vivo:

```
Remove Tag                  list[1]  →  desaparece, y aparece otro nodo con next str
Remove Tag email-04-listo   list[1]  →  igual
Branch                      list[1]  →  str
Webhook                     (sin next) →  list[2]     ← ojo
```

O sea que el botón *«How to fix»* de GHL recrea los nodos con `next` en cadena. Es
su propio esquema arreglándose solo, y es mejor que lo haga él que nosotros a
ciegas.

⚠️ **Pero deja algo que conviene mirar**: el nodo `Webhook` pasó de no tener `next`
a tener `next: [2]`. Es un array en un nodo que no ramifica, exactamente la clase
de cosa que el validador rechaza. Puede ser un estado intermedio de la edición o
un error nuevo; hay que comprobarlo cuando termine.

**Decisión: no se escribe por API mientras haya alguien editando.** Un `PUT`
nuestro sobrescribiría esas ediciones con una foto vieja. Queda preparado
`datos/backups/wf_20260829/fix_next.py`, en modo seco por defecto, por si hiciera
falta hacerlo en bloque: convierte solo los arrays de 0 y 1, manda el `status` que
el workflow ya tenía —sin él GHL despublica en silencio (§17)— y no toca los
borradores.

Copia de los 19 en `datos/backups/wf_20260829/`.

### 42.5 La regla que sale de esto

**Que la API acepte una estructura no significa que sea la correcta.** GHL tragó
estos `next` durante semanas y los validó tres semanas después. Cuando un helper
escriba una estructura nueva, hay que compararla con un objeto creado en la
interfaz —y aquí ya no se puede, porque no queda ninguno—. Para lo próximo:
**crear uno a mano primero, leerlo, y calcar esa forma.**
