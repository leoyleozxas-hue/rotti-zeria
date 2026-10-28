# Routes — rotti-zeria (Biarritz)

Rutas del App Router de Next.js 16.4.0 (file-based). **No existe archivo de configuración de rutas** (ni `router/index.ts`, ni `routes.ts`, ni `middleware` con rewrites): la única configuración de navegación declarada en código es el array `NAV_LINKS` de `app/admin/layout.jsx:15-44` y el `NAV_LINKS` de `components/Header.jsx:13-18`. Esos arrays se copian abajo porque son la fuente de verdad de la navegación.

Guard de acceso: `proxy.js` (convención `proxy` de Next 16), matcher `['/admin/:path*']` → exige sesión de Supabase y `user.app_metadata.role === 'admin'`; `/admin/login` queda exceptuado. Ver `layouts.md`, apéndice.

## Tabla de rutas

Leyenda de estado: `OK` = existe y es alcanzable · `OK*` = existe pero su implementación es incorrecta · `FALTA` = enlazada y no existe · `—` = no aplica.

| # | URL | Archivo | Tipo | Layout | Estado | Qué renderiza |
|---|---|---|---|---|---|---|
| 1 | `/` | `app/page.jsx` | Server | Store | OK | Home: hero full-bleed 100svh con foto + textura de madera, barra de info, grid de 5 especialidades, banda de destacados (4 productos de Supabase), historia y CTA de catering |
| 2 | `/productos` | `app/productos/page.jsx` | Server | Store | OK | Catálogo: hero de 50vh con tarjeta glass, sidebar sticky de 6 categorías y grid de `ProductCard` (3 cols en xl). Filtro por `?categoria=` |
| 3 | `/productos/[id]` | `app/productos/[id]/page.jsx` | Server | Store | OK* | Detalle: mitad foto (60%) / mitad ficha editorial (40%), `AddToCartSection`, sellos de calidad y relacionados de la misma categoría. `generateMetadata` propio. *No filtra `is_available`* |
| 4 | `/carrito` | `app/carrito/page.jsx` | Client | Store | OK | Página de carrito completa (lista + total + "Continuar con el pedido"). **Duplica la función de `CartDrawer`** |
| 5 | `/checkout` | `app/checkout/page.jsx` | Client | Store | OK | Formulario de pedido: datos, entrega (pickup/delivery condicional), fecha/hora mínima +24h, pago por transferencia y resumen sticky. `POST /api/orders` |
| 6 | `/checkout/exito` | `app/checkout/exito/page.jsx` | Server | Store | OK* | Confirmación + datos bancarios **ficticios**; `?order=` opcional. *Si se entra sin query, el número sale `undefined`* |
| 7 | `/favoritos` | `app/favoritos/page.jsx` | Client | Store | OK | Favoritos persistidos en localStorage (zustand): lista, agregar al carrito, quitar, vaciar |
| 8 | `/eventos` | `app/eventos/page.jsx` | Server | Store | OK | Landing de catering: hero partido (texto + foto), 3 servicios, 3 combos orientativos y CTA de presupuesto con ancla `#contacto-eventos` |
| 9 | `/contacto` | `app/contacto/page.jsx` | Client | Store | OK* | Hero de madera, bloque de 4 datos de contacto y formulario. *`onSubmit` no envía nada: `setSent(true)` con un `TODO`* |
| 10 | `/admin/login` | `app/admin/login/page.jsx` | Client | **Sin shell** | OK | Login de Supabase Auth con validación de rol. El admin layout corta el sidebar en esta ruta |
| 11 | `/admin` | `app/admin/page.jsx` | Server (async) | Admin | OK | Dashboard: alerta de pendientes, 4 cajas (Hoy/Ayer/7 días/Mes) con conteo y facturación, tabla de últimos 6 pedidos |
| 12 | `/admin/pedidos` | `app/admin/pedidos/page.jsx` | Server (async) | Admin | OK | Tablero de pedidos con realtime (`OrderNotifications`) + `OrdersBoard`. Sub-estados por `?estado=`: `all` \| `new` \| `preparing` \| `ready` \| `history` |
| 13 | `/admin/pedidos/[id]` | `app/admin/pedidos/[id]/page.jsx` | Server (async) | Admin | OK | Detalle de pedido: cabecera con estado, cliente, entrega, ítems con foto, total, `OrderStatusPanel`, referencia de pago y `PrintButton` |
| 14 | `/admin/productos` | `app/admin/productos/page.jsx` | Server (async) | Admin | OK | Listado de productos con `ProductsTable` y CTA "Nuevo producto". Filtro por `?categoria=` (viene del sidebar) |
| 15 | `/admin/productos/nuevo` | `app/admin/productos/nuevo/page.jsx` | Server (sync) | Admin | OK | Alta de producto: `<ProductForm />` sin props |
| 16 | `/admin/productos/[id]` | `app/admin/productos/[id]/page.jsx` | Server (async) | Admin | **OK\* / roto** | **No edita productos.** El archivo es una copia del detalle de pedido (su primera línea dice `// app/admin/pedidos/[id]/page.jsx`): consulta la tabla `orders` con el id del producto y llama `notFound()`. Es la variante del detalle de pedido con `print:hidden`, botón de WhatsApp y fallback de imágenes, pero vive en la ruta equivocada. Destino de los enlaces "Editar" de `ProductsTable` (`:130`, `:169`) |
| 17 | `/admin/destacados` | — | — | — | **FALTA** | Enlazada desde el sidebar (`app/admin/layout.jsx:42`, icono `Star`). No existe el archivo ni la carpeta |
| 18 | `/admin/lunch` | — | — | — | **FALTA** | Enlazada desde el sidebar (`app/admin/layout.jsx:43`, icono `Sandwich`). No existe el archivo ni la carpeta |
| — | `POST /api/orders` | `app/api/orders/route.js` | Route Handler | — | OK | Crea `orders` + `order_items` en Supabase. Consumido solo por `/checkout` (`fetch('/api/orders')`) |

