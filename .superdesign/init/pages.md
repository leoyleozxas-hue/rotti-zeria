# Pages — rotti-zeria (Biarritz)

Árboles de dependencia por ruta, trazados recursivamente desde el archivo de página y siguiendo sólo imports locales (alias `@/*` → raíz del repo, rutas relativas y `app/globals.css`). Se omiten `node_modules`: `next`, `react`, `lucide-react`, `sonner`, `zustand`, `react-hook-form`, `zod` y `@supabase/*` se asumen disponibles.

Todos los imports son **estáticos**: no hay `dynamic()` ni `lazy()` en el proyecto.

## Contexto común (aplica a casi toda página)

Toda ruta pasa por el root layout. Los archivos del shell son costo fijo del contexto de cualquier página de tienda:

```
app/layout.jsx
├── app/globals.css
└── components/StoreShell.jsx
    ├── components/Header.jsx
    │   ├── lib/store/cartStore.js
    │   ├── lib/store/favoritesStore.js
    │   └── lib/store/uiStore.js
    ├── components/Footer.jsx
    └── components/cart/CartDrawer.jsx
        ├── lib/store/cartStore.js
        └── lib/store/uiStore.js
```

`CartDrawer` sólo se renderiza en rutas de tienda; en `/admin/*` `StoreShell` devuelve `children` sin chrome, y el shell pasa a ser `app/admin/layout.jsx` (que importa `lib/supabase/client.js` y `sonner`).

---

## / (Home)

Entry: `app/page.jsx` (server component, async children via `Suspense`)

```
app/page.jsx
├── lib/supabase/server.js
├── components/ProductCard.jsx
│   ├── lib/store/cartStore.js
│   └── lib/store/favoritesStore.js
└── app/layout.jsx
    ├── app/globals.css
    └── components/StoreShell.jsx
        ├── components/Header.jsx
        │   ├── lib/store/cartStore.js
        │   ├── lib/store/favoritesStore.js
        │   └── lib/store/uiStore.js
        ├── components/Footer.jsx
        └── components/cart/CartDrawer.jsx
            ├── lib/store/cartStore.js
            └── lib/store/uiStore.js
```

Particularidad: define dos objetos de estilo de madera inline (`woodVertical`, `woodHorizontal`) y un subcomponente server `FeaturedProducts` que consulta `products` (`is_available = true`, `limit 4`). Las 5 imágenes de categoría son URLs de Unsplash hardcodeadas.

Conjunto mínimo de `--context-file`: `app/page.jsx`, `app/globals.css`, `components/ProductCard.jsx`, `components/Header.jsx`, `components/Footer.jsx`.

---

## /productos (Catálogo)

Entry: `app/productos/page.jsx` (server, `searchParams.categoria`)

```
app/productos/page.jsx
├── lib/supabase/server.js
├── components/ProductCard.jsx
│   ├── lib/store/cartStore.js
│   └── lib/store/favoritesStore.js
└── root layout + StoreShell (ver contexto común)
```

Subcomponente server `ProductosGrid` (filtro por categoría, orden `category` + `name`, estado vacío con CTA). El sidebar de categorías y el hero glass están inline en la página. `CATEGORIES` local (6 entradas incluyendo "Todos").

Conjunto mínimo: `app/productos/page.jsx`, `app/globals.css`, `components/ProductCard.jsx`, `components/Header.jsx`, `components/Footer.jsx`.

---

## /productos/[id] (Detalle de producto)

Entry: `app/productos/[id]/page.jsx` (server, `generateMetadata` + `params.id`)

```
app/productos/[id]/page.jsx
├── lib/supabase/server.js
├── components/AddToCartSection.jsx
│   ├── lib/store/cartStore.js
│   └── lib/store/favoritesStore.js
├── components/ProductCard.jsx
│   ├── lib/store/cartStore.js
│   └── lib/store/favoritesStore.js
└── root layout + StoreShell (ver contexto común)
```

Tres subcomponentes server: `ProductInfo` (llama `notFound()` si no hay producto), `RelatedProducts` (misma categoría, `limit 4`) y la página. Define el filtro CSS compartido `imageFilter = "contrast-[1.05] saturate-[1.1] brightness-[0.98]"`. Es la página con la tipografía más grande del sitio (`text-5xl lg:text-7xl`).

