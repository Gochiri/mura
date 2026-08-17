#!/bin/sh
# Genera los DOS pegables de GHL a partir de un único archivo fuente.
#
#   tracking-code-head.html → Tracking Code → HEAD  (el CSS)
#   tracking-code-body.html → Tracking Code → BODY  (lo que toca el DOM)
#
# Los dos llevan el mismo código y solo se diferencian en la constante
# MURA_PARTE, que decide qué bloques corren. Se hace así, y no partiendo
# el archivo por marcadores de texto, porque un build que trocea texto se
# rompe en silencio en cuanto alguien mueve una línea.
#
# El campo de GHL espera HTML, no JavaScript suelto: de ahí el <script>.
set -e
cd "$(dirname "$0")"

generar() {
  parte="$1"; destino="$2"; campo="$3"; lleva="$4"
  {
    echo '<!-- ============================================================'
    echo '     GENERADO — NO EDITAR ESTE ARCHIVO A MANO.'
    echo "     Va en: Settings → Tracking Code → $campo"
    echo "     Lleva: $lleva"
    echo ''
    echo '     La fuente es tienda/codigo-global-tienda.js, envuelto en una'
    echo '     etiqueta de script y con MURA_PARTE fijada. Se regenera con:'
    echo '       cd tienda && ./build.sh'
    echo '     ============================================================ -->'
    echo '<script>'
    echo "window.MURA_PARTE = '$parte';"
    cat codigo-global-tienda.js
    echo '</script>'
  } > "$destino"
  echo "$destino regenerado ($(wc -c < "$destino") bytes)"
}

generar head tracking-code-head.html HEAD \
  'el CSS: sistema de diseno, encuesta, buscador y tienda'
generar body tracking-code-body.html BODY \
  'lo que necesita el DOM: contador, buscador, cabecera e idioma'