## Enlaces rotos (verificados uno por uno)

| Enlace | Declarado en | Destino | Problema |
|---|---|---|---|
| `/admin/destacados` | `app/admin/layout.jsx:42` | no existe | 404. El sidebar lo pinta como ítem normal, sin señal de "próximamente" |
| `/admin/lunch` | `app/admin/layout.jsx:43` | no existe | 404 |
| `/admin/productos/{id}` | `components/admin/ProductsTable.jsx:130` y `:169` | existe pero no edita productos | El "Editar" de cada tarjeta/fila abre el detalle de un pedido inexistente → `notFound()` |

## Huérfanas / código sin consumidor

| Elemento | Estado |
|---|---|
| `components/admin/OrdersTable.jsx` | **Componente huérfano** (298 líneas). Ningún archivo lo importa; fue reemplazado por `OrdersBoard` |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Assets del scaffold de Next, sin referencias |
| `public/Generated Image October 14, 2026 - 11_18PM.png` | 1,8 MB, sin referencias |
| Dependencia `motion` (^14.2.0) | Instalada, nunca importada |
| Rama de edición de `ProductForm` (`initialData`) | Código muerto: el único uso es `<ProductForm />` en `/admin/productos/nuevo` |

Ninguna **página** queda huérfana: las 16 rutas existentes son alcanzables (10 por navegación visible, `/carrito` desde `AddToCartSection` y `CartDrawer`, `/checkout/exito` por redirección del checkout, y `/admin/productos/nuevo` desde el listado admin).

## Navegación declarada

### `NAV_LINKS` — tienda (`components/Header.jsx:13-18`)

| Label | href | Activo cuando |
|---|---|---|
| Inicio | `/` | `pathname === '/'` |
| Productos | `/productos` | igualdad exacta (**no** se marca activo en `/productos/[id]`) |
| Lunch & Eventos | `/eventos` | igualdad exacta |
| Contacto | `/contacto` | igualdad exacta |

Acciones aparte del nav: `/favoritos` (corazón + badge de cantidad), carrito (abre `CartDrawer`, no navega) y `/admin/login` (link discreto en el footer).

### `NAV_LINKS` — admin (`app/admin/layout.jsx:15-44`)

| Label | href | Hijos |
|---|---|---|
| Dashboard | `/admin` | — |
| Pedidos | `/admin/pedidos` | Todos `/admin/pedidos` · Nuevos `?estado=new` · En preparación `?estado=preparing` · Listos `?estado=ready` · Historial `?estado=history` |
| Productos | `/admin/productos` | Todos `/admin/productos` · Panes `?categoria=Panes` · Facturas `?categoria=Facturas` · Dulces `?categoria=Dulces` · Salados `?categoria=Salados` · Bocados calientes `?categoria=Bocados calientes` |
| Destacados | `/admin/destacados` | — (**ruta faltante**) |
| Lunch & Eventos | `/admin/lunch` | — (**ruta faltante**) |

