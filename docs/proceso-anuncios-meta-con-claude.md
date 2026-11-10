# Cómo se montaron los anuncios de otoño de MÛRA con Claude

Del material en bruto a la campaña activa (agosto–10 de noviembre de 2026).

Este documento cuenta el proceso completo: qué se hizo, en qué orden, con qué herramientas y cómo se repartió el trabajo
entre German, Sara y Claude. Sirve para repetirlo con otro cliente y para entender por qué la campaña está montada así.

**Fuentes y alcance.**
- **Del 30/10 al 10/11:** sale del registro completo de una misma sesión de Claude Code en la nube (105 mensajes de German).
- **Antes del 30/10:** se reconstruye con lo que quedó escrito en este repositorio (actas, planes, historial de git).
  Esas sesiones anteriores no se han leído; donde algo no consta, se dice.

---

## 1. Quién hacía qué

| Persona | Papel en el proceso |
|---|---|
| **Sara** (dueña de MÛRA) | Graba el material, aprueba cada vídeo y cada texto, y da los datos de las prendas (fichas técnicas, precios, stock). No habla con Claude: todo le llega a través de German. |
| **German** (Profit Technology) | Dirige el trabajo. Hace de puente con Sara (le reenvía capturas y mensajes), hace los clics en las interfaces que Claude no puede tocar (GHL, Business Manager, Events Manager) y decide. Es el único que activa la campaña. |
| **Claude** | Monta los vídeos, redacta los textos y los mensajes para Sara, y trabaja por API con Meta y con GHL. Verifica cada paso con datos, documenta en el repo y deja copia antes de cada cambio. |

**Reglas que se respetaron todo el tiempo** (vienen del `CLAUDE.md` del repo):
- Nada de credenciales en el chat ni en el repo; los tokens solo como variables de entorno.
- Copia de seguridad antes de tocar nada por API (`datos/backups/`).
- Todo se crea **en pausa**. Activar o cambiar presupuesto, solo con confirmación de German.
- Los textos solo dicen lo que está en las fichas o lo que se ve en el vídeo: sin «hecho a mano», sin «producción
  limitada», sin precios ni stock.
- Creatividades a nivel de colección, nunca de prenda suelta (hay pocas unidades por pieza).

---

## 2. Cronología

### Fase 0 · Antes de los anuncios (agosto–24 de octubre)

Reconstruida a partir del repo.

| Fecha | Qué se hizo | Dónde consta |
|---|---|---|
| ago–sep | Tienda en GHL, flujos de pedido, Nacex, correos. | `docs/2026-08-07-implementacion-ghl.md` |
| 22/9 | Informe a Sonia: qué faltaba antes de Meta. | `docs/para-sonia-estado-antes-de-meta.md` |
| 9/10 | Reunión con Sara: contrata el marketing (implementación 850 €, gestión 350 €/mes, inversión 1.800 € en 3 meses). | `docs/2026-10-09-reunion-sara.md` |
| 13/10 | `CLAUDE.md` con todo el contexto del proyecto. | `CLAUDE.md` |
| 14/10 | Meta por API dentro del portafolio de MÛRA: app, usuario del sistema y token. | `docs/meta-api.md` |
| 16/10 | Banner de cookies, Clarity y píxel tras el consentimiento, probados en producción. Guía de `Purchase` desde GHL. | `tienda/`, `docs/capi-purchase-ghl.md` |
| 19/10 | Plan de contenido con 8 fichas de anuncio, reglas de grabación para Sara y calendario. Plantilla reutilizable para otros clientes. | `docs/plan-contenido.md`, `plantillas/plan-contenido/` |
| 21/10 | Campaña y conjunto creados **en pausa** por API. | `docs/meta-campana.md`, `tienda/meta-campana.sh` |
| 24/10 | Cambios pedidos por Sara: fuera el backstage; prioridad a looks de calle; ficha 9. | `docs/plan-contenido.md` |

### Fase 1 · El píxel (30 de octubre)

