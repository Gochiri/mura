# Llamada Sonia (Be Banana) × Henry (Profit Technology) — 29 de julio de 2026

Google Meet, 59 min. Llamada anterior a la del 4 de agosto (Sonia × German × Henry).
Es la llamada donde se detecta el fallo de diseño original y nace la arquitectura
actual del sistema Mûra.

---

## Resumen ejecutivo

### El fallo detectado (origen de todo)

Sonia detectó que el diseño solo permitía **una oportunidad por contacto**: si una
clienta compra dos veces, el segundo pedido pisa o pierde los datos del primero.

**Solución acordada** (7:42–11:42):
1. Activar la opción de **duplicar oportunidades** (1 compra = 1 oportunidad).
2. Poner el **número de pedido como nombre/título de la oportunidad**.
3. Guardar los datos del pedido en **custom fields de oportunidad**, no de contacto
   (los de contacto se reeditan con cada pedido).

### Aclaración clave de GHL (Henry, 10:00)

Los campos de oportunidad **sí** se pueden usar en los emails **siempre que el
workflow tenga un gatillo de oportunidad** (cambio de etapa, etc.). Con gatillos que
no llevan contexto de oportunidad no aparecen. Esto condiciona qué merge tags
funcionan en cada email según su trigger.

### El número de pedido y el límite de Nacex (34:45–51:42) ⚠️

Discusión importante que quedó **abierta**:

- El campo "referencia" de **Nacex admite máximo 20 caracteres**. El Opportunity ID
  de GHL son ~20 caracteres → demasiado justo; un carácter más y Nacex lo rechaza
  (ya les pasó: "lo hemos cagado porque ya no lo coge Nacex").
