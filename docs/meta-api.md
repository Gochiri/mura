# Meta por API: app y token dentro del portafolio de MÛRA

*Decisión de German (14/10): todo se crea **directamente en el portafolio de
MÛRA** (ID `1650663796846832`). Usuario del sistema, app y token son de MÛRA y
solo sirven para MÛRA. Henry y Oliver entran con su acceso personal al
portafolio, que tiene que ser de **administrador** (control total). Las llamadas
se hacen desde las sesiones de Claude con `curl` a la Graph API.*

Nada de esto toca el portafolio de Profit ni su `ads-cli`.

## 1. Lo que tiene que existir antes

En [business.facebook.com](https://business.facebook.com), **con el portafolio
de MÛRA seleccionado** arriba a la izquierda. Si te quedas en el de Profit, todo
se crea en el sitio equivocado.

- **Comprobar el rol:** Configuración → Usuarios → Personas → tu nombre → tiene
  que poner control total. Si no, no aparecerá «Usuarios del sistema» y Sara
  tiene que subirte el rol.
- **Página de Facebook** e **Instagram @bymurastudio** en Configuración →
  Cuentas.
- **Cuenta publicitaria** en **EUR** y zona horaria **Madrid**, con la tarjeta
  de Sara. Moneda y zona horaria no se cambian después. ID: `[act_…]`.
- **Píxel**: ya creado, ID **`1799475611078369`**. No se carga en la web hasta
  que esté el banner de consentimiento.

## 2. Usuario del sistema

Configuración → Usuarios → **Usuarios del sistema** → Añadir.

- Nombre: `ads-cli-mura` (sin espacios).
- Rol: **Administrador**.
- **Asignar activos** con control total: la cuenta publicitaria, la página, la
  cuenta de Instagram y el píxel.

Meta limita los usuarios del sistema en portafolios sin verificar (suele dejar
uno administrador y uno normal). Si no deja crearlo, mirar si ya hay alguno de
otra integración.

## 3. La app

[developers.facebook.com/apps](https://developers.facebook.com/apps) → Crear app.

- Nombre: `MURA Ads` (la Û no la admite). Correo de contacto: uno que se lea.
- Caso de uso: **Otro → Negocio**.
- Portafolio comercial: **el de MÛRA**. Si se elige otro, el token da
  `(#200) Provide valid app ID`.
- Casos de uso: «Crear y administrar anuncios con la API de marketing».
- Se queda en modo desarrollo: para tocar solo activos del propio portafolio no
  hace falta revisión de app.

Después, **asignar la app al usuario del sistema**: portafolio de MÛRA →
Configuración → Cuentas → Apps → `MURA Ads` → Asignar acceso → `ads-cli-mura` →
control total. Es el paso que se salta todo el mundo, y el error que da después
no lo menciona.

## 4. El token

Usuarios del sistema → `ads-cli-mura` → **Generar token**.

- App: `MURA Ads`.
- Caducidad: **Nunca**. Después, comprobar que de verdad pone «Nunca» y anotar
  la fecha: hubo un token que figuraba así y venció a los 60 días.
- Permisos:
  - `business_management`
  - `ads_management`
  - `ads_read`
  - `pages_show_list`
  - `pages_read_engagement`
  - `pages_manage_ads`
  - `instagram_basic` (sin él no se listan las publicaciones de Instagram ni se
    promocionan reels ya publicados)
  - `instagram_manage_insights`
  - `leads_retrieval` (por si hay formularios instantáneos)
- Se muestra una sola vez.

Para la **API de Conversiones** hace falta otro token: Events Manager → el
píxel → Configuración → «Generar token de acceso».

## 5. Credenciales

En un `.env` **local**, que `.gitignore` ya excluye. Nunca en el repo, en un
artefacto ni pegadas en el chat.

```
META_APP_ID=
META_BUSINESS_ID=1650663796846832
META_ACCESS_TOKEN=          # token de ads-cli-mura
META_AD_ACCOUNT_ID=act_     # con el prefijo act_, obligatorio
META_PAGE_ID=
META_IG_USER_ID=
META_PIXEL_ID=1799475611078369
META_CAPI_TOKEN=            # token del píxel (Events Manager)
```

Antes de cada commit: `grep -rE 'AMf-|pit-|EAA' .` tiene que salir vacío. Los
tokens de Meta empiezan por `EAA`.

## 6. Comprobar

Con las variables cargadas (`set -a; source .env; set +a`):

```bash
# 1. La cuenta publicitaria de MÛRA
curl -s "https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_status,currency,timezone_name&access_token=$META_ACCESS_TOKEN"

# 2. Campañas (vacío si aún no hay)
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
| `(#200) Provide valid app ID` | La app no está asignada a `ads-cli-mura`, o se creó en otro portafolio |
| `act_… not found` o lista vacía | `ads-cli-mura` no tiene la cuenta publicitaria asignada |
| `(#190) Invalid OAuth access token` | Token revocado o vencido: regenerar y revisar la caducidad |
| Error 100 al listar campañas | Faltan permisos: regenerar con la lista completa |
| Instagram vacío o `(#10)` | Falta `instagram_basic` o la cuenta de Instagram no está asignada |

## 7. Reglas de uso desde Claude

- Sin pedir permiso: crear campañas, conjuntos y anuncios **en pausa**, leer
  insights, subir creatividades, pausar o retirar.
- **Solo con confirmación expresa de German:** activar una campaña, cambiar un
  presupuesto o un método de pago.
- Las campañas siguen `campanas-meta.md`: una campaña de Ventas, un conjunto,
  creatividades por colección.

## 8. A tener en cuenta

- Todo es de Sara: si algún día quita el acceso o borra el usuario del sistema,
  el token deja de servir. Es lo transparente para ella.
- Si Profit suma más clientes, se puede montar aparte el modelo de agencia (un
  `ads-cli` en el portafolio de Profit al que los clientes comparten activos).
  Para MÛRA no hace falta.
