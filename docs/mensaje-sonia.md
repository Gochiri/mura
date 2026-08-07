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

Un favor: en el PUT que ya haces al gestionar el envío (donde guardas albarán y URLs), añade también el campo `numero_de_pedido` (id `5p3I04zlvlct8CfuDNU5`) con el mismo valor que te llega en `numero_pedido` — así el custom field queda siempre relleno como querías. Una línea más en tu llamada y listo.

¿Hacemos la prueba completa con Stripe en test esta semana? 🚀
