# Política de cookies: cambios propuestos tras el banner (16/10/2026)

Para: Sonia (que tiene el original en su Drive) y quien haga la revisión
jurídica. Parte de la política con fecha **4 de septiembre de 2026** y de lo que
German comprobó el **16/10** en la web publicada, con un navegador limpio, antes
y después de pulsar «Aceptar todas». Nada de esto es asesoramiento jurídico: lo
técnico está comprobado; lo jurídico está marcado **[DECIDE EL REVISOR]**.

## 1. Lo que ha cambiado desde el 4 de septiembre

El 16/10 se publicó un **banner de consentimiento** (barra inferior, «Rechazar
todas» y «Aceptar todas» iguales, opciones de Análisis y Publicidad apagadas de
entrada, enlace «Configurar cookies» en el pie). Hoy **no instala nada de
terceros**: las dos categorías opcionales se activarán cuando se conecten
Microsoft Clarity y el píxel de Meta.

Por eso hay frases de la política que ya no son ciertas (apartado 03 y 04).

## 2. Hallazgos de la comprobación del 16/10

Antes de pulsar nada en el banner había, en cookies:

| Nombre | Dominio | Duración | ¿Está en la política? |
|---|---|---|---|
| `__cf_bm` | stylebymura.com | 30 min | Sí |
| `__cf_bm` | leadconnectorhq.com, filesafe.space | 30 min | Sí |
| `msgsndr_id` | stylebymura.com | 12 meses | Sí, como técnica |

En el almacenamiento local (las cuatro claves de GoHighLevel están **antes de
aceptar**, comprobado por German el 16/10 en una ventana nueva sin tocar el
banner; `mura_consent`, el carrito y el catálogo salen después):

| Clave | Quién | Qué guarda | ¿Está en la política? |
|---|---|---|---|
| `cart_details_…` | MÛRA | El carrito | Sí |
| `mura_consent` | MÛRA | La elección de cookies | **No** (nuevo desde el banner) |
| `mura_catalogo_v1` (sesión) | MÛRA | Copia del catálogo para que cargue rápido | **No** |
| `v2_contact_session_…` | GoHighLevel | Referencia de sesión (caduca a los ~30 min) | **No** |
| `v2_history_…`, `v2_session_history_…` | GoHighLevel | Historial de sesiones: origen, referente, palabras clave, parámetros de la URL y página de entrada | **No** |
| `v3_first_session_event_…` | GoHighLevel | Primer evento de sesión, con los mismos campos | **No** |

La política cita en el almacenamiento local el país detectado y la referencia
de la sesión de cupón; no aparecieron en esta comprobación (puede que solo salgan
en el pago). Confirmar si siguen existiendo.

## 3. Dos puntos delicados

**3.1 Las claves `v2_` y `v3_` de GoHighLevel.** Guardan el origen de la visita
(de dónde viene, con qué parámetros de campaña, por qué página entró). Eso es
atribución de marketing, no algo que el carrito o el pago necesiten. La política
dice que lo que hay en el almacenamiento local «no identifica a la persona ni
sale del navegador con ese fin» y que `msgsndr_id` «no mide audiencias». Con
estas claves a la vista, esas frases hay que **verificarlas con GoHighLevel**
(qué se hace con esos datos y si salen del navegador) antes de mantenerlas.
Ya consta que se instalan **antes** del consentimiento. **[DECIDE EL REVISOR]** si
hay que clasificarlas como no técnicas.

**3.2 `msgsndr_id` como técnica.** El argumento de la política es que sirve para
enlazar un formulario o un pedido con la ficha de contacto. Ese enlace ocurre al
**enviar** el formulario, pero la cookie se instala en la **primera carga**, antes
de que la persona haya pedido nada, y dura 12 meses. Es el punto más discutible
del apartado 03. **[DECIDE EL REVISOR]** si se sostiene como exenta. Si no se
sostiene, habría que cargarla solo tras el consentimiento, y eso depende de si
GoHighLevel permite desactivarla o retrasarla (pregunta abierta a Henry u Oliver).

## 4. Qué hay que comprobar o responder

1. ~~Almacenamiento local antes de aceptar.~~ **Hecho el 16/10:** `v2_contact_session`,
   `v2_history`, `v2_session_history` y `v3_first_session_event` ya existen antes de
   aceptar. Guardan un identificador de sesión y, en el historial, origen, referente,
   palabras clave, `adSource`, parámetros de la URL y página de entrada.
