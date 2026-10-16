# Código de la tienda

Qué se pega y dónde. **En este orden**, siempre.

| Archivo | Va en |
|---|---|
| `tracking-code-head.html` | Sitio "Mura" → Settings → **Tracking Code → Head** |
| `tracking-code-body.html` | Sitio "Mura" → Settings → **Tracking Code → Body** |
| `css-paginas-tienda.css` | **Custom CSS** de `/checkout` (las otras de tienda no se usan, ver abajo) |
| `carrito.html` | página `carrito` → elemento de código `custom-code-DN8OVgnA5P` |
| `gracias-compra.html` | página **`/gracias`** |
| `producto.html` | página `producto` → elemento `custom-code-oM1HT_mKKm` |
| `suscripcion-confirmada.html` | página `/suscripcion-confirmada` |
| `newsletter-home.html` | sección al final de `/home` |
| `experiencia.html` | página `/experiencia` (nueva) |

### Los dos que necesitan una URL antes de pegarse

`experiencia.html` es el que sigue pendiente de URL. El del newsletter ya
está puesto (22/8): `https://n8n.letsbebanana.com/webhook/alta-newsletter`,
la de producción del flujo de Sonia. El JSON importable declara ese mismo
path, para que no diverjan. Hay que importar antes su workflow en n8n
(`n8n-newsletter-workflow.json` y `n8n-experiencia-workflow.json`),
activarlo y copiar la URL de **producción** — la `/webhook/…`. La de
pruebas, `/webhook-test/…`, solo escucha con el editor de n8n abierto:
en producción no llega nunca. Ese fue el bug del 06b.

## Banner de cookies (16/10)

*Pegado en GHL y comprobado en producción por German el 16/10.*

Va **dentro del mismo global** (sección 10 de `codigo-global-tienda.js`), así
que no hay nada nuevo que pegar: basta regenerar y volver a pegar los dos
`tracking-code-*.html` y el `css-paginas-tienda.css` en `/checkout`.

- Sale en todas las páginas, abajo, sin bloquear. «Rechazar todas» y «Aceptar
  todas» son idénticos; «Configurar» abre análisis y publicidad, apagados de
  entrada. Caduca a los 12 meses.
- Añade solo «Configurar cookies» junto a «Política de cookies» en cada pie.
- **No instala Clarity ni el píxel.** Solo guarda la decisión. Quien los cargue
  tiene que preguntar antes con `window.muraConsent.permite('analitica')` o
  `.permite('marketing')`, o suscribirse con `.alCambiar(fn)`.
- Probado el 16/10 en Chromium: 22 comprobaciones (primera visita, rechazo,
  selección, reapertura desde el pie, borrado de `_fbp` al retirar el permiso,
  caducidad, móvil de 390 px, sin errores de JS).
- **Sin probar en producción:** el aviso a Clarity (`consentv2`) y a Meta
  (`fbq('consent')`) está escrito pero no hay nada cargado que lo reciba;
  comprobarlo al instalar cada uno.
- **Antes de dar el banner por bueno:** publicar `/politica-cookies` tras la
  auditoría real (ver `legal/README.md`). El texto del banner promete lo que
  esa política tiene que confirmar.

## Clarity (16/10)

Sección 11 del global. **Preparado y sin ID: no hace nada todavía.**

Cuando German cree el proyecto en clarity.microsoft.com (dominio
`stylebymura.com`):

1. Copiar el **ID del proyecto** (Configuración → Resumen).
2. Pegarlo en `tienda/codigo-global-tienda.js`, línea `var CLARITY_ID = '';`
   (nos lo pasa a Claude y lo hace Claude, o se edita a mano y se ejecuta
   `./build.sh`).
3. Volver a pegar `tracking-code-head.html` y `tracking-code-body.html` en GHL.

Se carga **solo si la clienta acepta Análisis** en el banner: antes no hay
descarga ni cookies de Clarity. No se carga en `/checkout`, `/gracias`,
`/thank-you` ni `/devoluciones` (datos personales en pantalla); quitar una de
esas rutas exige revisar antes el enmascarado en el panel de Clarity.