German detecta que el conjunto apunta a un píxel y la web carga otro. Claude prepara el cambio en el código del repo,
pero al comparar con lo que German pega desde GHL («estos son los reales hoy») se ve que **el repo estaba desfasado**:
pegarlo habría borrado funciones que ya estaban en producción. Se revierte el commit y se cambia solo la línea del ID en
GHL.

**Lección:** antes de pegar nada generado desde el repo, comparar con lo que corre en producción.

### Fase 2 · Material en bruto y primeros vídeos (2 de noviembre)

1. German sube un documento de contexto (`MURA-contexto-completo.md`) y pasa dos carpetas de Drive con el material de
   Sara: vídeos en la pared de shooting, vídeos en la calle, contenido orgánico y fotos.
2. El entorno de Claude no podía descargar de Drive. **German habilitó los dominios de Google en la configuración del
   entorno** (`drive.google.com`, `docs.google.com`…) y a partir de ahí se descargó con `gdown`.
3. Claude revisa el material con **hojas de contactos**: montajes de fotogramas en una imagen, para «ver» decenas de
   clips de un vistazo. Con ellas elige los planos.
4. Instrucción de German: «Empieza con lo que tengas». Primer vídeo: **A · Nueva colección de otoño**. Después,
   **B · El detalle** con macros.

### Fase 3 · Textos, edición con Sara y paquete (6 de noviembre)

1. **Textos desde las fichas.** «Leé las fichas y ajustá los textos»: Claude lee las fichas de la colección y escribe
   tres textos y cinco títulos por anuncio. Deja apuntado lo que **no** se puede decir y por qué. Por ejemplo, «piel»
   para un bomber que es polipiel, o «lana» para un abrigo con un 4 % de lana (`textos-anuncios-otono.md`).
2. **Más anuncios:** **C · Looks de calle** y **D · Así llega tu pedido** (empaque).
3. **Legibilidad.** German ve que los textos no se leen bien sobre fondos claros. Se cambia la tipografía a un peso
   mayor, se añade un degradado oscuro abajo y se limita el tamaño según la longitud.
4. **Ciclo con Sara**, el patrón que se repite en todo el proceso:
   - German reenvía capturas con los comentarios de Sara.
   - Claude **no edita todavía** («no edites aún»): primero redacta un texto para que Sara confirme que se ha entendido.
   - Comprueba que existe el material que Sara menciona.
   - Propone el plan («pasame un detalle con lo que vamos a hacer»).
   - Con el «Sara aprobó, hacé los vídeos», monta.
   - Cambios aplicados: en A, planos más cercanos; en B, el broche joya y una foto de encaje; en C, fuera la pared
     vacía.
5. **Paquete para Meta:** los 4 vídeos en 9:16 y 4:5, un CSV con textos, títulos y UTM, y un LEEME con dónde va cada
   cosa.
6. **Primer bloqueo de Meta:** la app de la API estaba en modo desarrollo, y Meta no deja crear anuncios así.
7. **Pregunta de Sara** sobre añadir productos a un reel. Claude se equivocó al principio (dijo que no se podía).
   German le enseñó la opción «Añadir productos» y se corrigió.

### Fase 4 · Cuenta, píxel y anuncios en pausa (9 de noviembre)

1. **¿Qué píxel y qué cuenta?** El portafolio de MÛRA es nuevo, y Meta no le deja crear cuentas publicitarias ni
   compartir activos durante semanas. Se elige la **opción C**:
   - La cuenta publicitaria sigue siendo «Mura - ES», del portafolio de Profit, pagada con la tarjeta de MÛRA.
   - Se le conecta el **píxel de MÛRA** (`1799475611078369`).
   - German hace los clics guiado por capturas (Socios, Activos conectados, «Solicitar acceso»).
   - Claude crea por API un **conjunto nuevo** con ese píxel y deja el antiguo en pausa, renombrado «NO USAR».
2. **El repo vuelve a ser la copia fiel de GHL.** German pega el código real del Head y del Body. Claude rehace
   `tienda/codigo-global-tienda.js` con el ID nuevo, regenera los pegables y hace commit.
