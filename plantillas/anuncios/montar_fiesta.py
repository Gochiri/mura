#!/usr/bin/env python3
"""Montaje de los anuncios B2 (detalle de fiesta), F (fiesta de noche) y G (Black Friday).

Uso: python3 montar_fiesta.py <planos> <fotos> <fuentes> <salida> [B2 F G]
  - planos: brutos de Sara pasados a 1080x1920 sin audio (C0343.mp4, IMG_0368.mp4…).
  - fotos:  fotos de la carpeta de Drive, con el nombre empezando por los 8 primeros
            caracteres de su id (1STMc7ss.jpeg…).
  - fuentes: Cormorant.ttf, CormorantIt.ttf, Jost400.ttf, Jost600.ttf.
Cada anuncio sale en 9x16 y 4x5, sin música (se mezcla aparte).

El movimiento se calcula en Python fotograma a fotograma (transformación afín con
precisión de subpíxel), para que los acercamientos lentos no tiemblen.
"""
import glob, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

PX, FO, FU, OUT = sys.argv[1:5]
QUE = sys.argv[5:] or ["B2", "F", "G"]
FPS = 25
TINTA, CREMA = (30, 27, 26), (246, 242, 235)
os.makedirs(OUT, exist_ok=True)


def suave(x):  # entra y sale despacio
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def golpe(x):  # llega rápido y se queda quieto: para el Black Friday
    x = min(max(x / 0.35, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def V(nombre, t0, dur, z=(1.0, 1.08), c=((.5, .5), (.5, .5)), ease=suave, tr=("fade", 0.0)):
    return dict(tipo="video", src=f"{PX}/{nombre}.mp4", t0=t0, dur=dur, z=z, c=c, ease=ease, tr=tr)


def F_(prefijo, dur, z=(1.0, 1.1), c=((.5, .5), (.5, .5)), rot=0, ease=suave, tr=("fade", 0.0)):
    src = glob.glob(f"{FO}/{prefijo}*")[0]
    return dict(tipo="foto", src=src, dur=dur, z=z, c=c, rot=rot, ease=ease, tr=tr)


def TARJ(lineas, fondo, tinta, dur, tr=("fade", 0.0), tam=None):
    return dict(tipo="tarjeta", lineas=lineas, tam=tam, fondo=fondo, tinta=tinta, dur=dur,
                z=(1.0, 1.03), c=((.5, .5), (.5, .5)), ease=suave, tr=tr)


# ---------------------------------------------------------------- anuncios
# tr = transición de ENTRADA a ese plano: (tipo de xfade, duración en s)
ANUNCIOS = {
    # B2 · sensorial y pausado: planos largos, fundidos de medio segundo, acercamientos lentos
    "B2": dict(
        planos=[
            V("C0343", 0.0, 1.8, z=(1.0, 1.08)),                                  # bordado de cerca (a 2,3 s entra un brazo movido)
            F_("1BkZbqB_", 2.7, z=(1.04, 1.16), c=((.5, .55), (.5, .45)), tr=("fade", .5)),  # mano sobre lentejuelas
            V("C0632", 2.0, 2.8, z=(1.10, 1.0), tr=("fade", .5)),                 # flecos de lentejuelas
            F_("1Invnp4N", 2.6, z=(1.0, 1.14), c=((.5, .40), (.5, .33)), tr=("fade", .5)),   # cuello de abalorios
            V("C0343", 3.6, 2.5, z=(1.10, 1.0), tr=("fade", .5)),                 # el bordado a contraluz
            F_("1N9GpWSo", 2.5, z=(1.0, 1.08), c=((.5, .38), (.5, .34)), tr=("fade", .5)),   # el cuello puesto
            V("C0635", 2.6, 3.2, z=(1.0, 1.06), tr=("fade", .5)),                 # la blusa sale de la bolsa
            TARJ(["M Û R A", "COLECCIÓN DE FIESTA", "stylebymura.com"], CREMA, TINTA, 2.8, tr=("fade", .7)),
        ],
        textos=[("Mírala de cerca", 0.3, 4.1), ("Lentejuelas, encaje y abalorios", 4.7, 11.7),
                ("Colección de fiesta MÛRA", 12.2, 17.5)],
        estilo=dict(fuente="CormorantIt.ttf", cuerpo=72, caja=0.42),
        color="eq=contrast=1.04:gamma=1.04",
    ),
    # F · fiesta de noche, v2 (22/11): 19 fotos en tres actos con cortes secos y zoom alterno.
    #   1) el pasillo de noche  2) los detalles, muy rápidos  3) los dos looks sobre pared clara
    #   y cierre con el plano de las mangas, que se queda más rato.
    "F": dict(
        planos=[
            F_("1STMc7ss", 1.5, z=(1.0, 1.10), c=((.5, .58), (.5, .48))),        # viene por el pasillo
            F_("18eyYtEr", 1.1, z=(1.10, 1.0), c=((.52, .42), (.5, .50))),
            F_("1Zv_wGr8", 1.1, z=(1.0, 1.10), rot=90),
            F_("1DAY28kp", 1.1, z=(1.10, 1.0), c=((.5, .30), (.5, .42))),       # brazo en la pared
            F_("1GL-FKvr", 1.0, z=(1.0, 1.12), c=((.5, .42), (.5, .32))),
            F_("1pBXw1t2", 1.0, z=(1.10, 1.0)),
            F_("1Invnp4N", 0.8, z=(1.0, 1.10), c=((.5, .40), (.5, .34)), tr=("fadewhite", .1)),  # cuello en percha
            F_("1BkZbqB_", 0.8, z=(1.10, 1.0)),                                    # lentejuelas
            F_("1N9GpWSo", 0.9, z=(1.0, 1.10), c=((.5, .36), (.5, .32))),        # el cuello puesto
            F_("1jTDJCvs", 0.7, z=(1.15, 1.0)),                                    # abalorios sueltos
            F_("1IZ5cKru", 1.0, z=(1.0, 1.08), tr=("fadewhite", .1)),             # blazer y flecos, andando
            F_("1Gj5PvAT", 0.9, z=(1.08, 1.0), c=((.5, .45), (.5, .5))),
            F_("1uAsIJMU", 1.1, z=(1.0, 1.10), c=((.5, .50), (.5, .40))),        # gira con la blazer
            F_("1oOXivhX", 0.9, z=(1.10, 1.0), c=((.5, .40), (.5, .50))),
            F_("1ST0tgGw", 0.9, z=(1.0, 1.08)),
            F_("12pOiMbP", 1.0, z=(1.0, 1.08), rot=-90),                          # encaje sobre pared clara
            F_("1iMCT7tb", 1.0, z=(1.08, 1.0)),
            F_("1zif9vnC", 0.9, z=(1.0, 1.08)),
            F_("10emf1mR", 2.3, z=(1.0, 1.16), c=((.5, .45), (.5, .36)), tr=("fade", .3)),  # abre las mangas
            TARJ(["M Û R A", "COLECCIÓN DE FIESTA", "stylebymura.com"], CREMA, TINTA, 2.5, tr=("fade", .5)),
        ],
        textos=[("Diciembre pide brillo", 0.2, 6.6), ("Encaje, lentejuelas y abalorios", 6.9, 10.0),
                ("Dos looks para tus noches", 10.2, 16.0), ("Colección de fiesta MÛRA", 16.4, 19.9)],
        estilo=dict(fuente="Cormorant.ttf", cuerpo=72, caja=0.42),
        color="colorbalance=rs=.03:bs=-.03:rm=.02:bm=-.02,eq=contrast=1.04:saturation=1.03",
    ),
    # G · energía: cortes cortos, golpes de zoom, destellos en blanco, tarjeta final en negro
    "G": dict(
        planos=[
            V("IMG_0368", 0.2, 0.9, z=(1.25, 1.0), ease=golpe),
            V("IMG_0373", 6.0, 0.8, z=(1.2, 1.0), ease=golpe, tr=("fadewhite", .12)),  # coloca un cartel
            V("IMG_0368", 3.2, 1.1, z=(1.0, 1.08), tr=("fadewhite", .12)),       # la mano deja el 20 %
            V("IMG_0373", 7.3, 1.0, z=(1.18, 1.0), ease=golpe, tr=("fadewhite", .12)),  # levanta el cartel
            V("IMG_0368", 6.0, 1.4, z=(1.0, 1.45), c=((.5, .5), (.42, .37)), tr=("fadewhite", .12)),  # al 20 %
            V("IMG_0373", 8.4, 1.6, z=(1.0, 1.05), tr=("fadewhite", .12)),
            TARJ(["M Û R A", "BLACK FRIDAY · 20 %", "CÓDIGO BLACK20", "stylebymura.com"],
                 TINTA, CREMA, 2.8, tr=("fadewhite", .15),
                 tam=[("Cormorant.ttf", 120, 160), ("Jost600.ttf", 66, 100), ("Jost600.ttf", 54, 100), ("Jost400.ttf", 44, 70)]),
        ],
        textos=[("DEL 27 AL 30 DE NOVIEMBRE", 0.1, 2.7), ("20 % EN TODA LA WEB", 2.9, 5.1),
                ("CÓDIGO BLACK20", 5.3, 6.7)],
        estilo=dict(fuente="Jost600.ttf", cuerpo=64, caja=0.88),
        color="eq=contrast=1.08",
    ),
}


# ---------------------------------------------------------------- motor
def encuadre(img, W, H, z, cx, cy):
    sw, sh = img.size
    s = max(W / sw, H / sh) * z
    hw, hh = W / (2 * s), H / (2 * s)
    x = min(max(cx * sw, hw), sw - hw)
    y = min(max(cy * sh, hh), sh - hh)
    return img.transform((W, H), Image.AFFINE, (1 / s, 0, x - hw, 0, 1 / s, y - hh), resample=Image.BICUBIC)


def tarjeta(p, W, H):
    im = Image.new("RGB", (W, H), p["fondo"])
    d = ImageDraw.Draw(im)
    # tam: (fuente, cuerpo, interlínea) por línea; por defecto, marca grande y lo demás en Jost
    tam = p["tam"] or [("Cormorant.ttf", 120, 150)] + [("Jost400.ttf", 46, 80)] * (len(p["lineas"]) - 1)
    fuentes = [ImageFont.truetype(f"{FU}/{f}", c) for f, c, _ in tam]
    alturas = [a for _, _, a in tam]
    y = H * 0.5 - sum(alturas) / 2
    for txt, f, a in zip(p["lineas"], fuentes, alturas):
        w = d.textlength(txt, font=f)
        d.text(((W - w) / 2, y), txt, font=f, fill=p["tinta"])
        y += a
    return im


def segmento(p, W, H, extra, ruta, color):
    # un fotograma de margen: si el plano se queda corto, xfade corta el vídeo ahí
    n = math.ceil((p["dur"] + extra) * FPS) + 1
    enc = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            *([] if p["tipo"] == "tarjeta" else ["-vf", color]), "-c:v", "libx264", "-crf", "16",
                            "-preset", "fast", "-pix_fmt", "yuv420p", ruta], stdin=subprocess.PIPE)
    if p["tipo"] == "video":
        dec = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-ss", str(p["t0"]), "-i", p["src"],
                                "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                               stdout=subprocess.PIPE)
        fija, ultimo = None, None
    else:
        if p["tipo"] == "foto":
            fija = ImageOps.exif_transpose(Image.open(p["src"])).convert("RGB")
            if p["rot"]:
                fija = fija.rotate(p["rot"], expand=True)
        else:
            fija = tarjeta(p, W, H)
    tot = p["dur"] * FPS
    for i in range(n):
        if p["tipo"] == "video":
            buf = dec.stdout.read(1080 * 1920 * 3)
            if len(buf) == 1080 * 1920 * 3:
                ultimo = Image.frombytes("RGB", (1080, 1920), buf)
            src = ultimo
        else:
            src = fija
        k = p["ease"](i / tot)
        z = p["z"][0] + (p["z"][1] - p["z"][0]) * k
        (x0, y0), (x1, y1) = p["c"]
        enc.stdin.write(encuadre(src, W, H, z, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k).tobytes())
    enc.stdin.close(); enc.wait()
    if p["tipo"] == "video":
        dec.stdout.close(); dec.wait()