Probado en Chromium con un ID de prueba y la petición interceptada (14
comprobaciones): sin decidir, rechazo y «solo Publicidad» no cargan; «Aceptar
todas» y «solo Análisis» sí; la decisión guardada carga al recargar; las rutas
excluidas no cargan; sin ID nunca carga. **Sin probar contra clarity.ms real**:
al instalarlo, comprobar que llegan sesiones y que las cookies `_clck` y `_clsk`
solo aparecen tras aceptar.

## Por qué además hay un CSS suelto (22/8)

**GHL no sirve el Tracking Code del Head dentro del `<head>`.** Lo deja en
el body y lo sube arriba por JavaScript cuando la app ya arrancó. Medido en
`/checkout` con `fetch(location.href)`: en el HTML servido `MURA_PARTE`
aparece dos veces y **ninguna** antes de `</head>`. De ahí que el estilo
tardara ~10 s en aparecer.

Lo que sí viaja en el HTML es el **Custom CSS de la página**, que sale como
primera hoja del head. Ahí va `css-paginas-tienda.css`, y así el navegador
tiene el estilo antes de pintar sin depender de ningún script.

Es **por página**, pero de las cuatro de tienda **solo se usa `/checkout`**
(22/8, German). `/products-list`, `/product-details` y `/thank-you` existen
porque la tienda de GHL las necesita, pero la clienta nunca las ve: la
rejilla es `/prendas`, la ficha es `/producto` y el post-compra es
`/gracias`. Tenerlo pegado también ahí no molesta y evita que se vean en
crudo si algún enlace interno lleva a una de ellas.

⚠️ **`gracias-compra.html` va en `/gracias`, no en `/thank-you`.** Este
README dijo lo contrario hasta el 22/8. Comprobado por API: `/gracias`
lleva el código MÛRA en su elemento y `/thank-you` no tiene ninguno. Si el
checkout no redirige a `/gracias` tras el pago, la clienta acaba en una
página vacía — conviene confirmarlo en los ajustes de la tienda.

El CSS sigue yendo también dentro del Head, que no estorba —son las mismas
reglas— y cubre cualquier página donde no se haya pegado.

## Por qué el global son dos archivos, y no uno

**El del Head lleva todo el CSS; el del Body, todo lo que toca el DOM.**

En `/checkout` el estilo tardaba unos segundos en aparecer. El CSS no
llegaba tarde por sí mismo —se inyecta síncrono— sino que llegaba tarde
**el script**: el Tracking Code del Body lo mete GHL dentro de un `div`
del propio body, y el checkout lo pinta el bundle de la tienda antes de
que nosotros lleguemos. Con el CSS en el Head, el navegador lo tiene
antes de pintar nada.

**Hay que pegar los dos.** Solo el Head: se ve el diseño pero no hay
cabecera inyectada, ni contador de carrito, ni buscador. Solo el Body:
funciona todo y no hay estilo ninguno.

## El orden importa

El Head lleva el sistema de diseño `.mura-*` que antes estaba copiado en
cada página. `carrito.html` y las demás ya **no** traen CSS: cuentan con
que el global esté puesto. Al revés, la página se queda en crudo.

## Regenerar los archivos pegables

Los dos `tracking-code-*.html` están **generados**: son el mismo
`codigo-global-tienda.js` envuelto en una etiqueta de script, con la
constante `MURA_PARTE` fijada a `head` o a `body` — cada bloque del
código mira esa constante para saber si le toca correr. Se edita el
`.js` (nunca los `.html`) y se regeneran:

    cd tienda && ./build.sh

Eso regenera los dos pegables **y** `css-paginas-tienda.css`, que no se
extrae buscando texto sino **ejecutando** el global con un DOM de mentira y
quedándose con lo que le pasa a `estilo()`. Si cambian los bloques o las
guardias de ruta, sigue sacando lo correcto.

Los dos llevan el código entero y solo se diferencian en esa línea. Es a
propósito: partir el fuente por marcadores de texto ahorra unos kilobytes
y a cambio deja un build que se rompe en silencio en cuanto alguien mueve
una línea.

## Vaciar el resto de páginas

Estas todavía llevan su propia copia del CSS. De cada una se borra solo
el bloque `<style>…</style>` de su elemento de código; el HTML se queda:

`/prendas` · `/producto` · `/colecciones` · `/novedades` · `/home` ·
`/mura` · `/contacto` · `/devoluciones` · `/gracias`

Se puede ir una a una. Mientras conserven la copia, las reglas están
duplicadas pero son idénticas y no rompen nada.
