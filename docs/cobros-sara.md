# Cobros a Sara: productos y links de pago en GHL

*Marketing acordado el 9/10/2026: 850 € de implementación (50 % + 50 %) y 350 €/mes
de gestión. Lo cobra **Profit Technology** desde **su subcuenta de GHL** y su
Stripe; nunca desde la subcuenta de MÛRA, donde el dinero iría a la Stripe de
Sara. **Sin impuestos en GHL**: lo fiscal lo resuelven Henry y el gestor de Sara.*

## Estado

| Link | Qué cobra | Importe | Cuándo se envía | Estado |
|---|---|---|---|---|
| A | Implementación, pago inicial (50 %) | 425 € | Ya, para arrancar la fase 0 | Pendiente de crear |
| B | Gestión de campañas | 350 €/mes | El día que arranquen los anuncios | Pendiente |
| C | Implementación, pago final (50 %) | 425 € | A la entrega de la implementación | Pendiente |

El link no es una factura: la factura con los datos fiscales de Sara la emite
Henry aparte.

## 1. Comprobaciones previas (subcuenta de Profit)

- **Payments → Integrations:** Stripe conectada en **modo live**.
- **Payments → Settings:** moneda **EUR**. Si la subcuenta está en USD, los links
  salen en dólares.
- **Impuestos:** que no haya ninguno aplicado por defecto.

## 2. Crear los productos

**Payments → Products → Create Product**

**Producto 1 · Implementación de campañas en Meta — MÛRA**

> Puesta a punto para medir y lanzar las campañas en Meta: banner de cookies y
> auditoría, píxel de Meta y API de Conversiones con los eventos de la tienda,
> enlaces etiquetados, mapa de calor y prueba completa. Total: 850 €.

Dos precios, los dos de pago único (*one time*) en EUR:
- «Pago inicial (50 %)»: 425 €;
- «Pago final (50 %)»: 425 €.

**Producto 2 · Gestión de campañas en Meta — MÛRA**

> Gestión mensual: montaje de la campaña y de los anuncios, revisión semanal,
> selección y textos a partir de vuestro contenido, mantenimiento de los eventos e
> informe mensual. La inversión en anuncios se paga aparte, directamente a Meta.
> Mínimo tres meses; después, mes a mes.

Un precio recurrente (*recurring*):
- «Mensual»: 350 € con periodo mensual;
- si pide número de cobros, se deja indefinido.

## 3. Crear los links

**Payments → Payment Links → Create Payment Link**

- **A:** producto 1, precio «Pago inicial (50 %)».
- **B:** producto 2, precio «Mensual».
- **C:** producto 1, precio «Pago final (50 %)».

En cada uno se piden nombre, correo y teléfono, sin impuestos, y se copia el
enlace.

Si el menú no aparece en esta versión de GHL, el link también sale desde el propio
producto («Generate payment link») o con un formulario de pedido en un funnel.

## 4. Comprobarlo antes de enviarlo

- Abrir cada link en una ventana privada y revisar:
  - el importe;
  - que la moneda sea €;
  - el nombre del producto;
  - en el B, que diga «al mes».
- **No pagar.** Si hay que probar el cobro, se hace con Stripe en modo test.

## 5. Después de cada pago

- El cobro aparece en **Payments → Transactions**. La suscripción del B aparece
  además en **Subscriptions**.
- **El link B empieza a cobrar el día en que se paga** y desde ahí repite cada
  mes. Por eso se envía cuando arrancan los anuncios, no antes.
- **Los tres meses obligatorios** no los impone GHL: son parte del acuerdo. La
  suscripción no se cancela antes del tercer cobro.
- **Si Sara para** (avisando antes del día 25), la suscripción se cancela en
  Subscriptions para que no cobre el mes siguiente. Si vuelve, se le manda el B
  de nuevo, y son dos meses seguidos como mínimo.

## 6. Mensaje para Sara (link A)

> Hola, Sara:
>
> Te paso el enlace para el primer pago de la implementación de las campañas:
> **425 €**, la mitad de los 850 € (lo imprescindible + el mapa de calor).
>
> [LINK A]
>
> En cuanto llegue, empezamos con la puesta a punto: el banner de cookies, el
> píxel de Meta y el mapa de calor. Necesitaremos que nos des acceso a tu
> portafolio comercial de Meta y que añadas tu tarjeta a la cuenta publicitaria;
> te guiamos paso a paso.
>
> Cómo siguen los pagos:
> - **La gestión (350 €/mes)** te llegará como un enlace aparte el día que
>   arranquen los anuncios. Se cobra cada mes desde ese día.
> - **El segundo 50 % (425 €)**, cuando terminemos la implementación.
> - **La inversión en anuncios** la pagas directamente a Meta con tu tarjeta; no
>   pasa por nosotros.
>
> Henry te enviará la factura de cada pago con tus datos fiscales.
>
> Cualquier duda, nos dices.
