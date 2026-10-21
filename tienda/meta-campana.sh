#!/usr/bin/env bash
# Crea en Meta, EN PAUSA, la campaña de Ventas de MÛRA y su único conjunto de
# anuncios, tal como está en docs/campanas-meta.md. No crea anuncios: esos
# necesitan un creativo y entran cuando haya contenido (docs/plan-contenido.md).
#
#   set -a; source .env; set +a   # o las variables META_* del entorno
#   ./tienda/meta-campana.sh            # crea
#   ./tienda/meta-campana.sh --ver      # solo lista lo que hay
#
# Nunca imprime el token. Activar la campaña o cambiar el presupuesto se hace
# aparte y solo con el visto bueno de German (docs/meta-api.md, apartado 7).
set -euo pipefail
: "${META_ACCESS_TOKEN:?falta META_ACCESS_TOKEN}" "${META_AD_ACCOUNT_ID:?falta META_AD_ACCOUNT_ID}" "${META_PIXEL_ID:?falta META_PIXEL_ID}"
G=https://graph.facebook.com/v21.0
A="access_token=$META_ACCESS_TOKEN"

NOMBRE_CAMPANA='MÛRA · Ventas · Cápsula 01'
NOMBRE_CONJUNTO='Mujeres 28–48 · España · Advantage+'
PRESUPUESTO_DIARIO=2200                 # céntimos: 22 €/día (docs/campanas-meta.md)
INICIO='2026-11-02T09:00:00+0100'
ANUNCIANTE='MÛRA'                       # Ley de Servicios Digitales (UE): quién se anuncia y quién paga

ver() {
  echo "Campañas:";  curl -s "$G/$META_AD_ACCOUNT_ID/campaigns?fields=id,name,status,objective&$A"; echo
  echo "Conjuntos:"; curl -s "$G/$META_AD_ACCOUNT_ID/adsets?fields=id,name,status,daily_budget,optimization_goal,start_time,campaign_id&$A"; echo
}
if [[ "${1:-}" == "--ver" ]]; then ver; exit 0; fi

# Si ya existe una campaña con ese nombre, no se duplica.
existente=$(curl -s "$G/$META_AD_ACCOUNT_ID/campaigns?fields=id,name&$A" | python3 -c "import json,sys;d=json.load(sys.stdin);print(next((c['id'] for c in d.get('data',[]) if c['name']==sys.argv[1]),''))" "$NOMBRE_CAMPANA")
if [[ -n "$existente" ]]; then
  echo "La campaña ya existe: $existente"; CAMP=$existente
else
  CAMP=$(curl -s -X POST "$G/$META_AD_ACCOUNT_ID/campaigns" \
    --data-urlencode "name=$NOMBRE_CAMPANA" -d "objective=OUTCOME_SALES" -d "status=PAUSED" \
    -d "buying_type=AUCTION" -d "special_ad_categories=[]" -d "is_adset_budget_sharing_enabled=false" -d "$A" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('id') or json.dumps(d,ensure_ascii=False))")
  echo "Campaña: $CAMP"
  [[ "$CAMP" =~ ^[0-9]+$ ]] || exit 1
fi

# Con audiencia Advantage+ la API solo admite controles: edad mínima hasta 25, máxima no por debajo de 65,
# tope de edad y sexo. El «28–48» del plan va como SUGERENCIA, que se añade en
# el Administrador de anuncios (Conjunto → Audiencia → Sugerencia de edad).
TARGETING=$(cat <<EOF
{"geo_locations":{"countries":["ES"]},"age_min":25,"age_max":65,"genders":[2],
 "targeting_automation":{"advantage_audience":1}}
EOF
)
PROMOTED="{\"pixel_id\":\"$META_PIXEL_ID\",\"custom_event_type\":\"ADD_TO_CART\"}"

CONJ=$(curl -s -X POST "$G/$META_AD_ACCOUNT_ID/adsets" \
  --data-urlencode "name=$NOMBRE_CONJUNTO" -d "campaign_id=$CAMP" -d "status=PAUSED" \
  -d "daily_budget=$PRESUPUESTO_DIARIO" -d "billing_event=IMPRESSIONS" \
  -d "optimization_goal=OFFSITE_CONVERSIONS" -d "bid_strategy=LOWEST_COST_WITHOUT_CAP" \
  -d "destination_type=WEBSITE" --data-urlencode "start_time=$INICIO" \
  --data-urlencode "dsa_beneficiary=$ANUNCIANTE" --data-urlencode "dsa_payor=$ANUNCIANTE" \
  --data-urlencode "promoted_object=$PROMOTED" --data-urlencode "targeting=$TARGETING" -d "$A")
echo "Conjunto: $CONJ"
echo; ver
