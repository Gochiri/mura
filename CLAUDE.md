# MÛRA — contexto del proyecto

Tienda de moda femenina **MÛRA** ([stylebymura.com](https://www.stylebymura.com),
Instagram [@bymurastudio](https://instagram.com/bymurastudio)), montada sobre
GoHighLevel + n8n + un Worker de Cloudflare + Nacex. Todo se escribe en
**castellano de España**: código comentado, documentos y entregables.

Desde octubre de 2026 el proyecto entra en una segunda fase: **campañas en Meta**.
Este archivo resume lo que una sesión nueva necesita saber; el detalle vive en
`docs/`.

## Quién es quién

| Persona | Papel |
|---|---|
| **Sara** | La dueña de MÛRA y la clienta. Autónoma (factura con DNI). No es técnica: todo lo que le llegue, sin jerga. |
| **German** (Profit Technology) | Lleva las campañas de Meta y la relación con Sara en marketing. Es con quien trabajas aquí. |
| **Henry y Oliver** (Profit Technology) | Equipo de German: soporte técnico de GHL, facturación de Profit. |
| **Sonia** (Be Banana) | Hizo la web y el CRM, lleva n8n (servidor `n8n.letsbebanana.com`) y el contrato de mantenimiento con Sara. |

Profit factura el **marketing** a Sara. El **mantenimiento** es el contrato de
Sonia (Be Banana), con parte del trabajo hecho por Profit.

## Estado comercial (13/10/2026, tras la reunión del 9/10)

Acta: `docs/2026-10-09-reunion-sara.md`.

**Marketing — aceptado por Sara**

| Concepto | Importe | Condiciones |
|---|---|---|
| Implementación | **850 €** | Lo imprescindible (750 €) + mapa de calor (100 €). 50 % al empezar, 50 % a la entrega. |
| Gestión de campañas | **350 €/mes** | 3 primeros meses obligatorios. Después mes a mes, por adelantado (antes del día 5); se para avisando antes del día 25; si se vuelve, mínimo 2 meses seguidos. |
| Inversión en Meta | **1.800 € en 3 meses** (800 / 650 / 350) | La paga MÛRA directamente a Meta con su tarjeta. No pasa por nosotros. |

- **Lo imprescindible (750 €):** banner de consentimiento de cookies y auditoría,
  píxel + API de Conversiones con los eventos de ficha y carrito, enlaces con UTM,
  prueba completa.
- **No contratado por ahora:** catálogo de Meta (300 € si se contrata; después, su
  actualización entra en la gestión) y lista de espera de Navidad (150 €).
- Sara prevé: Black Friday, Navidad y rebajas → pausa → relanzar con la colección
  de primavera en marzo.

**Mantenimiento (500 €/mes) — abierto.** Sara pide bajarlo porque el mes va a 0 €
en ventas y propone pagar por incidencia en vez de vigilancia continua. El equipo
le debe una propuesta. En el documento «Lo que tiene MÛRA» ya se le enseñó la
alternativa de 249 €/h. Sara da por hecho que el servidor del catálogo de la web
(el Worker de German) sigue.

## Campañas en Meta

Plan completo: `docs/campanas-meta.md`. Lo esencial:

- **Medir antes de gastar.** Orden obligatorio:
  1. banner de consentimiento (art. 22.2 LSSI: consentimiento previo, rechazar tan
     fácil como aceptar);
  2. Clarity conectado al banner;
  3. píxel + API de Conversiones.

  Ningún euro en anuncios hasta ver cada evento llegar bien a Meta.
- **Eventos:** la ficha y el carrito son código nuestro, así que `ViewContent` y
  `AddToCart` los emite `tienda/codigo-global-tienda.js`. `InitiateCheckout` y
  `Purchase` pasan por el checkout nativo: comprobar que la integración los manda.
  Píxel de MÛRA: `1799475611078369` (creado; no se carga hasta tener el banner).
- **Pruebas siempre en modo test.** Los pedidos de prueba del 20/9 (M100014,
  M100015) se hicieron en live y acabaron en el pipeline real; con el píxel serían
  compras falsas.
- **Estructura:** 1 campaña de Ventas con un solo conjunto (mujeres de 28 a 48 en
  España, como sugerencia a Advantage+). Optimiza a «añadir al carrito» y pasa a
  compra cuando haya volumen.
- **Creatividades:** a nivel de **colección o cápsula, nunca de prenda suelta**,
  porque hay unas 5,5 unidades por pieza. Contenido producido. Sara no habla a
  cámara: guiones sin diálogo con escenas de uso, o vídeos generados a partir de
  las fotos.
- **Dónde se gestionan:** desde el Administrador de anuncios de Meta, no desde
  GHL. Las métricas se ven también en GHL → Reportes → Meta Ads.
- **No hacemos:** campañas de tráfico o interacción, públicos similares de
  visitantes sin píxel, fragmentar 20 €/día en varios conjuntos, ni prometer ROAS.

## Mapa del repo

| Ruta | Qué hay |
|---|---|
| `docs/2026-08-07-implementacion-ghl.md` | Registro técnico de todo lo hecho en GHL, por secciones (§1–§42). Es la fuente de verdad: búscalo antes de tocar un flujo. |
| `docs/campanas-meta.md` | Plan de campañas, datos de referencia y briefing de creatividades. |
| `docs/2026-10-09-reunion-sara.md` | Acuerdos con Sara y lo que queda abierto. |
| `docs/cobros-sara.md` | Cómo se le cobra a Sara (productos y links en la subcuenta de Profit) y estado de cada link. |
| `docs/meta-api.md` | Meta por API dentro del portafolio de MÛRA: usuario del sistema y app existentes, token, `.env`, comprobaciones con `curl` y reglas de uso. |
| `docs/para-sonia-*.md` | Lo entregado a Sonia: aviso de pedido, formulario de devolución, estado antes de Meta (22/9). |
| `docs/2026-07-29-llamada-sonia-henry.md` | Llamada técnica de julio: número de pedido, Nacex, tags. |
| `tienda/` | Código de la web. Fuente única: `codigo-global-tienda.js` → `build.sh` genera `tracking-code-head.html`, `tracking-code-body.html` y `css-paginas-tienda.css`. Qué se pega y dónde, en `tienda/README.md`. |
| `tienda/worker-productos.js` | Worker de Cloudflare que sirve el catálogo y el stock a la web (caché de 60 s). |
| `tienda/n8n-*.json` | Nodos de n8n para pegar (newsletter, encuesta, devolución web, aviso de pedido). |
| `legal/` | Páginas legales; `legal/README.md` explica dónde está la política de cookies (Drive de Sonia). |
| `correos/` | Plantillas HTML de correo (asunto y previsualización en el comentario de cabecera). |
| `datos/` | Mapas de ids, stock y copias de seguridad (`datos/backups/`) antes de cada cambio por API. |

## Reglas técnicas que ya nos han mordido

- **API de GHL:** la pública es `https://services.leadconnectorhq.com`, con
  cabecera `Version: 2021-07-28` y un token PIT. Usa `curl`: `urllib` devuelve 403
  por Cloudflare.
- **Secretos:** el PIT, los tokens de Firebase y cualquier credencial **nunca** se
  escriben en el repo ni en un artefacto. Antes de cada commit o publicación,
  `grep -rE 'AMf-|pit-|EAA'` tiene que salir vacío (`EAA` es el prefijo de los
  tokens de Meta).
- **Meta por API:** todo dentro del portafolio de MÛRA (ID `1650663796846832`):
  usuario del sistema `Conversions API System User` (creado por Meta con el píxel, ya con todos los activos), app `Conversions API Application` y su token. No se usa el
  portafolio de Profit. Todo en un `.env` local
  (`META_ACCESS_TOKEN`, `META_CAPI_TOKEN`, `META_AD_ACCOUNT_ID`…; lista completa en
  `docs/meta-api.md`). Se llama a la Graph API con `curl`. Activar campañas o
  cambiar presupuestos, solo con confirmación de German.
- **Copia antes de tocar:** antes de cualquier cambio por API, guarda una copia en
  `datos/backups/`.
- **Tags:** un tag que ya está puesto no vuelve a disparar. Siempre se quita antes
  de ponerlo (§17).
- **Plantillas:** cambiar el `template_id` de un paso de workflow sobrescribe la
  plantilla destino. Haz una copia antes de reapuntar (§40).
- **Triggers:** en los workflows migrados (`isTriggerBucketMigrated: true`), el
  POST de trigger devuelve un id pero no guarda nada. Los triggers se crean en la
  interfaz (§41).
- **`next` en array:** en un nodo que no ramifica, `next` va como texto, no como
  array; GHL lo valida desde septiembre. Se arregla con «How to fix» en el editor
  (§42).
- **Tracking Code del HEAD:** GHL no lo sirve dentro del `<head>`. El CSS va
  también en el Custom CSS de la página; edita siempre la fuente y ejecuta
  `build.sh` (§35, `tienda/README.md`).
- **Webhooks de n8n:** en producción, siempre `/webhook/…`. `/webhook-test/…` solo
  escucha con el editor abierto (§23).
- **Formularios:** nunca formularios nativos de GHL embebidos (van en un iframe
  que nuestro CSS no alcanza). Se hacen en HTML propio con `fetch` a n8n, como la
  newsletter, la encuesta y la devolución.
- **Ficha y carrito** son código propio. Lo que dependa de ellos (eventos de
  Meta, «Completa tu look», otros colores) se toca en `tienda/`, no en GHL.

## Entregables

- Lo que va a Sara o a Sonia se publica como artefacto de diseño A4 para descargar
  en PDF:
  - fondo crema `#F6F2EB`, tinta `#1E1B1A`;
  - Cormorant Garamond para títulos y Jost para el texto;
  - cabecera «MÛRA» espaciada y pie con número de página.
- **Artefactos existentes** (privados de la cuenta de German; desde una sesión se
  leen con la acción `read` de Artifact):
  - Propuesta de campañas v2 — https://claude.ai/artifact/XkqtWxWP2KAS6DoLuatfCf
  - Lo que tiene MÛRA (mantenimiento y pendientes) — https://claude.ai/artifact/UXvaxbE6zpuz3TByGufwUp
- **Cifras:** solo con fuente (la cuenta, lo que aporte German, o aritmética dicha
  como tal). Los rangos del sector van marcados como orientativos.
- **Datos personales:** sin nombres de clientas, ids ni tokens en nada que salga
  del equipo.
- **Estilo con Sara:** cercano y claro. Las decisiones de dinero se explican con
  cuentas, nunca con promesas.

## Pendientes abiertos (13/10)

| Pendiente | Quién |
|---|---|
| Propuesta de mantenimiento más barata (por incidencia u horas) | German + Sonia |
| Cobro: productos y links de pago en la subcuenta de Profit (link A, 425 €), datos fiscales de Sara vía su gestor y factura de cada pago. Instrucciones y estado de los links en `docs/cobros-sara.md` | German + Henry |
| Meta por API, todo en el portafolio de MÛRA (ID `1650663796846832`; Henry y Oliver son administradores como personas): cuenta publicitaria en EUR con la tarjeta de Sara (el píxel ya existe), usuario del sistema `Conversions API System User` con los activos y la app `MURA Ads` (`1139141968627775`); token con 6 permisos al `.env`; falta añadir el caso de uso de Instagram y regenerar; ID de portafolio por confirmar (1650663796846832 o 1239463275926698) (`docs/meta-api.md`) | Henry u Oliver; la tarjeta, Sara |
| Banner de consentimiento + auditoría real de cookies | Sonia / Claude |
| Clarity conectado al banner; píxel + CAPI con eventos propios | German instala, Claude el código |
| Guiones sin diálogo y 6–8 creatividades de colección | German + Sara |
| Las 10 fechas de los pendientes del presupuesto (página 3 de «Lo que tiene MÛRA», hoy `[FECHA]`) | Sonia + German |
| Comprobar si el formulario de devolución valida pedido + correo, como dice el PDF de Sonia (el flujo que dejamos solo comprueba que el contacto existe) | Sonia |
| Defectos del 22/9: `100vw` en `.mura` (8 px de scroll lateral), rejilla con agotados, correo de entrega duplicado, asunto del recibo («Aqui», «factura»), LS03 sin probar y sin cerrar su oportunidad al pagar | Claude |
| Home: Sara la ve «muy seria»; carrusel o vídeo de outfits, decidir con el mapa de calor | German + Sara |