def montar(nombre, cfg, W, H, ytexto, sufijo):
    pl = cfg["planos"]
    segs = []
    for i, p in enumerate(pl):
        extra = (pl[i + 1]["tr"][1] or 0.04) if i + 1 < len(pl) else 0  # el corte también solapa un fotograma
        ruta = f"{OUT}/_{nombre}_{sufijo}_{i}.mp4"
        segmento(p, W, H, extra, ruta, cfg["color"])
        segs.append(ruta)
    ins = sum((["-i", s] for s in segs), [])
    f, previo, t = [], "[0:v]", 0.0
    for i in range(1, len(pl)):
        t += pl[i - 1]["dur"]
        tipo, d = pl[i]["tr"]
        d = d or 0.04  # un fotograma: en la práctica, un corte
        f.append(f"{previo}[{i}:v]xfade=transition={tipo}:duration={d}:offset={t:.3f}[x{i}]")
        previo = f"[x{i}]"
    e = cfg["estilo"]
    dt = []
    for txt, a, b in cfg["textos"]:
        txt = txt.replace(":", r"\:").replace("'", "’")
        base = (f"drawtext=expansion=none:fontfile={FU}/{e['fuente']}:text='{txt}':fontsize={e['cuerpo']}:"
                f"x=(w-text_w)/2:y={ytexto}:enable='between(t,{a:.2f},{b:.2f})'")
        if e["caja"]:  # opacidad de la banda detrás del texto
            dt.append(base + f":fontcolor=white:box=1:boxcolor=0x1E1B1A@{e['caja']}:boxborderw=28")
        else:
            dt.append(base + ":fontcolor=white:shadowcolor=black@0.55:shadowx=0:shadowy=3")
    f.append(f"{previo}{','.join(dt)},format=yuv420p[o]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", ";".join(f),
                    "-map", "[o]", "-an", "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                    "-movflags", "+faststart", f"{OUT}/{nombre}_{sufijo}.mp4"], check=True)
    if not os.environ.get('GUARDAR'):
        for s in segs:
            os.remove(s)
    print(nombre, sufijo, "duración", round(sum(p["dur"] for p in pl), 2))


for n in QUE:
    montar(n, ANUNCIOS[n], 1080, 1920, 1180, "9x16")
    montar(n, ANUNCIOS[n], 1080, 1350, 1000, "4x5")
