# Páginas legales

Cuatro documentos, todos con el mismo patrón: `.mura-legal-*` propio, sin
depender del Tracking Code global (son páginas que se guardan y se imprimen, y
tienen que sostenerse solas). De cada archivo se copia **solo lo que hay entre
las dos marcas de COPIAR** a un elemento de código personalizado de GHL.

| Documento | Archivo | URL | Publicada |
|---|---|---|---|
| Aviso Legal | `aviso-legal.html` | `/aviso-legal` | sí |
| Política de Privacidad | `politica-privacidad.html` | `/politica-privacidad` | sí |
| Condiciones de Contratación | `condiciones-contratacion.html` | `/condiciones-contratacion` | sí |
| **Política de Cookies** | **no está en el repo** — ver abajo | `/politica-cookies` | **NO** |

## La política de cookies

Está escrita y terminada, pero **no vive aquí**: el archivo es
`politica-cookies.html` en el Drive de Sonia
(`1lgFCoTzySca0fwypk19GhsgCOLVZn0sg`, carpeta de MÛRA), con el mismo patrón y la
misma calidad que las otras tres.

**El pie de todas las páginas de la tienda ya enlaza a `/politica-cookies`, y esa
página no existe.** Hoy es un enlace roto en producción, en las cinco páginas que
llevan pie. Es el único de los cinco enlaces legales que no abre nada.

### Antes de publicarla hay dos cosas que hacer, y una no es opcional

1. **Auditar las cookies reales.** El propio documento lo dice en un aviso
   interno: la tabla del apartado 02 está redactada a partir del comportamiento
   *habitual* de GoHighLevel, no de una inspección de la web publicada. Tres de
   las cuatro duraciones figuran como "pendiente de comprobar". Hay que abrir el
   inspector del navegador en stylebymura.com (Application → Storage → Cookies),
   enumerar qué se instala de verdad, de quién es, para qué sirve y cuánto dura,
   y corregir la tabla con eso.

   *No se puede hacer desde aquí:* la política de red del entorno deniega la
   salida a `www.stylebymura.com` (403 en el CONNECT del proxy). Lo tiene que
   hacer alguien con el navegador abierto.

2. **Si aparece cualquier cookie que no sea técnica**, además hace falta un
   banner de consentimiento que la **bloquee hasta que la clienta acepte**, con
   rechazar tan fácil como aceptar y revocable después. Avisar de que existe no
   basta: el consentimiento del art. 22.2 LSSI es previo. Esto pasa a ser
   obligatorio sin matices el día que se instale el píxel de Meta, que hoy no
   está puesto.

### Estado de revisión

Los cuatro documentos son un borrador redactado con asistencia de IA y **no están
revisados por un profesional**. El encargo para quien los revise está en el Drive:
"Revisión jurídica · Páginas legales de MÛRA"
(`1iatKohIWx3XBKD6RsUcqGgBan91NcYN_lSRjvICmLRc`), y recoge las tesis jurídicas que
se dieron por buenas al redactarlos — garantía, devoluciones, transferencias
internacionales a EE. UU. por GHL y Stripe, y los envíos fuera del EEE.
