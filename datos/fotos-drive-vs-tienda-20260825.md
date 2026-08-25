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

Es `IMG_4097.jpg` (`1KLj62MyHun0duoUy6f-b-58FCQGuHUxE`), subida a Drive el **13/7**,
después de cargar la tienda. **Comprobada abriéndola:** es la foto del conjunto
—camisa negra de encaje con cuello de perlas y pantalón de encaje transparente—,
archivada una vez en la carpeta de cada prenda. Está donde debe. Solo hay que
subirla al producto.

⚠️ **Corrección de una hipótesis mía.** Al ver cuatro archivos llamados
`IMG_4097.jpg` del mismo día en cuatro carpetas distintas, di por hecho que eran
una tanda mal colocada y que al pantalón no le faltaba nada. **Falso:** las dos
de la camisa y el pantalón son la misma toma del conjunto, bien archivada. La
coincidencia de nombre venía de exportarlas del mismo carrete, no de un error.
Las únicas mal colocadas son las dos del body (ver abajo).

## Cuatro piezas sin carpeta `Fotos web`

| Pieza (Drive) | Producto | Fotos en la tienda |
|---|---|---|
| Body negro encaje | Body Lencero Essential — Negro | **1** |
| Pantalón print vaquero ballon | Pantalón Print | 2 |
| Top print vaquero | Top Peplum Print | 2 |
| Chalequillo blanco | *(no existe)* | — |

Las tres primeras están publicadas con una o dos fotos y **no hay de dónde sacar
más**: su carpeta de Drive no tiene `Fotos web`. Sus fotos actuales salieron de
otro sitio. Con una sola foto, el Body Lencero Negro es el más flojo de la tienda.

**Y en la carpeta del body hay dos fotos que no son suyas.** No tiene subcarpeta:
dentro están sueltos una foto del body (16/6, la que está publicada), la ficha
técnica, y **dos `IMG_4097.jpg` del 13/7 que son de una blazer gris** —
comprobado en pantalla. Esas dos no pintan nada ahí; si son de la *Blazer Gris
Arquitectónica*, son dos fotos más disponibles para ella, que hoy tiene 4:

- `1EWePFlxL0Kf9AYJc84PsiSqAjySkjSTr` · 1.485.493 b · 13/7 14:19
- `1R7Dyv5aBtLWiEq7wttoI_K615yWYZNwc` · 1.622.300 b · 13/7 14:20

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