- El Order ID interno de GHL/Stripe es largo y feo para el cliente ("poner tu número
  de orden es este, es como muy crazy").
- **Idea acordada en esta llamada**: generar un **ID interno secuencial de Mûra**
  (tipo `M001` / `000001`) mediante un workflow con **custom value + operación
  matemática** que se incrementa con cada pago (gatillo Payment Received) y se
  guarda en el custom field de oportunidad "número de pedido". Con aviso a Sara si
  llega a 999999.
- Nadie verificó qué genera Stripe vs GHL ni la longitud real del order ID.

> Nota: en la llamada posterior del 4 de agosto, German dijo que "el pedido es
> contact order ID" y sobre esa base se configuró SP01. El **contador secuencial
> interno de esta llamada no llegó a implementarse** — queda como decisión abierta
> (ver pendientes en `2026-08-07-implementacion-ghl.md`).

### Mecánica de tags email-04-listo / email-08-listo (16:41–33:23, 52:46)

- n8n hace el `putRecogida` a Nacex → recibe albarán, link de seguimiento y
  etiqueta (PDF) → sube la etiqueta a GHL, guarda la URL en la oportunidad y añade
  el tag **`email-04-listo`** → GHL, al ver el tag, envía el email 04.
- Devoluciones: el formulario dispara el webhook → n8n verifica el pedido, pide a
  Nacex la etiqueta de devolución (PDF), la sube, guarda la URL y añade
  **`email-08-listo`** → GHL envía el email 08 con el enlace de descarga.
- Sonia no podía crear el tag desde el trigger (bug de UI); Henry le enseñó:
  primero crear el tag en Settings, luego seleccionarlo en el trigger.

### Watchdog de entrega (26:00–29:13)

Diseño original: tras "envío realizado", esperar **24h**; si la oportunidad sigue en
la etapa 04, llamar al webhook watchdog → n8n consulta el estado en Nacex → si
entregado, mover al 5; si no, aviso a Sara (Nacex tarda ≤24h en entregar).
*(En la llamada del 4 de agosto se cambió a 48h: 24 recogida + 24 entrega.)*

### Otros acuerdos y estado (a 29 de julio)

- Sonia creó los 4 workflows "sin nomenclatura" (04 solicitud, 04 email, 05, 08) —
  los que luego se corrigieron el 7 de agosto.
- Sonia creó el **Formulario Devolución v2** añadiendo el campo nº de pedido
  ("lo encuentras en tu mail de confirmación") para buscar por pedido y no por
  cliente (una clienta puede tener dos pedidos).
- Sonia modificó los emails **02 y 08** (subidos al Drive): el 08 ahora lleva botón
  de descargar etiqueta además del enlace al proceso de devolución.
- Los emails aún no estaban montados en GHL (a esa fecha).
- Faltaban fotos de productos por subir a la web (Sara avisó; pendiente identificar
  cuáles de los 36-37 productos).
- Henry propuso **simplificar n8n**: en vez de que n8n actualice contacto + mueva
  etapas, que n8n solo actualice un campo/tag y GHL dispare el resto (germen del
  principio "n8n etiqueta, GHL reacciona" consolidado el 4 de agosto).
- Las pruebas de compra se harán con **Stripe en modo test** cuando estén todos los
  flujos (activación pendiente por parte de Sonia/Sara).
- Todo lo construido para Mûra será **replicable para Moncho** (mismo carrier,
  Nacex).

---

## Transcripción completa

*Google Meet, 29 de julio de 2026, 59 min. Participantes: Be Banana (Sonia),
Profit Technology (Henry).*

```
0:00 - Be Banana: How are you?
0:02 - Profit Technology: How are you?
0:03 - Be Banana: Very good, and you?
0:05 - Profit Technology: Well, I'm fighting with a shortcut. I'm tired right now. Tengo a mi pequeña aquí en la casa y no la puedo disfrutar por el trabajo.
0:17 - Be Banana: Es que tienes una agenda buena hoy. Uff, y no, y toda la semana.
0:22 - Profit Technology: Tanto, tomela, ven. Tienes siete añitos apenas, apenas.
0:36 - Be Banana: Un terremoto. Mi sobrino tiene seis y es morta.
0:41 - Profit Technology: sobrina trabaja conmigo, mire. Mi mire, igualita, bonita.
0:47 - Be Banana: ¿Qué pasa? ¿Que papá no para de trabajar o qué? No. Te se enchufa del ordenador. Tú coges el cable y lo tiras así. Y uno apaga.
0:57 - Profit Technology: No se apaga. ¡Vaya!
1:00 - Be Banana: ¡Échale agua! ¡Ay, no! ¡Vaya, bebé!
1:06 - Profit Technology: ¡No, eso no es colaborador usted tanto!
1:10 - Be Banana: ¡Échale agua, dice!
1:12 - Profit Technology: ¡Qué máquina!
1:15 - Be Banana: A mí hoy me llaman mi sobrino que sí tengo ya Lego para cuando vengan. Digo, sí, sí, tengo tres. Yo también la metí en servicio de los Legos y le encantó. Sí, es que les gusta mucho. Nosotros estuvimos montando el otro día miniaturas de Harry Potter.
1:34 - Profit Technology: Ajá.
1:35 - Be Banana: Son como bolitas así chiquititas que van con resina. Sí, sí, sí.
1:40 - Profit Technology: No, yo le compré fue los Legos Creator que vienen tres en uno.
1:43 - Be Banana: Ah, sí. Sí.
1:45 - Profit Technology: Le compré tres para que juega bastante. O sea, tiene nueve. sobrino se canso.
1:51 - Be Banana: Le cogí un Creator de coche, avión y no sé qué y se canso. Sin embargo, los de Harry Potter sí los monta. No.
2:00 - Profit Technology: Yo le compré el de conejo, perro y no sé qué, y gato. Le compré tres que se convierten en tres distintos, pero es que eso le ayuda cerebralmente y todo para que piense y siga instrucciones y todo. Yo de chiquito tenía unos que se llamaban Costru. Era parecido a los Legos de ahorita, pero eran los Legos esos con... El Lego ahorita, por ejemplo, de la Fórmula 1 que mueve motores o cosas esas.
2:32 - Be Banana: Lo que yo tenía se llamaba Costru. Y tenían manguera. Que tienen motorcitos y tal. Nosotros teníamos canes.
2:40 - Profit Technology: Me traía a mi tío de Estados Unidos y era así. No era como Lego como tal, sino que era raro. Era un pin como con otro pin arriba redondo y en seis o en cuatro. Era raro, pero yo lo volví a ver. Bueno, he buscado en internet y no me salen.
2:56 - Be Banana: Pues aquí teníamos Kennex y es... Parecido, pruébalos, míralo, porque igual es eso, con K, K'nex.
3:08 - Profit Technology: Eran estos, mire, ay los conseguí, no puede ser, sin querer queriendo los conseguí.
3:14 - Be Banana: Volvieron.
3:16 - Profit Technology: Volvieron, pero nada, creo que los conseguí en las imágenes, ya, no creo que ahorita estén. O esto existe. Ah, no, mentira. Era, no, esto es Lego, le dije tipo Lego y me pasó.
3:34 - Be Banana: No, eso no es.
3:37 - Profit Technology: No, esto no son, todo esto es Lego. Es que era raro el modelo. Esto es Lego, ¿no? Todo esto es Lego. No, ninguna de estas, pensé que lo había conseguido, me había emocionado. Ya el cansancio me está haciendo ver locuras.
4:00 - Be Banana: De verdad, dame un segundo, preparar el guión del próximo reel, media hora para el viernes. Bueno, te cuento, he estado ahí toqueteando un montón.
4:24 - Profit Technology: Cuéntame, porque esta parte la llevaba a Germán, obviamente nos dividimos las responsabilidades un poco por todo el trabajo, pero pues nada, yo le paso esto a, te atiendo, como quien dice ahorita, y le paso esto a Germán para que él lo termine, pero sí, que ya esta parte le tocaba a él, pero nada, lo atiendo yo y ya esta. Si, si no, que me escriba, no pasa nada. Te cuento, Es he hasta dormido, es un señor mayor y hace siestas y cosas así.
4:50 - Be Banana: Joder, siempre con decirle mayor, pobrecito, porque lleva boina, este que injusto.
4:56 - Profit Technology: Cumplió 51, cumplió ahorita 51, ayer, el lunes.
5:01 - Be Banana: ¿Sí? Hostia, pues no parece, eh. Ay, ya va a escuchar eso.
5:07 - Profit Technology: Ya se crece. Pero, ¿es verdad?
5:09 - Be Banana: ¿A ti te parece que tenga cara de 51?
5:11 - Profit Technology: No, yo le digo 10-70. Vale, voy a buscar tu chat para rebobinar porque no entendí pero nada. Y menos a esa hora. Hola, hola, me dices ahora que aún no están los cambios hechos. ¿Cuáles cambios?
5:31 - Be Banana: Eh, ropa que falta por subir. Hay cosas que solo había una prenda y los, bueno, eso lo he visto yo, los e-mails, pero...
5:43 - Profit Technology: Sí, los e-mails no los hemos montado, eso sí, toda la razón.
5:48 - Be Banana: Pero ella me ha dicho sobre todo por la ropa que faltaba y... Pero son 36 productos, ¿no?
5:58 - Profit Technology: Pero hay algún...
6:00 - Be Banana: ¿Qué solo hay una foto? Y en el drive hay tres o cuatro fotos de cada uno.
6:05 - Profit Technology: Vale, lo reviso entonces. El drive es... ¿Qué está? Francisco, no, Kibibanana. Ah, pero son dos drives. En este no lo tengo. El otro me lo pasaste por correo. Buscarlo para Kibibanana. Tenemos información en varios drives. Mediante se compartió estos e-mails, carpeta, branding, productos. Aquí está.
6:45 - Be Banana: Y te dijo en cuáles, casualidad.
6:49 - Profit Technology: Bueno, si no, los reviso.
6:51 - Be Banana: Eh, no. No, ok.
6:55 - Profit Technology: Bueno, tengo que revisarlo. Creo que había una sola carpeta que no tenía. ¿Tienes revisar 37 productos para ver cuál faltó?
7:03 - Be Banana: La voy a preguntar por si acaso me dice, pero no me ha dicho.
7:07 - Profit Technology: Vale, sí, porque hay que revisar. Ficha técnica, no. Fotos contenidos, no. Fotos web, por ejemplo, en este laser hay 4. Habría que ver si los hay aquí. Sí, toca revisar uno por uno.
7:30 - Be Banana: Le escribo, ¿eh? Le escribo, espérate si quieres, a ver qué me contesta. Y si ella sabe cuáles son, pues mira, ¿sabes?
7:40 - Profit Technology: Vale, te explico.
7:42 - Be Banana: Me he dado cuenta de que en la lógica de los pasos que tiene que llevar la esta de ventas, hay un fallo. Y es que solo permite una oportunidad por persona. [...] Imagina, compro ahora y la próxima vez que compro, entonces eso se pierde. [...] Pero he encontrado una solución y es en el nombre de oportunidad, poner el número de orden. Que se genera automáticamente en GoHighLevel, creo, cuando haces una compra.
8:54 - Profit Technology: That is the solution, permit it to be a... But it is very important that the number of...
9:02 - Be Banana: ¿Por qué? Porque luego, cuando tú vas a mandar los e-mails, como ya no estás cambiando ni guardando datos en el contacto, te va a faltar el número de orden que tú necesitas si el quiere devolver.
9:16 - Profit Technology: Claro, en el contacto no puedo guardar nada, todo tiene que ser la oportunidad.
9:20 - Be Banana: El contacto no se explica la oportunidad, sí. Pero los datos de oportunidad no los puedes usar en los e-mails. Entonces, la solución que a mí se me ha ocurrido es poner en el título de oportunidad el número de orden y en el workflow, cuando tú, por ejemplo, haces el e-mail de pedido confirmado, este es tu número de pedido, generas una variable con el título de oportunidad y esa variable temporal que la tienes en contacto es la que usas para el número de pedido dentro del texto del e-mail.
10:00 - Profit Technology: Eso puede ser otro, pero sí se pueden usar variables de oportunidad en el correo si dentro del workflow hay un gatillo de oportunidad.
10:13 - Be Banana: Claro, pero es que hay varios que no van a tener eso. Sería primero compran, luego Sara lo pasa a lo estoy preparando. Ahí no hay un gatillo de oportunidad. Bueno, sí, Sara lo pasa, no sé.
10:31 - Profit Technology: Sara lo movió de etapa, al moverlo de etapa dispara y sale la oportunidad.
10:35 - Be Banana: Claro, tú puedes usar de oportunidad siempre y cuando el texto, esa cosa, esté en la oportunidad y no en el cliente, ¿no? Exacto. Bueno, el caso es que creo que para solucionarlo el número de orden tiene que ser el título de oportunidad, creo. Ya lo veréis vosotros.
10:54 - Profit Technology: Porque me sorprendiste con tanto conocimiento de Gojailer. De verdad te lo digo.
10:59 - Be Banana: No. Estuve investigando. Entonces, pero estoy investigando porque he querido solucionaros toda la parte de... Mira, mientras hablabas, lo hice.
11:13 - Profit Technology: Claro, no lo puedo guardar. Si el gatillo es cualquiera de oportunidades, en este caso cambia a nuevo lead, por ejemplo, ya me aparece opportunity, name, whatever.
11:26 - Be Banana: Claro, pero tiene que ser en la oportunidad, tiene que estar en el título.
11:30 - Profit Technology: Sí, no hay problema, pero por ejemplo, opportunity name y ya está.
11:34 - Be Banana: Eso es.
11:35 - Profit Technology: O el custom fill que pongamos de oportunidad y ya está. Es que aquí está el número de pedido, ¿eh?
11:42 - Be Banana: A ver, claro, estaría muy bien tener el número de pedido, que es lo que yo decía, y llevarlo. [...] Habría que dejar que se dupliquen las oportunidades, eso es el paso principal. Ahora, primero, confirmación de pedido. Cuando se confirma pedido, se crea el Custom Fill número de pedido. [...] Cuando lo pasas de preparación a envío he creado una automatización, que la puedes ver, que luego las colocáis vosotros como veáis mejor, pero os lo he dejado ya avanzado. ¿Cuáles son? Pone cuatro, creo. Hay solicitud de envío realizada y luego email de pedido enviado.
13:20 - Profit Technology: Y solicitud de evolución y solicitud de pedido enviado y todas las que están... esas no son cuatro.
13:26 - Be Banana: porque no saben la nomenclatura, ok. Claro, este es el paso cuatro. Entonces, en el de solicitud de envío realizada llama al webhook de N8N, que ahí hago las llamadas HTTP a Nacex.
13:50 - Profit Technology: Eso es.
13:51 - Be Banana: Entonces... ¿Y el siguiente webhook es de...?
13:58 - Profit Technology: ¿A quién llama? A N8N. ¿Otro N8n?
14:01 - Be Banana: Todos a N8n. Te explico lo que hace cada uno.
14:06 - Be Banana: El primero hace el put recogida, que eso es que crea el envío, crea la etiqueta, devuelve el número de albarán de Nacex, que ese lo deberíamos de guardar dentro de la oportunidad como custom field.
14:25 - Profit Technology: Nacex o cualquier cosa que lo pongamos ahí.
14:27 - Be Banana: Y el link. Eso es todo lo que nos devuelve Nacex. Con la llamada del HTTP.
14:35 - Profit Technology: Ahí esperamos un día y hay una condición.
14:40 - Be Banana: Eso es. Si en un día no se ha recogido... pero ese es para enviado. [...] Eso es cuando Sara lo pasa del 3 al 4, cuando ya lo tiene preparado y quiere que Nacex lo recoja. Ahí cuando ella lo mueve, entonces llama a Nacex, hace el put recogida, agenda recogida para que vengan a por el paquete a casa de Sara, crea el envío y Nacex devuelve albarán, link y etiqueta.
16:08 - Profit Technology: ¿Pero en dónde? No, porque yo no lo estoy recibiendo.
16:13 - Be Banana: [...] Al final, él (n8n) automáticamente sube la etiqueta a GoHighLevel. Lo hace él solo.
17:03 - Be Banana: Aquí llama a Nacex [...] me lo pone estructurado en JSON porque el HTTP de Nacex me pide un formato concreto. [...] Me saca el booleano de si tengo ya albarán o no. Y si tiene albarán, lo etiqueta y lo sube a GoHighLevel.
17:42 - Profit Technology: y le pone una etiqueta, que esa etiqueta es la que está aquí. ¿Esa etiqueta al ponerla pasa algo o no pasa nada?
17:58 - Be Banana: Se etiqueta la oportunidad de ese cliente, se etiqueta el cliente. [...] Lo que se sube es el albarán y la etiqueta. La etiqueta de pegar en la caja, la que tiene que imprimir Sara. Se sube el archivo en binario, que es la etiqueta, luego coge y sube el JSON del albarán con el PDF para que también tenga los datos.
19:13 - Profit Technology: Eso es interno de ella, perfecto.
19:16 - Be Banana: Claro, y eso se sube en el cliente, que esto lo tendré que modificar, porque se tiene que subir en vez de en el cliente, en la oportunidad. Claro, pero esos campos no están creados. No, todavía no.
19:38 - Profit Technology: Ahí es donde me estaba haciendo choque la cabeza.
19:43 - Be Banana: Luego está el preparar la actualización y entonces se hace la URL de seguimiento de pedido. Se actualiza el contacto en la oportunidad. Creo que lo cambia al 4 ya. Custom Fields, el ID... Esto hay que verlo bien.
20:14 - Profit Technology: Porque claro, tú estás armando todo aquí, pues para nosotros encontrar la lógica en GoHighLevel. Por ejemplo, tú solamente con actualizar un Custom Field de oportunidad, nosotros podemos aquí hacer el resto. No tienes que hacerlo desde allá. [...] Podemos ahorrarte esos dos pasos y lo hacemos directamente aquí. Ojo, no lo borres ni nada. Lo vemos cuando ya vayamos a verlo y unificamos en N8N.
20:55 - Be Banana: Sí, me reúno con Germán y lo vemos.
21:07 - Profit Technology: Ojo, entiendo lo que estás haciendo, pero podemos unificarlo aquí entre N8N y GoHighLevel y que se simplifique y menos fallas.
21:20 - Be Banana: [enseña el doc] Aquí he puesto lo que hace.
21:50 - Be Banana: [sobre el doc Sistema Mura] ¿Cuál es la carpeta que tenéis vosotros?
22:16 - Profit Technology: Ahí tengo diseño, Docs, HTML, todo. He movido a GHL. Ya apareció. Sistema Mura.
22:32 - Be Banana: Ahora que esto está con lo del número de pedido, hay que ver con qué variable se hace. [...] Y luego te he hecho también el workflow de solicitud de envío realizada, el email de pedido enviado.
23:16 - Be Banana: Después de que esto se hace, se envía el email ya con las etiquetas, o con la URL. Lo que pasa es que he puesto este [template] porque no están los emails. Habrá que poner esto, que se puede poner fijo, Mura y el email de Mura.
23:46 - Profit Technology: Sí, eso se pone fijo o ya los toma del location name.
23:51 - Be Banana: Cuando se añade la etiqueta de compra01, así sabemos si luego hace compra02 para enviar el mail de bienvenida de nuevo, que le gusta a Sara. [...] Luego está el de pedido entregado, que tiene dos opciones. Y el 8, le acabo de corregir el formulario que no lo habías puesto, pero ya lo puse. Hice otro de devoluciones.
26:00 - Profit Technology: No, este es entregado y había dos opciones.
26:05 - Be Banana: Una, que llegue el email de está entregado y otra que pasen 24 horas. [...] El de envío realizado tiene un wait de un día. Cuando pasa un día, llama a este workflow. Este workflow saca los datos...
26:39 - Profit Technology: Si el primero le envía los datos al otro, después espera un día. Si está en la condición, si sigue en venta de pedidos 04, después de un día, va a disparar ese.
26:59 - Be Banana: Sí. Si no, hace un aviso a Sara, oye que no ha llegado, porque Nacex se supone que tarda 24 horas como mucho en entregarlo.
27:23 - Be Banana: El watchdog 24 horas ve el estado de Nacex: si está entregado, true, lo mueve al 5; si no está entregado, manda aviso a Sara.
27:41 - Profit Technology: Porque aquí se puede mandar el aviso a Sara, mas no verificar el estado de Nacex.
28:31 - Be Banana: [el otro trigger] es el trigger del email. Si recibes el email en el que dice que el pedido está entregado, con este webhook llama a este de aquí y entonces mueve la oportunidad a entregado.
28:59 - Profit Technology: Ahora sí todo tiene sentido. Ahí lo que podemos unificar es la parte de movimiento de GoHighLevel, pero es una tontería.
29:13 - Be Banana: Y el identificador, porque ahora lo tenía hecho con el Opportunity ID. Yo lo estaba identificando por Opportunity ID, pero en realidad, ahora ya se puede identificar por número de pedido.
29:37 - Profit Technology: Sí, escogiendo un Custom Field de oportunidad. Eso está creado, sí.
29:52 - Be Banana: Entonces, que el identificador clave sea el número de pedido. Que es lo que tienes que buscar ahí. En lugar de que lo busque por Opportunity ID, que lo busque por número de pedido. Y en el email hay que añadir el campo de número de pedido. ¿Por qué? Porque luego si esa persona quiere pedir la devolución, ese número de pedido lo va a tener que poner en el formulario. Por eso te hice el otro formulario y te añadí número de pedido.
30:41 - Be Banana: [Formulario v2] puse volumen 2. Esto es lo del número de pedido: "lo encuentras en tu mail de confirmación". Para que en vez de hacer la búsqueda por cliente, haga la búsqueda por pedido, por si ese cliente tiene dos pedidos. [...] Cuando tú pides una devolución, al cliente le tiene que llegar la etiqueta de imprimir de Nacex. Aquí verifico el pedido con GoHighLevel y hago una llamada a Nacex para coger la etiqueta de devolución. Esa la subo a GoHighLevel, preparo la URL [...] Le pongo la etiqueta email-08-listo. Y cuando está la etiqueta email-08-listo, en GoHighLevel, cuando recibe esta etiqueta, es cuando se activa la automatización.
32:24 - Profit Technology: Claro, pero ahí para mandarlo a GoHighLevel, ¿tú lo estás enviando cómo? Por webhook. Pero en GoHighLevel no hay nadie que lo reciba. Eso quiere decir que cuando llegue el formulario dispara el webhook, pero no lo está recibiendo.
32:43 - Be Banana: Eso lo modifica aquí a través de él (n8n), lo hace aquí.
32:53 - Profit Technology: Claro, va a sobreescribir sobre una oportunidad, sobre un campo que pongamos. Lo que va a dar es una URL, o un link. Así sí se va a poder hacer en GoHighLevel.
33:23 - Be Banana: Se lo sube para que se quede en el campo de la oportunidad. Mira, etiqueta Nacex, y que luego le llegue el email al cliente. Por eso te dije que modifiqué algunos emails. Solo he cambiado el 8 y el 2 y ya están subidos en el drive.
34:10 - Be Banana: Esto de aquí llevaba a proceso de devolución, pero te tienes que descargar la etiqueta para devolver.
34:22 - Profit Technology: Y hay que arreglar uno de los correos, porque hay que copiar el custom field de oportunidad. Definir cuál es el campo, copiarlo y pegárselo al código para que siempre sea el mismo. Eso sí hay que editarlo en el número de pedido.
34:45 - Be Banana: Claro, en el primero de número de pedido tiene que llevar número de pedido, que será la oportunidad.
34:52 - Profit Technology: Exacto, opportunity punto lo que vaya detrás, que no lo sabemos porque hay que ponerlo en automatización para ver cuál es.
34:59 - Be Banana: Porque he leído que el Opportunity son 20 dígitos. El número de pedido igual es un poco más cortito y para el cliente es más fácil copiar y pegar. [...] A Nacex yo le puedo dar un campo que es pedido, para que Nacex me lo devuelva. ¿Qué pasa? Que el Opportunity ID es hasta 20 caracteres y Nacex también es hasta 20, como que era muy justo. Pero claro, como de repente me creé un Opportunity ID de un carácter más, lo hemos cagado porque ya no lo coge Nacex y entonces no me hace el traqueo del número de pedido. Por eso digo, si el número de pedido, el original que hace GHL, es de menos caracteres, mejor utilizar eso como traqueo para seguir siempre el pedido.
36:41 - Profit Technology: Ya te entiendo, sí.
36:48 - Be Banana: Y como tampoco entendía las nomenclaturas que habíais puesto, pues os he puesto un poco para que sepáis más o menos.
37:01 - Be Banana: Lo que falta es eso, cuando se hace el pedido, todo esto no lo tengo hecho, solo he hecho las cosas relativas a Nacex. Lo único que del vuestro he visto es eso que te digo, que un cliente no podía pedir dos.
37:26 - Profit Technology: Es solamente activar la opción de duplicar oportunidades y ya está.
37:30 - Be Banana: En el sistema te voy a pegar los flujos que he visto yo, para que también lo tenga. Sobre todo para tenerlo ya definido.
38:00 - Profit Technology: Bien, lo de las pruebas sí hay que hacerlo, pero creo que tienes que activarlo tú en Stripe. Sí, cuando tengamos todos los flujos hechos. Antes de entregarle a Sara.
38:37 - Be Banana: ¿Cómo es el campo número de pedido para ponerlo ya en mis flujos de N8N?
38:44 - Profit Technology: Te vienes aquí donde dice Custom Field. Fíjate siempre de oportunidades, porque puede haber uno de contacto — el número de pedido lo hay en contacto, que fue el que tú creaste. Ese no vale.
39:13 - Be Banana: No vale porque los campos de contacto los reedita cada vez que hacen el pedido. Por eso tiene que ser este, que es de la oportunidad. [...] A mí me decía que los campos de oportunidad no se podían usar en los mails, pero claro, yo no había caído: si están dentro del flujo, sí.
39:56 - Profit Technology: Hay muchas opciones que no se pueden usar si no tienen un gatillo. Si el workflow no empieza con orden pagada o cualquier cosa de pay, no te deja seleccionar campos de pago. Depende del gatillo que vaya.
40:33 - Be Banana: Y ese será el valor de ID estándar para identificar todo. Ese es el que voy a usar.
40:41 - Profit Technology: Lo único es lo que tú dijiste ahorita: si tienen todos los mismos dígitos, más o menos.
40:50 - Be Banana: Pero seguro que es menos que el Opportunity ID porque el Opportunity ID ya he visto que son 20.
41:00 - Profit Technology: ¿Este número lo da Stripe o...?
41:06 - Be Banana: No lo sé, no lo he revisado. Creo que lo hace GHL cuando haces el pedido.
41:32 - Profit Technology: No, tiene que ser Stripe, porque GHL nada más es un puente. Todo lo que se muestra en GoHighLevel es un espejo de Stripe. [muestra Payments → Orders → Internal Order ID]
42:15 - Be Banana: Pero ese Order ID para el cliente, en un email poner "tu número de orden es este", es como muy crazy. Igual hacer un Custom Field que esté dentro de la oportunidad y que sea Order ID.
42:41 - Profit Technology: Claro, pero ese Order ID lo va a generar Stripe.
42:49 - Be Banana: Lo que yo digo no es eso. Imagínate que en Stripe se genera ese ID y el pedido y entonces se hace la oportunidad. Puede ser que cuando se hace la oportunidad nueva, hagamos una automatización que añada un campo dentro de la oportunidad que sea un Order ID interno nuestro de Mura, como M001.
43:19 - Profit Technology: Sí, se pudiera. Es un workflow que va sumando y actualizando un campo.
44:00 - Be Banana: Y si vemos que es un número muy largo, pues ver la manera de poner un número de ID un poco más visual y que quede siempre dentro de la oportunidad, dentro de la tarjeta. Y si ese Custom Field lo podemos usar en los emails, pues ya estaría cerrado el flujo.
44:26 - Profit Technology: [Explora IDs en Stripe/GHL: Internal Order ID, Transaction ID, Alt ID, huella digital... ninguno concuerda claramente]
47:25 - Be Banana: Habría que ver la manera de que esa oportunidad lleve un número que sea de pedido para referencia interna y que nosotros con eso ya sepamos asociar cualquier gestión de Nacex a ese pedido en concreto.
48:03 - Profit Technology: Supongamos que yo quiero actualizar una oportunidad. Como este tiene un gatillo de Payment, si yo aquí me bajo, sale Payment: source, current, code, invoice, discount, coupon, ID transaction...
48:39 - Be Banana: Claro, pero como casi todos los gatillos van a ser de oportunidad, de mover de uno a otro, entonces se tienen que coger los datos de la oportunidad.
48:51 - Profit Technology: Claro, pero en alguna automatización tenemos que jalar este para que de aquí actualicemos el campo y poderlo llevar para allá. Pero solo en la primera en la que se hace el pago.
49:06 - Be Banana: Solo en la primera en la que se hace la compra y ahí es donde se genera el ID interno para que nosotros lo gestionemos.
49:23 - Profit Technology: Lo que hay que hacer es el custom field tal y meterle un math, una operación matemática. [demuestra: custom value contador + add 1 + guardar en custom field]
50:19 - Be Banana: Y entonces, cada vez que se cambie la oportunidad, ese custom value lo va a llevar la oportunidad y lo vamos a poder sacar. Siempre va a ser distinto para todos.
50:59 - Be Banana: ¿Eso de que se vaya sumando puede repetirse con los anteriores?
51:05 - Profit Technology: No, repetirse no se va a repetir porque la automatización lo va a estar sumando. Lo que hay que verificar es que con seis dígitos: 000001, 000002...
51:28 - Be Banana: Y luego hay que hacer un aviso, si llega a 999999, que avise a Sara.
51:36 - Profit Technology: Eres millonaria, paga más.
51:46 - Profit Technology: [recapitula] Supuestamente faltan fotos de la ropa → preguntar cuáles. Estás automatizada con Nacex, perfecto. Hay cuatro workflows nuevos que no tienen la nomenclatura. Hacen falta los correos. "Necesito añadir un tag a este workflow, no me deja, tag email04 listo".
52:46 - Be Banana: Yo pulsaba en el más y no hacía nada.
52:56 - Profit Technology: [demuestra] Primero se crea el tag, después se selecciona.
53:40 - Be Banana: Primero el huevo y después la gallina.
54:00 - Be Banana: Lo que yo quería: en el 04, cuando n8n añade el enlace que le ha devuelto Nacex para seguimiento de pedido, lo añade a la oportunidad y añade la etiqueta email-04. Por eso ese trigger es cuando se ha añadido esa etiqueta.
54:36 - Profit Technology: Sí, está bien, súper bien. Lo que te faltaba era crearla aquí en GHL porque no existía en este lado.
54:57 - Profit Technology: Yo mañana estoy aquí currando todo el día.
55:04 - Profit Technology: [tema aparte: certificaciones GHL, directorio, consultorías]
57:36 - Be Banana: Qué bien, pues te abandono, que voy a cenar. Yo le digo a Sara que ya lo he hablado contigo. Aquí ya con Mura también aprendimos a tener todo antes...
58:04 - Profit Technology: porque se ha hecho muy larga Mura.
58:09 - Be Banana: Lo bueno es que luego es replicable todo lo que hagamos para Moncho. Y con lo de N8N y todo, porque ya tengo la docu de Nacex. Va a usar Nacex, ya se lo he dicho yo.
58:31 - Be Banana: Bueno, pues vamos hablando. Que voy a cenar. Chao, comandante.
58:39 - Profit Technology: Chao.
```
