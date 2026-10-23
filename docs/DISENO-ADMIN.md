# Sistema de diseño del panel — rotti-zeria

Todo lo que se ve en `/admin` sale de este documento. Si algo no está acá, no
debería estar en el código.

**Alcance:** panel de administración (tema oscuro de madera). La tienda mantiene
su tema claro; comparte tipografía y paleta base, no los tokens de superficie.

---

## 1. Principios

1. **Un color, un significado.** Si dos cosas se ven iguales, son lo mismo. Si
   son distintas, se distinguen por color, no por posición.
2. **El color comunica estado, no decora.** Las tarjetas de pedido se colorean
   por estado; el resto del panel es neutro para que el color signifique algo.
3. **Nada de hex sueltos.** Los tokens viven en `app/globals.css` (`@theme`).
   Si falta un color, se agrega ahí, no en el componente.
4. **Un primitivo por problema.** Un botón, un input, una tabla, un diálogo.
   Si una pantalla necesita algo distinto, se extiende el primitivo.
5. **El vacío y la carga se diseñan.** Un `null` no se muestra con un párrafo
   gris: se muestra con `EmptyState` o `Skeleton`.

---

## 2. Tokens

Definidos en `app/globals.css` dentro de `@theme`, así Tailwind 4 genera las
utilidades (`bg-ink-900`, `text-pending`, `rounded-card`, `shadow-panel`).

### 2.1 Superficies

| Token | Valor | Utilidad | Uso |
|---|---|---|---|
| `--color-ink-950` | `#120605` | `bg-ink-950` | Fondo del panel, inputs, cabecera de tabla |
| `--color-ink-900` | `#1a0b07` | `bg-ink-900` | Tablas, tarjetas sólidas |
| `--color-ink-850` | `#20100a` | `bg-ink-850` | Diálogos modales |
| `--color-ink-800` | `#26130c` | `bg-ink-800` | Tarjetas de grilla |
| `--color-ink-700` | `#2f1810` | `bg-ink-700` | Estados hover de superficie |
| `--color-ink-600` | `#3b2019` | `bg-ink-600` | Reserva (bordes activos) |

### 2.2 Texto y acento

| Token | Valor | Uso |
|---|---|---|
| `--color-cream` | `#F5EDE3` | Texto base sobre oscuro |
| `--color-gold` | `#C9A96E` | Acento, iconos secundarios, bordes |
| `--color-gold-soft` | `#E0C89A` | Acento claro: eyebrows, precios, foco, CTA |

Opacidades permitidas para texto (mínimo legible **/45**):

| Clase | Uso |
|---|---|
| `text-white` | Dato principal |
| `text-white/65` | Dato secundario |
| `text-white/45` | Metadato |
| `text-white/30` | Sólo iconografía decorativa — nunca texto que importe |

### 2.3 Colores de estado

Cuatro familias, no siete colores. El mapa vive en `lib/constants/orders.js`.

| Token | Valor | Familia | Estados |
|---|---|---|---|
| `--color-pending` | `#e8b04b` | `pending` | `pending_payment`, `payment_review` |
| `--color-active` | `#45b98a` | `active` | `confirmed`, `preparing` |
| `--color-ready` | `#4bb3d4` | `ready` | `ready` |
| `--color-closed` | `#8d8179` | `closed` | `delivered`, `cancelled` |

Cada familia expone cuatro usos en `ORDER_TONES`: `badge`, `dot`, `accent`
(barra superior de la tarjeta), `ring` (borde en hover) y `glow` (sombra en hover).

### 2.4 Radios

| Token | Valor | Utilidad | Uso |
|---|---|---|---|
| `--radius-field` | `12px` | `rounded-field` | Inputs, selects, botones chicos/medianos, thumbs |
| `--radius-card` | `18px` | `rounded-card` | Tarjetas de grilla, tablas |
| `--radius-panel` | `22px` | `rounded-panel` | Paneles grandes, diálogos |
| — | `9999px` | `rounded-full` | Sólo pills, badges y CTA (`size="lg"`) |

**Regla:** nunca `rounded-lg`/`rounded-xl`/`rounded-2xl` en código nuevo del
panel. Esos tres son de la tienda y quedaron como deuda vieja.

### 2.5 Elevación

| Token | Utilidad | Uso |
|---|---|---|
| `--shadow-panel` | `shadow-panel` | Reposo de tarjetas y tablas |
| `--shadow-lift` | `shadow-lift` | Hover de tarjeta, diálogos |

Dos niveles. Una tarjeta no gana profundidad por ser más importante, sino por
estar interactiva.

### 2.6 Tipografía

