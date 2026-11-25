#!/usr/bin/env bash
# Opción (c) del riesgo carrito/cupón (TRASPASO §5.1): bajar del 26 al 30/11 el
# umbral del envío gratis a domicilio de 99 € a 79,20 € (= 99 × 0,8), para que
# un carrito de 99 € o más pague 0 € de envío también si GHL calcula la tarifa
# DESPUÉS del 20 % de BLACK20. Con «normal» se vuelve a 99 €.
#
# Solo toca las dos tarifas «Envío a tu puerta (Nacex)» de la zona «España».
# La recogida en punto Nacex Shop no cambia.
#
# Uso:
#   datos/envio-umbral.sh bf                # ensayo: enseña qué haría
#   datos/envio-umbral.sh bf --ejecutar     # copia en datos/backups/ y cambia a 79,20 €
#   datos/envio-umbral.sh normal --ejecutar # vuelta a 99 € (1/12)
#
# Lee MURA_GHL_PIT y MURA_GHL_LOCATION_ID del entorno (no GHL_API_KEY: es otra subcuenta).
set -euo pipefail

: "${MURA_GHL_PIT:?Falta MURA_GHL_PIT}"; : "${MURA_GHL_LOCATION_ID:?Falta MURA_GHL_LOCATION_ID}"
MODO="${1:?bf o normal}"; EJECUTAR="${2:-}"
API=https://services.leadconnectorhq.com
ZONA=6a764f72df6bb6cc8e548c29
TARIFA_PAGO=6a764f7ad2a595a78307f718     # 3 €
TARIFA_GRATIS=6aae4dd8a3e65b12c464df47   # 0 €
case "$MODO" in
  bf)     MAX_PAGO=79.19; MIN_GRATIS=79.2 ;;
  normal) MAX_PAGO=98.99; MIN_GRATIS=99 ;;
  *) echo "Modo: bf o normal" >&2; exit 1 ;;
esac

H=(-H "Authorization: Bearer $MURA_GHL_PIT" -H "Version: 2021-07-28" -H "Accept: application/json" -H "Content-Type: application/json")
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ZONAJSON=$(curl -s "${H[@]}" "$API/store/shipping-zone/$ZONA?altId=$MURA_GHL_LOCATION_ID&altType=location&withShippingRate=true")

echo "$ZONAJSON" | python3 -c "
import json,sys
z=json.load(sys.stdin); z=z.get('data',z)
for r in z.get('shippingRates',[]): print('  ahora:',r['_id'],r['name'],r['amount'],'€',r.get('conditionType'),r.get('minCondition'),'→',r.get('maxCondition'))"
echo "Cambio: 3 € hasta $MAX_PAGO · gratis desde $MIN_GRATIS"

if [ "$EJECUTAR" != "--ejecutar" ]; then echo "Ensayo: no se ha cambiado nada."; exit 0; fi

COPIA="$RAIZ/datos/backups/ghl_envio_zona_$(date +%Y%m%d_%H%M)_antes_$MODO.json"
printf '%s\n' "$ZONAJSON" > "$COPIA"; echo "Copia: $COPIA"

cuerpo() { # nombre importe min max
  python3 -c "import json,sys;print(json.dumps({'altId':sys.argv[1],'altType':'location','name':sys.argv[2],'currency':'EUR','amount':float(sys.argv[3]),'conditionType':'price','minCondition':float(sys.argv[4]),'maxCondition':float(sys.argv[5]),'isCarrierRate':False}))" \
    "$MURA_GHL_LOCATION_ID" "$@"
}
curl -s -X PUT "${H[@]}" "$API/store/shipping-zone/$ZONA/shipping-rate/$TARIFA_PAGO" \
  -d "$(cuerpo 'Envío a tu puerta (Nacex)' 3 0 "$MAX_PAGO")"; echo
curl -s -X PUT "${H[@]}" "$API/store/shipping-zone/$ZONA/shipping-rate/$TARIFA_GRATIS" \
  -d "$(cuerpo 'Envío a tu puerta (Nacex)' 0 "$MIN_GRATIS" 0)"; echo

echo "Después:"
curl -s "${H[@]}" "$API/store/shipping-zone/$ZONA?altId=$MURA_GHL_LOCATION_ID&altType=location&withShippingRate=true" | python3 -c "
import json,sys
z=json.load(sys.stdin); z=z.get('data',z)
for r in z.get('shippingRates',[]): print('  ',r['name'],r['amount'],'€',r.get('minCondition'),'→',r.get('maxCondition'))"
echo "Recuerda: web/carrito.html sigue diciendo 99 €. Con (c) eso juega a favor de la clienta (paga menos de lo anunciado, nunca más)."
