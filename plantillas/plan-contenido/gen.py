#!/usr/bin/env python3
"""Genera el lienzo A4 (artboards .dc.html + canvas.json) a partir de un
plan-contenido.md relleno.

  python3 gen.py docs/plan-contenido.md --marca "NOMBRE" --out ./salida
      [--pie "Agencia para NOMBRE"] [--para "Para NOMBRE · Mes 2026"]
      [--fondo "#F6F2EB"] [--tinta "#1E1B1A"]
      [--serif "Cormorant Garamond"] [--sans "Jost"]
      [--intro "Párrafo de portada"] [--funciona "Lo que rinde en el orgánico"]

Lee del .md: la tabla bajo «## Calendario», la lista numerada bajo «## Reglas
de grabación» y las fichas «### N · …» con sus campos en negrita. Después:
./medir.sh salida/project, y publicar salida/project/ en un artefacto Design.
"""
import argparse, datetime, json, os, re

ap = argparse.ArgumentParser()
ap.add_argument('md')
ap.add_argument('--marca', required=True)
ap.add_argument('--out', default='./salida')
ap.add_argument('--pie')
ap.add_argument('--para')
ap.add_argument('--fondo', default='#F6F2EB')
ap.add_argument('--tinta', default='#1E1B1A')
ap.add_argument('--serif', default='Cormorant Garamond')
ap.add_argument('--sans', default='Jost')
ap.add_argument('--intro', default='Tus publicaciones ya nos han dicho qué funciona. Este plan parte de ahí: tú grabas con el móvil siguiendo cada ficha; nosotros montamos los anuncios, ponemos el texto y la música y los lanzamos.')
ap.add_argument('--funciona', default='[Dos frases con lo que rinde en el orgánico del cliente y lo que no, con cifras.]')
A = ap.parse_args()

MARCA = A.marca
PIE = A.pie or f'Profit Technology para {MARCA}'
PARA = A.para or f'Para {MARCA}'
OUT = os.path.join(A.out, 'project'); os.makedirs(OUT, exist_ok=True)
SERIF = f"'{A.serif}', Georgia, serif"
SANS, FONDO, TINTA = A.sans, A.fondo, A.tinta
GF = (f"https://fonts.googleapis.com/css2?family={A.serif.replace(' ', '+')}:ital,wght@0,300;0,400;0,500;1,400"
      f"&amp;family={SANS.replace(' ', '+')}:wght@300;400;500&amp;display=swap")

# ---------- piezas de maquetación
def label(t, c="#6B6258"): return f'<div style="font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: {c};">{t}</div>'
def h2(t): return f'<h2 style="margin: 0; font-family: {SERIF}; font-size: 44px; font-weight: 300; line-height: 1.02;">{t}</h2>'
def lead(t): return f'<p style="margin: 0; font-family: {SERIF}; font-style: italic; font-size: 20px; line-height: 1.35; color: #3E3833;">{t}</p>'
def p(t, extra=""): return f'<p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: {TINTA};{extra}">{t}</p>'
def col(items, gap=8): return f'<div style="display: flex; flex-direction: column; gap: {gap}px;">' + ''.join(items) + '</div>'
def grid(cells, cols=2, gap=28, extra=""): return f'<div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: {gap}px;{extra}">' + ''.join(cells) + '</div>'
def bloque(mt, inner): return f'<div style="margin-top: {mt}px;">{inner}</div>'
def lista(items, marca="—", fs=13):
    return col([f'<div style="display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 6px; font-size: {fs}px; line-height: 1.5;"><span style="color: #6B6258;">{marca}</span><span>{t}</span></div>' for t in items], 6)
def filas(rows, w1="150px", fs=13):
    out = [f'<div style="display: grid; grid-template-columns: {w1} minmax(0, 1fr); gap: 16px; padding: 8px 0; border-bottom: 1px solid #CFC6B8; font-size: {fs}px; line-height: 1.5;"><div style="font-weight: 500;">{a}</div><div style="color: #3E3833;">{b}</div></div>' for a, b in rows]
    return f'<div style="display: flex; flex-direction: column; border-top: 1px solid {TINTA};">' + ''.join(out) + '</div>'
def banda(lab, texto, size=20):
    return f'<div style="padding: 18px 24px; background: #E6DED2; display: flex; flex-direction: column; gap: 8px;">{label(lab, "#4A433C")}<p style="margin: 0; font-family: {SERIF}; font-size: {size}px; line-height: 1.32;">{texto}</p></div>'
