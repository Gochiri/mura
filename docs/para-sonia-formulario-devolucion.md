# El formulario de devolución: dónde va y qué falta

*29 de agosto*

## Las tres páginas, que se parecen y no son lo mismo

Esto es lo que estaba enredado, y ya está claro:

| Página | Qué es |
|---|---|
| `/devoluciones` | Las instrucciones — «Envíos y devoluciones». Se queda como está. |
| `/devolucion` | **El formulario.** Hoy tiene dentro la página de gracias. |
| `/gracias-devolucion` | La confirmación, después de enviarlo. |

**Tu página de gracias no se había borrado.** La hiciste el 14/8 y se quedó con
el nombre `/devolucion`, en singular — por eso hoy no la encontrabas donde
esperabas. Tu captura lo confirma: eso que sale ahí es «Hemos recibido tu
solicitud».

Así que tu plan es el bueno: el contenido de gracias se queda en
`/gracias-devolucion`, y `/devolucion` se vacía para meter el formulario.

Una corrección pequeña, porque afecta a lo que decías de los correos: **hoy
ninguna plantilla apunta a `/devolucion`**. Las de devolución van a
`{{custom_values.url_devoluciones}}`, que es la de instrucciones, en plural. Lo
que sí es verdad —y es mejor— es que **no hay que tocar ninguna plantilla**:
el botón del correo 16 va por el custom value `url_formulario_devolucion`, que
ya he apuntado a `https://www.stylebymura.com/devolucion`. Si mañana el
formulario cambia de sitio, se cambia ese valor y ya. Un campo, no cuatro
plantillas.

---

## El formulario va con código nuestro, no con el de GHL

Tenías razón: en este proyecto no hemos embebido ni un solo formulario nativo de
GHL. Lo comprobé —cero `widget/form` y cero `form_embed.js` en todo el repo—.
La newsletter de `/home` y la encuesta de `/experiencia` son HTML nuestro con un
`fetch` a n8n, y este va igual.

El motivo es el mismo de siempre: el formulario de GHL viaja dentro de un iframe
de `leadconnectorhq.com` y nuestro CSS global no puede entrar ahí. Se vería un
formulario de GHL dentro de una página de MÛRA.

**El código está en `tienda/devoluciones-form.html`.** Se pega entero en un
elemento de código de `/devolucion`, igual que la newsletter en la home. Lleva
nombre, apellidos, correo, teléfono, número de pedido, motivo y el consentimiento
de privacidad; los estilos ya están en el Tracking Code global, así que no hace
falta pegar CSS aparte.

La dirección **no se le vuelve a pedir**: la dejó al comprar y la lee n8n de su
ficha. Si la reescribe a mano y se equivoca en un dígito, es una recogida fallida
de Nacex.

---

## ⚠️ Esto sustituye una cadena que ya funcionaba

Léelo antes de publicar, porque si se hace en el orden equivocado se pierden
solicitudes.

Hasta hoy la devolución entraba por el formulario nativo `Formulario Devolución
v2` (`HBK7tGDlcIFN0vaXoksg`), y su envío disparaba el `08a` con un trigger de
tipo `form_submission`. Ese trigger —`EQfcssMWOwqEkHqAFxZj`— **sigue vivo y no se
toca todavía**. Mientras montamos lo nuevo conviven las dos entradas y no se cae
ninguna solicitud. Cuando la nueva funcione, se retira el formulario viejo y su
trigger.

---

## Lo que hay que hacer en n8n

**No hace falta que lo montes a mano: está hecho.** Los diez nodos están en
`tienda/n8n-devolucion-web-nodos.json`, calcados llamada por llamada del alta de
newsletter que ya te funciona, porque hace exactamente lo mismo con otros campos.

### Cómo pegarlo

1. Abre el archivo, copia todo el contenido.
2. **Ctrl+V sobre el lienzo de n8n.** No uses *Import from File*: eso reemplaza
   el workflow entero en vez de añadir los nodos.
3. Sustituye `PEGAR_AQUI_EL_PIT` en las cuatro llamadas HTTP. Si prefieres, muévelo
   a una credencial Header Auth y quita la cabecera `Authorization` de cada nodo.
4. Guarda y **actívalo**. Sin activar, la URL de producción
   `/webhook/devolucion-web` no escucha.

### Qué hace, por si quieres revisarlo antes

