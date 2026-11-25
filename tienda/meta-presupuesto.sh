#!/usr/bin/env bash
# Cambia el presupuesto diario del conjunto de MÛRA en Meta.
#
# REGLA (TRASPASO §6.1): solo con OK expreso de German en el momento.
# Para el 26–30/11 (Black Friday), además: confirmación escrita de Sara y
# saldo de la tarjeta comprobado por ella.
#
# Uso:
#   tienda/meta-presupuesto.sh 40              # ensayo: enseña qué haría, no cambia nada
#   tienda/meta-presupuesto.sh 40 --ejecutar   # copia en datos/backups/ y cambia a 40 €/día
#   tienda/meta-presupuesto.sh 22 --ejecutar   # vuelta a 22 €/día (noche del 30/11)
#
# Lee META_ACCESS_TOKEN del entorno. No escribe el token en ningún archivo.
set -euo pipefail

CONJUNTO=52588391414956          # «Mujeres 25–48 · España · Advantage+»
G=https://graph.facebook.com/v21.0
EUROS="${1:?Indica los euros diarios, p. ej. 40}"
EJECUTAR="${2:-}"
: "${META_ACCESS_TOKEN:?Falta META_ACCESS_TOKEN en el entorno}"

case "$EUROS" in (*[!0-9]*|'') echo "Euros enteros, sin decimales" >&2; exit 1;; esac
if [ "$EUROS" -lt 5 ] || [ "$EUROS" -gt 60 ]; then
  echo "Fuera de rango (5–60 €/día). Si de verdad hace falta, cámbialo a mano." >&2; exit 1
fi
CENTS=$((EUROS * 100))

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ANTES=$(curl -s "$G/$CONJUNTO?fields=name,status,effective_status,daily_budget,budget_remaining&access_token=$META_ACCESS_TOKEN")
echo "Ahora:  $ANTES"
echo "Cambio: daily_budget ${CENTS} (= ${EUROS} €/día)"

if [ "$EJECUTAR" != "--ejecutar" ]; then
  echo "Ensayo: no se ha cambiado nada. Añade --ejecutar con el OK de German."
  exit 0
fi

COPIA="$RAIZ/datos/backups/meta_conjunto_presupuesto_$(date +%Y%m%d_%H%M).json"
printf '%s\n' "$ANTES" > "$COPIA"
echo "Copia:  $COPIA"

curl -s -X POST "$G/$CONJUNTO" -d "daily_budget=$CENTS" -d "access_token=$META_ACCESS_TOKEN"; echo
echo "Después: $(curl -s "$G/$CONJUNTO?fields=status,daily_budget&access_token=$META_ACCESS_TOKEN")"