3. **Anuncios por API.** German pasa la app a modo público y Claude crea los creativos. Meta rechaza los anuncios con
   varios textos rotativos, porque exigen un conjunto «dinámico», y eso no se puede cambiar después de crear el conjunto.
   German elige la opción 1: **un texto y un título por anuncio**. Se crean los 4 en pausa.
4. **Música.**
   - En el editor del Administrador de anuncios no había opción de añadir música (German lo comprobó con capturas).
   - Claude le pasa a German un **prompt para generar la música con IA**. German genera «Sophisticated Calm» (30 s)
     con su herramienta.
   - Claude no puede escucharla, pero la mide: volumen y energía segundo a segundo. Propone usar el tramo desde el
     segundo 9,5, donde entra con fuerza.
   - Se mezcla en los 4 vídeos a −16 LUFS, con fundido de salida, y Sara la aprueba.
5. **Zona segura.** El aviso de Meta («el icono o el botón pueden tapar el texto») lleva a subir títulos y etiquetas.
   Se comprueba en fotogramas con las líneas de zona segura dibujadas.
6. **Comprobación antes de lanzar.** Claude repasa por API la cuenta, el pago, la campaña, el conjunto, los anuncios y
   las estadísticas del píxel. Sale un problema serio: **el píxel nuevo no recibía nada de la web**. La depuración se
   hizo a distancia, con German pegando comandos en la consola del navegador:
   1. No salía el banner de cookies.
   2. El bloque del Body estaba en la página, pero no se ejecutaba.
   3. Error de sintaxis en la línea 1300, columna 24.
   4. Captura de GHL: **faltaba la comilla de cierre del ID del píxel** en el Body.

   Corregido eso, llegan `PageView`, `ViewContent` y `AddToCart`.
7. **Eventos del checkout.** `InitiateCheckout` no se envía (el checkout es el nativo de GHL). No bloquea, porque la
   campaña optimiza a «Añadir al carrito». `Purchase` sale de un workflow de GHL: se corrige la moneda de USD a
   **EUR**.
8. **Stock.** German pasa las cantidades a mano. Sale que **la chaqueta burdeos del vídeo no estaba en la tienda**.
   Claude redacta la pregunta para Sara.

### Fase 5 · Tienda lista y activación (10 de noviembre)

1. **Fichas nuevas.** Sara manda el conjunto burdeos (también en gris) y las fichas de la chaqueta y el pantalón por
   Drive. Claude las lee y las cruza con la tienda, ya con acceso de lectura a GHL por una variable del entorno.
   Encuentra:
   - el abrigo de pelo animal print, **oculto** en la web aunque sale en el anuncio;
   - bolsos con el mismo nombre en varios colores;
   - el Bolso Ánfora agotado;
   - nombres de «Completa tu look» que no existen en la tienda.
2. **Ronda de preguntas a Sara**, en un mensaje numerado para copiar y pegar. German avisa cuando una pregunta ya está
   enviada («se repiten las preguntas?»), y Claude manda solo lo nuevo.
3. **Sara contesta punto por punto. Claude aplica por API**, con copia previa de los 53 productos:
   - Abrigo de pelo animal print, visible otra vez.
   - Bolsos renombrados con su color.
   - Creados la **Chaqueta Vínculo** y el **Pantalón Sastre Vínculo** en burdeos y gris:
     - fotos optimizadas y subidas a la biblioteca de GHL;
     - tallas S/M y M/L;
     - colecciones;
     - la línea «Modelo · Color» que agrupa los colores en la ficha.

     Se crean ocultos, se comprueban y luego se hacen visibles.
   - Anuncios A y C con el nombre definitivo «Chaqueta Vínculo» en el texto. En el vídeo A se rehace solo la etiqueta.
4. **Prendas camel.** Las carpetas de Drive solo traían fotos. German pega las fichas en el chat. Se crean la
   **Chaqueta Entallada Camel** (visible) y el **Pantalón Pinzas Camel** (oculto, porque su ficha da la composición
   como provisional).
5. **Últimos pasos:**
   - German verifica el dominio `stylebymura.com`: Claude le da la guía del registro TXT en el DNS.
   - Fija la sugerencia de edad en **25–48** y Claude renombra el conjunto.
   - German **activa la campaña**. Claude verifica por API que la campaña, el conjunto y los 4 anuncios están
     activos, sin avisos de revisión.
   - Claude renombra los anuncios y programa una revisión de resultados para el 11/11.

