# Black Friday · lo preparado el 25/11 (antes de que arranque BLACK20)

Estado consultado por API el 25/11 a las 18:45–19:30 (hora de Madrid). No se ha cambiado nada en GHL ni en Meta.

## 1. Riesgo carrito/cupón (TRASPASO §5.1)

**Comprobado por API (solo lectura):**

- `BLACK20`: 20 %, `scheduled`, del 25/11 23:00 UTC al 30/11 22:59:59 UTC (es decir, del 26/11 a las 00:00 al 30/11 a las 23:59 peninsular), sin límite de usos ni de productos.
- `BIENVENIDA10`: 10 %, activo, uno por clienta, 8 usos.
- Tarifas de la zona «España»: 3 € de 0 a 98,99 €, gratis desde 99 € (las dos de `conditionType: price`) y recogida en punto Nacex Shop gratis.
- **No se suman:** cada pedido de GHL guarda **un solo** objeto `coupon` y un solo importe `discount` (pedidos del 2/11, del 12/11 y del 23/11). Además, el checkout tiene un único campo de código. Falta verlo en pantalla después de las 00:00: aplicar `BIENVENIDA10` y luego `BLACK20` y comprobar que el segundo sustituye al primero (sin pagar).
- **Antes o después del descuento: sin respuesta en el historial.** Ningún pedido tiene el subtotal en 99 € o más y el subtotal con descuento por debajo de 99 €, así que el historial no lo decide.
- La prueba en navegador no se pudo hacer desde la sesión de Claude: el entorno bloquea `stcdn.leadconnectorhq.com` y el checkout se queda en blanco.
- `/carrito` publicado = `web/carrito.html` del repo (comprobado el 25/11).

**Prueba (a) en 5 minutos, para German, sin pagar:**

1. En una ventana privada, abre `stylebymura.com/producto?id=6a4a790c316f38573181abf6` (Sobrefalda Negra, 99 €) y añádela.
2. En `/checkout`, rellena con un correo del equipo (no de una clienta), pasa al pago y aplica `BIENVENIDA10` (funciona igual que `BLACK20`).
3. Mira la línea de envío. Si dice **0 €**, GHL calcula antes del descuento: no hace falta nada. Si dice **3 €**, lo calcula después: aplica la opción (c).
4. **No pagues.** Borra el contacto de prueba en los 10 minutos siguientes (si no, LS03 abre una oportunidad en «01 Carrito Abandonado» y envía el correo 1 a esa dirección). Si se crea la oportunidad, bórrala.

**Si no da tiempo, opciones preparadas:**

| | Qué hace | Archivo | Riesgo |
|---|---|---|---|
| **(b)** | Del 26 al 30/11, en el carrito, si el total está entre 99 € y 123,75 € (= 99 / 0,8, el tramo dudoso), en lugar de «Tu envío a domicilio es gratis» dice: «Envío gratis desde 99 €. Si usas un código de descuento, verás el envío definitivo en el pago.» Vuelve sola al texto normal el 1/12. | `web/carrito-black-friday-opcion-b.patch` (una línea de `web/carrito.html`; `git apply` y pegar). German lo pega en el elemento `custom-code-DN8OVgnA5P` de `/carrito` | La clienta puede pagar 3 € de envío; solo se le avisa |
| **(c)** | Umbral del envío gratis a **79,20 €** (= 99 × 0,8) del 26 al 30/11; el 1/12 vuelve a 99 €. | `datos/envio-umbral.sh bf --ejecutar` / `normal --ejecutar` (ensayo sin `--ejecutar`, probado). Copia automática en `datos/backups/` | Si GHL calcula antes del descuento, los pedidos sin cupón de 79,20 a 98,99 € también salen gratis: 3 € menos por pedido para Sara. El carrito sigue diciendo 99 €: la clienta paga menos de lo anunciado, nunca más |

**Recomendación:** (a) esta noche. Si no se puede, **(c)**: es la única que garantiza que nadie que vea «envío gratis» en el carrito pague 3 €. Formato del `PUT` de tarifa: es el de la API pública de GHL, **sin probar en escritura**. El script imprime el estado de después; si algo no cuadra, se restaura desde la copia.

## 2. Presupuesto 22 → 40 €/día (26–30/11): listo, sin ejecutar

- Conjunto `52588391414956`: `ACTIVE`, `daily_budget` 2200 (22 €), quedaban 2,71 € del día (Meta, 25/11).
- Cuenta `act_1141864065246239`: activa, sin límite de gasto, tarjeta como método de pago. Por API no se ve el saldo disponible de la tarjeta: tiene que confirmarlo Sara.
- **Cuentas**, con el conjunto a 358,09 € a 25/11 (Meta) y el primer mes del 10/11 al 10/12, que tiene 800 € previstos:
  - hasta fin del 25/11: unos 360,80 € (358,09 + 2,71 que quedaban del día);
  - del 26 al 30/11 a 40 €/día: 5 × 40 = 200 € (a 22 €/día serían 110 €; la diferencia es de 90 €);
  - del 1 al 9/12 a 22 €/día: 9 × 22 = 198 €;
  - total: unos **758,80 €**, o 780,80 € si se cuenta también el 10/12. En los dos casos, por debajo de 800 €. Es el presupuesto diario: Meta puede gastar algo más algún día y lo compensa en la semana.
- **Comando** (solo con OK de German, la confirmación escrita de Sara y el saldo comprobado):
  - `tienda/meta-presupuesto.sh 40 --ejecutar` el 26/11. Hace una copia en `datos/backups/meta_conjunto_presupuesto_*.json`, sube a 4000 céntimos y lee el resultado.
  - Vuelta: `tienda/meta-presupuesto.sh 22 --ejecutar` el 30/11 por la noche.
  - Sin `--ejecutar` solo enseña el cambio (probado el 25/11).
