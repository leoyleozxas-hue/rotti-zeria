# Auditoría de front — rotti-zeria (Biarritz)

**Fecha:** 23/10/2026 · **Alcance:** 32 archivos JSX, 22 rutas, tokens de Tailwind 4, panel de admin, tienda y formulario de contacto.
**Método:** lectura directa del código fuente. No hay capturas: la app no se levantó en este entorno.

---

## 0. Veredicto en 30 segundos

La **dirección visual está resuelta y es buena**: paleta cálida de panadería (cream/madera/dorado), serif Fraunces para títulos, texturas de madera como separador de bandas. Eso no se toca.

El problema no es el gusto, es la **sistematización y el cableado**:

- **353 literales hex** escritos a mano, **8 marrones distintos** usados como si fueran el mismo, **173 radios** en 4 escalas para los mismos gestos. El admin es, de hecho, un **segundo sistema de diseño** (oscuro) que no comparte tokens con la tienda.
- El panel de admin tiene agujeros que hoy **le impiden funcionar como herramienta de trabajo**: editar producto cae en 404, dos ítems del menú no existen, el detalle de pedido está duplicado en la carpeta equivocada.
- La **API de pedidos confía el total al navegador** (`app/api/orders/route.js`). No es un problema de diseño: es un agujero de plata.
- El formulario de contacto **no envía nada** (hay un `TODO` y un `setSent(true)`).

Prioridad: **reparar estructura antes de sumar diseño nuevo.** Diseñar más pantallas sobre esta base sólo multiplica la deuda.

---

## 0-bis. Estado de los hallazgos P0 (actualizado tras el pase de diseño)

Ver [`docs/DISENO-ADMIN.md`](docs/DISENO-ADMIN.md) para el sistema que se creó.

| Hallazgo | Estado |
|---|---|
| 2.1 Editar producto roto | ✅ Arreglado — `app/admin/productos/[id]/page.jsx` ahora monta `ProductForm` con `initialData` |
| 2.2 Detalle de pedido duplicado | ✅ Unificado — la versión buena vive en `pedidos/[id]` y la copia se eliminó |
| 2.3 `/admin/destacados` y `/admin/lunch` dan 404 | ✅ Ya no son enlaces: se muestran como "Pronto" (`lib/constants/nav.js`) |
| 2.4 Título del topbar | ✅ Reemplazado por un mapa de rutas (`titleForPath`) |
| 2.5 `OrdersTable.jsx` huérfano | ✅ Borrado (298 líneas) |
| 2.6 API confía el precio al navegador | ⏳ Pendiente — es backend, va en la Fase 1 |
| 2.7 `/checkout/exito` con banco ficticio | ⏳ Pendiente |
| 2.8 `ClearCartOnMount` vacía de más | ⏳ Pendiente |
| 2.9 Sin `loading`/`error`/`not-found` | 🟡 Parcial — `loading.jsx` agregado en `/admin`, `/admin/pedidos` y `/admin/productos` |
| 2.10 Producto agotado comprable | ⏳ Pendiente |
| 2.11 PNG huérfano de 1,8 MB | ⏳ Pendiente |
| 3.x Deuda de estilos del panel | ✅ Resuelta en el panel: 0 hex, 0 radios viejos, tokens propios |
| 5.1 Accesibilidad del storefront | ⏳ Pendiente (el panel ya tiene foco global, dialogs accesibles y labels) |

---

## 1. Lo que ya está bien (no tocar)

| Elemento | Dónde | Por qué funciona |
|---|---|---|
| Paleta cálida + madera | `app/globals.css:3-14` | Coherente con el rubro, evita el look genérico SaaS |
| Fraunces + Inter | `app/layout.jsx:6-16` | Serif con carácter para títulos, sans legible para UI |
| Banda de madera como separador | `app/page.jsx:127, 181, 241` | Ritmo visual real: claro → oscuro → claro |
| Hero full-bleed con zoom lento | `app/page.jsx:74-124` | Impacto sin ruido; `prefers-reduced-motion` respetado |
| Sidebar de admin con textura | `app/admin/layout.jsx:46-67` | Identidad propia del panel, no un dashboard blanco |
| Cart store con persist | `lib/store/cartStore.js` | El código más limpio del proyecto |
| Realtime + sonido de pedidos | `components/admin/OrderNotifications.jsx` | Detalle de oficio real: avisa sin mirar la pantalla |

---

## 2. Bugs estructurales y funcionales (P0)

Verificados leyendo el código, no por inferencia.