---

## 3. Los cuatro anuncios

| Anuncio | Qué muestra | Versiones hasta la final |
|---|---|---|
| **A · Nueva colección de otoño** | 4 prendas en movimiento (Abrigo Arco, Abrigo Sastre, abrigo de pelo animal print, Chaqueta Vínculo burdeos), con el nombre de cada una. 13,5 s. | 8 borradores |
| **B · El detalle** | 7 primeros planos (encaje, abalorios, broche, pelo…), con «El detalle» → «que lo cambia todo». 14,9 s. | 3 |
| **C · Looks de calle** | 7 looks grabados en la calle, con «Looks de calle» → «Nueva colección de otoño». 14,8 s. | 5 |
| **D · Así llega tu pedido** | El empaque: papel de seda, tarjeta y bolsa, con «Así llega tu pedido» → «Envuelto con cuidado». 14,3 s. | 2 |

**Elementos comunes a los cuatro:**
- Cormorant Garamond para los títulos y Jost para las etiquetas.
- Tarjeta final crema con «M Û R A».
- Formatos 9:16 y 4:5.
- La misma música.
- Destino `stylebymura.com/prendas` con UTM por anuncio y botón «Comprar».

---

## 4. Cómo trabajó Claude: herramientas y técnicas

**Skills.** En esta sesión **no se usó ninguna skill** del catálogo (ni las de marketing, ni las de Meta, ni las de
GHL). Todo se hizo con las herramientas generales de Claude Code. Que en sesiones anteriores se usaran skills, por
ejemplo para los documentos A4 de Sara, no consta en lo leído.

**Herramientas de la sesión** (recuento del registro):

| Herramienta | Usos | Para qué |
|---|---|---|
| Terminal (Bash) | 202 | ffmpeg, Python, llamadas a las API de Meta y GHL, git |
| Leer archivos e imágenes | 58 | Revisar código, fichas y, sobre todo, ver fotogramas y hojas de contactos |
| Enviar archivos a German | 15 | Vídeos, paquete para Meta |
| Escribir archivos | 9 | Scripts de montaje, documentos |
| Herramientas del entorno en la nube | 4 | Documentación del entorno; formulario seguro de credenciales (German lo rechazó); comprobar las variables disponibles; programar la revisión del 11/11 |

**Técnicas concretas:**
- **Edición de vídeo con ffmpeg y Python** (`montar_v2.py`, `montar_d.py`):
  - cada plano se define como archivo, inicio, duración y recorte para 4:5;
  - los títulos se dibujan con fundidos;
  - el degradado inferior se genera para que el texto se lea;
  - las fotos se convierten en planos con un zoom lento;
  - la tarjeta final es común a todos.
- **Hojas de contactos con Pillow** para elegir planos y fotos sin ver cada archivo entero.
- **Fuentes de la marca** descargadas de paquetes npm y convertidas a TTF, porque GitHub estaba bloqueado.
- **Audio medido, no escuchado:** volumen integrado, picos y energía segundo a segundo para elegir el tramo.
- **Meta Graph API:**
  - subir vídeos;
  - crear creativos y anuncios en pausa;
  - leer el estado de la cuenta y las estadísticas del píxel;
  - renombrar;
  - verificar la activación.
- **API de GHL:**
  - leer productos y stock;
  - subir fotos a la biblioteca;
  - crear productos con variantes y precios;
  - cambiar la visibilidad y los nombres.
- **Depuración remota:** comandos de una línea para pegar en la consola del navegador, que acotan el problema paso a
  paso.

---

## 5. Cómo interactuó German (el patrón que funcionó)

1. **Órdenes cortas y por pasos:** «seguí con el de looks en calle», «hacé el de detalle con las macros», «vamos con
   la 1». Claude propone opciones con una recomendada y German elige.
2. **Capturas de pantalla como canal principal.** Las pantallas de Meta, GHL y Events Manager, y los mensajes de Sara,
   llegan como imagen. Claude las lee y responde con el paso siguiente.
