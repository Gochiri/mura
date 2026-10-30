# La campaña en Meta (creada el 21/10, en pausa)

> **30/10: recreada en la cuenta nueva.** La cuenta anterior (`act_1650663796846832`) se
> borró y con ella la campaña del 21/10. Hoy, con `tienda/meta-campana.sh` y el token de
> `muraescli` (portafolio de Profit, `docs/meta-api.md`), se crearon **en pausa** en
> `act_1141864065246239` («Mura - ES»): campaña `52585971203356` y conjunto
> `52585971218156`, mismos parámetros que abajo, pero optimizando al píxel nuevo
> **`1577201230843977`** («mura es pixel», de Profit). Quedan sin activar, sin anuncios,
> y sin tarjeta en la cuenta. **Aviso:** el código de la web (`tienda/`) aún carga el
> píxel viejo `1799475611078369`; hay que cambiarlo (con el visto bueno de German) antes de
> activar, o el conjunto optimizaría a un píxel que no recibe nada.

| Qué | Nombre | ID |
|---|---|---|
| Campaña | MÛRA · Ventas · Cápsula 01 | `52585971203356` (la del 21/10, `52549695358270`, se perdió) |
| Conjunto | Mujeres 28–48 · España · Advantage+ | `52585971218156` (el del 21/10, `52549695445670`, se perdió) |

**Campaña:** objetivo Ventas (`OUTCOME_SALES`), subasta, presupuesto en el
conjunto (no CBO), sin categorías especiales.

**Conjunto:** 22 €/día, optimiza a **Añadir al carrito** del píxel
`1577201230843977` (era `1799475611078369`), puja de menor coste, destino web, inicio **2/11/2026 a las
9:00** (hora de Madrid), ubicaciones automáticas. Público: audiencia Advantage+
con los controles que la API admite (mujeres, España, 25–65). El **28–48 del
plan se pone como sugerencia** en el Administrador de anuncios → conjunto →
Audiencia → «Sugerencia de edad»; la API no lo admite como control. Anunciante y
pagador (Ley de Servicios Digitales): MÛRA.

**Dónde verla:** business.facebook.com → Administrador de anuncios → cuenta
«Mura - ES» (`act_1141864065246239`). `./tienda/meta-campana.sh --ver` la lista por
API.

## Lo que falta para poder activarla

1. **Método de pago en la cuenta publicitaria.** El 21/10 no tiene ninguno:
   Sara lo pone en Administrador de anuncios → Facturación → Añadir método de
   pago, en la cuenta «Mura».
2. **Los anuncios** (`plan-contenido.md`): cada uno con sus 3 textos y 6 títulos
   como variantes. Se crean en pausa con el creativo subido.
3. **Purchase por GHL** (`capi-purchase-ghl.md`), para que Meta sepa qué
   anuncio vende.
4. **Dominio verificado** (`meta-api.md`).

Activar la campaña o cambiar su presupuesto, solo con el visto bueno de German.

## Avisos de la API que ya nos han costado un intento

- La campaña exige `is_adset_budget_sharing_enabled` (true/false) si no usa
  presupuesto de campaña.
- El conjunto exige `dsa_beneficiary` y `dsa_payor` (UE).
- Con `advantage_audience=1`, `age_min` no puede pasar de 25 ni `age_max` bajar de
  65: lo demás va como sugerencia en la interfaz.
- Los valores con `+` (el nombre, la zona horaria de `start_time`) van con
  `--data-urlencode`, o curl los convierte en espacios. `start_time` no se puede
  editar después: hubo que borrar y recrear el conjunto.
