# Meta: app y token para operar los anuncios de MÛRA por API

*Para que Claude (o cualquier script) pueda crear campañas, leer resultados y
subir creatividades desde fuera del Administrador de anuncios. La app se crea en
el **portafolio comercial de MÛRA**, que es de Sara; Profit entra como socio.*

**Una sola app sirve para anuncios e Instagram.** No hace falta crear dos: en el
paso «Casos de uso» se marcan los dos. Dos apps significan dos tokens, dos
revisiones y dos sitios donde se rompe lo mismo.

## 0. Antes de la app: el Business Manager de MÛRA

Todo esto en [business.facebook.com](https://business.facebook.com), con la
cuenta de Sara o con la de German si ya es administrador.

1. **Portafolio comercial** de MÛRA creado, con la **página de Facebook** y la
   cuenta de **Instagram @bymurastudio** vinculadas (Configuración → Cuentas).
2. **Cuenta publicitaria** nueva dentro del portafolio, en EUR, con la **tarjeta
   de Sara** como método de pago. Es lo acordado: la inversión no pasa por Profit.
3. **Píxel**: Configuración → Orígenes de datos → Conjuntos de datos → crear uno
   («MÛRA web»). Anotar su id.
4. **Profit como socio**: Configuración → Socios → Añadir socio → id del
   portafolio de Profit Technology. Darle **administrador** en la cuenta
   publicitaria, la página, el conjunto de datos y la cuenta de Instagram.

Sin el paso 4, German trabaja con el usuario de Sara, y eso es lo que queremos
evitar.

## 1. Crear la app (developers.facebook.com → Mis aplicaciones → Crear)

| Paso | Qué poner |
|---|---|
| Detalles | Nombre: `MURA Ads` (la Û no la admite). Correo de contacto: uno de MÛRA o de Profit que se lea; no un correo personal. |
| Casos de uso | Marcar **«Gestionar anuncios»** (activa la Marketing API) y **«Gestionar todo en Instagram»** (activa la API de Instagram). |
| Empresa | Elegir el **portafolio de MÛRA**. |
| Requisitos | Aceptar lo que pida (normalmente solo las condiciones). |
| Información general | Revisar y crear. |

Después, en la app:

- **Configuración → Básica**: rellenar política de privacidad
  (`https://www.stylebymura.com/politica-privacidad`) y categoría «Compras». Sin
  esto la app no puede pasar a modo activo, aunque de momento no hace falta.
- **Modo de desarrollo es suficiente** mientras la app solo toque activos del
  propio portafolio (su cuenta publicitaria, su página, su Instagram). No hace
  falta revisión de app ni acceso avanzado para eso.

## 2. El token: usuario del sistema, no usuario personal

Un token de persona caduca y muere si esa persona pierde el acceso. El de un
usuario del sistema no.

1. Business Manager → Configuración → **Usuarios → Usuarios del sistema → Añadir**.
   Nombre `claude-ads`, rol **Administrador**.
2. **Asignar activos**: la cuenta publicitaria, la página, el conjunto de datos y
   la cuenta de Instagram, todos con control total.
3. **Generar token** → elegir la app `MURA Ads` → caducidad **Nunca** → permisos:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_manage_insights`
4. Copiar el token **una sola vez** y guardarlo donde dice el apartado 3. Meta no
   lo vuelve a enseñar.

Para la **API de Conversiones** hace falta otro token distinto: Events Manager →
el conjunto de datos → Configuración → «Generar token de acceso». Ese va en
`META_CAPI_TOKEN`.

## 3. Dónde viven las credenciales

En un `.env` **local**, que `.gitignore` ya excluye. Nunca en el repo, en un
artefacto ni pegado en el chat.

```
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=        # token del usuario del sistema
META_CAPI_TOKEN=          # token del conjunto de datos (Events Manager)
META_AD_ACCOUNT_ID=act_   # con el prefijo act_
META_PIXEL_ID=
META_PAGE_ID=
META_IG_USER_ID=
```

Antes de cada commit: `grep -rE 'AMf-|pit-|EAA' .` tiene que salir vacío. Los
tokens de Meta empiezan por `EAA`.

## 4. Comprobar que funciona

Con las variables cargadas (`set -a; source .env; set +a`):

```bash
# ¿El token ve la cuenta publicitaria?
curl -s "https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_status,currency&access_token=$META_ACCESS_TOKEN"

# ¿Puede leer campañas? (vacío si aún no hay)
curl -s "https://graph.facebook.com/v21.0/$META_AD_ACCOUNT_ID/campaigns?fields=name,status&access_token=$META_ACCESS_TOKEN"

# ¿Llega a la cuenta de Instagram?
curl -s "https://graph.facebook.com/v21.0/$META_PAGE_ID?fields=instagram_business_account&access_token=$META_ACCESS_TOKEN"

# ¿El píxel recibe eventos de prueba? (Events Manager → Probar eventos da el código)
curl -s -X POST "https://graph.facebook.com/v21.0/$META_PIXEL_ID/events" \
  -d "access_token=$META_CAPI_TOKEN" \
  -d 'data=[{"event_name":"PageView","event_time":'"$(date +%s)"',"action_source":"website","event_source_url":"https://www.stylebymura.com/","user_data":{"client_user_agent":"test"}}]' \
  -d "test_event_code=TESTXXXX"
```

Lo esperado: la cuenta con `currency: EUR` y `account_status: 1`; el Instagram
con un `id`; el evento de prueba con `events_received: 1`.

## 5. Reglas de uso desde Claude

- Crear campañas, conjuntos y anuncios **en pausa**; leer insights; subir
  creatividades; pausar o retirar: sin pedir permiso.
- **Activar** una campaña, **cambiar un presupuesto** o un método de pago:
  siempre con confirmación expresa de German en el chat.
- Las campañas siguen el plan de `campanas-meta.md`: una campaña de Ventas, un
  conjunto, creatividades por colección.
