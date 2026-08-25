# Stock devuelto al inicial · 23/8

`MURA_stock_por_pieza.xlsx` (de German, sacado de las fichas técnicas del
Drive) es el stock inicial de la tienda. Se dejó la tienda igual que la hoja.

## Qué se hizo

14 variantes corregidas, +19 unidades. La tienda quedó en **242 unidades**,
las mismas que la hoja, verificado releyendo las 87 variantes.

- `inventario_antes.json` — las 87 variantes antes de tocar nada (223 uds).
- `inventario_despues.json` — después (242 uds).
- `../fix_stock.py` — el script. Modo seco por defecto, `--aplicar` para escribir.

## Dónde vive el stock en la API

**No** en `/products/inventory`: esa ruta no existe para escribir, y el 422 que
devuelve —`"Invalid productId: inventory"`— engaña, porque la API está leyendo
la palabra "inventory" como un id de producto. El stock es un campo del precio
de cada variante:

    GET /products/{productId}/price/{priceId}?locationId=…
    PUT /products/{productId}/price/{priceId}

El PUT quiere el precio entero (`name`, `type`, `currency`, `amount`), no solo
la cantidad: mandar únicamente `availableQuantity` borraría el resto. Probado
antes de escribir nada con un PUT que reponía el mismo valor.

## De dónde salían las diferencias

18 pedidos de prueba, 18 unidades, todos de correos del equipo. Trece de las
catorce variantes cuadraban al céntimo con lo vendido. La que no:

  **Blazer Gris Arquitectónica · Única** — hoja 6, tienda 4, vendida 1.
  Falta una unidad que ningún pedido explica. Se repuso a 6 siguiendo la hoja,
  pero conviene que German lo mire.

## Dos cabos sueltos

- **`Chalequillo Traje Blanco`** está en la hoja y **no existe** como producto
  en la tienda. No es stock 0: no está creado.
- **`Camisa Oliva (Drapeo)`** en la hoja se llama **`Camisa Oliva`** en la
  tienda. El stock coincide; solo baila el nombre.

## Los pedidos de prueba no se pueden borrar

No hay ruta de borrado ni en la API pública ni en la interna (`DELETE
/payments/orders/{id}` y variantes → "Cannot DELETE", ruta inexistente). Son
registros de pago. Da igual: los 18 están marcados `liveMode: false`, así que
no cuentan como ventas reales.

Lo que sí ensucia son las **6 oportunidades de prueba** del pipeline
Ventas/Pedidos, que se ven siempre. Esas sí se pueden borrar por API —
pendiente de que German lo confirme.
