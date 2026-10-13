# MÛRA antes de Meta

*22 de septiembre · copia del documento compartido «MÛRA antes de Meta»*

La tienda vende y cobra de verdad; lo que falta antes de pagar tráfico es poder
medirlo. Y lo primero no es el píxel: es un banner de consentimiento de cookies,
porque sin él no se puede instalar legalmente ni el píxel ni el mapa de calor.

## Qué está hecho

El recorrido de compra funciona de punta a punta con clientas reales. El 3 de
septiembre, tres pedidos de Macarena, Cristina y Fátima pasaron solos por los
nueve correos del ciclo, en orden y a su hora. Todo lo de abajo está comprobado
el 22/9 en la cuenta, no en notas antiguas.

| Área | Qué funciona | Cómo lo sé |
| --- | --- | --- |
| Cobros | La tienda cobra de verdad: cuatro pagos reales el 3/9, de 29,10 € a 161 €. | Pedidos en modo live en la cuenta. |
| Compra | Ficha con galería, carrito propio, checkout nativo en castellano y página de gracias. | Las tres compras llegaron hasta el pago sin ayuda. |
| Correos al comprar | Llegan dos y solo dos: el recibo y la confirmación. La notificación duplicada de la tienda ya no sale. | Correos enviados a las tres clientas. |
| Confirmación | Sale del flujo a los 3–4 minutos, con el desglose: prenda, talla, cantidad y foto. | Leído el cuerpo de los tres correos: sin huecos ni llaves sin rellenar. |
| Ciclo completo | Preparación (+10 min), envío (6/9), entrega (7/9), experiencia (+3 días) y reseña (+10 días). | Mismos correos, fechas incluidas. |
| Clasificación | Las tres quedaron con `compra-1`: el etiquetado de primera y segunda compra funciona. | Etiquetas de los tres contactos. |
| Newsletter | Doble opt-in: «Confirma tu suscripción» y después la bienvenida. | Correos de Macarena y Fátima. |
| Devoluciones | Formulario propio en `/devolucion`, flujo de n8n y página de gracias. | Páginas del funnel, tocadas el 11 y el 19/9. |
| Carrito abandonado | LS03 publicado el 22/9: correo de recuperación y oportunidad en «01 · Carrito Abandonado». | Publicado a las 17:25; aún no se ha visto disparar. |
| Legales | Aviso legal, privacidad y condiciones publicadas; la página `/politica-cookies` existe. | Páginas del funnel. |

13 de los 19 workflows están publicados. Los seis en borrador son de la fase
siguiente: stock, lanzamientos, leads de redes, reseñas, VIP y reactivación.

## Qué falta antes de Meta

Las cuatro primeras bloquean a Meta y van en ese orden; de la quinta en adelante
se pueden hacer en paralelo.

| # | Qué | Por qué va antes de Meta | Quién |
| --- | --- | --- | --- |
| 1 | Banner de consentimiento de cookies | Sin él no se puede instalar legalmente ni el píxel ni el mapa de calor: el art. 22.2 LSSI pide consentimiento previo, con rechazar tan fácil como aceptar. Hoy no hay ninguno en la web. | Sonia |
| 2 | Auditoría real de cookies y política publicada | La tabla de la política se escribió sin inspeccionar la web. Hay que listar las cookies de verdad desde el navegador y corregirla. | Sonia |
| 3 | Mapa de calor conectado al banner | Tiene que grabar desde el primer día de tráfico. | German instala, Claude lo conecta |
| 4 | Píxel de Meta y API de Conversiones | La ficha y el carrito son código propio: `ViewContent` y `AddToCart` no los dispara GHL solo, hay que emitirlos nosotros. `InitiateCheckout` y `Purchase` pasan por el checkout nativo: comprobar que los manda la integración. | German conecta la cuenta, Claude los eventos |
| 5 | Título y Open Graph por producto | Hoy un producto compartido por WhatsApp sale en blanco. Ruta nueva en el Worker de Cloudflare que ya tenemos. | Claude escribe, German despliega |
| 6 | Probar siempre en modo test | Los dos pedidos de prueba del 20/9 (773 € y 72 €) crearon las oportunidades M100014 y M100015 en el pipeline real. Con el píxel puesto serían dos compras falsas para Meta. | Sonia |
| 7 | Checkout: España preseleccionada y Bizum | El país arranca en Afghanistan. Bizum: confirmar en Stripe si está activo. | Claude el país, German Bizum |
| 8 | Rejilla sin agotados | El Bolso Ánfora sale sin precio en la primera fila. La ficha ya marca los agotados; la rejilla no. | Claude |
| 9 | Barra de scroll lateral | La web se sale 8 px por la derecha: `100vw` en `.mura` cuenta la barra de scroll. | Claude |
| 10 | Carrito abandonado: prueba y duplicados | Ver disparar LS03 con un abandono de prueba. Y cerrar su oportunidad cuando la clienta paga, o quedará duplicada con la del pedido. | German prueba, Claude el paso |
| 11 | Dos detalles en los correos | A Fátima el correo de entrega le llegó dos veces (7/9, 10:03 y 13:44). El asunto del recibo dice «Aqui» sin tilde y habla de «factura». | Claude |

Después vienen la captura (lista de espera y DM en los reels), los
micro-influencers con código propio y, al final, la pauta.

## El mapa de calor

Sí, y conviene ponerlo en cuanto esté el banner, antes de volver a traer
tráfico. No depende de Meta ni de ninguna compra.

Herramienta: **Microsoft Clarity** — gratuita, mapas de calor y grabaciones,
un fragmento en el Tracking Code del HEAD.

1. Tener el banner funcionando.
2. Crear el proyecto en Clarity con el dominio `stylebymura.com`.
3. Pegar su fragmento en el Tracking Code del HEAD, junto al código que ya hay.
4. Conectarlo al banner con la API de consentimiento de Clarity.
5. Crear el mapa de la ficha con la regla «empieza por `/producto`»: cada prenda
   tiene su propia dirección y, sin esa regla, el mapa no diría nada.

Antes de darlo por bueno: abrir una grabación del checkout y comprobar que nombre,
dirección y tarjeta salen enmascarados.