### 2.1 Editar producto está roto
`components/admin/ProductsTable.jsx:130` y `:169` enlazan a `/admin/productos/{id}`. Pero ese archivo **`app/admin/productos/[id]/page.jsx` es una copia del detalle de pedido**: su primera línea dice `// app/admin/pedidos/[id]/page.jsx` y consulta la tabla `orders` con el id del producto (`:36`). Resultado: "Editar" → `notFound()` → 404. **El `ProductForm` nunca se renderiza en modo edición.**

### 2.2 Hay dos copias divergentes del detalle de pedido
- `app/admin/pedidos/[id]/page.jsx` (210 líneas) — la vieja. **Es la que se usa.**
- `app/admin/productos/[id]/page.jsx` (233 líneas) — la mejorada (botón WhatsApp, fallback de imágenes, mejor metadata). Vive en la ruta equivocada, así que no se ejecuta.

Es la mejora más reciente del equipo, tirada en una carpeta que no corresponde. **Fix:** mover la buena a `pedidos/[id]` y reescribir `productos/[id]` con `ProductForm initialData`.

### 2.3 Dos ítems del menú dan 404
`app/admin/layout.jsx:42-43` enlaza `/admin/destacados` y `/admin/lunch`. **No existen esas rutas.** El dueño tiene dos botones que llevan a la página de error.

### 2.4 El título del panel miente (en las rutas que no existen)
`app/admin/layout.jsx:269-271`: un ternario de dos niveles que sólo reconoce `pedidos` y `productos`; todo lo demás cae en "Dashboard". Las rutas reales aciertan (`/admin/productos/nuevo` muestra "Productos" porque el check es `.includes('/productos')`), pero **`/admin/destacados` y `/admin/lunch` mostrarían "Dashboard"** si existieran — y de todos modos son un ternario frágil que no escala a la navegación propuesta en 4.4.

### 2.5 Código muerto que confunde
`components/admin/OrdersTable.jsx` — 13,4 KB, **nadie lo importa**. Segunda implementación del tablero de pedidos, con su propio `getCardBorder` y su propio formateo de fecha. Dos fuentes de verdad para la misma pantalla.

### 2.6 La API de pedidos confía el precio al navegador
`app/api/orders/route.js:10, 42`: el `total` y los `unit_price` vienen en el body del cliente. No se valida con `orderSchema` (`lib/validations/order.js`, que ya existe y no se usa), no se verifica `is_available`, no hay stock.

Además:
- **Insert no transaccional** (`:30-67`): si fallan los ítems, queda una orden huérfana.
- **`order_number = Date.now().slice(-6)`** (`:11`): colisiona cada ~17 minutos, sin reintento.
- El **DNI se pide y valida** (`checkout:132`) pero nunca se envía ni se guarda (`api/orders:32-45`).

**Fix:** recalcular precios server-side desde la tabla `products`, insertar orden + ítems en una RPC de Postgres, y un número de pedido secuencial por día.

### 2.7 `/checkout/exito` es un placeholder público
Muestra banco y CBU ficticios (`app/checkout/exito/page.jsx:19`) y el número de pedido sale `undefined` si se entra sin query string. Es una URL a la que cualquiera puede llegar.

### 2.8 `ClearCartOnMount` vacía el carrito de más
`components/ClearCartOnMount.jsx:9` limpia el carrito al montar, sin verificar que el pedido exista ni que sea esa pestaña. **Afecta otras pestañas abiertas.**

### 2.9 No hay `loading.jsx`, `error.jsx` ni `not-found.jsx` en ningún segmento
Un error de Supabase o una ruta inexistente caen en la pantalla por defecto de Next, sin shell ni marca. Verificado por búsqueda en todo el árbol.

### 2.10 Producto agotado se puede comprar
`app/productos/[id]/page.jsx:16-20` no filtra `is_available`, y el detalle se sirve igual. El carrito acepta un producto oculto.

### 2.11 Activo huérfano en `public/`
`public/Generated Image October 14, 2026 - 11_18PM.png` — 1,8 MB, sin referencias.

---

## 3. Fundaciones de diseño (P1)

### 3.1 Los tokens existen pero casi no se usan
`app/globals.css:3-14` define `--color-cream`, `--color-wood`, `--color-gold`… En la práctica hay **242 hex hardcodeados** en los `.jsx`, y varios marrones compitiendo:

| Token | Hex a mano | Apariciones |
|---|---|---|
| `--color-chocolate` | `#2B0F0B` / `#2b0f0b` | 20+ |
| — | `#3a130d` | 12 |
| — | `#5a1a10` | 6 |
| — | `#1a0806` / `#150604` | 15+ |
| — | `#9a8b7a`, `#c4b5a5`, `#FAF7F2`, `#FCFAF8`, `#2A1810`, `#341D14`, `#23120B`, `#2C1E16` | 30+ |

Detalle fino: `ProductCard.jsx:37` usa `#FCFAF8` y `:41` `#2b0f0b` en minúscula, contra `#2B0F0B` en mayúscula dos líneas después. Funciona igual, pero es la señal de que nadie está mirando el sistema.

El inventario completo, hex por hex y con su rol en la UI, está en [`theme.md`](.superdesign/init/theme.md). Ahí también se ve lo más elocuente: **`--color-wood` (`#3A1E14`) está definido en el tema y no se usa ni una vez**; en su lugar hay 12 objetos de estilo de madera inline, 4 variantes distintas de "glass" y 3 definiciones de panel de vidrio que no coinciden entre sí.

### 3.2 Radios: cuatro escalas para el mismo gesto
173 declaraciones de radio en 4 escalas: `rounded-full` ×60 · `rounded-xl` ×46 · `rounded-2xl` ×34 · `rounded-lg` ×30. Sin regla: tarjeta de producto `rounded-2xl` (`ProductCard.jsx:37`), tarjeta de pedido `rounded-xl` (`OrdersBoard.jsx:303`), panel de métrica `rounded-2xl` (`admin/page.jsx:108`). Los inputs son a veces `rounded-xl`, a veces `rounded-lg`, a veces rectangulares (`AddToCartSection.jsx:54`).

**Propuesta:** 3 radios. `--radius-sm: 8px` (inputs, badges) · `--radius-md: 16px` (tarjetas, paneles) · `--radius-full` (sólo botones y pills).

### 3.3 Contenedores sin criterio
`max-w-4xl` ×7 · `max-w-5xl` ×5 · `max-w-6xl` ×9 · y aparecen `max-w-2xl` (`exito:10`) y `max-w-7xl` (`productos:110`). **Propuesta:** un `PageContainer` con `narrow` (contacto/checkout) y `wide` (catálogo/admin).

### 3.4 Tipografía sin escala
Títulos de `text-2xl` a `text-7xl` según el archivo, **25 tamaños arbitrarios** (`text-[9px]`, `[10px]`, `[11px]`) y `tracking-[0.18em]`, `[0.2em]`, `[0.3em]` mezclados. Las etiquetas en mayúsculas nunca se ven exactamente iguales entre pantallas.

**Propuesta:** `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-caption`, `text-eyebrow` en `@theme`.

### 3.5 Sombras y bordes sin patrón
`shadow-sm` (`carrito:35`), `shadow-2xl` (`productos:94`), `shadow-[inset_…]` (`OrderStatusPanel:30`), `shadow-lg shadow-black/40` (`OrdersTable:222`). Cuatro lenguajes de profundidad en la misma app.

### 3.6 Estados ausentes
- `focus-visible` aparece **19 veces en 32 archivos**. En el admin (`OrdersBoard`, `ProductsTable`) casi ningún botón lo tiene, y ahí se trabaja con teclado.
- `aria-*` aparece **12 veces**.
- Contraste flojo: `text-white/50` y `/30` sobre madera (`OrdersBoard.jsx:317`, `ProductsTable.jsx:79`).
- **Agregar al carrito no da feedback** (`ProductCard.jsx:88-98`): sin toast, sin confirmación, sin apertura del drawer. El usuario no sabe si funcionó.

### 3.7 Duplicaciones que ya son deuda estructural
| Qué se repite | Veces | Dónde |
|---|---|---|
| Lista de categorías (`Panes`, `Facturas`, `Dulces`, `Salados`, `Bocados calientes`) | **5** | `page.jsx:42-68`, `productos/page.jsx`, `admin/layout.jsx:35-39`, `ProductForm.jsx:14`, badge de `ProductCard` |
| Selector de cantidad (stepper) | **3** con estilos distintos | `AddToCartSection.jsx:33`, `CartDrawer.jsx:88`, `carrito/page.jsx` |
| Carrito | **2** interfaces | `CartDrawer` + `/carrito` (ver 5.2) |
| Tablero de pedidos | **3** implementaciones | `OrdersBoard`, `OrdersTable` (huérfano), copia en `productos/[id]` |
| Datos del local (dirección, teléfono, horario) | **3** con valores distintos | `contacto:13-18`, `Footer:26-33`, `page.jsx:131-136` |

