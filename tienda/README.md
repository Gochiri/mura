# Código de la tienda

Qué se pega y dónde. **En este orden**, siempre.

| Archivo | Va en |
|---|---|
| `tracking-code-body.html` | Sitio "Mura" → Settings → **Tracking Code → Body** |
| `carrito.html` | página `carrito` → elemento de código `custom-code-DN8OVgnA5P` |
| `gracias-compra.html` | página **"Thank you!"** (`/thank-you`), no `/gracias` |

## El orden importa

`tracking-code-body.html` lleva el sistema de diseño `.mura-*` que antes
estaba copiado en cada página. `carrito.html` ya **no** trae CSS: cuenta
con que el global esté puesto. Al revés, la página se queda en crudo.

## Regenerar el archivo pegable

`tracking-code-body.html` está **generado**: es
`codigo-global-tienda.js` envuelto en `<script>`, porque el campo de GHL
espera HTML. Se edita el `.js` y se regenera:

    cd tienda && ./build.sh

## Vaciar el resto de páginas

Estas todavía llevan su propia copia del CSS. De cada una se borra solo
el bloque `<style>…</style>` de su elemento de código; el HTML se queda:

`/prendas` · `/producto` · `/colecciones` · `/novedades` · `/home` ·
`/mura` · `/contacto` · `/devoluciones` · `/gracias`

Se puede ir una a una. Mientras conserven la copia, las reglas están
duplicadas pero son idénticas y no rompen nada.
