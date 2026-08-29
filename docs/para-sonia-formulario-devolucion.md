# El formulario de devolución: dónde está y qué le falta

*29 de agosto*

## Lo primero: el formulario existe

**`Formulario Devolución v2`** · id `HBK7tGDlcIFN0vaXoksg`

Está en la subcuenta de MÛRA, en la raíz de *Forms*, sin carpeta. La cuenta solo
tiene cuatro formularios en total: este, `Opt-in Newsletter`, `Encuesta
Post-Compra` y `Form 1`. Si en tu pantalla no sale, mira que no haya un filtro
puesto o que no estés en otra subcuenta — está ahí.

Y funciona: tiene **tres envíos reales**, los dos de German del 14/8 y el de
Martin Garcia Castizo del 16/8, con el pedido `M100017` y todo.

**Su URL directa** es:

```
https://api.leadconnectorhq.com/widget/form/HBK7tGDlcIFN0vaXoksg
```

Ese es el mismo patrón que ya usa la Encuesta Post-Compra en
`{{custom_values.url_feedback}}`, así que no es una suposición. La he guardado en
un custom value nuevo, **`url_formulario_devolucion`**, para que ni tú ni yo
tengamos que volver a buscar el id.

## Lo que le falta: no tiene entrada ni salida

No es que esté roto. Es que nunca se terminó de montar:

- **No está embebido en ninguna página.** Por eso desde la web no hay forma de
  llegar a él. Estaba anotado como pendiente desde el 12/8 y se quedó ahí.
- **No tiene configurado el On Submit.** Al enviarlo, la clienta ve el mensaje
  por defecto de GHL en vez de una página de gracias de marca.

Las dos cosas se hacen en la interfaz. El builder de formularios y el de páginas
no se pueden tocar por API — lo comprobamos en su día: todas las rutas de
escritura sobre páginas responden «Cannot POST», que significa que la ruta no
existe, no que falte permiso.

---

## Lo de la página de gracias

Dices que ya no está y la has vuelto a crear. **No se borró**: casi seguro que
nació con otro nombre.

El funnel tiene hoy 23 pasos. En el volcado que guardamos el 22/8 tenía 22, y
ahí **no había ninguna `/gracias-devolucion`**. Lo que sí había, y sigue
habiendo, es esto:

```
paso 20   /devolucion            actualizada el 14/8 a las 22:00
paso 23   /gracias-devolucion    creada hoy a las 10:55   ← la tuya
```

El 14/8 a las 22:00 es justo el día que probamos la devolución entera y en el que
se corrigieron los dos bugs de maquetación del HTML de la página de gracias. Todo
apunta a que `/devolucion`, en singular, **es tu página de aquel día**.

No lo puedo confirmar desde aquí: el entorno donde trabajo tiene bloqueado el
acceso a `stylebymura.com` y GHL no me deja leer el contenido de las páginas con
el token que tengo. Tú la abres en el editor en diez segundos.

**Si es la tuya**, borra la que has creado hoy y cámbiale la url a esa. **Si está
vacía**, borra esa y quédate con la de hoy. Una de las dos sobra, y tener dos
páginas casi iguales es como acabamos aquí.

El HTML que va dentro está en el repo, en `legal/gracias-devolucion.html`. Se
copia solo lo que hay entre las dos marcas de COPIAR.

---

## Lo que hay que hacer, por orden

### 1. Abrir `/devolucion` y decidir

Lo de arriba. Primero esto, porque el paso 3 necesita saber a qué página redirige.

### 2. Embeber el formulario en `/devoluciones`

En la página **`/devoluciones`** —la de «Envíos y devoluciones», la que ya enlaza
el pie de toda la tienda—, al final, después de las instrucciones.

Con el **elemento *Form* nativo del builder**, no con el iframe pegado a mano: el
nativo se actualiza solo si mañana cambias el formulario.

Va ahí y no en una página propia porque `/devoluciones` ya está enlazada desde el
pie de todas las páginas y desde los correos **08**, **09A**, **10** y **16** vía
`{{custom_values.url_devoluciones}}`. Cero enlaces nuevos que repartir, y la
clienta lee el proceso antes de rellenar.

### 3. Configurar el On Submit → página de gracias

En los ajustes del formulario, la acción al enviar: redirigir a la página de
gracias que quede después del paso 1.

**Este es el eslabón que nunca se configuró.**

### 4. Traducir las etiquetas

Siguen en inglés. Las dos de abajo ya están en español (nº de pedido y motivo),
son las de sistema las que faltan:

| Ahora | Debe decir |
|---|---|
| First Name | Nombre |
| Last Name | Apellidos |
| Email | Correo electrónico |
| Phone | Teléfono |
| Address | Dirección |
| City | Población |
| Postal Code | Código postal |
| botón *Submit* | Solicitar devolución |

### 5. Quitar el consentimiento de SMS

Esto es importante y no es cosmético. En el envío de Martin, el campo
`terms_and_conditions` guardó esto:

> «Al marcar esta casilla, acepto recibir mensajes de texto no comerciales de
> Mura sobre nuevos productos. La frecuencia de los mensajes puede variar…»

En un formulario de **devolución** eso no pinta nada. Y pedir consentimiento de
marketing para tramitar una devolución es discutible en RGPD: son dos cosas
distintas y no se pueden atar. Quítalo, o cámbialo por la aceptación de la
política de privacidad.

### 6. Publicar

`/devoluciones` y la página de gracias.

---

## Cómo comprobar que quedó bien

Con un envío de verdad desde la web, no desde la vista previa del editor:

1. Entrar en `https://www.stylebymura.com/devoluciones` → **el formulario se ve**,
   en español, sin el texto de los SMS.
2. Rellenarlo con un nº de pedido real y enviar → **aterriza en la página de
   gracias** de marca.
3. El workflow **08 Solicitud devolución** se dispara → tu flujo de n8n → Nacex →
   el correo 08 con la etiqueta.

Esa cadena ya la probamos entera el 14/8 y funcionó. Lo único que estamos
añadiendo ahora es el punto de entrada.

---

## Otra cosa que apareció de camino

Buscando el custom value del formulario me topé con otro que estaba mal:

```
url_coleccion   apuntaba a   /coleccion
la página es                 /colecciones
```

No existe ninguna página `/coleccion` en el funnel. Y ese custom value es el
botón principal de **cuatro correos**: 05 · entrega, 11 · segunda compra,
14 · lanzamiento y 17 · cumpleaños. Los cuatro llevaban a un 404.

Ya está corregido. Las plantillas no hubo que tocarlas — para eso está el custom
value.
