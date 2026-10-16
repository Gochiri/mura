# Purchase a Meta desde GHL (API de Conversiones)

Decisión de German (16/10): la compra se manda a Meta desde un **workflow de GHL**,
sin n8n. El navegador no envía `Purchase` (el checkout es el nativo), así que es la
única fuente y no hay duplicado que evitar. `ViewContent` y `AddToCart` siguen
siendo solo del navegador (`tienda/README.md`).

**Estado:** pendiente de montar. Esta guía es para Henry u Oliver.

## Lo que se sabe de la acción (captura del 16/10)

Acción «Meta conversion API» del workflow. Campos: tipo de conexión (Integration o
Ad Manager), tipo de evento (Funnel Event), Dataset ID, nombre del evento de
Facebook, valor, moneda y «mapeo personalizado» (solo `fbclid`, ID de lead de
Facebook e `igsid`).

- **No tiene `test_event_code`:** todo envío es un Purchase **real**. Nada de pedidos
  falsos en vivo ni del botón de probar el workflow.
- **No tiene `content_ids`, `eventID` ni `fbp`.**
- La **moneda viene en USD**: hay que poner EUR.
- El nombre del evento viene en **Lead**: hay que cambiarlo a Purchase.

## Antes de montarlo

1. **Conexión con Meta.** Quien conecte Facebook en GHL debe tener acceso al
   portafolio de **MÛRA** (ID `1239463275926698`) y al píxel `1799475611078369`. No el
   portafolio de Profit. Si esa persona pierde el acceso, el envío se rompe.
2. **Que no haya otro píxel cargado por GHL.** Comprobado el 16/10: antes de aceptar
   el banner no hay ninguna petición a Facebook, así que GHL no carga el suyo. Si
   alguien lo configura en los ajustes del sitio, saltaría sin consentimiento.
3. **Disparador.** Usar el de compra completada de la tienda y comprobar que salta
   con un pedido pagado, no con un intento de pago.

## El workflow

- Nombre: `Meta · Purchase (API de Conversiones)`.
- **Filtro de pruebas** antes de la acción: continuar solo si el contacto **no** tiene
  la etiqueta `prueba`. Los pedidos de prueba se hacen con esa etiqueta puesta.
- Acción «Meta conversion API»:
  - Connection type: Ad Manager (o Integration, según cómo esté conectada la cuenta).
  - Event type: Funnel Event.
  - **Dataset ID: el píxel de MÛRA `1799475611078369`.** Comprobar que no elige otro.
  - Facebook event name: **Purchase** (no Lead).
  - Value: el **total pagado por la clienta**, con el selector de variables del
    campo. Comprobar con un pedido real que el importe es el correcto y decidir
    si incluye envío; anotar el criterio aquí.
  - Currency: **EUR**.
  - Custom mapping: apagado, salvo que se decida otra cosa.

## Cómo comprobarlo sin ensuciar el píxel

Como no hay código de prueba, **la primera compra real es la prueba**. Cuando
llegue, en Events Manager → el píxel → Resumen (puede tardar unos minutos) debe
verse un `Purchase` desde el servidor, con valor y moneda EUR. Si se prefiere
probar antes, hacerlo una sola vez, con un importe pequeño y anotado, sabiendo que
quedará registrado como compra.

## Preguntas abiertas

- **Consentimiento.** El workflow manda la compra, con los datos de contacto
  cifrados, sin saber si la clienta aceptó Publicidad. **[DECIDE EL REVISOR]** si
  basta con el aviso en la política de privacidad o hace falta consentimiento previo,
  y si ese dato puede guardarse junto al pedido (el checkout nativo no deja
  añadir campos propios).
- **Calidad de la coincidencia.** Con tan pocos campos, Meta reconocerá menos
  compras. Valorar tras unas semanas si hace falta añadir envío desde servidor
  propio (n8n) con `fbp` y `fbc`.
