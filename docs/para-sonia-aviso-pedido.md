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

Se añaden dos nodos, en `tienda/n8n-aviso-pedido-nodos.json` (se pegan en el
lienzo con Ctrl+V):

1. **Pedido completo (GHL)** — HTTP GET al pedido por id.
2. **Mensaje para Sara** — arma el texto y lo deja en `{{ $json.mensaje }}`,
   listo para el nodo de Telegram que ya tienes.

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