Y una dependencia instalada que nadie usa: **`motion`** está en `package.json` y no se importa en ningún archivo (las animaciones son CSS a mano en `globals.css:27-53`).

---

## 4. Panel de admin — arquitectura propuesta

### 4.1 El problema de fondo
El panel está construido **pantalla por pantalla**, y cada pantalla resolvió tres veces el mismo problema. `OrdersBoard` y `ProductsTable` son ~70% el mismo componente con otro nombre; `OrdersTable` es una tercera copia.

Medible: **la barra de búsqueda + toggle de vista está implementada 3 veces** (`OrdersBoard.jsx:225-254`, `ProductsTable.jsx:70-105`, `OrdersTable.jsx:135-170`), con paddings y radios distintos entre sí.

### 4.2 Capa de componentes que falta
`components/ui/`:

```
button.jsx        primary | secondary | ghost | danger | icon
input.jsx         + field.jsx (label + error + hint, atado a react-hook-form)
select.jsx        nativo estilizado (hoy el <select> del SO rompe el tema)
panel.jsx         el "glass" en 3 densidades: solid | glass | wood
data-toolbar.jsx  búsqueda + filtros + toggle de vista (hoy triplicado)
table.jsx         header sticky, scroll horizontal, fila vacía
badge.jsx         estado de pedido con UN color semántico
tabs.jsx          tabs con contador, sincronizadas con la URL
empty-state.jsx   icono + copy + acción
skeleton.jsx      reemplaza los "Cargando..." de texto plano
confirm-dialog.jsx reemplaza window.confirm (ProductsTable.jsx:32)
page-header.jsx   título + subtítulo + acciones (hoy repetido en 5 páginas)
```

### 4.3 Un solo color por estado
Hoy el mismo estado tiene tres colores según la pantalla: `OrdersBoard.jsx:43-81` (ámbar/verde/cian/blanco/rojo), `pedidos/[id]/page.jsx:20-28` (`amber/sky/violet/emerald`), y el dashboard usa un badge neutro para todos (`admin/page.jsx:179`).

**Propuesta:** un mapa único en `lib/constants/orders.js` con 4 familias semánticas:

| Familia | Estados | Significado |
|---|---|---|
| `pending` (ámbar) | `pending_payment`, `payment_review` | requiere acción del local |
| `active` (verde) | `confirmed`, `preparing` | en curso |
| `ready` (cian) | `ready` | esperando retiro |
| `closed` (neutro) | `delivered`, `cancelled` | archivado |

### 4.4 Navegación: de 5 ítems a una IA real
Hoy: Dashboard · Pedidos · Productos · Destacados · Lunch & Eventos (y dos de esos dan 404). Falta la mitad de lo que un local necesita:

```
OPERACIÓN   Dashboard · Pedidos (Todos/Nuevos/En cocina/Listos/Historial) · Cocina (pantalla grande)
CATÁLOGO    Productos · Categorías · Destacados
COMERCIAL   Lunch & Eventos · Cupones · Zonas y envíos
CLIENTES    Mensajes (contacto) · Clientes
SISTEMA     Reportes · Configuración (horarios, dirección, WhatsApp) · Usuarios
```

El título se resuelve con un **mapa de rutas** en `lib/constants/nav.js` (fuente única para sidebar + topbar + breadcrumbs), no con un ternario.

### 4.5 Lo que le falta al Dashboard para servir un lunes a la mañana
Hoy: 4 cajas de conteo/monto + últimos 6 pedidos. Falta lo que el dueño mira primero:

- **"Para hoy"**: pedidos con `pickup_date` de hoy, ordenados por hora de retiro. Es la pantalla que se imprime.
- **Productos más vendidos** (7 días) y **ticket promedio**.
- **Alerta de catálogo vacío** ("Dulces no tiene productos visibles").
- **Acciones rápidas**: + Nuevo producto, ver pedidos nuevos.
- **Buscador global** (nro. de pedido, cliente, producto) — hoy hay que elegir la sección antes de buscar.

---

## 5. Tienda (storefront)

