# Oportunidades de prueba borradas · 23/8

Las 6 del pipeline **Ventas/Pedidos** (`X7wvJysuBVmdXXl1b8zx`), todas de las
pruebas de agosto. `antes.json` es el volcado completo antes de borrarlas.

```
M100018          sonia@letsbebanana.com          17/8   etapa 05
M100017          javi_xtrem_84@gmail.com         16/8   etapa 03
M100016          javi_xtrem_84@gmail.com         16/8   etapa 03
M100007          javi_xtrem_84@gmail.com         13/8   etapa 02
M100004          javi_xtrem_84@gmail.com         13/8   etapa 05
TEST-TRIGGER03   testmanana-claude@example.com    9/8   devolución
```

`DELETE /opportunities/{id}` — las seis devolvieron `success: true`, y una
relectura del pipeline da **0 oportunidades**.

El custom value **Contador Pedidos** se puso en `100000` (venía de `100018`),
así que el primer pedido real de Sara será el M100001.

## Lo que NO se borró, y por qué

- **Los 18 pedidos de pago.** No hay ruta de borrado en ninguna de las dos APIs
  y GHL no deja: son registros de pago. Da igual, están en `liveMode: false`.
- **Los contactos de prueba.** Se dejan a propósito: son con los que se
  probaron los flujos y borrarlos se lleva por delante ese historial.
## Leads/Comunidad: borradas también (mismo día)

`leads_antes.json` guarda las dos: *German Emiliano Borrello* (25/8) y
*Laura Perez* con el correo de Javi (17/8). Los dos pipelines quedan a cero.

⚠️ **El buscador de oportunidades va con retraso.** Justo después de los dos
`DELETE` —los dos con `success: true`— `/opportunities/search` seguía
devolviendo las dos. No era un borrado fallido: `GET /opportunities/{id}`
daba **404** en las dos, y a los pocos segundos el buscador ya devolvía 0.
Conviene recordarlo: para comprobar un borrado, preguntar por id, no por el
buscador.