Fuentes: **Fraunces** (`font-serif`) para títulos y montos grandes; **Inter**
(`font-sans`) para todo lo demás. Ya vienen del layout raíz.

| Rol | Clases | Uso |
|---|---|---|
| Título de pantalla | `font-serif text-3xl md:text-4xl text-white` | `PageHeader` (`title`) |
| Título de panel | `font-serif text-lg text-white` | `PanelHeader` |
| Cuerpo | `text-sm text-white/65` | Texto de interfaz |
| Metadato | `text-xs text-white/45` | Fechas, teléfonos, ayudas |
| Etiqueta | `text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40` | Cabeceras de tabla, KPIs |
| Eyebrow | `text-[10px] uppercase tracking-[0.2em] text-gold-soft` | Sobre el título |
| Monto | `font-serif tabular text-2xl` | Totales y métricas |

`tabular` (`.tabular` en `globals.css`) va en **todo** número que se alinee en
columna: precios, totales, contadores, fechas.

---

## 3. Componentes

Todos en `components/ui/`. Ninguno tiene estilos propios de una pantalla.

| Componente | Archivo | Props clave | Cuándo usarlo |
|---|---|---|---|
| `Panel` | `panel.jsx` | `tone`: `glass` \| `solid` \| `raised` \| `quiet`, `padded` | Toda superficie con borde y sombra |
| `PanelHeader` | `panel.jsx` | `title`, `action` | Cabecera interna de un panel |
| `Button` | `button.jsx` | `variant`: `primary` \| `secondary` \| `ghost` \| `danger` \| `success`, `size`: `sm` \| `md` \| `lg` | Toda acción |
| `ButtonLink` | `button.jsx` | igual + `href` | Acción que navega |
| `IconButton` / `IconLink` | `button.jsx` | `label` (**obligatorio**), `variant` | Acción de sólo icono |
| `StatusBadge` | `status-badge.jsx` | `status`, `size`, `pulse` | Estado de pedido |
| `PageHeader` | `page-header.jsx` | `eyebrow`, `title`, `description`, `backHref`, `actions` | Cabecera de cada pantalla |
| `Toolbar` + `ResultCount` | `toolbar.jsx` | `aside` | Barra sobre una grilla |
| `SearchField` | `search-field.jsx` | `value`, `onChange`, `label` | Búsqueda (siempre con `label`) |
| `ViewToggle` | `view-toggle.jsx` | `value`, `onChange` | Tarjetas / lista |
| `Select` | `select.jsx` | `value`, `onChange`, `options`, `label` | Filtros y orden |
| `DataTable` + `Row` + `Cell` | `data-table.jsx` | `columns`, `minWidth`, `index` | Vista de lista |
| `EmptyState` | `empty-state.jsx` | `icon`, `title`, `description`, `action` | Sin datos / sin resultados |
| `Skeleton*` | `skeleton.jsx` | `count` | `loading.jsx` de cada ruta |
| `ConfirmDialog` | `confirm-dialog.jsx` | `open`, `title`, `description`, `destructive` | Toda acción destructiva |
| `Field` + `fieldClass` | `field.jsx` | `label`, `htmlFor`, `error` | Todo input de formulario |

### Reglas de uso

- **`primary` una sola vez por pantalla.** Es el botón que el usuario vino a
  apretar. Si hay dos, no hay ninguno.
- **`danger` sólo para destruir.** Cancelar pedido y eliminar producto. No para
  "cerrar sesión".
- **`IconButton` sin `label` no compila el code review.** El componente lo pide
  como prop obligatoria a propósito.
- **`window.confirm` está prohibido.** Usá `ConfirmDialog`.

---

## 4. Patrones de pantalla

### 4.1 Estructura fija

```
PageHeader            eyebrow · título · descripción · acciones
Toolbar               búsqueda · filtros · contador · vista
{Grid | DataTable}    contenido
ConfirmDialog         si hay acciones destructivas
```

### 4.2 Grilla vs lista

- **Grilla:** tarjetas con imagen (productos) o con barra de estado (pedidos).
  Entrada escalonada `anim-rise` con `--i`. Hover: `-translate-y-0.5` +
  `shadow-lift` + borde de acento. Zoom de imagen al 4%.
- **Lista:** `DataTable` con cabecera sticky, `minWidth` para permitir scroll
  horizontal, hover de fila `bg-white/[0.035]`.
- **La misma información en ambos modos.** Si la grilla muestra el estado, la
  lista también.

### 4.3 Tarjeta de pedido

```
▔▔▔ barra de acento (color del estado)
número · fecha              [badge] [×]
cliente
teléfono
n productos (desplegable)
──────────────────────────────
TOTAL            $x.xxx  [👁] [siguiente paso]
```

