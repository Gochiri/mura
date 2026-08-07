# Mûra — GoHighLevel

Proyecto de implementación de la subcuenta **Mûra** (tienda de moda, [stylebymura.com](http://stylebymura.com/)) en GoHighLevel.

- **Location ID:** `NxPF5fOicowujokEk5Hm`

## Contenido del repositorio

| Carpeta | Descripción |
|---------|-------------|
| `correos/` | Las 18 plantillas de correo HTML (versión vigente, cargadas en Marketing → Emails → Templates → carpeta "Correos") |
| `datos/plantillas_ghl.json` | Mapa nombre → ID de cada plantilla en GHL |
| `datos/productos_ghl.json` | Los 36 productos del catálogo cargados en GHL (ID, nombre, tallas) |
| `datos/reporte_correos_v2.json` | Reporte de la actualización de correos del 2026-08-07 |
| `docs/plan-workflows.md` | Guía de conexión plantilla → workflow: asuntos, disparadores, custom fields/values requeridos y checklist de activación |

## Estado del proyecto

### Catálogo de productos (2026-07-05)
36 productos creados vía API pública (`/products/`): tipo físico, precios en EUR, variantes de talla con stock por talla e inventario activo, fotos en el CDN de GHL y descripciones desde las fichas técnicas del cliente. 242 unidades de stock inicial.

### Plantillas de correo (última actualización 2026-08-07)
18 plantillas HTML en la carpeta "Correos" (`6a6aa119fee4921a97537ba5`): flujo transaccional completo (confirmación → preparación → envío → entrega → experiencia → reseña), devoluciones (solicitud, verificada, incidencia, datos no coinciden, reembolso), y marketing (bienvenida, segunda compra, reactivación, lanzamiento, reposición, cumpleaños, reseña en Google).

Cada HTML lleva en su comentario de cabecera el **ASUNTO** y la **PREVISUALIZACIÓN** recomendados — las plantillas HTML de GHL no almacenan asunto; se define al conectarlas en workflows o campañas.

## Pendientes

- **Chalequillo blanco**: producto sin crear — su ficha técnica (docx) venía vacía. Hay 3 fotos listas; falta la ficha correcta del cliente.
- **Duplicado del correo 02**: existe un "02 · confirmación pedido" fuera de la carpeta Correos (creado manualmente) cuyo contenido difiere del oficial `02-confirmacion.html`. Decidir cuál conservar.
- **Correo 13**: no existe en la numeración (nunca vino en los archivos del cliente).
- **Workflows**: la subcuenta tiene workflows en borrador (AP01, AP02, AP03…) pendientes de conectar con estas plantillas. Plan completo de conexión en `docs/plan-workflows.md`.

## Notas técnicas

- API pública de GHL: `https://services.leadconnectorhq.com` con header `Version: 2021-07-28`.
- Crear plantilla de correo: `POST /emails/builder` (type `html`, `parentId` de la carpeta) y luego `POST /emails/builder/data` (campos `html`, `editorType: "html"` y `updatedBy` obligatorio).
- Las fotos de producto se suben con `POST /medias/upload-file` (multipart) y se adjuntan en `medias` al crear el producto.
- El CLI local de GoHighLevel (carpeta `gohighlevel-cli/`, excluida del repo) guarda las credenciales en su `.env`.
