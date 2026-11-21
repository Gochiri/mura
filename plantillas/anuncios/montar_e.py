#!/usr/bin/env python3
"""Montaje del anuncio E · «Fiesta, así llega» (pedido del conjunto Animal Verde).

Uso: python3 montar_e.py <carpeta_planos> <carpeta_fuentes> <carpeta_salida>
  - carpeta_planos: los brutos de Sara ya pasados a 1080x1920 sin audio (C0616.mp4…).
  - carpeta_fuentes: Cormorant.ttf y Jost400.ttf.
Genera E_9x16.mp4 y E_4x5.mp4, sin música (se mezcla aparte).
"""
import subprocess, sys, os
PX, FU, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
# (plano, inicio en s, duración en s)
CORTES = [
    ("C0619", 1.3, 2.0),   # las manos doblan el conjunto (antes de 1,3 s sale movido)
    ("C0620", 0.8, 2.0),   # top y pantalón, se coloca la etiqueta
    ("C0616", 2.6, 2.0),   # perfume
    ("C0621", 1.0, 2.2),   # papel de seda
    ("C0622", 2.6, 1.8),   # pegatina
    ("C0622", 42.6, 2.0),  # tarjeta MÛRA
    ("C0623", 6.0, 2.2),   # a la bolsa
    ("C0627", 0.6, 2.6),   # la bolsa en la mano
]
FINAL = 2.6  # tarjeta final
# (texto, desde, hasta) sobre la línea de tiempo
t = [0]
for _, _, d in CORTES: t.append(t[-1] + d)
TEXTOS = [
    ("Así llega tu pedido de fiesta", t[0] + 0.2, t[2] - 0.15),
    ("Preparado a mano, pieza a pieza", t[2] + 0.15, t[5] - 0.15),
    ("Envío en 24/48 h · Gratis desde 99 €", t[5] + 0.15, t[7] - 0.15)  # la bolsa final va limpia, sin texto encima del logo,
]
TINTA, CREMA = "0x1E1B1A", "0xF6F2EB"

def montar(nombre, w, h, ytexto):
    ins, filt = [], []
    for i, (p, s, d) in enumerate(CORTES):
        ins += ["-ss", str(s), "-t", str(d), "-i", f"{PX}/{p}.mp4"]
        f = 1.0 if p == "C0627" else 0.55  # en la bolsa, el logo queda abajo
        recorte = f"crop={w}:{h}:(iw-{w})/2:(ih-{h})*{f}," if h < 1920 else ""
        filt.append(f"[{i}:v]{recorte}eq=gamma=1.08:contrast=1.03,setsar=1,fps=25,format=yuv420p[v{i}]")
    n = len(CORTES)
    ins += ["-f", "lavfi", "-t", str(FINAL), "-i", f"color=c={CREMA}:s={w}x{h}:r=25"]
    filt.append(
        f"[{n}:v]drawtext=fontfile={FU}/Cormorant.ttf:text='M Û R A':fontsize=110:fontcolor={TINTA}:x=(w-text_w)/2:y=h*0.40,"
        f"drawtext=fontfile={FU}/Jost400.ttf:text='COLECCIÓN DE FIESTA':fontsize=42:fontcolor={TINTA}:x=(w-text_w)/2:y=h*0.40+180,"
        f"drawtext=fontfile={FU}/Jost400.ttf:text='stylebymura.com':fontsize=46:fontcolor={TINTA}:x=(w-text_w)/2:y=h*0.40+280,"
        f"format=yuv420p,setsar=1[v{n}]")
    filt.append("".join(f"[v{i}]" for i in range(n + 1)) + f"concat=n={n+1}:v=1:a=0[c]")
    dt = []
    for txt, a, b in TEXTOS:
        txt = txt.replace(":", r"\:")
        dt.append(f"drawtext=fontfile={FU}/Cormorant.ttf:text='{txt}':fontsize=62:fontcolor=white:"
                  f"box=1:boxcolor={TINTA}@0.62:boxborderw=26:x=(w-text_w)/2:y={ytexto}:"
                  f"enable='between(t,{a:.2f},{b:.2f})'")
    filt.append("[c]" + ",".join(dt) + "[o]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", ";".join(filt),
                    "-map", "[o]", "-an", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                    "-movflags", "+faststart", f"{OUT}/{nombre}.mp4"], check=True)

montar("E_9x16", 1080, 1920, 1190)
montar("E_4x5", 1080, 1350, 1130)
print("duración", t[-1] + FINAL)