El botón de la derecha es siempre `NEXT_STATUS[order.status]`, nunca una lista
de todos los estados.

### 4.4 Dashboard

Orden de lectura: **accionar → medir → explorar**.

1. Alerta de pendientes (sólo si hay).
2. Cuatro métricas: hoy, 7 días, mes, ticket promedio — todas con delta contra
   el período anterior.
3. Para retirar hoy (ordenado por hora) + lo más vendido de la semana.
4. Últimos pedidos.

---

## 5. Movimiento

| Efecto | Clase | Dónde |
|---|---|---|
| Entrada escalonada | `anim-rise` + `style={{ '--i': index }}` | Tarjetas, filas, métricas |
| Hover de tarjeta | `hover:-translate-y-0.5 hover:shadow-lift` | Grillas |
| Zoom de imagen | `group-hover:scale-[1.04]` | Miniatura de producto |
| Barrido de carga | `anim-shimmer` | `SkeletonBlock` |
| Chevron / acordeón | `rotate-180 transition-transform` | Sidebar, items del pedido |

**Regla:** nada anima en loop salvo el `pulse` de `pending`. `prefers-reduced-motion`
desactiva `anim-rise` y `anim-shimmer` (y el hero de la tienda).

---

## 6. Accesibilidad

- **Foco:** una sola regla global en `globals.css` (`.admin-scope :focus-visible`)
  dibuja el anillo en todo el panel. No hace falta repetir clases, pero **sí**
  está prohibido `focus:outline-none` sin reemplazo.
- **Radios de acción:** mínimo 32×32 px (`size="iconSm"`); lo normal es 36×36.
  El buscador y los inputs son de 40 px de alto.
- **Diálogos:** `role="alertdialog"`, `aria-modal`, foco atrapado, cierre con
  `Escape`, y el foco vuelve al disparador (`ConfirmDialog` ya lo hace).
- **Errores de formulario:** `aria-invalid` + `aria-describedby` apuntando al
  mensaje (`Field` lo arma solo).
- **Contadores:** `aria-live="polite"` en `ResultCount` para anunciar cambios al
  filtrar.
- **Estado de tabs y filtros:** `aria-selected` / `aria-current="page"`.

---

## 7. Cómo agregar una pantalla nueva

1. Copiá la estructura de 4.1.
2. Si necesitás un color, un radio o una sombra que no existe → se agrega al
   `@theme`, no en el componente.
3. Si necesitás un control que no existe → se crea en `components/ui/`, no
   dentro de la pantalla.
4. Agregá `loading.jsx` con el esqueleto que corresponda.
5. Agregá la entrada en `lib/constants/nav.js` (grupo + icono + `titleForPath`).
6. Checklist antes de commitear:
   - [ ] Cero hex nuevos en el diff.
   - [ ] Cero `rounded-xl`/`rounded-2xl` nuevos.
   - [ ] Todo botón de icono tiene `aria-label`.
   - [ ] Todo input tiene `label` asociado.
   - [ ] Los vacíos usan `EmptyState`.
   - [ ] Los números usan `tabular`.

---

## 8. Bitácora de este pase

| Día | Qué | Archivos |
|---|---|---|
| 1 | Tokens del panel, animaciones y foco global | `app/globals.css` |
| 1 | Mapa único de estados | `lib/constants/orders.js` |
| 1 | 16 primitivos de UI | `components/ui/*` |
| 1 | Productos: grilla + lista, confirmación real, filtros por categoría | `components/admin/ProductsTable.jsx`, `app/admin/productos/page.jsx` |
| 1 | Pedidos: tarjetas con barra de estado, tabs con contador, optimistic update | `components/admin/OrdersBoard.jsx`, `app/admin/pedidos/page.jsx` |
| 1 | Dashboard: deltas, para retirar hoy, más vendido, ticket promedio | `app/admin/page.jsx` |
| 1 | Navegación agrupada, "pronto" en vez de 404, título real por ruta | `app/admin/layout.jsx`, `lib/constants/nav.js` |
| 1 | Edición de producto (existía rota) y detalle de pedido único | `app/admin/productos/[id]/page.jsx`, `app/admin/pedidos/[id]/page.jsx` |
| 1 | Formulario de producto con errores accesibles | `components/admin/ProductForm.jsx`, `components/ui/field.jsx` |
| 1 | Esqueletos de carga por ruta | `app/admin/loading.jsx`, `app/admin/productos/loading.jsx`, `app/admin/pedidos/loading.jsx` |
| 1 | Login con los mismos primitivos | `app/admin/login/page.jsx` |
| 1 | Borrado de `OrdersTable.jsx` (298 líneas muertas) | — |