def head(sec):
    return (f'<div style="display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 14px; border-bottom: 1px solid #CFC6B8;">'
            f'<div style="font-family: {SERIF}; font-size: 18px; font-weight: 500; letter-spacing: 0.42em;">{MARCA}</div>'
            f'<div style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #6B6258;">{sec}</div></div>')
def foot(n, N): return f'<div style="margin-top: auto; display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #CFC6B8; font-size: 12px; color: #6B6258;"><span>{PIE}</span><span>{n} / {N}</span></div>'
def page(title, n, N, sec, body):
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Plan de contenido {MARCA} · {title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="{GF}">
<style>
body{{margin:0;background:#EDE8DE;font-family:'{SANS}',sans-serif;color:{TINTA}}}
</style>
</helmet>
<div style="width: 794px; height: 1123px; box-sizing: border-box; padding: 56px 72px 44px; background: {FONDO}; display: flex; flex-direction: column; font-family: '{SANS}', sans-serif; color: {TINTA};">
{head(sec)}
{body}
{foot(n, N)}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":794,"height":1123}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''
def md2html(t): return re.sub(r'`([^`]+)`', r'\1', t).replace('**', '')
def flat(t): return re.sub(r'\s+', ' ', t).strip()

# ---------- lectura del .md
md = open(A.md, encoding='utf-8').read()

def seccion(titulo):
    m = re.search(r'^## ' + titulo + r'[^\n]*\n(.*?)(?=^## |\Z)', md, re.S | re.M)
    return m.group(1) if m else ''

# calendario: filas de la tabla, sin cabecera ni separador
cal = []
for l in seccion('Calendario').splitlines():
    if l.startswith('|') and not re.match(r'^\|[-| ]+\|$', l) and 'Semana' not in l.split('|')[1]:
        cal.append(tuple(c.strip() for c in l.strip().strip('|').split('|')))

# reglas: "1. **Título** texto"
reglas = [(flat(m.group(1)), flat(md2html(m.group(2))))
          for m in re.finditer(r'^\d+\.\s+\*\*(.+?)\*\*\s*(.*?)(?=^\d+\.\s+\*\*|\Z)', seccion('Reglas de grabaci'), re.S | re.M)]

# fichas
fichas = []
for m in re.finditer(r'^### (\d+) · (.+?)\n(.*?)(?=^### |^## |\Z)', md, re.S | re.M):
    num, titulo, cuerpo = m.group(1), m.group(2).strip(), m.group(3)
    def campo(nombre):
        mm = re.search(r'^- \*\*' + nombre + r'[^*]*\*\*\s*(.*?)(?=^- \*\*|\Z)', cuerpo, re.S | re.M)
        return mm.group(1).strip() if mm else ''
    def items(txt):
        return [flat(x) for x in re.findall(r'^\s*(?:\d+\.|-)\s+(.*?)(?=^\s*(?:\d+\.|-)\s|\Z)', txt, re.S | re.M)]
    planos = items(campo('Planos')) or ([flat(campo('Montaje'))] if campo('Montaje') else [])
    titulos = [t.strip() for t in flat(campo('Títulos')).split(' · ') if t.strip()]
    producto = campo('Prendas') or campo('Producto') or campo('Material') or campo('Servicio')
    fichas.append(dict(num=num, titulo=titulo.replace(' — ', ' · '),
        objetivo=flat(campo('Objetivo')), producto=re.sub(r'\s*\([^()]*\d[^()]*\)', '', flat(producto)),
        lugar=flat(campo('Lugar y luz')), planos=planos, pantalla=flat(campo('Texto en pantalla')),
        textos=items(campo('Texto del anuncio')), titulos=titulos, destino=flat(campo('Destino')), nota=flat(campo('Nota'))))
assert 1 <= len(fichas) <= 10, f'{len(fichas)} fichas'

N = 2 + len(fichas)
pages = []

# 1 · portada
body = (f'<div style="display: flex; flex-direction: column; gap: 14px; margin-top: 36px;">{label(PARA)}'
 f'<h1 style="margin: 0; font-family: {SERIF}; font-size: 68px; font-weight: 300; line-height: 0.96; letter-spacing: -0.01em;">Plan de<br>contenido</h1>'
 f'<p style="margin: 0; font-family: {SERIF}; font-style: italic; font-size: 24px; line-height: 1.3; color: #3E3833; max-width: 580px;">{len(fichas)} anuncios, las reglas para grabarlos y el calendario.</p></div>'
 + bloque(26, p(A.intro, ' font-size: 14.5px; line-height: 1.65; max-width: 600px;'))
 + bloque(26, col([label('Calendario'), f'<div style="display: flex; flex-direction: column; border-top: 1px solid {TINTA};">' + ''.join(
     f'<div style="display: grid; grid-template-columns: 110px minmax(0, 1fr) 80px; gap: 14px; padding: 8px 0; border-bottom: 1px solid #CFC6B8; font-size: 13px; line-height: 1.5;"><span style="font-weight: 500;">{a}</span><span>{md2html(b)}</span><span style="color: #6B6258;">{c}</span></div>' for a, b, c in cal) + '</div>'], 10))
 + bloque(22, grid([col([label('Grabas tú'), lista(['El bruto de cada anuncio, con el móvil, siguiendo la ficha.', 'Lo subes a una carpeta de Drive por anuncio.', 'Publicas los reels en tu feed con el texto que te damos.'])], 8),
                    col([label('Montamos nosotros'), lista(['Los anuncios: cortes, texto en pantalla, música, formatos.', 'Vídeos a partir de las fotos que ya tienes.', 'Textos, títulos y la revisión semanal.'])], 8)], gap=32))
 + bloque(18, p('<span style="color: #6B6258;">Fuera del plan:</span> sesión con fotógrafo, reels largos editados para el feed y retoque de imagen. Si los quieres, lo presupuestamos aparte.', ' font-size: 12.5px; color: #3E3833;'))
)
pages.append(('Main.dc.html', '1 · Portada y calendario', 'Portada', body))

# 2 · reglas
body = (f'<div style="display: flex; flex-direction: column; gap: 14px; margin-top: 40px;">{label("01 · Cómo grabar")}{h2("Reglas para grabar con el móvil")}'
 + lead('Con esto el bruto sale bien a la primera y no hay que repetir.') + '</div>'
 + bloque(24, filas(reglas, '150px', 13.5))
 + bloque(24, banda('Lo que hemos visto en tus publicaciones', A.funciona, 19))
)
pages.append(('Reglas.dc.html', '2 · Cómo grabar', 'Cómo grabar', body))

# fichas
for i, f in enumerate(fichas):
    planos_html = col([f'<div style="display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 6px; font-size: 14px; line-height: 1.5;"><span style="font-family: {SERIF}; font-size: 18px; color: #6B6258;">{k+1}</span><span>{md2html(t)}</span></div>' for k, t in enumerate(f['planos'])], 9)
    textos_html = col([f'<div style="font-size: 13.5px; line-height: 1.5; color: #3E3833; padding-left: 12px; border-left: 2px solid #CFC6B8;">{md2html(t)}</div>' for t in f['textos']], 10)
    tit_html = '<div style="display: flex; flex-wrap: wrap; gap: 6px;">' + ''.join(f'<span style="font-size: 13px; padding: 5px 12px; border: 1px solid #CFC6B8; border-radius: 999px;">{t}</span>' for t in f['titulos']) + '</div>'
    filas_ficha = [('Producto', md2html(f['producto'])), ('Lugar y luz', md2html(f['lugar'])), ('Texto en pantalla', md2html(f['pantalla'])), ('Destino', md2html(f['destino']))]
    if f['nota']: filas_ficha.append(('Nota', md2html(f['nota'])))
    body = (f'<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 40px;">{label("Ficha " + f["num"] + " de " + str(len(fichas)))}{h2(f["titulo"])}'
      + lead(md2html(f['objetivo'])) + '</div>'
      + bloque(18, filas([r for r in filas_ficha if r[1]], '140px', 13.5))
      + bloque(26, grid([col([label('Planos' if len(f['planos']) > 1 else 'Montaje'), planos_html], 10),
                         col([label('Texto del anuncio (3 variantes)'), textos_html, label('Títulos del enlace (se rotan)'), tit_html], 12)], gap=28))
    )
    pages.append((f'Ficha{f["num"]}.dc.html', f'{i+3} · Ficha {f["num"]}', f'Ficha {f["num"]}', body))

canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')},
          "title": "Plan de contenido " + MARCA, "launch": {"view": "canvas"}, "pages": [], "boards": {}, "order": [], "notes": {}, "designSystems": []}
for i, (fn, title, sec, body) in enumerate(pages):
    open(os.path.join(OUT, fn), 'w', encoding='utf-8').write(page(title.split(' · ', 1)[1], i + 1, N, 'Plan de contenido · ' + sec, body))
    canvas["boards"][fn] = {"x": (i % 5) * 874, "y": (i // 5) * 1243, "w": 794, "h": 1123, "title": title}
    canvas["order"].append(fn)
json.dump(canvas, open(os.path.join(OUT, 'canvas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(pages), 'páginas en', OUT)