Conjunto mínimo: `app/productos/[id]/page.jsx`, `app/globals.css`, `components/AddToCartSection.jsx`, `components/ProductCard.jsx`.

---

## /carrito (Carrito, página completa)

Entry: `app/carrito/page.jsx` (client)

```
app/carrito/page.jsx
├── lib/store/cartStore.js
└── root layout + StoreShell (ver contexto común)
```

Es la página con menos dependencias locales del proyecto. Usa clases token (`bg-chocolate`, `text-caramel`, `bg-beige`, `hover:bg-gold-soft`) mientras el `CartDrawer` del mismo carrito usa hex — ver `theme.md` #4 y #5.

Conjunto mínimo: `app/carrito/page.jsx`, `app/globals.css`, `lib/store/cartStore.js`.

---

## /checkout (Checkout)

Entry: `app/checkout/page.jsx` (client)

```
app/checkout/page.jsx
├── lib/store/cartStore.js
├── lib/validations/order.js
└── root layout + StoreShell (ver contexto común)

# consumido en runtime por fetch('/api/orders')
app/api/orders/route.js
└── lib/supabase/server.js
```

La página no importa el route handler (lo llama por `fetch`), pero el contrato de datos vive en `lib/validations/order.js` (que **la API no usa**). El formulario tiene 18 campos con `zod` y 4 secciones en tarjetas blancas + resumen sticky.

Conjunto mínimo: `app/checkout/page.jsx`, `lib/validations/order.js`, `app/globals.css`, `lib/store/cartStore.js`.

---

## /favoritos

Entry: `app/favoritos/page.jsx` (client)

```
app/favoritos/page.jsx
├── lib/store/favoritesStore.js
├── lib/store/cartStore.js
└── root layout + StoreShell (ver contexto común)
```

Dos estados mutuamente excluyentes: vacío (icono `Heart` + CTA) y lista. Cada fila enlaza a `/productos/{id}`.

Conjunto mínimo: `app/favoritos/page.jsx`, `app/globals.css`, `lib/store/favoritesStore.js`.

---

## /admin (Dashboard)

Entry: `app/admin/page.jsx` (server, async)

```
app/admin/page.jsx
├── lib/supabase/server.js
└── app/admin/layout.jsx
    ├── lib/supabase/client.js
    └── root layout (app/layout.jsx → StoreShell corta el chrome en /admin)
```

`getStats()` consulta `orders` completa y calcula hoy / ayer / 7 días / mes + pendientes + últimos 6. Define la constante `glass` local (variante A). No hay subcomponentes: las cajas y la tabla están inline.

Conjunto mínimo: `app/admin/page.jsx`, `app/admin/layout.jsx`, `app/globals.css`.

---

## /admin/pedidos (Tablero de pedidos)

Entry: `app/admin/pedidos/page.jsx` (server, async)

```
app/admin/pedidos/page.jsx
├── lib/supabase/server.js
├── components/admin/OrderNotifications.jsx
│   └── lib/supabase/client.js
├── components/admin/OrdersBoard.jsx
│   └── lib/supabase/client.js
└── app/admin/layout.jsx
    └── lib/supabase/client.js
```

`getOrders()` trae `orders` con `order_items (id, quantity, product_name)` embebidos en una sola consulta. `OrdersBoard` es el componente más grande del repo (405 líneas) y concentra tabs, búsqueda, grid/lista y modal de cancelación.

Conjunto mínimo: `app/admin/pedidos/page.jsx`, `components/admin/OrdersBoard.jsx`, `app/admin/layout.jsx`, `app/globals.css`. Sumar `OrderNotifications.jsx` sólo si se diseña el estado de "nuevo pedido".

---

## /admin/pedidos/[id] (Detalle de pedido)

Entry: `app/admin/pedidos/[id]/page.jsx` (server, async; 210 líneas — la versión **viva**)

```
app/admin/pedidos/[id]/page.jsx
├── lib/supabase/server.js
├── components/admin/OrderStatusPanel.jsx
│   └── lib/supabase/client.js
├── components/admin/PrintButton.jsx
└── app/admin/layout.jsx
    └── lib/supabase/client.js
```

`getOrder()` hace 2 consultas (`orders` + `order_items`). Define `STATUS_LABELS`, `STATUS_COLORS` (mapeo B de colores, distinto del de `OrdersBoard`) y `glass` variante C. Le falta `print:hidden` en la barra superior, que sí tiene su copia en `productos/[id]`.