- Recordatorio: **G** (`52591554954356`) se activa el 27 por la mañana y se pausa el 30 por la noche, también con OK.

## 3. Ventana de Black Friday y newsletter del 26: propuesta de quién y qué

**Ventana de la web — Claude el código, German lo pega.**

- La «ventana» es la **sección 15** del código global (panel «10 % en tu primera compra» con la pestaña vertical).
- **Propuesta:**
  - del 26/11 a las 00:00 al 30/11 a las 23:59 (hora peninsular), la misma sección enseña «**20 % en toda la web** · código **BLACK20** · hasta el lunes 30», con un botón para copiar el código, otro a `/prendas` y la línea «No se acumula con el 10 % de bienvenida»;
  - fuera de esas fechas vuelve sola al 10 %.
- Es un solo cambio en `tienda/codigo-global-tienda.js` + `build.sh`. German pega Head y Body **una vez** (hoy o el 26 temprano) y no hay que volver a pegar el 1/12.
- Coste: ~1 h de Claude + 10 min de German.

**Newsletter del 26 — Claude redacta, Sara aprueba, German programa.**

- **Qué:** un correo HTML con el estilo de `correos/` (pasaría a ser `correos/21-black-friday.html`):
  - asunto y previsualización;
  - 20 % en toda la web con BLACK20 del jueves 26 al lunes 30;
  - no se acumula con el 10 %;
  - envío gratis desde 99 € y recogida gratis en punto Nacex;
  - botón a `/prendas` con UTM `utm_source=newsletter&utm_medium=email&utm_campaign=black_friday_2026`.
- **A quién:** contactos con el tag `newsletter-suscrita` (63 a 25/11). **No** a `nl-sin-confirmar` (66): no han confirmado la suscripción.
- **Cuándo:** jueves 26 a las 9:00 peninsular, programado desde GHL (Marketing → Correo) por German. Opcional: recordatorio el lunes 30 por la mañana, «último día».
- **Ojo:** Sonia prepara un correo de novedades; que no salgan los dos el mismo día (German se lo dice).
- Sara aprueba el texto por WhatsApp hoy o mañana a primera hora.

## 4. Compra de prueba con PayPal en modo test: guion para German

No se puede hacer desde la sesión de Claude: hace falta la interfaz de GHL y la cuenta sandbox de PayPal. Cosas que conviene saber antes:

- El modo test de GHL vale **para toda la subcuenta**: mientras esté puesto, las clientas reales no pueden pagar. Hacerlo en una ventana corta y tranquila, **mejor el 26 antes de las 8:00 peninsular** (o esta noche), nunca con el presupuesto ya subido a 40 €.
- Un pedido de prueba **puede disparar SP01**, que manda `Purchase` a Meta por la API de Conversiones (TRASPASO §8.7: no hay filtro de pruebas). Antes de la prueba, desactivar la acción «Meta Conversion API» de SP01 (o poner SP01 en borrador). Avisar a Sara de que le llegará un aviso de Telegram de un pedido de prueba.

**Pasos**

1. Pagos → Integraciones: pasar a modo test y comprobar que PayPal tiene credenciales sandbox conectadas. Si PayPal no ofrece modo test en la integración, ya es un dato: anotarlo.
2. Ventana privada: Sobrefalda (99 €) al carrito → checkout con correo del equipo → **aplicar `BIENVENIDA10`** (así la misma prueba responde también a la §1: mirar el envío) → pagar con PayPal sandbox.
3. Anotar:
   - si vuelve a `/gracias`;
   - si el pedido sale `paid` o se queda `pending` (en noviembre 4 de 5 intentos con PayPal se quedaron «pendiente»);
   - si llega el correo de confirmación.
4. Repetir con tarjeta de prueba de Stripe (`4242 4242 4242 4242`) para comparar.
5. Volver a modo live, reactivar la acción de SP01 y borrar el pedido, la oportunidad y el contacto de prueba.
6. Pasarle a Claude el número de pedido: Claude lee el pedido y la transacción por API y deja el resultado en `docs/`.

## 5. Mensajes para Sara (formato WhatsApp, sin datos de la clienta)

**Reembolso del 23/11**

```
Hola Sara 😊 Una pregunta rápida: el pedido del lunes 23 (chaqueta y pantalón Vínculo burdeos, 120,60 €) aparece como *devuelto el martes 24*.

- ¿Lo devolviste tú? ¿Te contó la clienta el motivo?
- Si la ropa no llegó a salir, ¿volvemos a sumar esas dos piezas al stock de la web?

Te lo pregunto porque en las cuentas de la campaña ese pedido contaba como venta, y quiero dejarlo bien apuntado. ¡Gracias!
```

**Confirmación del presupuesto de Black Friday** (para que German lo mande con el anterior o aparte)

```
Y otra cosa para mañana: lo que hablamos de *subir la inversión del jueves 26 al lunes 30*.

- Pasaríamos de 22 € a *40 € al día* esos 5 días: son *90 € más* que si lo dejamos igual (200 € en vez de 110 €).
- Con eso, el primer mes de campaña (10/11 al 10/12) quedaría en unos *760–780 €*, dentro de los 800 € que acordamos.
- El martes 1 volvemos a 22 €.

¿Me lo confirmas por aquí? Y, si puedes, mira que la tarjeta tenga margen esos días, porque Meta cobra según va gastando.
```
