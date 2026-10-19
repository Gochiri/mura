# Plantilla: plan de contenido para campañas en Meta

Reproduce para otro cliente lo que se hizo para MÛRA (`docs/plan-contenido.md`):
un documento con 6–8 fichas de anuncios, reglas de grabación y calendario, y un
lienzo A4 para enviar al cliente en PDF.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `plan-contenido.md` | La plantilla del documento, con huecos `[ASÍ]`. Se copia al repo del cliente como `docs/plan-contenido.md`. |
| `gen.py` | Genera el lienzo A4 (10 artboards) a partir del `.md` relleno. Lee las fichas del propio documento. |
| `medir.sh` | Comprueba en local que ninguna página se pasa del A4. Necesita Chromium. |

## Cómo se usa, en cinco pasos

1. **Datos de partida.** Qué vende el cliente, quién graba, si quiere hablar a
   cámara, su Instagram, dos competidores, la fecha de arranque de los anuncios y
   qué dice su propuesta firmada sobre creatividades y edición.
2. **Investigar antes de escribir.** Del orgánico del cliente: sus 10–15 últimas
   publicaciones con cifras, ordenadas de más a menos, y qué formato y ángulo hay
   arriba y abajo. De los dos competidores, en la Biblioteca de anuncios de Meta:
   cuántos anuncios activos, desde cuándo, qué dice el copy, qué formatos, qué
   rotan. Sin esto, las fichas son intuición.
3. **Rellenar la plantilla.** Copiar `plan-contenido.md` al repo del cliente y
   rellenar todos los huecos. Las fichas van por momento de uso o necesidad del
   cliente final; el destino es siempre una categoría o landing. Mantener los
   títulos `### N · …` y los campos en negrita: el generador los lee.
4. **Generar y publicar el lienzo.** `python3 gen.py docs/plan-contenido.md
   --marca "NOMBRE" --out /ruta/salida`, medir con `medir.sh`, y publicar los
   archivos de `project/` en un artefacto de tipo Design nuevo.
5. **Entregar.** Enlace al lienzo (privado hasta que se comparta o se exporte el
   PDF) y un mensaje corto al cliente con las fechas y la petición de reunión de
   30 minutos para aprobar los guiones.

## Prompt para pegar en la sesión del nuevo cliente

```
Lee plantillas/plan-contenido/README.md y plantillas/plan-contenido/plan-contenido.md.

Cliente: [NOMBRE]. Vende [QUÉ] en [DÓNDE]. Graba [QUIÉN], [sí/no] quiere hablar a cámara.
Instagram: [@handle]. Competidores: [A], [B]. Arranque de anuncios: [FECHA].
Lo que dice la propuesta sobre creatividades y edición: [TEXTO LITERAL].

Haz, en este orden:
1. Analiza el orgánico del cliente y los dos competidores en la Biblioteca de anuncios de Meta. Resume en «Lo que ya sabemos que funciona» con cifras y fecha.
2. Rellena la plantilla con 6–8 fichas por momento de uso. Comprueba stock o disponibilidad de lo que aparezca en cada ficha.
3. Genera el lienzo A4 con gen.py, mide con medir.sh y publícalo como artefacto Design.
4. Guarda el documento en docs/plan-contenido.md y enlaza el lienzo en su cabecera.
5. Prepara el mensaje de WhatsApp para el cliente.

Castellano de España. Sin cifras sin fuente. Sin descuentos en el copy salvo que el modelo del cliente sea de promoción.
```

## Lo que cambia según el nicho

- **Producto físico:** las fichas giran en torno a utilidad, proceso, detalle y
  colección. Comprobar stock por referencia antes de citarla; si es escaso,
  anunciar la categoría.
- **Servicio local:** antes/después, cómo es la visita, equipo, opinión real de un
  cliente (con permiso). El destino es la página de reserva; el CTA, «Reservar» o
  «Pedir cita». La métrica de la revisión semanal es coste por cita.
- **Formación:** resultado de un alumno, un consejo aplicable, detrás del método,
  por qué ahora. CTA «Inscribirme»; métrica coste por registro.
- **Si el cliente habla a cámara:** cada plano lleva su frase escrita en la ficha,
  de una línea, y la regla 2 de grabación cambia.

## Origen

Hecho para MÛRA (moda femenina, octubre de 2026). El análisis de competencia que
sirvió de base (Bimani y Coosy) dio dos técnicas que valen para cualquier nicho:
el mismo texto con el título del enlace rotando, y anuncios por momento de uso en
vez de por tipo de producto.
