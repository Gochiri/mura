# Código de la tienda

Qué se pega y dónde. **En este orden**, siempre.

| Archivo | Va en |
|---|---|
| `tracking-code-head.html` | Sitio "Mura" → Settings → **Tracking Code → Head** |
| `tracking-code-body.html` | Sitio "Mura" → Settings → **Tracking Code → Body** |
| `carrito.html` | página `carrito` → elemento de código `custom-code-DN8OVgnA5P` |
| `gracias-compra.html` | página **"Thank you!"** (`/thank-you`), no `/gracias` |
| `producto.html` | página `producto` → elemento `custom-code-oM1HT_mKKm` |
| `suscripcion-confirmada.html` | página `/suscripcion-confirmada` |
| `newsletter-home.html` | sección al final de `/home` |
| `experiencia.html` | página `/experiencia` (nueva) |

### Los dos que necesitan una URL antes de pegarse

`newsletter-home.html` y `experiencia.html` llevan el marcador
`PEGAR_URL_DEL_WEBHOOK_N8N`. Hay que importar antes su workflow en n8n
(`n8n-newsletter-workflow.json` y `n8n-experiencia-workflow.json`),
activarlo y copiar la URL de **producción** — la `/webhook/…`. La de
pruebas, `/webhook-test/…`, solo escucha con el editor de n8n abierto:
en producción no llega nunca. Ese fue el bug del 06b.

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
