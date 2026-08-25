"""Deja el stock de la tienda igual que la hoja MURA_stock_por_pieza.xlsx.

El stock NO se escribe en /products/inventory: esa ruta no existe y el 422
que devuelve ("Invalid productId: inventory") engaña, porque la API lee
"inventory" como un id de producto. Vive en el precio de cada variante:

    PUT /products/{productId}/price/{priceId}

Modo seco por defecto. Para aplicar: --aplicar
"""
import json, subprocess, sys, unicodedata, re
S='/tmp/claude-0/-home-user-mura/850d7451-a44a-54fd-98c5-35adaf625d82/scratchpad'
API='https://services.leadconnectorhq.com'; PIT='pit-c16bafa6-438e-424d-8d49-7ea9f44590c1'
LID='NxPF5fOicowujokEk5Hm'
H=['-H','Authorization: Bearer '+PIT,'-H','Version: 2021-07-28','-H','Content-Type: application/json']

def norm(x): return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',str(x).lower()).encode('ascii','ignore').decode())
def ntalla(t):
    t=norm(t); return {'tallaunica':'unica','u':'unica'}.get(t,t)

c=json.load(open(f'{S}/comparativa.json')); hoja=c['hoja']
inv=json.load(open(f'{S}/inv.json'))
seco = '--aplicar' not in sys.argv
cambios=0

for v in inv:
    k=norm(v['productName']); t=ntalla(v['name'])
    if k not in hoja: continue
    objetivo=hoja[k]['tallas'].get(t)
    actual=v.get('availableQuantity') or 0
    if objetivo is None or objetivo==actual: continue
    cambios+=1
    print(f"  {v['productName'][:38]:38} {v['name']:6} {actual} → {objetivo}")
    if seco: continue
    u=f"{API}/products/{v['product']}/price/{v['_id']}"
    cur=json.loads(subprocess.run(['curl','-s']+H+[u+f'?locationId={LID}'],capture_output=True,text=True).stdout)
    cuerpo={"locationId":LID,"name":cur['name'],"type":cur['type'],"currency":cur['currency'],
            "amount":cur['amount'],"trackInventory":cur.get('trackInventory',True),
            "availableQuantity":objetivo,
            "allowOutOfStockPurchases":cur.get('allowOutOfStockPurchases',False)}
    open('/tmp/b.json','w').write(json.dumps(cuerpo,ensure_ascii=False))
    out=subprocess.run(['curl','-s','-X','PUT']+H+['--data-binary','@/tmp/b.json',u],capture_output=True,text=True).stdout
    r=json.loads(out)
    print('       →', 'ok' if r.get('availableQuantity')==objetivo else out[:140])

print(f"\n{cambios} variantes" + (" · MODO SECO, nada enviado" if seco else " · aplicado"))
