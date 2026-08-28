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

Se añaden **cuatro** nodos, en `tienda/n8n-aviso-pedido-nodos.json` (se pegan en el
lienzo con Ctrl+V):

1. **Pedido completo (GHL)** — HTTP GET al pedido por id.
2. **Mensaje para Sara** — un nodo de código que **no guarda ni envía nada**:
   solo prepara tres textos y los deja en el item —`{{ $json.mensaje }}` para el
   aviso de Telegram, `{{ $json.resumen }}` en texto plano y
   `{{ $json.resumenHtml }}`, que es el bloque que se ve dentro del correo—.
   Quien guarda y quien envía son los dos nodos siguientes.
3. **Guardar pedido en la oportunidad** — `PUT /opportunities/{opportunityId}`
   escribiendo **dos** campos en la misma llamada: `resumen_pedido` y
   `resumen_pedido_html`. Es lo que hace que **la clienta vea
   qué ha comprado dentro del correo**, sin ir al portal.

   Va en la **oportunidad**, no en el contacto: el resumen es de *ese* pedido, y
   en el contacto se pisaría en cada compra. GHL te manda el `opportunityId` en
   el mismo webhook.

4. **Avisar a Sara (Telegram)** — `POST` al webhook de avisos que ya tienes
   (`…/webhook/db8ae6be-…`) con el campo `mensaje`, el mismo que usa SP01 hoy.
   Si prefieres un nodo Telegram con tus credenciales, cámbialo: lo único que
   importa es que reciba `$json.mensaje`.

⚠️ **Los nodos 3 y 4 van en paralelo, los dos colgando del nodo de código.** No
encadenados: si el de Telegram fuera detrás del que guarda, recibiría la
respuesta de GHL y se quedaría sin el texto.

### Cómo pegarlo

1. Abre en n8n el workflow que recibe ese webhook.
2. Abre `n8n-aviso-pedido-nodos.json` en un editor de texto, selecciona todo y
   **copia**.
3. Clic en un hueco vacío del lienzo y **Ctrl+V** (Cmd+V en Mac). Los tres nodos
   aparecen ya enlazados entre ellos.

⚠️ **No uses «Import from File»**: eso reemplaza el lienzo o te crea otro
workflow. Aquí lo que hace falta es añadir tres nodos a uno que ya existe.

Luego quedan cuatro cosas a mano:

- **La entrada** — del nodo donde ya tienes el `orderId` → *Pedido completo (GHL)*.
- **La salida** — ninguna: los dos nodos finales cierran el circuito. Si tenías
  un nodo de Telegram propio en este flujo, quítalo o quita el nuestro, o Sara
  recibirá el aviso dos veces.
- **El PIT** — sustituir `PEGAR_AQUI_EL_PIT` en los dos nodos HTTP. Mejor aún: si
  tienes credencial de GHL en n8n, úsala en vez de escribir la clave en la
  cabecera.
- **El nombre del webhook** — el nodo de código lo lee con `$('Webhook')`. Si el
  tuyo se llama de otra forma, cambia ese nombre en las dos líneas donde aparece.

Y al terminar, **guardar y comprobar que el workflow queda activo**.

Si al pegar n8n se queja, borra el bloque `"meta"` del principio del JSON y pega
desde `"nodes"`: son notas mías, no formato de n8n.

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
- Por eso el nodo 3: la plantilla inserta `{{{opportunity.resumen_pedido_html}}}`
  —con **triple llave**, que en Handlebars significa «sin escapar el HTML»—
  dentro de la celda del bloque «Tu selección».
- Los campos ya están creados en GHL: `opportunity.resumen_pedido` (texto largo,
  el desglose en texto plano) y `opportunity.resumen_pedido_html` (texto largo,
  las filas de tabla).

**Cada prenda lleva su foto**, no una sola foto para todo el pedido. Una
plantilla de GHL no sabe recorrer los artículos —no hay bucle ni condicional—,
así que el bucle lo hace el nodo de código: monta una fila por pieza con el
nombre, la talla, el importe y la foto a la derecha, y guarda el HTML entero en
`resumen_pedido_html`. La foto sale de `product.image`, la destacada —la misma
que se ve en la rejilla—, con respaldo en `product.medias[0].url`; si una prenda
no tiene, esa fila va sin celda de imagen en vez de con un hueco roto.

El campo antiguo `imagen_pedido` **ya no existe**: era el apaño de una foto por
pedido, la de la primera prenda, que con dos artículos enseñaba una y callaba la
otra.

⚠️ **Hay una carrera de tiempos que conviene mirar en la primera prueba real.**
SP01 espera **3 minutos** entre el webhook que te llama y el correo a la clienta
(era 1 minuto; se subió el 28/8 justo por este margen).
Si tu flujo tarda más en escribir el campo, el correo sale con el hueco vacío
—se ve el título «Tu selección» y debajo nada—. Si aun así va justo, subimos esa
espera otra vez: es cambiar un número.

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
