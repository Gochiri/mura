# Fotos: Drive vs tienda · 25/8

Comparadas las fotos de cada pieza en Drive
(`1LnzyjagwsFgl-cwVn3QL3Lv1kbln1lbz`) con las imágenes de cada producto en GHL.
El puente entre los dos nombres es la columna «Pieza (carpeta Drive)» → «Nombre
web» de `MURA_stock_por_pieza.xlsx`: los nombres no coinciden solos.

**37 piezas · 130 fotos en Drive · 125 en la tienda.**

⚠️ **Las fotos no siempre están en `Fotos web`.** 33 piezas tienen esa subcarpeta;
las otras 4 guardan las fotos **sueltas en la carpeta de la pieza**, junto a la
ficha técnica. La primera versión de este informe solo miró dentro de `Fotos web`
y dio por hecho que esas cuatro no tenían material. Falso: tres de ellas lo
tienen, y una está completa en la tienda.

## Lo que falta subir

| Pieza | Drive | Tienda | |
|---|---|---|---|
| Body Lencero Essential — Negro | 3 | 1 | **faltan 2** |
| Pantalón Encaje Eclipse | 4 | 3 | **falta 1** |

**Body Lencero Essential — Negro** (`1HC_ZLx3wE4sLMGHd-JnL_oErpxKU2iZx`, sueltas):
la foto de producto del 16/6 —la única publicada— y dos del 13/7 donde el body se
lleva con una blazer gris por encima. **Son del body**: la blazer solo decora.

- `1EWePFlxL0Kf9AYJc84PsiSqAjySkjSTr` · 13/7 14:19
- `1R7Dyv5aBtLWiEq7wttoI_K615yWYZNwc` · 13/7 14:20

**Pantalón Encaje Eclipse**: falta `IMG_4097.jpg`
(`1KLj62MyHun0duoUy6f-b-58FCQGuHUxE`, 13/7). Es la foto del conjunto —camisa
negra de encaje con cuello de perlas y pantalón de encaje—, archivada una vez en
la carpeta de cada prenda. La camisa ya la tiene publicada; el pantalón no.

## Chalequillo Traje Blanco: hay fotos, falta el producto

Tiene **3 fotos sueltas** en su carpeta (`1798Y3o0PKS5voxEHM4gamAMsAed_FqDO`) y
sigue **sin existir como producto** en la tienda. Es la única pieza de la hoja de
stock que hoy no se puede vender, y no es por falta de material.

`IMG_6528.jpg` · `IMG_6697.jpg` · `IMG_6612.jpg`

## Lo que está bien y parecía que no

- **Pantalón Print** y **Top Peplum Print**: 2 fotos sueltas cada uno en Drive y
  las 2 publicadas. Completos. Son pocas fotos, pero no falta ninguna.
- **Camisa Abeja Joya Azul Marino**: 5 en la tienda y 4 en Drive. Una de más.
- **Camisa Oliva**: la hoja la llama *Camisa Oliva (Drapeo)*; las fotos cuadran.
- Las otras 28 piezas cuadran exactamente.

## Dos lecciones del recuento

**Un nombre repetido no significa un archivo mal colocado.** Cuatro archivos
`IMG_4097.jpg` del mismo día en cuatro carpetas distintas parecían una tanda mal
subida. No lo eran: son fotos de conjunto, y cada una se archiva en la carpeta de
cada prenda que aparece. La coincidencia venía de exportarlas del mismo carrete.

**Y una foto de catálogo puede llevar prendas que no se venden ahí.** Las dos del
body llevan una blazer gris encima; leídas de lejos parecen de la blazer.

## Cómo se contó

Archivos `image/*` dentro de `Fotos web` **y** sueltos en la carpeta de cada
pieza. En la tienda, las `medias` de tipo imagen de cada producto, leídas una a
una con `GET /products/{id}`.
