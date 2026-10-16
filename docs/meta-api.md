# Meta por API: app y token dentro del portafolio de MÛRA

*Decisión de German (14/10): todo vive **en el portafolio de MÛRA** (ID `1239463275926698`, confirmado el 16/10 en Información del negocio; `1650663796846832` es el ID de la cuenta publicitaria, no el del portafolio). Usuario del sistema, app y token son de MÛRA y solo sirven
para MÛRA. Henry y Oliver entran con su acceso personal al
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
  de Sara. Moneda y zona horaria no se cambian después. ID: `act_1650663796846832` (comprobado el 16/10: «Mura», EUR, activa).
- **Píxel**: ya creado, ID **`1799475611078369`**. No se carga en la web hasta
  que esté el banner de consentimiento.

## 2. Usuario del sistema y app: ya existen

Al crear el píxel, Meta creó solos en el portafolio de MÛRA:

- **Usuario del sistema** `Conversions API System User` (ID `61595501576203`),
  rol Empleado. Basta: gestiona campañas si tiene los activos asignados.
- **App** `Conversions API Application`, ya asignada a ese usuario.

Se reutilizan. No hace falta crear otros, y así se evita el aviso de Meta de que
el administrador debe llevar 7 días en el portafolio para crear usuarios del
sistema con rol Administrador.

**Activos asignados** al usuario, todos con acceso total (comprobado el 14/10):
página MÛRA, cuenta publicitaria Mura, la app, el píxel Mura Pixel e Instagram
@bymurastudio.

## 3. La app: `MURA Ads`

Creada el 14/10 en developers.facebook.com, propiedad de MÛRA, ID
**`1139141968627775`**, y asignada al usuario del sistema con acceso total. La
`Conversions API Application` que Meta crea con el píxel **no sirve** para
generar tokens (el botón sale gris con «una app debe formar parte de este
portfolio»).

Caso de uso de la app hoy: solo «Crear y administrar anuncios con la API de
marketing». Por eso el token solo ofrece seis permisos. Se añadió después el de
Instagram (developers.facebook.com → `MURA Ads` → Casos de uso) y el token se
regeneró el 16/10; ver los permisos en el apartado 4.

## 4. El token

Usuarios del sistema → `Conversions API System User` → **Generar token**.

- App: `Conversions API Application`.
- Caducidad: **Nunca**. Después, comprobar que de verdad pone «Nunca» y anotar
  la fecha: hubo un token que figuraba así y venció a los 60 días.
- Permisos disponibles con el caso de uso actual (los seis marcados el 14/10):
  `ads_management`, `ads_read`, `business_management`, `pages_manage_ads`,
  `pages_read_engagement`, `pages_show_list`.
- Con el caso de uso de Instagram (token regenerado el 16/10) se añadieron
  `instagram_basic`, `instagram_manage_insights` y otros de Instagram
  (publicar, comentarios, mensajes). Sigue sin `leads_retrieval`: solo hace
  falta si hay anuncios de formulario.
- Se muestra una sola vez.

Para la **API de Conversiones** hace falta otro token: Events Manager → el
píxel → Configuración → «Generar token de acceso».

## 5. Credenciales

En un `.env` **local**, que `.gitignore` ya excluye. Nunca en el repo, en un
artefacto ni pegadas en el chat.

```
META_APP_ID=1139141968627775
META_BUSINESS_ID=1239463275926698
META_ACCESS_TOKEN=          # token de Conversions API System User
META_AD_ACCOUNT_ID=act_1650663796846832     # con el prefijo act_, obligatorio
META_PAGE_ID=
META_IG_USER_ID=17841410968485139   # @bymurastudio
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
  -d 'data=[{"event_name":"PageView","event_time":'"$(date +%s)"',"action_source":"website","event_source_url":"https://www.stylebymura.com/","user_data":{"client_user_agent":"Mozilla/5.0 (test)","client_ip_address":"203.0.113.10"}}]' \
  -d "test_event_code=TESTXXXX"
```

Lo esperado: la cuenta con `currency: EUR` y `account_status: 1`; la página con
un `instagram_business_account.id`; el evento con `events_received: 1`.

| Error | Qué falta |
|---|---|
| `(#200) Provide valid app ID` | La app no está asignada al usuario del sistema |
| `act_… not found` o lista vacía | El usuario del sistema no tiene la cuenta publicitaria asignada |
| `(#190) Invalid OAuth access token` | Token revocado o vencido: regenerar y revisar la caducidad |
| Error 100 al listar campañas | Faltan permisos: regenerar con la lista completa |
| Error 100, subcódigo `2804050` al enviar un evento | Faltan datos del cliente: `user_data` necesita `client_user_agent` y `client_ip_address` |
| El evento da `events_received: 1` pero no sale en «Probar eventos» | El código de test no es el de una sesión activa: dejar la pestaña abierta y copiar el código que muestra. El evento se ha registrado como real |
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