Pie del sidebar: `Ver tienda` → `/` y `Cerrar sesión` (botón, no link: `supabase.auth.signOut()` + push a `/admin/login`).

El título del topbar se deriva del pathname con un ternario (`app/admin/layout.jsx:269-271`): `.includes('/pedidos')` → "Pedidos", `.includes('/productos')` → "Productos" (por eso `/admin/productos/nuevo` sí muestra "Productos"), cualquier otra cosa → "Dashboard".

## Parámetros y query strings

| Ruta | Params | Query | Consumido en |
|---|---|---|---|
| `/productos` | — | `categoria` (`Todos` \| `Panes` \| `Facturas` \| `Dulces` \| `Salados` \| `Bocados calientes`) | `app/productos/page.jsx:72-74, 35-37` |
| `/productos/[id]` | `id` (uuid) | — | `app/productos/[id]/page.jsx:142, 159` |
| `/checkout/exito` | — | `order` (nº de pedido, opcional) | `app/checkout/exito/page.jsx:6-7` |
| `/admin/pedidos` | — | `estado` (`all` \| `new` \| `preparing` \| `ready` \| `history`) | `app/admin/pedidos` → `OrdersBoard:112-118` |
| `/admin/pedidos/[id]` | `id` (uuid) | — | `app/admin/pedidos/[id]/page.jsx:52` |
| `/admin/productos` | — | `categoria` (5 categorías) | `app/admin/productos/page.jsx:17-19` |
| `/admin/productos/[id]` | `id` | — | ruta rota (ver arriba) |

## Ruta por ruta: qué se ve

- **`/`** — 6 bandas verticales alternando claro/oscuro: hero 100svh con `animate-hero-zoom` y `animate-hero-rise`, franja de madera vertical con horario/dirección/artesanal, especialidades (5 tarjetas rectangulares borde `#c4b5a5`), banda de madera horizontal con 4 `ProductCard`, historia a 2 columnas con imagen con `ring` y textura multiplicada, CTA final en madera.
- **`/productos`** — hero con tarjeta glass `bg-[#150604]/60 backdrop-blur-md border-white/20` y, debajo, fondo de madera fija con sidebar blanco `sticky top-24` y grilla de tarjetas.
- **`/productos/[id]`** — layout partido sin márgenes (`bg-[#FAF7F2]`), botón "Volver" pill flotante sobre la foto, tipografía `text-5xl lg:text-7xl` para el nombre, filtro CSS `contrast/saturate/brightness` sobre la imagen.
- **`/carrito`** — versión página del carrito: `bg-white rounded-2xl`, controles `rounded-full`, botones con clases token (`bg-chocolate`, `text-caramel`, `border-beige`).
- **`/checkout`** — grilla `lg:grid-cols-[1fr_400px]`, 4 secciones en tarjetas blancas `rounded-2xl p-6 shadow-sm`, radios de entrega con `peer-checked:border-gold`, resumen sticky con scroll interno (`max-h-72`).
- **`/checkout/exito`** — tarjeta blanca centrada con emoji 🥖, número de pedido en `text-gold` y bloque `bg-beige` con datos bancarios.
- **`/favoritos`** — lista de filas blancas con miniatura 80px, precio y CTA "Agregar".
- **`/eventos`** — hero oscuro partido con foto a sangre, 3 tarjetas de servicio con icono en círculo `#3a130d`, 3 combos y CTA en madera vertical con `id="contacto-eventos"`.
- **`/contacto`** — hero de madera + grilla `md:grid-cols-5` (info 2 / formulario 3); inputs **rectangulares** con `border-[#c4b5a5]`.
- **`/admin`** — paneles glass sobre madera, cajas con cifra en `font-serif text-4xl`, tabla de últimos pedidos con `font-mono` para el número.
- **`/admin/pedidos`** — buscador + toggle grid/lista + tabs pill con contador; tarjetas de pedido con borde por estado; tabla de 6 columnas en vista lista.
- **`/admin/pedidos/[id]`** — 4 bloques glass apilados: cabecera, cliente/entrega en 2 columnas, ítems con miniatura + total destacado, y panel de acciones.
- **`/admin/productos`** — header con conteo + CTA dorado, luego toolbar (búsqueda/orden/toggle) y grid de tarjetas con badge Visible/Oculto.
- **`/admin/productos/nuevo`** — formulario en grilla `md:grid-cols-[1fr_300px]`: datos a la izquierda, dropzone de imagen + botones a la derecha.
