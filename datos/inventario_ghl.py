#!/usr/bin/env python3
"""Inventario de solo lectura de la subcuenta de GHL de MÛRA.

Uso: MURA_GHL_PIT=… MURA_GHL_LOCATION_ID=… python3 datos/inventario_ghl.py <carpeta_salida>
Solo hace GET. Guarda cada respuesta en JSON quitando datos personales (emails, teléfonos,
nombres de contactos) y enmascarando cualquier cosa con pinta de token.
"""
import json, os, re, subprocess, sys

B = "https://services.leadconnectorhq.com"
PIT, LOC = os.environ["MURA_GHL_PIT"], os.environ["MURA_GHL_LOCATION_ID"]
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
SECRETO = re.compile(r"(pit-[0-9a-f-]{8,}|EAA[A-Za-z0-9]{10,}|AMf-[A-Za-z0-9_-]{10,}|sk_(live|test)_[A-Za-z0-9]+|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)")
PERSONAL = {"email", "phone", "firstName", "lastName", "firstNameLowerCase", "lastNameLowerCase", "contactName",
            "fullNameLowerCase", "address1", "dateOfBirth", "emailLowerCase", "phoneLowerCase", "additionalEmails",
            "additionalPhones", "name_contact", "contactEmail", "contactPhone"}


def limpiar(x):
    if isinstance(x, dict):
        return {k: ("<omitido>" if k in PERSONAL else limpiar(v)) for k, v in x.items()}
    if isinstance(x, list):
        return [limpiar(v) for v in x]
    if isinstance(x, str):
        return SECRETO.sub("<secreto-omitido>", x)
    return x


def get(ruta, version="2021-07-28"):
    r = subprocess.run(["curl", "-s", B + ruta, "-H", f"Authorization: Bearer {PIT}", "-H", f"Version: {version}",
                        "-H", "Accept: application/json"], capture_output=True, text=True)
    try:
        return json.loads(r.stdout)
    except Exception:
        return {"_error": r.stdout[:300]}


def guardar(nombre, d):
    json.dump(limpiar(d), open(f"{OUT}/{nombre}.json", "w"), ensure_ascii=False, indent=1)
    n = None
    if isinstance(d, dict):
        for v in d.values():
            if isinstance(v, list):
                n = len(v); break
    print(f"{nombre:28s} {'error ' + str(d)[:150] if isinstance(d, dict) and (d.get('statusCode', 200) >= 400 or '_error' in d) else n}")
    return d


loc = get(f"/locations/{LOC}")
l = loc.get("location", {})
guardar("ubicacion", {"location": {k: l.get(k) for k in ("id", "name", "timezone", "country", "website", "dateAdded", "settings", "social")}})
guardar("campos_personalizados", get(f"/locations/{LOC}/customFields"))
guardar("campos_oportunidad", get(f"/locations/{LOC}/customFields?model=opportunity"))
guardar("valores_personalizados", get(f"/locations/{LOC}/customValues"))
guardar("tags", get(f"/locations/{LOC}/tags"))
guardar("plantillas_sms_email_antiguas", get(f"/locations/{LOC}/templates?originId={LOC}&limit=100"))
guardar("workflows", get(f"/workflows/?locationId={LOC}"))
guardar("pipelines", get(f"/opportunities/pipelines?locationId={LOC}"))
guardar("plantillas_correo", get(f"/emails/builder?locationId={LOC}&limit=100"))
guardar("campanas_email_antiguas", get(f"/campaigns/?locationId={LOC}"))
guardar("formularios", get(f"/forms/?locationId={LOC}&limit=50"))
guardar("encuestas", get(f"/surveys/?locationId={LOC}&limit=50"))
guardar("calendarios", get(f"/calendars/?locationId={LOC}"))
guardar("enlaces_trigger", get(f"/links/?locationId={LOC}"))
us = get(f"/users/?locationId={LOC}")
guardar("usuarios", {"users": [{k: u.get(k) for k in ("id", "name", "type", "role", "roles", "deleted")} for u in us.get("users", [])]})
fun = guardar("funnels_webs", get(f"/funnels/funnel/list?locationId={LOC}&limit=50"))
paginas = {}
for f in fun.get("funnels", []):
    p = get(f"/funnels/page?locationId={LOC}&funnelId={f['_id']}&limit=50")
    paginas[f["name"]] = [{k: x.get(k) for k in ("_id", "name", "url", "stepId", "deleted", "updatedAt")} for x in (p if isinstance(p, list) else p.get("funnelPages", p.get("pages", [])))] if not isinstance(p, dict) or "_error" not in p else p