2. **GoHighLevel:** ¿se puede desactivar el seguimiento de atribución del sitio,
   o cargarlo solo tras el consentimiento? ¿Qué hace exactamente `msgsndr_id`?
   **Respuesta del asistente de GHL (16/10), no oficial ni de una persona:** en su
   documentación no hay instrucciones para desactivar o gestionar el seguimiento
   nativo; no describe `msgsndr_id` ni las claves `v2_`/`v3_`; confirma que existe un
   banner de cookies de GHL para Websites pero no si permite rechazar igual de fácil
   ni si se controla por script. Lo que sí se controla es el código que añadimos
   nosotros. Falta una respuesta por escrito de una persona de GHL (ticket).
   Además, dos comprobaciones propias: (a) pestaña Network sin pulsar el banner,
   filtrando por `leadconnectorhq` y `msgsndr`, para ver si los datos de la visita
   salen del navegador; (b) activar el banner de GHL en una página de prueba y ver si
   frena esas claves antes de aceptar.
3. **¿Está publicada `/politica-cookies`?** Si el pie ya la abre, estos cambios
   se aplican sobre la versión publicada.

## 5. Texto propuesto

### Apartado 02: filas nuevas en la tabla del almacenamiento local

Sustituir el párrafo «Además de las cookies, el navegador guarda tres valores…»
por una tabla con los valores reales una vez cerrados los puntos 3.1 y 4.1, e
incluir al menos:

- `mura_consent`: recuerda la elección de cookies. Propia, 12 meses. Técnica.
- `mura_catalogo_v1`: copia del catálogo de prendas para que la web cargue
  rápido. Propia, mientras dura la pestaña. Técnica.
- Las claves `v2_` y `v3_` de GoHighLevel, con la clasificación que decida el
  revisor.

### Apartado 03: sustituir

> «Todas las cookies del apartado 02 son técnicas, y por eso este sitio no
> muestra un aviso de aceptación: no hay nada que aceptar.»

por (si el revisor mantiene todo como técnico):

> «Las cookies del apartado 02 son técnicas y no requieren consentimiento. Aun
> así, este sitio muestra desde el 16 de octubre de 2026 un aviso de preferencias
> que permite aceptar o rechazar las cookies opcionales de análisis y de
> publicidad. Hoy el sitio no instala ninguna de ellas: se activarán, solo si la
> persona las acepta, cuando se incorporen las herramientas descritas en el
> apartado 05.»

Y la frase «Hasta que ese mecanismo exista, la cookie no va» pasa a: «El
mecanismo existe desde el 16 de octubre de 2026; ninguna cookie no exenta se
instalará antes de que se acepte».

### Apartado 04: sustituir

> «Hoy no existe en este sitio un mecanismo de consentimiento porque no hay nada
> que consentir…»

por:

> «Desde el 16 de octubre de 2026 el sitio muestra un aviso de preferencias, con
> «Rechazar todas» y «Aceptar todas» en pie de igualdad, y un enlace «Configurar
> cookies» en el pie de todas las páginas, desde el que se puede cambiar o
> retirar lo aceptado en cualquier momento. La elección se conserva durante doce
> meses y después se vuelve a preguntar.»

Y la última frase del párrafo, sobre que la elección se guarda en una cookie:
**la elección se guarda en el almacenamiento local del navegador, no en una
cookie**. Borrar los datos del sitio la borra y la elección volverá a
plantearse.

(El texto original promete un enlace «Preferencias de cookies»; el enlace
publicado se llama «Configurar cookies». Se ha ajustado el texto, no el código.)

### Apartado 05: preparar, sin publicar todavía

El día que se instalen, se añaden a la tabla **tras comprobarlas en la web**,
no antes. Nombres y duraciones tal como los conozco por la documentación de cada
proveedor, **a verificar al instalar**:

| Herramienta | Cookies habituales | Finalidad | Categoría |
|---|---|---|---|
| Microsoft Clarity | `_clck`, `_clsk` (y otras propias de Microsoft) | Mapas de calor y grabaciones de uso | Análisis, con consentimiento |
| Meta (píxel y API de Conversiones) | `_fbp`, `_fbc` | Medir si un anuncio de Instagram o Facebook ha llevado a una compra | Publicidad, con consentimiento |

El banner ya borra `_clck`, `_clsk`, `_fbp` y `_fbc` si la persona retira el
permiso.

### Fecha

Tras publicar los cambios: «Última actualización · [fecha]», y en el apartado 02
la fecha de la nueva comprobación (16 de octubre de 2026).

## 6. API de Conversiones desde GoHighLevel (propuesta del 16/10)

Se plantea mandar el `Purchase` a Meta desde un workflow de GHL (`docs/capi-purchase-ghl.md`).
Esa acción envía el importe y los datos de contacto cifrados **sin comprobar el
consentimiento de Publicidad**, y usa el `fbclid` que guarda el seguimiento de
atribución de GHL (las claves `v2_`/`v3_` y `msgsndr_id`). Dos preguntas para el
revisor **[DECIDE EL REVISOR]**:

1. ¿Hace falta consentimiento previo para ese envío, o basta con informarlo en la
   política de privacidad? Si hace falta, ¿cómo se guarda junto al pedido?
2. Si el seguimiento de GHL alimenta la publicidad (esto es una inferencia a partir
   del campo «FBCLID» de la acción, no un dato comprobado), ¿sigue siendo defendible
   como cookie técnica?