### 5.1 Accesibilidad — lo que hay que arreglar sí o sí
| Hallazgo | Dónde | Sev. |
|---|---|---|
| Botones `<button>` dentro de `<Link>` (HTML inválido, tab-order roto) | `ProductCard.jsx:47, 88` | alta |
| Drawer sin `role="dialog"`, sin `aria-modal`, sin focus trap, sin Escape, y **sigue tabulable cerrado** | `CartDrawer.jsx:40-43` | alta |
| Inputs sin `htmlFor`/`id` ni `aria-invalid`/`aria-describedby` | `checkout:105-114`, `login:82-90` | alta |
| Foco visible ausente (`focus:outline-none` sin reemplazo) | `checkout:108` | alta |
| Botones de sólo-icono sin `aria-label` | `CartDrawer:81,89,93`, `AddToCartSection:34,41`, `OrdersTable:151-163` | media |
| Sin `aria-pressed` en corazones de favorito | `ProductCard:50`, `AddToCartSection:63` | baja |
| Salto de jerarquía h1→h3 | `favoritos:66` | baja |

### 5.2 UX: dos carritos
Existen `CartDrawer` (lateral) y `/carrito` (página completa), con estilos distintos para lo mismo. `AddToCartSection.jsx:25` redirige a `/carrito` en vez de abrir el drawer; `ProductCard` agrega sin abrir nada. **Decisión pendiente:** un solo patrón — drawer para acción rápida, página para revisión, y el mismo componente de línea en ambos.

### 5.3 Áreas táctiles chicas
`ProductCard:49` (36 px), `carrito:51` (32 px), `CartDrawer:89` (~26 px), `favoritos:85` (36 px), `AddToCartSection:34` (40 px). El mínimo cómodo es 44×44.

### 5.4 Contenido hardcodeado que debería salir de la DB
- Combos y servicios de `/eventos` están escritos en el JSX (`eventos:88-153`).
- "Más vendido" se aplica a **toda** la categoría Facturas (`ProductCard:40`), no es un dato real.
- Datos del local (dirección, teléfono, horarios) repetidos en `contacto:13-18`, `Footer:26-33` y `page.jsx:131-136`, con valores distintos entre sí.

### 5.5 Impresión
`pedidos/[id]:84` imprime la barra "Volver / Imprimir" porque sólo la copia equivocada tiene `print:hidden` (`productos/[id]:99`). La hoja de impresión del pedido es un caso de uso real (la cocina imprime) y hoy sale sucia.

### 5.6 Fechas
`checkout:16` calcula la fecha mínima con `toISOString()` (UTC): en Argentina puede ofrecer un día de más o de menos según la hora. `lib/validations/order.js:6` congela "mañana" al importar el módulo, así que una pestaña abierta todo el día valida contra ayer.

---

## 6. Formulario de contacto — el hueco más caro

### 6.1 Estado actual
`app/contacto/page.jsx:26-30`:

```js
function onSubmit(e) {
  e.preventDefault()
  // TODO: conectar con tu backend (Supabase / email) antes de publicar.
  setSent(true)
}
```

**No envía nada.** Muestra "Mensaje enviado" y el mensaje se pierde. Es el único canal de contacto del sitio.

Además:
- Sin validación real (sólo `required` del navegador), sin estado de error, sin loading, sin disabled.
- Sin teléfono ni motivo — los dos datos que el local necesita para responder rápido.
- Datos de contacto hardcodeados en el archivo (`:13-18`): cambiarlos requiere deploy.
- **Inconsistencia de país:** los precios se formatean `es-AR` en todo el sitio, el teléfono es `+598 00 000 000` (Uruguay), el footer dice WhatsApp `11 1234-5678` (Argentina) y la dirección es `Av. Siempre Viva 123`. Hay que decidir país y unificar.
- La confirmación reemplaza el formulario entero (`:57-61`) sin ofrecer nada más: ni WhatsApp, ni volver.

### 6.2 Rediseño propuesto

| Columna izquierda (info) | Columna derecha (formulario) |
|---|---|
| Horarios con indicador **abierto/cerrado ahora** (calculado) | Nombre · Email · Teléfono · Motivo (consulta / pedido especial / eventos / reclamo) |
| Dirección + link a mapa | Mensaje (textarea con contador) |
| WhatsApp como CTA primario (el canal real del rubro) | Checkbox de consentimiento |
| Email con `mailto:` | Botón con estados: idle → enviando → enviado → error |

Backend mínimo viable:
1. Tabla `contact_messages` en Supabase (`name`, `email`, `phone`, `topic`, `message`, `status`, `created_at`).
2. Server Action con `lib/validations/contact.js` (mismo `zod` que el resto).
3. Honeypot + rate limit por IP: el formulario va a recibir spam en dos semanas.
4. Aviso por email o reusar `OrderNotifications`.
5. Bandeja `/admin/mensajes` para leerlos y marcarlos como respondidos.