guardar("paginas_por_funnel", paginas)
prods = guardar("productos", get(f"/products/?locationId={LOC}&limit=100"))
guardar("inventario", get(f"/products/inventory?altId={LOC}&altType=location&limit=500"))
guardar("colecciones", get(f"/products/collections?altId={LOC}&altType=location&limit=100"))
guardar("envio_zonas", get(f"/store/shipping-zone?altId={LOC}&altType=location&withShippingRate=true"))
guardar("envio_transportistas", get(f"/store/shipping-carrier?altId={LOC}&altType=location"))
guardar("tienda_ajustes", get(f"/store/store-setting?altId={LOC}&altType=location"))
guardar("cupones", get(f"/payments/coupon/list?altId={LOC}&altType=location&limit=100"))
guardar("integraciones_pago", get(f"/payments/integrations/provider/whitelabel?altId={LOC}&altType=location"))
guardar("suscripciones", get(f"/payments/subscriptions?altId={LOC}&altType=location&limit=50"))

# Resúmenes agregados sin datos personales
ords = get(f"/payments/orders?altId={LOC}&altType=location&limit=100")
guardar("pedidos_resumen", {"orders": [{k: o.get(k) for k in ("_id", "createdAt", "amount", "currency", "status", "paymentStatus", "fulfillmentStatus", "liveMode", "source")} for o in ords.get("data", [])], "total": ords.get("totalCount")})
tx = get(f"/payments/transactions?altId={LOC}&altType=location&limit=100")
guardar("transacciones_resumen", {"data": [{k: t.get(k) for k in ("_id", "createdAt", "amount", "currency", "status", "paymentProviderType", "liveMode", "entitySourceType")} for t in tx.get("data", [])], "total": tx.get("totalCount")})
opps = {}
for p in get(f"/opportunities/pipelines?locationId={LOC}").get("pipelines", []):
    for s in p.get("stages", []):
        r = subprocess.run(["curl", "-s", "-X", "POST", B + "/opportunities/search", "-H", f"Authorization: Bearer {PIT}",
                            "-H", "Version: 2021-07-28", "-H", "Content-Type: application/json", "-d",
                            json.dumps({"locationId": LOC, "limit": 1, "filters": [{"field": "pipeline_stage_id", "operator": "eq", "value": s["id"]}]})],
                           capture_output=True, text=True)
        try:
            tot = json.loads(r.stdout).get("total")
        except Exception:
            tot = None
        opps[f"{p['name']} / {s['name']}"] = tot
guardar("oportunidades_por_etapa", {"etapas": opps})
r = subprocess.run(["curl", "-s", "-X", "POST", B + "/contacts/search", "-H", f"Authorization: Bearer {PIT}", "-H", "Version: 2021-07-28",
                    "-H", "Content-Type: application/json", "-d", json.dumps({"locationId": LOC, "pageLimit": 1})], capture_output=True, text=True)
total = json.loads(r.stdout).get("total")
cuenta_tags = {}
for t in get(f"/locations/{LOC}/tags").get("tags", []):
    r = subprocess.run(["curl", "-s", "-X", "POST", B + "/contacts/search", "-H", f"Authorization: Bearer {PIT}", "-H", "Version: 2021-07-28",
                        "-H", "Content-Type: application/json", "-d",
                        json.dumps({"locationId": LOC, "pageLimit": 1, "filters": [{"field": "tags", "operator": "contains", "value": t["name"]}]})],
                       capture_output=True, text=True)
    try:
        cuenta_tags[t["name"]] = json.loads(r.stdout).get("total")
    except Exception:
        cuenta_tags[t["name"]] = None
guardar("contactos_resumen", {"total_contactos": total, "contactos_por_tag": cuenta_tags})
