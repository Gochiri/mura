# Reunión con Sara · 19/11/2026

*Meet de 44 min. Asisten Sara, German, Henry y Oliver. Grabación en Fathom (cuenta de German).
Documento que se le envió antes: `docs/entregables/2026-11-18-primera-semana-campana.pdf`.*

## Lo que Sara dio por bueno

- Los cambios de la web: la barra fija «Tu selección», el envío a la vista en el carrito y la galería de la ficha.
- El segundo correo de carrito abandonado (24 h): lo ha visto.
- Quiere recibir los informes cuando traigan un cambio sugerido, no los que solo informan.

## Black Friday — acordado

| Tema | Acuerdo |
|---|---|
| Para qué | Rotar stock y tener liquidez. |
| Días | Viernes 27 a lunes 30/11 (el domingo se anuncia que sigue el lunes, «Cyber Monday»). Newsletter desde el jueves 26. |
| Descuento | Por cupón. Idea de Sara: **20 %** a las prendas de más verano, **15 %** al resto y **sin descuento** el bolso de piel y 4–5 novedades. |
| 10 % de bienvenida | No se acumula. Hay que decirlo. |
| Web | Durante esos días, la ventana de la newsletter se cambia por una con el código de Black Friday. Lo hace Profit, no Sonia. |
| Campaña | Misma campaña y mismo conjunto. Sigue «Así llega tu pedido»; se pausa «Looks de calle»; entran 2 anuncios de fiestas el martes 24. |
| Presupuesto | Subirlo solo esos días, dentro de los 800 € del primer mes (iban 196 €). Sara lo aceptó de palabra; falta confirmarlo por escrito con la cifra. |
| Material | Sara graba el 20/11 (fiesta y empaquetado) y lo sube antes del sábado 22. |
| Stock | Mínimo 5 unidades de cada pieza que se anuncie. |

## Black Friday — abierto

- **La lista de prendas por tramo** (20 %, 15 %, sin descuento). La tiene que dar Sara.
- **Dos descuentos distintos en un mismo carrito.** Henry explicó que el cupón se limita a las prendas que se elijan.
  Queda por comprobar en modo test si el checkout de GHL admite dos cupones en un pedido; si solo admite uno, un
  carrito con prendas de los dos tramos no recibe los dos descuentos y hay que resolverlo de otra forma.
- **Dónde se enseña el código:** ventana de la web (sí), anuncios y publicaciones de Sara (por decidir).
- **El anuncio que anuncia el Black Friday.** Idea de Sara: papeles impresos por el suelo, como en el «coming soon».
- **Fecha límite de pedido para Navidad.**

## Otros temas

- **Envío gratis desde 99 €:** sin cerrar. Sara duda (son de las piezas más caras) y dijo que no le importaría asumir
  el envío en una prenda de 100 €.
- **Correo de novedades:** lo está preparando Sonia, con la foto pequeña de cada prenda. Primero se sube el producto y
  después se manda el correo.
- **Línea más casual y de precio más bajo:** Sara quiere abrirla (básicos, vaqueros, complementos, más bolsos) para la
  venta cruzada; depende de cómo vaya el Black Friday y de la liquidez. German propuso vender los básicos en packs de
  tres. Queda la duda de si se reetiquetan. Consejo de German y Henry: no dar un volantazo con 9 días de campaña.
- **Mantenimiento (500 €/mes): cancelado** con Sonia la semana anterior. Sonia avisó de que la web puede ir más lenta
  en días fuertes. Queda sin definir quién sube productos y stock.
- **Gestión (350 €/mes):** el mes va del 10 al 10. Pendiente de pago (problema con la tarjeta); Henry le pasa el importe.
- **Tarjeta de Meta:** Sara recargó 100 €. Con el presupuesto subido hace falta saldo suficiente.
- **No se habló:** el pedido repetido de 134 € del 12/11 y el texto del botón «Añadir a mi selección».

## Respuestas de Sara del 20/11 (WhatsApp)

- **Descuento de Black Friday: toda la web al 15 %.** Sustituye a los tramos del 20 % / 15 % / sin descuento; con un
  solo cupón desaparece la duda de los dos cupones en un pedido. Por confirmar: si el bolso de piel y las novedades
  entran también.
- **Envío gratis: baja a 99 €.** Cambia la tarifa en GHL (zona «España») y el texto en carrito, ficha y segundo correo
  de carrito abandonado.
- **Fecha límite para Navidad:** Nacex le dice **viernes 18/12**. Los envíos son de 24/48 h laborables; lo pedido por
  la mañana sale el mismo día y lo pedido desde las 16 h, a la mañana siguiente. Nacex tiene además un servicio de
  12 h por 10 €, que se puede ofrecer para los pedidos de última hora (por decidir cómo).

**Más tarde, el mismo 20/11:**

- **Sara propone subir el descuento al 20 % en toda la web** (su pareja opina que un 15 % apenas se distingue del 10 %
  de bienvenida). Pendiente de que lo cierre; sigue sin decir si el bolso de piel y las novedades entran.
- **Grabación:** subido al Drive el empaquetado de fiesta (encaje, preparación de pedido), el conjunto animal print
  (pantalón y top en un mismo paquete) y prendas de encaje saliendo de la bolsa. Falta la parte nocturna (exterior e
  interior con luz cálida), que graba esa noche. Todo en calidad de cámara de fotos. Falta que pase la carpeta.

**Cierre del 20/11:**

- **Envío gratis desde 99 €: hecho.** Tarifa de GHL cambiada por API (3 € hasta 98,99 €, gratis desde 99 €; copia en
  `datos/backups/ghl_envio_zona_20261120.json`) y carrito, ficha y plantilla del segundo correo publicados y
  comprobados contra el repo.
- **Sara confirma el 20 %.** Cupón creado por API: código `BLACK20`, 20 % sobre toda la tienda, programado del jueves
  26/11 a las 00:00 al lunes 30/11 a las 23:59 (hora peninsular), sin límite de usos. Sin excluir el bolso de piel ni
  las novedades (Sara no lo ha contestado). Falta probar en modo test: que no se suma a `BIENVENIDA10` y si el envío
  gratis se calcula antes o después del descuento.

**Prueba del cupón en el checkout real (25/11, sin pagar ni dejar datos):** con un cupón temporal idéntico a `BLACK20`
(20 %, toda la tienda), borrado después; copia previa en `datos/backups/ghl_cupones_20261125.json`.

- Prenda de 109 €: sin cupón, envío gratis. Con el 20 %: descuento 21,80 €, **el envío pasa a 3 €** y el total queda en
  90,20 €. **GHL calcula el envío gratis sobre el importe ya descontado.**
- **No se acumulan:** al meter `BIENVENIDA10` después, sustituye al 20 % (total 101,10 €). Solo cabe un código por pedido.
