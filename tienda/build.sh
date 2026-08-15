#!/bin/sh
# Envuelve el código global en <script> para poder pegarlo en GHL,
# cuyo campo de Tracking Code espera HTML y no JavaScript suelto.
set -e
cd "$(dirname "$0")"
{
  echo '<!-- ============================================================'
  echo '     GENERADO — NO EDITAR ESTE ARCHIVO A MANO.'
  echo '     La fuente es tienda/codigo-global-tienda.js; este es solo'
  echo '     ese archivo envuelto en <script> para poder pegarlo en el'
  echo '     campo de GHL, que espera HTML y no JavaScript suelto.'
  echo '     Se regenera con:  ./build.sh'
  echo '     ============================================================ -->'
  echo '<script>'
  cat codigo-global-tienda.js
  echo '</script>'
} > tracking-code-body.html
echo "tracking-code-body.html regenerado ($(wc -c < tracking-code-body.html) bytes)"
