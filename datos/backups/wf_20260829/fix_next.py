"""Convierte los `next` que son array de 0 o 1 elemento en cadena (o los quita).

De donde sale el fallo: fix04a.py escribia siempre una lista —
    if nexts is not None: t['next'] = [full(x) for x in nexts]
— tambien cuando el nodo tenia un solo sucesor. El helper bueno
(ghl_build.chain) escribe una cadena. GHL lo acepto sin rechistar durante
semanas y ahora su editor lo valida: "Non-branching node has next as an array".

Solo se tocan los arrays de 0 y 1. Los de 2 o mas estan en nodos que SI
ramifican (if_else principal, find_opportunity, wait con condicion) y sin una
referencia hecha en la interfaz cualquier cambio ahi seria adivinar.

El PUT lleva el status que YA tenia el workflow: sin el, GHL despublica en
silencio (seccion 17). Los borradores se quedan en borrador.

Modo seco por defecto. Para aplicar: --aplicar
"""
import os, json, sys, copy
os.environ['GHL_LOCATION_ID']='NxPF5fOicowujokEk5Hm'
os.environ['GHL_FIREBASE_REFRESH_TOKEN']=open(
    '/tmp/claude-0/-home-user-mura/850d7451-a44a-54fd-98c5-35adaf625d82/scratchpad/.ghl_token').read().strip()
import ghl_build as g
L='NxPF5fOicowujokEk5Hm'
seco = '--aplicar' not in sys.argv

ws = g.client.request('GET', f'/workflow/{L}')
total = 0
for w in sorted(ws, key=lambda x: x['name']):
    wf = g.client.request('GET', f"/workflow/{L}/{w['id']}")
    tpl = [copy.deepcopy(t) for t in wf['workflowData']['templates']]
    cambios = []
    for t in tpl:
        n = t.get('next')
        if isinstance(n, list) and len(n) <= 1:
            if len(n) == 1:
                t['next'] = n[0]
                cambios.append(f"{t['type']} · {t.get('name')}: [1] -> cadena")
            else:
                del t['next']
                cambios.append(f"{t['type']} · {t.get('name')}: [] -> se quita")
    if not cambios:
        continue
    total += len(cambios)
    print(f"\n=== {wf['name']}  ({wf.get('status')})")
    for c in cambios: print('    ·', c)
    if seco: continue
    cuerpo = {"name": wf['name'], "version": wf.get('version', 1),
              "status": wf.get('status'),            # el que ya tenia
              "allowMultiple": wf.get('allowMultiple', True),
              "workflowData": {"templates": tpl}}
    r = g.client.request('PUT', f"/workflow/{L}/{w['id']}", cuerpo)
    print('    respuesta:', 'ok' if r and not (isinstance(r, dict) and r.get('_error')) else r)

print(f"\nnodos a corregir: {total}")
if seco: print('MODO SECO — nada enviado. Repetir con --aplicar')
