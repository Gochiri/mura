# Mensaje para Sonia (WhatsApp) — pendiente de enviar

> Estado: BORRADOR, aún no enviado. Actualizado 7/8/2026 tras implementar el
> contador nativo en GHL.

---

Hola Sonia 👋 Buenas noticias: el número de pedido ya lo genera GHL solo — no tienes que montar nada para la numeración 🎉

Al confirmarse una compra, GHL crea la oportunidad con nombre **M100001, M100002...** (contador interno, 7 caracteres, cabe de sobra en la referencia de Nacex — el orderId de GHL medía 24 y por eso no valía). Tu búsqueda `?q=` con match exacto funciona igual.

Cambios que te afectan, ya hechos:
✓ Los webhooks te mandan `numero_pedido` (= nombre de la oportunidad) en envío, watchdog y devolución
✓ `peso` y `bultos` ahora salen de la oportunidad, no del contacto
✓ Watchdog a 48h
✓ El webhook del formulario de devolución estaba leyendo campos equivocados (te llegaba vacío) — corregido
✓ Tag `etiqueta-por-imprimir` creado; emails 04 y 05 con las plantillas reales

Y el custom field `opportunity.numero_de_pedido` también se rellena solo desde GHL (ya probado con pedido de test: nombre y campo llegan con el mismo valor M1xxxxx) — así que puedes usar el que prefieras en tus flujos.

Ya hicimos la primera compra de prueba con Stripe test y el flujo de compra funciona de punta a punta. Cuando quieras coordinamos la prueba conjunta de envío + Nacex (necesitamos tus flujos de n8n al otro lado) 🚀

---

# Consulta 13/8 — confirmación de compra (pendiente de enviar)

Sonia, cerré lo del order id y la respuesta es que no hay forma de tenerlo en el correo del workflow. Probé los ocho merge tags posibles con una compra real (order.id, order._id, order.order_id, order.order_url, order.total, payment.order_id, payment.id y contact.order_id) y **salieron los ocho vacíos**. Los datos del pedido solo existen dentro de las plantillas de notificación de la tienda, que es justo donde a ti te funcionaba el `order.order_url`.

Y hay un segundo problema: el bloque del carrito (las fotos de las prendas, subtotal, envío) también es exclusivo de esas plantillas. Un correo mandado desde el workflow no puede enseñar lo que compró, ni aunque le metamos la URL.

El conflicto, cronometrado en una compra real:

- 22:41:25 pedido
- 22:41:30 correo de tienda ← todavía no existe la oportunidad
- 22:41:34 se crea M100008 ← aquí nace el número de pedido
- 22:41:57 SMS del workflow, con el M100008 ✓

O sea: el correo que sabe **qué** compró sale antes de que exista el número, y el que sabe **el número** no puede enseñar la compra. Y el M tiene que ir sí o sí en la confirmación, porque el formulario de devolución lo pide y tú buscas la oportunidad por ese nombre.

Tres salidas, dinos cuál prefieres:

1. **Dos correos**: el recibo de la tienda al instante (con productos y el botón que funciona) y el vuestro de marca con el M unos minutos después. Se monta ya, sin depender de nada.
2. **Uno solo**: webhook al principio de SP01 → tú buscas la orden con `GET /payments/orders?contactId=…&limit=1` (comprobado, devuelve la más reciente primero) y escribes la URL en un campo de contacto → el correo sale con M y con botón. Sin lista de productos, y tienes ~20 segundos para responder.
3. **Uno solo desde la tienda, sin número**: habría que cambiar el formulario de devolución para que no pida el número (buscar por email), pero se vuelve ambiguo si la clienta tiene varios pedidos.

Ojo con una cosa: ahora mismo el paso de email del workflow está desactivado, así que la clienta no recibe el M1xxxxx por ningún lado. Tal cual está no se puede lanzar.
