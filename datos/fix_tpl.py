"""Arregla los href rotos de las plantillas de correo (API publica de GHL).

Solo toca lo que hay DENTRO de href="...". El resto del HTML —textos, estilos,
los comentarios de cabecera— se queda byte a byte como estaba.
"""
import json, re, os, urllib.request, urllib.error, sys

LID='NxPF5fOicowujokEk5Hm'
PIT='pit-c16bafa6-438e-424d-8d49-7ea9f44590c1'
API='https://services.leadconnectorhq.com'
BK='datos/backups/plantillas_20260822'
FEEDBACK='{{custom_values.url_feedback}}?cid={{contact.id}}'

REGLAS={
 '06': {'{{contact.url_feedback}}': FEEDBACK},
 '07': {'AÑADIR ENLACE': FEEDBACK},
 '18': {'AÑADIR ENLACE GOOGLE': '{{custom_values.url_resena_google}}'},
 '09A':{'{{contact.url_devolucion}}': '{{custom_values.url_devoluciones}}'},
 '10': {'{{contact.url_devolucion}}': '{{custom_values.url_devoluciones}}'},
 '15': {'{{contact.url_pieza}}': '{{custom_values.url_pieza}}'},
 '16': {'AÑADIR LINK': '{{custom_values.url_devoluciones}}',
        'AÑADIR CONTACTO': '{{custom_values.url_contacto}}'},
 # en 03 y 08 el <a> visible ya estaba bien; lo que quedo viejo es el
 # fallback VML de Outlook, que apuntaba al campo de contacto.
 '03': {'{{contact.url_pedido}}': 'https://stylebymura.com/store/account/orders/{{opportunity.order_id}}'},
 '08': {'{{contact.url_etiqueta_devolucion}}': '{{opportunity.url_etiqueta_devolucion}}'},
}

def clave(nombre):
    n=nombre.split('·')[0].strip()
    return n if n in REGLAS else None

def post(path, body):
    """curl y no urllib: Cloudflare devuelve 1010 a urllib (falta UA de navegador)."""
    import subprocess, tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
        json.dump(body, f, ensure_ascii=False); ruta=f.name
    out=subprocess.run(['curl','-s','-X','POST',API+path,
        '-H','Authorization: Bearer '+PIT,'-H','Version: 2021-07-28',
        '-H','Content-Type: application/json','--data-binary','@'+ruta],
        capture_output=True, text=True).stdout
    os.unlink(ruta)
    try: return json.loads(out)
    except Exception: return {'_error':'no-json','body':out[:300]}

idx=json.load(open(f'{BK}/_indice.json'))
seco = '--aplicar' not in sys.argv
for nombre,meta in sorted(idx.items()):
    k=clave(nombre)
    if not k: continue
    html=open(f"{BK}/{meta['file']}",encoding='utf-8').read()
    cambios={}
    def sustituir(m):
        v=m.group(1)
        for viejo,nuevo in REGLAS[k].items():
            if v.strip()==viejo:
                cambios[viejo]=cambios.get(viejo,0)+1
                return 'href="%s"'%nuevo
        return m.group(0)
    nuevo_html=re.sub(r'href="([^"]*)"', sustituir, html)
    print(f'--- {nombre}  ({len(html)} → {len(nuevo_html)} bytes)  cambios: {cambios or "NINGUNO"}')
    if not cambios:
        print('    ⚠ no se encontro el marcador; no se toca'); continue
    if seco: continue
    r=post('/emails/builder/data', {'locationId':LID,'templateId':meta['id'],
        'updatedBy':'claude-fix-href','editorType':'html','html':nuevo_html})
    print('    respuesta:', 'ok' if r.get('ok') else r)
print('\nMODO SECO — nada enviado. Repetir con --aplicar' if seco else '\nAplicado.')
