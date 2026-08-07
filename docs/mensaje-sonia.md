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
