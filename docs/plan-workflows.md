# Plan de conexión de workflows — Mûra

Guía para conectar las 18 plantillas de la carpeta **Correos** (`6a6aa119fee4921a97537ba5`) con los workflows de la subcuenta (`NxPF5fOicowujokEk5Hm`). Los asuntos y previsualizaciones salen de la cabecera de cada HTML — las plantillas de GHL no los almacenan, así que **se escriben a mano en el paso "Send Email" de cada workflow**.

> Los workflows en borrador de la subcuenta (AP01, AP02, AP03…) deben mapearse a los flujos de abajo. Al abrir cada borrador, verificar a qué flujo corresponde y anotar aquí su nombre real.

---

## Flujo 1 · Transaccional de pedido (compra → reseña)

Secuencia disparada por la compra. Los pasos 02–04 son transaccionales (sin enlace de baja); del 05 en adelante son comerciales (respetan la baja de marketing).

| # | Plantilla (ID) | Disparador / espera | Asunto | Previsualización |
|---|---|---|---|---|
| 02 | `6a6aa2e6e3d32f78af2869e2` | Compra realizada (inmediato) | `{{contact.first_name \| default: "Hola"}}, hemos recibido tu elección.` | Gracias por confiar en MÛRA. |
| 03 | `6a6aa2e814830a62bce73c7a` | Estado "Preparando" (+1 día) | `{{contact.first_name \| default: "Hola"}}, estamos preparando tu MÛRA.` | Cada detalle cuenta. |
| 04 | `6a6aa2ea4eb3e6c4d953427c` | Pedido enviado | `{{contact.first_name \| default: "Hola"}}, tu MÛRA ya está en camino.` | Ya puedes seguir su recorrido. |
| 05 | `6a6aa2ed3954360b6a94f117` | Entrega confirmada | `{{contact.first_name \| default: "Hola"}}, ya está contigo.` | Esperamos que la disfrutes durante mucho tiempo. |
| 06 | `6a6aa2ef3fca8e1053eff501` | Entrega +3 días | Nos encantará saber cómo ha sido. | Tu experiencia también forma parte de MÛRA. |
| 07 | `6a75e5e973e37ca123637d76` | Entrega +7–10 días | Tu opinión también forma parte de MÛRA. | Nos encantaría conocer cómo ha sido tu experiencia. |
| 18 | `6a75e5ef7d94d21ac56215a0` | Cliente satisfecha, tiempo después de la entrega | Tu experiencia puede ayudar a otras mujeres. | Comparte tu opinión sobre MÛRA en Google. |

**Nota 07 vs 18**: el 07 lleva a un formulario de feedback propio (privado); el 18 a la reseña pública de Google. Mantener ambos solo si se buscan las dos cosas. Recomendación: condicionar el 18 a feedback positivo del 06/07.

## Flujo 2 · Devoluciones

Todo transaccional (sin enlace de baja). Se integra con el workflow n8n "08 · Devolución" (etiqueta Nacex vía `getAlbDevolucion`).

| # | Plantilla (ID) | Disparador | Asunto | Previsualización |
|---|---|---|---|---|
| 08 | `6a6aa2f161a2115039f0034f` | Solicitud de devolución desde "Gestionar mi pedido" | Hemos recibido tu solicitud de devolución. | Te acompañamos en los siguientes pasos. |
| 16 | `6a75e5eb96dc697014d600f7` | Datos de la solicitud (nº pedido / correo) no coinciden | Necesitamos confirmar algunos datos de tu solicitud. | Hemos detectado una pequeña diferencia en la información facilitada. |
| 09A | `6a6aa2f38ea1ab2089eb114e` | Devolución recibida y revisada OK | Hemos revisado tu devolución. | Todo está correcto. Tu reembolso se procesará en breve. |
| 09B | `6a6aa2f661a2115039f00392` | Devolución recibida, no cumple condiciones | Hemos revisado tu devolución. | Necesitamos informarte sobre el resultado de la revisión. |
| 10 | `6a6aa2f8301f379d94c7b7ce` | Reembolso emitido | El proceso ha finalizado. | Tu reembolso ya está en marcha. |

**Nota**: 09A y 09B comparten asunto a propósito (decisión de la clienta); se diferencian en la previsualización.

## Flujo 3 · Marketing / ciclo de vida

Todo comercial (con enlace de baja). Cada uno es un workflow independiente.

