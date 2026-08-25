# Fotos: Drive vs tienda · 25/8

Comparadas las carpetas `Fotos web` de cada pieza en Drive
(`1LnzyjagwsFgl-cwVn3QL3Lv1kbln1lbz`) con las imágenes de cada producto en
GHL. El puente entre los dos nombres es la columna «Pieza (carpeta Drive)» →
«Nombre web» de `MURA_stock_por_pieza.xlsx`: los nombres no coinciden solos.

**37 carpetas de pieza · 33 con `Fotos web` · 120 fotos en Drive · 125 en la tienda.**
De las 33 emparejadas, **29 cuadran exactamente**.

## Lo que falta

| Pieza | Drive | Tienda | |
|---|---|---|---|
| Pantalón Encaje Eclipse | 4 | 3 | **falta 1** |

La que falta es con toda probabilidad `IMG_4097.jpg`, subida a Drive el **13/7**,
después de que se cargara la tienda. En la carpeta de *Camisa negra encaje collar
perla* hay otro archivo con **el mismo nombre y distinto tamaño**, también del
13/7 — conviene mirar los dos, no vaya a ser que uno esté en la carpeta
equivocada.

## Cuatro piezas sin carpeta `Fotos web`

| Pieza (Drive) | Producto | Fotos en la tienda |
|---|---|---|
| Body negro encaje | Body Lencero Essential — Negro | **1** |
| Pantalón print vaquero ballon | Pantalón Print | 2 |
| Top print vaquero | Top Peplum Print | 2 |
| Chalequillo blanco | *(no existe)* | — |

Las tres primeras están publicadas con una o dos fotos y **no hay de dónde sacar
más**: su carpeta de Drive no tiene `Fotos web` (las dos primeras solo tienen
`Ficha técnica`, y *Top print vaquero* no tiene ninguna subcarpeta). Sus fotos
actuales salieron de otro sitio. Con una sola foto, el Body Lencero Negro es el
más flojo de la tienda.

**Chalequillo Traje Blanco** sigue sin existir como producto, y tampoco tiene
fotos web. Es la única pieza de la hoja de stock que hoy no se puede vender.

## Dos avisos menores

- **Camisa Abeja Joya Azul Marino**: 5 fotos en la tienda y 4 en Drive. Una de
  más, no es un problema.
- **Camisa Oliva**: la hoja la llama *Camisa Oliva (Drapeo)* y la tienda
  *Camisa Oliva*. Las fotos cuadran (3 y 3); solo baila el nombre.

## Cómo se contó

Solo archivos `image/*` **directamente dentro** de `Fotos web` — sin entrar en
subcarpetas ni contar PDFs. En la tienda, las `medias` de tipo imagen de cada
producto, leídas una a una por `GET /products/{id}`.