---

## 7. Faltantes profesionales (transversal)

| # | Qué falta | Por qué importa | Esf. |
|---|---|---|---|
| 1 | `metadata` por página + Open Graph + imagen de preview | Hoy **todas** las páginas comparten el título del layout raíz. Si compartís el link por WhatsApp, no hay preview | S |
| 2 | `loading.jsx` / `error.jsx` / `not-found.jsx` | 404 y 500 salen sin shell ni marca (ver 2.9) | S |
| 3 | Estados vacíos diseñados | "No hay pedidos en esta categoría" es un párrafo centrado; el catálogo público vacío no tiene CTA | S |
| 4 | Skeletons en vez de "Cargando..." | `admin/page.jsx:65`, `productos/[id]:169`, `admin/layout.jsx:71` | S |
| 5 | Favicon con la marca | Hay un `app/favicon.ico` genérico | S |
| 6 | Fotos reales en vez de stock | 6 fotos de Unsplash + 3,6 MB de texturas PNG. Un local real necesita sus fotos | M |
| 7 | Optimizar assets | 2 texturas de 1,6–2 MB como `background-image` sin optimizar, más un PNG huérfano de 1,8 MB | S |
| 8 | Confirmación de pedido real | `/checkout/exito` muestra banco ficticio (ver 2.7) | M |
| 9 | Pantalla de cocina | Un solo pedido por pantalla no sirve cuando hay 8 en cola | M |
| 10 | Accesibilidad base | Foco visible, `aria-label`, contraste 4.5:1 (ver 5.1) | M |
| 11 | Analytics / medición | No hay forma de saber qué categoría se mira | S |
| 12 | Página de gracias del contacto | `checkout/exito` existe; contacto no tiene equivalente | S |

---

## 8. Roadmap sugerido

**Fase 0 — Reparar (medio día).** Mover el detalle de pedido bueno a `pedidos/[id]`; reescribir `productos/[id]` con `ProductForm`; borrar `OrdersTable.jsx`; crear o eliminar `/admin/destacados` y `/admin/lunch`; arreglar el título del topbar; borrar el PNG huérfano; `print:hidden` en la barra del detalle.

**Fase 1 — Seguridad y plata (medio día).** `api/orders/route.js` con precios server-side, RPC transaccional, `order_number` secuencial, validación de `is_available`. Filtrar agotados en el detalle.

**Fase 2 — Fundaciones (1–2 días).** Tokens en `@theme` (radios, escala tipográfica, colores semánticos), `components/ui/` con los 12 primitivos, migrar admin primero (donde más se repite) y después tienda.

**Fase 3 — Contacto real + bandeja (1 día).** Formulario con zod + Server Action + tabla + email + `/admin/mensajes`.

**Fase 4 — Admin útil (2–3 días).** Dashboard "para hoy", mapa de rutas, Categorías, Configuración del local, pantalla de cocina.

**Fase 5 — Pulido (1–2 días).** Metadata/OG, 404 propia, skeletons, empty states, accesibilidad, fotos reales, `/checkout/exito` real.

---

## 9. Cómo se generó este documento

- Skill `superdesign` instalada en `.agents/skills/superdesign/` (13 archivos, verificados byte a byte contra el repo original).
- Análisis del repo según `references/INIT.md` → artefactos en [`.superdesign/init/`](.superdesign/init/): [`components.md`](.superdesign/init/components.md) (10 componentes con código completo), [`layouts.md`](.superdesign/init/layouts.md), [`theme.md`](.superdesign/init/theme.md) (tokens + 20 inconsistencias medidas), [`pages.md`](.superdesign/init/pages.md) (11 árboles de dependencia), [`routes.md`](.superdesign/init/routes.md) (18 rutas con estado), [`extractable-components.md`](.superdesign/init/extractable-components.md).
- Lectura directa de los 32 archivos JSX + `globals.css` + `next.config.mjs` + `proxy.js` + la carpeta `lib/`.
- Conteos de inconsistencias calculados sobre el árbol completo (excluyendo `node_modules` y `.next`). Los números de este documento son los de `theme.md`, que cuenta **todos** los literales hex fuera de los 7 tokens; un primer conteo mío, más estrecho (sólo los marrones de uso frecuente), dio 242 y quedó corregido acá.

> **Corrección aplicada:** la versión inicial de este documento afirmaba que `/admin/productos/nuevo` mostraba el título "Dashboard". Es falso: el ternario usa `.includes('/productos')`, así que muestra "Productos". Corregido en 2.4.