3. **German hace los clics, Claude verifica.** German cambia algo en una interfaz y escribe «ya lo hice» o «verifica».
   Claude lo comprueba por API y confirma o encuentra el fallo. Así salieron el píxel sin eventos, la moneda en USD y
   el producto oculto.
4. **Nada a Sara sin pasar por German.** Claude redacta los mensajes listos para copiar. German los envía, trae la
   respuesta y Claude la aplica.
5. **Aprobación antes de editar.** «No edites aún»: primero se confirma que se ha entendido el comentario de Sara, y
   después se monta.
6. **Corrige a Claude cuando hace falta.** Los productos no estaban duplicados, eran colores («debe ser por los
   colores»). Sí se pueden añadir productos a un reel. La captura de la ficha era de Sara, no de German.
7. **Decide en lo que es suyo:** la cuenta y el píxel (opción C), un texto por anuncio, la música, la edad del público,
   no hacer más pruebas de compra, la activación.

---

## 6. Problemas que aparecieron y cómo se resolvieron

| Problema | Causa | Solución |
|---|---|---|
| El código del repo habría borrado funciones en producción | Repo desfasado respecto a GHL | Revertir; después, rehacer el repo desde el código real |
| No se podía descargar de Drive | Dominios bloqueados en el entorno | German los habilitó en la configuración del entorno |
| No se podían crear anuncios por API | App de Meta en modo desarrollo | German la pasó a modo público |
| Meta rechazó los anuncios con varios textos | El conjunto no era de contenido dinámico | Un texto y un título por anuncio |
| No había música en el Administrador de anuncios | Opción no disponible en esa cuenta | Pista generada con IA y mezclada en el vídeo |
| Texto tapado en Reels y Stories | Títulos demasiado abajo | Subirlos a la zona segura |
| El píxel nuevo no recibía eventos | Faltaba una comilla en el Body de GHL | Depuración desde la consola y corrección en GHL |
| La chaqueta del anuncio no estaba en la tienda | Producto sin crear | Ficha de Sara y alta por API |
| El abrigo de pelo del anuncio no se veía en la web | Producto oculto | Volver a hacerlo visible |
| `Purchase` en USD | Valor por defecto de la acción de GHL | Cambiado a EUR |
| Dominio sin verificar | La metaetiqueta no sirve en el Tracking Code de GHL | Registro TXT en el DNS |

---

## 7. Qué queda abierto (a 10/11)

- **Pantalón Pinzas Camel:** sigue oculto hasta que Sara confirme la composición en la etiqueta.
- **Acción de compra en GHL:** pasar de «Administrador de anuncios» a «Integración» (token del píxel) y comprobar que
  el código de prueba está vacío.
- **Consentimiento de `Purchase`** enviado desde el servidor: decisión pendiente (`docs/capi-purchase-ghl.md`).
- **Revisión de resultados:** programada para el 11/11. Los 2–3 primeros días son de aprendizaje y no conviene tocar
  nada.
- **Siguientes prendas:** dos pantalones de sastre y el vestido camisero, para la semana siguiente.
- **Cuenta publicitaria propia de MÛRA:** pasar a ella cuando Meta lo permita.

---

## 8. Para repetirlo con otro cliente

1. Empezar por la **medición**, en este orden: banner de consentimiento, Clarity, píxel, `Purchase`. Comprobar cada
   evento en Events Manager antes de gastar.
2. **Plan de contenido** con fichas por anuncio y reglas de grabación (`plantillas/plan-contenido/`).
3. **Material en bruto en Drive** y dominios de Google habilitados en el entorno de Claude.
4. Montaje con los scripts de esta sesión como base: planos, recortes, títulos, degradado, zona segura y tarjeta final.
5. Textos **solo desde las fichas**, con una lista de lo que no se puede decir.
6. Ciclo de aprobación con el cliente: entender, confirmar, montar, aprobar.
7. Antes de activar, **cruzar anuncios y tienda**: que cada prenda que sale en un vídeo esté visible y con stock.
8. Crear todo en pausa por API, verificar y activar solo con la confirmación del responsable.