Conjunto mínimo: `app/admin/pedidos/[id]/page.jsx`, `components/admin/OrderStatusPanel.jsx`, `app/admin/layout.jsx`.

⚠️ Existe una **segunda implementación** de esta misma pantalla en `app/admin/productos/[id]/page.jsx` (233 líneas, con botón de WhatsApp, fallback de imágenes y `print:hidden`). Para diseñar el detalle de pedido, leer las dos y decidir cuál es la referencia: la ruta correcta tiene el código viejo.

---

## /admin/productos (Listado admin de productos)

Entry: `app/admin/productos/page.jsx` (server, async, `searchParams.categoria`)

```
app/admin/productos/page.jsx
├── lib/supabase/server.js
├── components/admin/ProductsTable.jsx
│   └── lib/supabase/client.js
└── app/admin/layout.jsx
    └── lib/supabase/client.js
```

`getProducts()` filtra por categoría si viene el query param. `ProductsTable` (186 líneas) repite el patrón toolbar de `OrdersBoard` con paddings y radios distintos; enlaza "Editar" a `/admin/productos/{id}` (ruta rota).

Conjunto mínimo: `app/admin/productos/page.jsx`, `components/admin/ProductsTable.jsx`, `app/admin/layout.jsx`.

---

## Rutas restantes (dependencias compactas)

| Ruta | Entry | Dependencias locales |
|---|---|---|
| `/eventos` | `app/eventos/page.jsx` (server) | sólo `lucide-react` + root layout. Todo el contenido (servicios, combos) está hardcodeado en el archivo |
| `/contacto` | `app/contacto/page.jsx` (client) | root layout. `onSubmit` no llama a ningún backend |
| `/checkout/exito` | `app/checkout/exito/page.jsx` (server, `searchParams.order`) | `components/ClearCartOnMount.jsx` → `lib/store/cartStore.js` |
| `/admin/login` | `app/admin/login/page.jsx` (client) | `lib/supabase/client.js` + root layout. Sin shell admin |
| `/admin/productos/nuevo` | `app/admin/productos/nuevo/page.jsx` (server sync) | `components/admin/ProductForm.jsx` → `lib/validations/product.js`, `lib/supabase/client.js`; + `app/admin/layout.jsx` |
| `/admin/productos/[id]` | `app/admin/productos/[id]/page.jsx` (server async) | `lib/supabase/server.js`, `components/admin/OrderStatusPanel.jsx`, `components/admin/PrintButton.jsx`, `app/admin/layout.jsx` — **copia del detalle de pedido; no renderiza `ProductForm`** |

## Grafo inverso — quién usa cada archivo

| Archivo | Consumido por |
|---|---|
| `lib/store/cartStore.js` | `ProductCard`, `AddToCartSection`, `CartDrawer`, `ClearCartOnMount`, `Header`, `/carrito`, `/checkout`, `/favoritos` |
| `lib/store/favoritesStore.js` | `ProductCard`, `AddToCartSection`, `Header`, `/favoritos` |
| `lib/store/uiStore.js` | `Header`, `CartDrawer` |
| `lib/supabase/server.js` | `/`, `/productos`, `/productos/[id]`, `/admin`, `/admin/pedidos`, `/admin/pedidos/[id]`, `/admin/productos`, `/admin/productos/[id]`, `api/orders` |
| `lib/supabase/client.js` | `admin/layout`, `admin/login`, `OrdersBoard`, `OrderNotifications`, `OrderStatusPanel`, `ProductsTable`, `ProductForm` |
| `lib/validations/order.js` | sólo `/checkout` (la API **no** lo usa) |
| `lib/validations/product.js` | sólo `ProductForm` |
| `components/ProductCard.jsx` | `/`, `/productos`, `/productos/[id]` |
| `components/admin/OrderStatusPanel.jsx` | `/admin/pedidos/[id]` y `/admin/productos/[id]` |
| `components/admin/PrintButton.jsx` | `/admin/pedidos/[id]` y `/admin/productos/[id]` |
| `components/admin/OrdersTable.jsx` | **nadie** |
| `components/ClearCartOnMount.jsx` | `/checkout/exito` |
| `app/globals.css` | todas (vía root layout) |
