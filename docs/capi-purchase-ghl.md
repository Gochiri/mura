# Purchase a Meta desde GHL (API de Conversiones)

Decisión de German (16/10): la compra se manda a Meta desde un **workflow de GHL**,
sin n8n. El navegador no envía `Purchase` (el checkout es el nativo), así que es la
única fuente y no hay duplicado que evitar. `ViewContent` y `AddToCart` siguen
siendo solo del navegador (`tienda/README.md`).

**Estado:** pendiente de montar. Esta guía es para Henry u Oliver.

## Lo que se sabe de la acción (capturas del 16/10)

Acción «Meta conversion API» del workflow, con dos modos de conexión:

- **Integration** (el que usamos): pide **token de acceso**, **ID del conjunto de
  datos**, nombre del evento, valor, moneda, **código de prueba** y un «mapeo
  personalizado» con el campo `FBCLID`. No depende de la sesión de ninguna persona.
- **Ad Manager**: usa la cuenta de Facebook conectada en GHL (depende de que esa
  persona conserve el acceso). No lo usamos.

Valores por defecto que hay que cambiar: el nombre del evento viene en **Lead** y la
moneda en **USD**.

No tiene campos para `content_ids`, `eventID` ni `fbp`. Para `Purchase` no hace falta
el `eventID` (es la única fuente); sí se pierde algo de calidad de coincidencia.

## Antes de montarlo

1. **Token y conjunto de datos.** El conjunto de datos es el píxel de MÛRA,
   `1577201230843977`. El token es el de la API de Conversiones de ese píxel
   (Events Manager → el píxel → Configuración → «Generar token de acceso», o el que ya
   se generó). Se pega **directamente en el campo de GHL**, nunca en el repo ni en un
   chat. Quien pueda editar el workflow puede verlo.
2. **Que no haya otro píxel cargado por GHL.** Comprobado el 16/10: antes de aceptar
   el banner no hay ninguna petición a Facebook. Si alguien configura un píxel en los
   ajustes del sitio, saltaría sin consentimiento.
3. **Disparador.** Usar el de compra completada de la tienda y comprobar que salta con
   un pedido pagado, no con un intento de pago.

## El workflow

- Nombre: `Meta · Purchase (API de Conversiones)`.
- **Filtro de pruebas** antes de la acción: continuar solo si el contacto **no** tiene
  la etiqueta `prueba`.
- Acción «Meta conversion API», conexión **Integration**:
  - Token de acceso: el del píxel.
  - ID del conjunto de datos: `1577201230843977`.
  - Nombre del evento: **Purchase** (no Lead).
  - Valor: el **total pagado por la clienta**, con el selector de variables del campo.
    Comprobar que el importe es el correcto y decidir si incluye el envío; anotar aquí
    el criterio.
  - Moneda: **EUR**.
  - Mapeo personalizado / FBCLID: dejar vacío salvo que se decida otra cosa.
  - **Código de prueba: vacío en producción.**

## Cómo probarlo y dejarlo en producción

1. En Events Manager → el píxel → **Probar eventos**, copiar el código de prueba (empieza
   por `TEST`; caduca si se cierra la sesión).
2. Pegarlo en el campo **Código de prueba** de la acción y guardar.
3. Lanzar el workflow con un contacto de prueba. El evento debe aparecer en **Probar
   eventos** como `Purchase`, origen **Servidor**, con valor y EUR. Con el código puesto,
   no cuenta como compra real.
4. **Borrar el código de prueba y volver a guardar la acción.** Si se deja puesto, todas
   las compras reales irán solo a la pestaña de pruebas y Meta no las usará para anuncios.
5. Publicar el workflow y comprobar la primera compra real en Resumen (puede tardar unos
   minutos).

## Preguntas abiertas

- **Consentimiento.** El workflow manda la compra, con los datos de contacto
  cifrados, sin saber si la clienta aceptó Publicidad. **[DECIDE EL REVISOR]** si
  basta con el aviso en la política de privacidad o hace falta consentimiento previo,
  y si ese dato puede guardarse junto al pedido (el checkout nativo no deja
  añadir campos propios).
- **Calidad de la coincidencia.** Con tan pocos campos, Meta reconocerá menos
  compras. Valorar tras unas semanas si hace falta añadir envío desde servidor
  propio (n8n) con `fbp` y `fbc`.
