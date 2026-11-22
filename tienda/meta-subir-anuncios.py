#!/usr/bin/env python3
"""Sube anuncios de vídeo EN PAUSA al conjunto de MÛRA, con la misma estructura que D.

Uso: python3 tienda/meta-subir-anuncios.py <anuncios.json>
Lee META_ACCESS_TOKEN y META_AD_ACCOUNT_ID del entorno (nunca se escriben aquí).
Cada anuncio: nombre, video (ruta local), segundo_miniatura, titulo, texto, enlace, utm_content, utm_campaign.
Usa curl (como el resto de llamadas a la Graph API del proyecto).
"""
import json, os, subprocess, sys, tempfile, time

G = "https://graph.facebook.com/v21.0"
TOKEN = os.environ["META_ACCESS_TOKEN"]
CUENTA = "act_" + os.environ["META_AD_ACCOUNT_ID"].removeprefix("act_")
CONJUNTO = "52588391414956"
PAGINA, INSTAGRAM = "1239437265929299", "17841410968485139"
DOF = os.environ.get("META_DOF")  # degrees_of_freedom_spec copiado de D (todo en OPT_OUT)


def curl(*args):
    r = subprocess.run(["curl", "-s", *args, "-F", f"access_token={TOKEN}"] if "-F" in args else
                       ["curl", "-s", *args, "--data-urlencode", f"access_token={TOKEN}"],
                       capture_output=True, text=True)
    d = json.loads(r.stdout)
    if "error" in d:
        raise SystemExit(f"Error de Meta: {d['error'].get('message')} {d['error'].get('error_user_msg', '')}")
    return d


def subir(a):
    print("·", a["nombre"])
    v = curl("-X", "POST", f"{G}/{CUENTA}/advideos", "-F", f"source=@{a['video']}", "-F", f"name={a['nombre']}")
    vid = v["id"]
    for _ in range(60):  # Meta procesa el vídeo antes de poder usarlo
        st = curl("-G", f"{G}/{vid}", "--data-urlencode", "fields=status")["status"]["video_status"]
        if st == "ready":
            break
        time.sleep(10)
    else:
        raise SystemExit(f"El vídeo {vid} no terminó de procesarse")
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        mini = f.name
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(a["segundo_miniatura"]), "-i", a["video"],
                    "-frames:v", "1", "-q:v", "2", mini], check=True)
    img = curl("-X", "POST", f"{G}/{CUENTA}/adimages", "-F", f"filename=@{mini}")
    hsh = next(iter(img["images"].values()))["hash"]
    spec = {"page_id": PAGINA, "instagram_user_id": INSTAGRAM,
            "video_data": {"video_id": vid, "title": a["titulo"], "message": a["texto"], "image_hash": hsh,
                           "call_to_action": {"type": "SHOP_NOW", "value": {"link": a["enlace"]}}}}
    tags = f"utm_source=meta&utm_medium=paid_social&utm_campaign={a['utm_campaign']}&utm_content={a['utm_content']}"
    args = ["-X", "POST", f"{G}/{CUENTA}/adcreatives", "--data-urlencode", f"name={a['nombre']}",
            "--data-urlencode", f"object_story_spec={json.dumps(spec, ensure_ascii=False)}",
            "--data-urlencode", f"url_tags={tags}"]
    if DOF:
        args += ["--data-urlencode", f"degrees_of_freedom_spec={DOF}"]
    cr = curl(*args)["id"]
    ad = curl("-X", "POST", f"{G}/{CUENTA}/ads", "--data-urlencode", f"name={a['nombre']}",
              "--data-urlencode", f"adset_id={CONJUNTO}", "--data-urlencode", f"creative={json.dumps({'creative_id': cr})}",
              "--data-urlencode", "status=PAUSED")["id"]
    print(f"  vídeo {vid} · creatividad {cr} · anuncio {ad} (PAUSED)")
    return dict(nombre=a["nombre"], video=vid, creatividad=cr, anuncio=ad)


if __name__ == "__main__":
    hechos = [subir(a) for a in json.load(open(sys.argv[1]))]
    print(json.dumps(hechos, ensure_ascii=False, indent=1))