| # | Plantilla (ID) | Disparador | Asunto | Previsualización |
|---|---|---|---|---|
| 01 | `6a6aa2e4a1ebd230f8649167` | Suscripción a la newsletter | Bienvenida a MÛRA. | Tu historia con MÛRA empieza hoy. |
| 11 | `6a6aa2fa8ea1ab2089eb119e` | Segunda compra realizada | Qué alegría volver a encontrarnos. | Gracias por volver a elegir MÛRA. |
| 12 | `6a6aa2fc61a2115039f003cf` | 3 meses sin actividad | Hace tiempo que no coincidimos. | Queríamos volver a saludarte. |
| 14 | `6a6aa2fe0d3eda23ad6dc3d7` | Nueva colección (lanzamiento manual/campaña) | Una nueva historia comienza. | La nueva colección ya está disponible. |
| 15 | `6a6aa30014830a62bce73d47` | Pieza repuesta en stock | Ha vuelto. | La pieza que esperabas vuelve a estar disponible. |
| 17 | `6a75e5ed44a7d6989c157ce7` | Cumpleaños de la clienta | Hoy queremos celebrar contigo. | Un pequeño detalle de MÛRA para acompañarte en tu día. |

**Nota 17**: usa el código fijo `CONTIGOMURA10`. Para uso único real por clienta, sustituir por un código dinámico (`{{contact.codigo_cumple}}`) generado por el workflow.

---

## Campos personalizados de contacto requeridos

Crear en Settings → Custom Fields antes de activar los workflows. Los rellenan los workflows (GHL o n8n):

| Campo | Usado en | Quién lo rellena |
|---|---|---|
| `url_pedido` | 02, 03 | Workflow de pedido (n8n / integración tienda) |
| `url_seguimiento` | 04 | Workflow de envío (nº de seguimiento del transportista) |
| `url_feedback` | 06 | Pendiente: la clienta debe asignar la URL del formulario |
| `url_etiqueta_devolucion` | 08 | Workflow n8n "08 · Devolución" (etiqueta Nacex) |
| `url_devolucion` | 09A, 10 | Workflow de devoluciones |
| `url_pieza` | 15 | Workflow de reposición (URL de la pieza repuesta) |
| `codigo_cumple` | 17 (opcional) | Solo si se opta por código de cumpleaños dinámico |

## Custom values (valores globales de la subcuenta)

Crear en Settings → Custom Values (son fijos de marca):

| Custom value | Usado en | Contenido |
|---|---|---|
| `url_home` | 01, 12 | Home de stylebymura.com |
| `url_coleccion` | 05, 11, 14, 17 | Página de colección |
| `url_devoluciones` | 08 | Página "Cómo devolver un pedido" (**pendiente de crear**) |
| `url_contacto` | 09B | Canal de atención al cliente |

## Enlaces pendientes escritos en duro (bloquean activación)

Estas plantillas tienen texto placeholder que hay que sustituir **en el HTML** (aparece 2 veces por plantilla: botón VML de Outlook + `<a>` normal):

| Plantilla | Placeholder | Sustituir por |
|---|---|---|
| 07 · reseña | `AÑADIR ENLACE` | URL del formulario de feedback (no existe aún) |
| 16 · datos devolución | `AÑADIR LINK` | URL del formulario de devolución |
| 16 · datos devolución | `AÑADIR CONTACTO` | Canal de atención (puede reutilizarse `{{custom_values.url_contacto}}` del 09B) |
| 18 · reseña Google | `AÑADIR ENLACE GOOGLE` | Enlace "escribir una reseña" de la ficha de Google Business |

Tras sustituir, re-subir el HTML a la plantilla (`POST /emails/builder/data`).

## Checklist de activación

1. [ ] Abrir los borradores AP01, AP02, AP03… y mapearlos a los flujos de arriba (anotar nombres reales en este doc).
2. [ ] Crear los 6–7 custom fields de contacto y los 4 custom values.
3. [ ] Crear la página "Cómo devolver un pedido" y el formulario de feedback; obtener el enlace de reseña de Google Business.
4. [ ] Sustituir los 4 placeholders en duro (07, 16 ×2, 18) y re-subir esos HTML.
5. [ ] En cada paso "Send Email": seleccionar la plantilla por ID, pegar asunto y previsualización de las tablas.
6. [ ] Envío de prueba del 02 para verificar la sintaxis `{{contact.first_name | default: "Hola"}}` antes del primer envío real.
7. [ ] Verificar que los correos comerciales (01, 05, 06, 07, 11, 12, 14, 15, 17, 18) respetan la baja y los transaccionales (02, 03, 04, 08, 09A, 09B, 10, 16) se envían siempre.
8. [ ] Resolver el duplicado del "02 · confirmación pedido" fuera de la carpeta Correos antes de conectar, para no enlazar la copia equivocada.