```
Webhook devolucion-web
  → Datos completos?          no → responde datos-invalidos
  → Buscar contacto por email
  → ¿Existe el contacto?      no → responde sin-pedido
  → Guardar pedido y motivo   (POST /contacts/upsert)
  → Quitar tag  →  Poner tag  (solicitud-devolucion)
  → responde ok
```

Tres detalles que te van a interesar:

- **Los dos campos se escriben por `id`, no por `key`.** Las claves de GHL llegan
  con los acentos comidos —`n_de_pedido_lo_encuentras_en_tu_mail_de_confirmacin`,
  `motivo_de_devolucin__cambio`— y una letra de más o de menos falla en silencio.
  `q73ODvZiPLCMqRrUkVCK` es el número de pedido, `2GQ11kHcaUggy8K4P9U4` el motivo.
  Son los mismos que ya lee el 08a.
- **El remove del tag va antes del add**, con `neverError` para que la primera vez
  no falle. Sin eso, la segunda devolución de una misma clienta no entra nunca.
- **La dirección no se toca.** La de la ficha es la que dejó al comprar, y es la
  que necesita Nacex.

### Lo que NO hace, a propósito

No comprueba que el número de pedido sea de esa clienta: `sin-pedido` solo mira si
el contacto existe. Verificar el pedido ya lo hace la cadena de abajo —el 08a
busca la oportunidad y, si no la encuentra, el tag `devolucion-no-encontrada`
dispara el 08c—. Ponerlo también aquí sería mantener la misma regla en dos sitios.

Si prefieres, el 08a puede desaparecer y llamas tú a Nacex desde este mismo flujo
— te ahorrarías un webhook de salida de GHL, que **sí es premium** y se cobra por
ejecución. A tu criterio; con el tag funciona igual.

---

## Lo que queda en la interfaz

### 1. Vaciar `/devolucion` y pegar el formulario

El contenido de gracias que hay ahora se va a `/gracias-devolucion`.

### 2. Terminar `/gracias-devolucion`

Con el navbar, como decías. El HTML está en `legal/gracias-devolucion.html`: se
copia solo lo que hay entre las dos marcas de COPIAR.

No hace falta configurar ningún «On Submit»: el formulario es nuestro y ya
redirige él solo a `/gracias-devolucion` cuando n8n responde bien.

### 3. Añadir el trigger por tag al `08a`

En el `08a`, un trigger nuevo:

```
Contact Tag  →  Tag Added  →  solicitud-devolucion
```

El tag ya está creado en la cuenta (`k1wdT7fvuRS5ilFgHDZl`), así que sale en el
desplegable.

⚠️ **Esto no lo he podido hacer por API y no es por falta de permisos.** Los
triggers de ese workflow están migrados a un almacén aparte
(`isTriggerBucketMigrated: true`): el endpoint antiguo acepta el POST, devuelve
un id y no escribe nada. Lo probé cuatro veces —con y sin `targetActionId`, con y
sin `advanceCanvasMeta`, y con el `workflowId` en la query— y luego leyendo el
trigger por su id, que responde 404. Son treinta segundos en el editor.

### 4. Cuando la nueva entrada funcione, retirar la vieja

Desactivar el trigger `Form Submitted` del `08a` y archivar el formulario
`Formulario Devolución v2`. **No antes**, o el periodo entre medias se queda sin
entrada.

### 5. Publicar

`/devolucion` y `/gracias-devolucion`.

---

## Cómo comprobar que quedó bien

Con un envío de verdad desde la web, no desde la vista previa:

1. Entrar en `stylebymura.com/devolucion` → el formulario se ve, en castellano.
2. Rellenarlo con un pedido real → aterriza en `/gracias-devolucion`.
3. Rellenarlo con un número inventado → sale el aviso de que revise el número y
   **no** redirige.
4. En la ficha del contacto: los dos campos escritos y el tag puesto.
5. Llega el correo 08 con la etiqueta de Nacex.

El paso 3 es el que más se olvida y es el que evita que Sara reciba solicitudes
que no puede tramitar.

---

## Otra cosa que apareció de camino

`url_coleccion` apuntaba a `/coleccion` y la página es `/colecciones`. Ese custom
value es el botón principal de **cuatro correos** —05 · entrega, 11 · segunda
compra, 14 · lanzamiento y 17 · cumpleaños—, así que los cuatro llevaban a un
404. Ya está corregido, sin tocar ninguna plantilla.
