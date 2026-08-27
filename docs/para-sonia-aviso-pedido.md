# Para Sonia · que el aviso de pedido diga qué preparar

**El problema.** Sara recibe «tienes un pedido nuevo de Laura Pérez» y nada más:
ni prenda, ni talla, ni cantidad. Tiene que ir a Payments → Orders a buscarlo.
Los tres avisos que salen hoy de `01 · Compra confirmada (SP01)` —notificación
interna, Telegram y SMS— no llevan el desglose.

**Dónde está el dato.** En el pedido, y con la talla ya pegada al nombre:

```json
items[0] = { "name": "Vestido Asimetría Floral - M", "qty": 1,
             "price": { "name": "M", "amount": 119, "currency": "EUR" } }
```

⚠️ **El listado de pedidos no trae los artículos** (`items: []`). Hay que pedir el
pedido por su id:

```
GET https://services.leadconnectorhq.com/payments/orders/{orderId}
      ?altId=NxPF5fOicowujokEk5Hm&altType=location
Authorization: Bearer <PIT>      Version: 2021-07-28
```

**Dónde encaja.** En tu flujo del webhook
`https://n8n.letsbebanana.com/webhook/b03f0adf-70f8-41b7-923a-a2a0669355e3`
—«guardar order id»—, que es el que ya tiene el `orderId`. GHL te manda ahí
`opportunityId`, `contactId` y `numero_pedido`.

Se añaden **tres** nodos, en `tienda/n8n-aviso-pedido-nodos.json` (se pegan en el
lienzo con Ctrl+V):

1. **Pedido completo (GHL)** — HTTP GET al pedido por id.
2. **Mensaje para Sara** — arma el texto y lo deja en `{{ $json.mensaje }}`,
   listo para el nodo de Telegram que ya tienes.
3. **Guardar resumen en el contacto** — `PUT /contacts/{contactId}` escribiendo
   el campo `resumen_pedido`. Es lo que hace que **la clienta vea qué ha
   comprado dentro del correo**, sin ir al portal.

⚠️ El nodo de código lee el webhook con `$('Webhook')`. Si tu nodo de webhook se
llama de otra forma, cambia ese nombre en las dos líneas donde aparece.

**Cómo queda** (probado con un pedido real de la cuenta y con uno de dos piezas):

```
Pedido nuevo M100019 · Laura Pérez

· Vestido Asimetría Floral - M ×1
· Blazer Gris Arquitectónica - Única ×2

Total 437,00 €
```

Si el pedido llegara sin artículos, el mensaje lo dice en vez de salir mudo:
es mejor que Sara lea «no he podido leerlo» a que crea que no hay nada.

**Cuando esté, avísanos:** hay que quitar de SP01 el paso de Telegram genérico
(«tienes un pedido nuevo de…»), o llegarán dos mensajes por cada compra. Ese
cambio es de GHL y lo hacemos nosotros; son dos minutos.

---

## Lo segundo: el correo de la clienta (27/8)

De tu compra de prueba salieron tres cosas más, y las tres se arreglan con el
mismo campo:

- El botón **«Ver mi pedido»** llevaba al portal nativo de GHL —en inglés, sin
  marca— y para entrar mandaba un **OTP también en inglés**. Ese botón ya se ha
  quitado de los correos **02** y **03**; en su lugar va el desglose del pedido.
- Por eso el nodo 3: la plantilla muestra `{{contact.resumen_pedido}}` dentro de
  un bloque con `white-space: pre-line`, que es lo que respeta los saltos de
  línea del campo.
- El campo ya está creado en GHL: `contact.resumen_pedido`, texto largo.

⚠️ **Hay una carrera de tiempos que conviene mirar en la primera prueba real.**
SP01 espera **1 minuto** entre el webhook que te llama y el correo a la clienta.
Si tu flujo tarda más en escribir el campo, el correo sale con el hueco vacío
—se ve el título «Tu selección» y debajo nada—. Si va justo, subimos esa espera
en SP01: es cambiar un número.

---

## Por qué no se hace desde GHL

El aviso sale de un paso de webhook de SP01, y ahí solo se pueden mandar merge
fields. **GHL no tiene un merge field que recorra los artículos de un pedido**:
`{{opportunity.*}}` y `{{contact.*}}` dan el pedido y la clienta, pero no la
lista. La composición tiene que ocurrir donde se puede leer el pedido entero,
que es n8n.

## Un cabo suelto que verás de paso

La tienda manda su propio correo de confirmación y **está apuntando a la
plantilla «02 · confirmación»** en vez de a la de GHL, que sí lleva tabla de
artículos. Y SP01 manda **otro** correo con una copia suya. O sea: la clienta
recibe dos correos y en ninguno ve qué ha comprado. Eso lo arreglamos nosotros en
GHL, pero conviene que lo sepas por si lo ves desde tu lado.
