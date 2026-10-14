# Meta por API: el modelo de agencia

*Un usuario del sistema, una app y un token en el **portafolio comercial de
Profit Technology**, válidos para todos los clientes. Cada cliente comparte sus
activos con Profit como socio. MÛRA es el primero que entra así. Las llamadas se
hacen desde las sesiones de Claude con `curl` a la Graph API; no hay CLI.*

Por qué así y no una app por cliente: con una app dentro del portafolio del
cliente hay un usuario del sistema, una app y un token por cada uno, y hace falta
que cada cliente nos haga administrador. Con el modelo de agencia el token es
siempre el mismo y lo único que cambia entre clientes son los ids.

## 1. Una sola vez, en el portafolio de Profit

En [business.facebook.com](https://business.facebook.com) con el portafolio de
Profit Technology seleccionado.

1. **ID del portafolio:** Configuración del negocio → Información del negocio.
   Es el que se les da a los clientes para que nos añadan como socio.
   Hoy: `[ID_PORTAFOLIO_PROFIT]`.
2. **Usuario del sistema:** Usuarios → Usuarios del sistema → Añadir. Nombre
   `ads-cli` (sin espacios: con espacios falla después), rol **Administrador**.
   Uno solo para toda la agencia.
3. **La app:** [developers.facebook.com/apps](https://developers.facebook.com/apps)
   → Crear app.
   - Caso de uso: **Otro → Negocio**.
   - Portafolio comercial: **el de Profit**. Si se elige otro, el token da
     `(#200) Provide valid app ID`.
   - Casos de uso: solo «Crear y administrar anuncios con la API de marketing».
   - Nombre: `Profit Ads`. Correo de contacto: uno de Profit que se lea.
4. **Asignar la app al usuario del sistema.** Business Suite → Configuración →
   Cuentas → Apps → la app → Asignar acceso → `ads-cli` → control total. **Es el
   paso que se salta todo el mundo**, y el error que da después no lo menciona.
5. **Generar el token:** Usuarios del sistema → `ads-cli` → Generar token.
   - App: `Profit Ads`.
   - Caducidad: **Nunca**. Después de generarlo, comprobar que de verdad pone
     «Nunca» y anotar la fecha: hubo un token que figuraba así y venció a los
     60 días.
   - Permisos:
     - `business_management`
     - `ads_management`
     - `ads_read`
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_ads`
     - `instagram_basic` (sin él no se listan publicaciones de Instagram, y
       promocionar reels ya publicados es lo que mejor ha funcionado en otros
       clientes)
     - `instagram_manage_insights`
     - `leads_retrieval` (por si hay formularios instantáneos)
   - Se muestra una sola vez. Al apartado 3 directamente.

## 2. Por cada cliente: MÛRA

Profit **no** está como empresa en el portafolio de MÛRA: Sara dio acceso a
Henry y a Oliver **como personas**. Eso basta, siempre que uno de los dos tenga
**control total** (administrador) del portafolio de MÛRA. Desde ahí, esa persona
añade a Profit como socio (punto 2) sin pedirle nada a Sara, salvo la tarjeta.
Si solo tienen acceso parcial, Sara tiene que subirles el rol o compartir ella
los activos.

Por qué no basta con el acceso personal: el usuario del sistema `ads-cli` vive
en el portafolio de Profit, y solo ve activos que estén compartidos **con el
portafolio de Profit**, no con personas sueltas.

1. **Si no existen todavía, en el portafolio de MÛRA:**
   - cuenta publicitaria en **EUR** y zona horaria **Madrid**, con la tarjeta de
     Sara. Moneda y zona horaria no se pueden cambiar después, y la cuenta no se
     puede sacar del portafolio;
   - conjunto de datos (el píxel), «MÛRA web», en Orígenes de datos.
2. **Que Profit tenga los activos.** ID del portafolio de MÛRA:
   **`1650663796846832`**. Dos vías:
   - **Vía A (recomendada): Profit los pide.** Portafolio de Profit →
     Configuración → Socios → «Solicitar acceso a activos de un socio» → pegar
     `1650663796846832` → marcar los activos de abajo → enviar. La aprueba
     quien tenga control total en MÛRA (Sara, o Henry u Oliver si son
     administradores) desde el portafolio de MÛRA → Solicitudes.
   - **Vía B: MÛRA los da.** Portafolio de MÛRA → Configuración → Socios →
     Añadir socio → ID de Profit.

   Activos y permiso:
   - cuenta publicitaria → administrar campañas;
   - página de Facebook → acceso total (sin esto no se crean anuncios ni
     formularios; es lo que más se olvida);
   - cuenta de Instagram @bymurastudio;
   - conjunto de datos / píxel.

   Lo que no exista todavía (punto 1) no se puede pedir: primero se crea.
3. **En el portafolio de Profit:** Cuentas publicitarias → la cuenta de MÛRA →
   Asignar acceso → `ads-cli` → administrar campañas. Lo mismo con la página, el
   Instagram y el conjunto de datos.
4. **No se genera token nuevo.** Con el mismo token, la cuenta de MÛRA tiene que
   aparecer en `me/adaccounts` (apartado 4). Si aparece, el acceso quedó bien.

## 3. Credenciales

En un `.env` **local**, que `.gitignore` ya excluye. Nunca en el repo, en un
artefacto ni pegadas en el chat. El token es uno; por cliente cambian los ids.

```
META_APP_ID=
META_BUSINESS_ID_PROFIT=
META_ACCESS_TOKEN=          # token de ads-cli, el de la agencia
# ids de MÛRA
META_BUSINESS_ID_MURA=1650663796846832
META_AD_ACCOUNT_ID=act_     # con el prefijo act_, obligatorio
META_PAGE_ID=
META_IG_USER_ID=
META_PIXEL_ID=
META_CAPI_TOKEN=            # token del conjunto de datos: Events Manager → el conjunto → Configuración → Generar token
```

Antes de cada commit: `grep -rE 'AMf-|pit-|EAA' .` tiene que salir vacío. Los
tokens de Meta empiezan por `EAA`.

## 4. Comprobar

Con las variables cargadas (`set -a; source .env; set +a`):

```bash
# 1. Cuentas a las que llega el token: la de MÛRA tiene que estar
curl -s "https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_status,currency,timezone_name&access_token=$META_ACCESS_TOKEN"

# 2. Campañas de MÛRA (vacío si aún no hay)
curl -s "https://graph.facebook.com/v21.0/$META_AD_ACCOUNT_ID/campaigns?fields=name,status&access_token=$META_ACCESS_TOKEN"

# 3. Página e Instagram
curl -s "https://graph.facebook.com/v21.0/$META_PAGE_ID?fields=name,instagram_business_account&access_token=$META_ACCESS_TOKEN"

# 4. Publicaciones de Instagram (prueba de instagram_basic)
curl -s "https://graph.facebook.com/v21.0/$META_IG_USER_ID/media?fields=id,media_type,permalink&limit=3&access_token=$META_ACCESS_TOKEN"

# 5. Evento de prueba al píxel (el código sale de Events Manager → Probar eventos)
curl -s -X POST "https://graph.facebook.com/v21.0/$META_PIXEL_ID/events" \
  -d "access_token=$META_CAPI_TOKEN" \
  -d 'data=[{"event_name":"PageView","event_time":'"$(date +%s)"',"action_source":"website","event_source_url":"https://www.stylebymura.com/","user_data":{"client_user_agent":"test"}}]' \
  -d "test_event_code=TESTXXXX"
```

Lo esperado: la cuenta con `currency: EUR` y `account_status: 1`; la página con
un `instagram_business_account.id`; el evento con `events_received: 1`.

| Error | Qué falta |
|---|---|
| `(#200) Provide valid app ID` | La app no está asignada a `ads-cli` (paso 1.4) |
| `act_… not found` o no aparece en `me/adaccounts` | `ads-cli` no tiene la cuenta asignada en Profit (paso 2.3), o MÛRA no la compartió (2.2) |
| `(#190) Invalid OAuth access token` | Token revocado o vencido: regenerar y revisar la caducidad |
| Error 100 al listar campañas | Faltan permisos: regenerar con la lista completa |
| Instagram vacío o `(#10)` | Falta `instagram_basic` o la cuenta de Instagram no está compartida |

## 5. Reglas de uso desde Claude

- Sin pedir permiso: crear campañas, conjuntos y anuncios **en pausa**, leer
  insights, subir creatividades, pausar o retirar.
- **Solo con confirmación expresa de German:** activar una campaña, cambiar un
  presupuesto o un método de pago.
- Las campañas siguen `campanas-meta.md`: una campaña de Ventas, un conjunto,
  creatividades por colección.

## 6. Más adelante

- **Acceso avanzado.** La app arranca en modo desarrollo, con límites de
  llamadas bajos. Para uno o dos clientes basta; cuando haya varios y se tiren
  informes seguidos, pedir acceso avanzado a `ads_management` desde el panel de
  la app. No hace falta ahora; se sabe cuando aparecen errores de límite.
- **Otros clientes** entran con el mismo apartado 2: compartir activos, asignar
  `ads-cli`, cambiar los ids del `.env`.
