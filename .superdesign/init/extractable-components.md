# Extractable components — rotti-zeria (Biarritz)

Catálogo de componentes del repo que se pueden extraer como `DraftComponent` reutilizables en Superdesign. Este archivo es el "menú": el flujo de diseño lo lee para decidir qué extraer antes de generar borradores. El código completo está en `components.md` y `layouts.md`.

Criterio de *Extractable props*: **sólo** props de estado/navegación que cambian según la página (activo, href, contadores, flags de visibilidad). Todo lo demás (textos, iconos, clases, imágenes) es *Hardcoded* y se reproduce tal cual.

| # | Componente | Archivo | Categoría | Usado en |
|---|---|---|---|---|
| 1 | `StoreShell` | `components/StoreShell.jsx` | layout | todas las rutas de tienda |
| 2 | `StoreHeader` | `components/Header.jsx` | layout | todas las rutas de tienda |
| 3 | `StoreFooter` | `components/Footer.jsx` | layout | todas las rutas de tienda |
| 4 | `CartDrawer` | `components/cart/CartDrawer.jsx` | layout | todas las rutas de tienda (global) |
| 5 | `AdminShell` | `app/admin/layout.jsx` | layout | todas las rutas `/admin/*` salvo login |
| 6 | `AdminSidebar` | `app/admin/layout.jsx:136-251` | layout | ídem (parte del shell) |
| 7 | `AdminTopbar` | `app/admin/layout.jsx:254-291` | layout | ídem (parte del shell) |
| 8 | `AdminLoginCard` | `app/admin/login/page.jsx:64-125` | layout | `/admin/login` |
| 9 | `ProductCard` | `components/ProductCard.jsx` | basic | `/`, `/productos`, `/productos/[id]` |
| 10 | `QuantityStepper` | `components/AddToCartSection.jsx:31-48` + `CartDrawer.jsx:88-96` | basic | detalle de producto, carrito |
| 11 | `AddToCartBar` | `components/AddToCartSection.jsx` | basic | `/productos/[id]` |
| 12 | `OrderStatusBadge` | `components/admin/OrdersBoard.jsx:43-81` (y copia en `OrdersTable.jsx:37-76`) | basic | tablero y tabla de pedidos |
| 13 | `OrderStatusPanel` | `components/admin/OrderStatusPanel.jsx` | basic | detalle de pedido |
| 14 | `OrdersBoard` | `components/admin/OrdersBoard.jsx` | basic | `/admin/pedidos` |
| 15 | `ProductsTable` | `components/admin/ProductsTable.jsx` | basic | `/admin/productos` |
| 16 | `ProductForm` | `components/admin/ProductForm.jsx` | basic | `/admin/productos/nuevo` |
| 17 | `PrintButton` | `components/admin/PrintButton.jsx` | basic | detalle de pedido |
| 18 | `EmptyState` (patrón, no componente) | 3 implementaciones distintas | basic | carrito, checkout, favoritos, tablas admin |

---

## Layout

## StoreShell
- Source: `components/StoreShell.jsx`
- Category: layout
- Description: Decide qué chrome mostrar según la ruta; en `/admin/*` devuelve sólo `children`, en tienda monta header + main + footer + drawer.
- Extractable props: `variant` ("store" | "bare", default: "store")
- Hardcoded: `usePathname()` + `startsWith('/admin')`, `<main className="flex-1 pt-[4.25rem]">`, orden de los 4 hijos, `flex min-h-screen flex-col` del body en el root layout.

## StoreHeader
- Source: `components/Header.jsx`
- Category: layout
- Description: Barra superior fija de 68px, translúcida oscura, con logo, 4 links, favoritos, carrito y hamburguesa móvil.
- Extractable props: `activeHref` (string, default: derivado de `pathname`), `cartCount` (number, default: 0), `favoritesCount` (number, default: 0), `isMenuOpen` (boolean, default: false)
- Hardcoded: logo `/images/logo-biarritz-blanco.png` con `mix-blend-screen`, los 4 items (`Inicio /`, `Productos /productos`, `Lunch & Eventos /eventos`, `Contacto /contacto`), iconos `Heart`/`ShoppingBag`/`Menu`/`X`, badge carrito `bg-[#C9A96E] text-[#2C1E16]`, badge favoritos `bg-red-500`, `bg-[#1a0806]/50 backdrop-blur-xl`, borde activo `border-[#C9A96E]` (desktop) y `border-l-2` (móvil).

## StoreFooter
- Source: `components/Footer.jsx`
- Category: layout
- Description: Footer de 3 columnas sobre textura de madera, con barra inferior de copyright y acceso a admin.
- Extractable props: ninguna (server component sin estado)
- Hardcoded: gradiente `rgba(18,4,2,.75)→.82` + `url('/images/textura-madera.png')`, títulos `Biarritz / Contacto / Horarios`, dirección `Av. Siempre Viva 123`, `WhatsApp: 11 1234-5678`, horarios `Lun a Sáb: 7:00 - 20:00` / `Dom: 8:00 - 13:00`, link `/admin/login` con icono `Lock` y texto "Acceso Admin", año dinámico.

## CartDrawer
- Source: `components/cart/CartDrawer.jsx`
- Category: layout
- Description: Drawer lateral derecho de 420px con overlay, lista, total y CTA a checkout; bloquea el scroll del body.
- Extractable props: `isOpen` (boolean, default: false), `items` (array, default: []), `total` (number)
- Hardcoded: `z-[100]`/`z-[110]`, `w-full sm:w-[420px] bg-[#FAF7F2]`, iconos `ShoppingBag`/`X`/`Trash2`/`Plus`/`Minus`, textos `Tu pedido` / `Tu carrito está vacío` / `Total estimado` / `Finalizar compra` / `Continuar comprando` / `Volver a la tienda`, botones rectangulares `py-4` (sin radio), formato `es-AR`.

## AdminShell
- Source: `app/admin/layout.jsx`
- Category: layout
- Description: Shell completo del panel: fondo de madera, sidebar fijo, topbar sticky, `<main>` y `<Toaster>`; corta en `/admin/login`.
- Extractable props: `activeSection` ("dashboard" | "pedidos" | "productos" | "destacados" | "lunch"), `pageTitle` (string, default: derivado del pathname), `todayLabel` (string), `isSidebarOpen` (boolean, default: false)
- Hardcoded: `woodMain` / `woodSidebar` / `topbarStyle` (imágenes de textura + radiales), `NAV_LINKS` completo con iconos `LayoutDashboard`/`ShoppingBag`/`Package`/`Star`/`Sandwich`, pie "Ver tienda" + "Cerrar sesión", `<Suspense fallback="Cargando panel...">`, `Toaster position="top-right" richColors`, `w-72`, `h-14`.

## AdminSidebar
- Source: `app/admin/layout.jsx:136-251`
- Category: layout
- Description: Sidebar fijo de 288px con textura vertical, logo grande, grupos expandibles con hijos y acciones de cuenta.
- Extractable props: `activeItem` (string), `expandedGroups` (string[], default: derivado del pathname), `isOpen` (boolean, desktop siempre visible)
- Hardcoded: `NAV_LINKS` y sus hijos con query strings (`?estado=…`, `?categoria=…`), logo 340×120 `max-h-32 mix-blend-screen`, `ChevronDown` rotado, item activo `bg-gradient-to-r from-[#E0C89A]/25 to-[#E0C89A]/10 border-[#E0C89A]/40`, `shadow-[inset_0_1px_0_rgba(255,255,255,.15)]`, `custom-scrollbar`, overlay móvil `bg-black/60`.
- Nota: `Destacados` y `Lunch & Eventos` se renderizan igual que los demás aunque sus rutas no existan.

## AdminTopbar
- Source: `app/admin/layout.jsx:254-291`
- Category: layout
- Description: Topbar sticky de 56px con hamburguesa, kicker "Admin", título de sección, chip de fecha y pill "Tienda".
- Extractable props: `title` (string, default: "Dashboard"), `todayLabel` (string, default: "")
- Hardcoded: kicker `text-[9px] uppercase tracking-[0.2em] text-[#E0C89A]` con texto "Admin", iconos `Menu`/`Calendar`/`ExternalLink`, chips `border-white/15 bg-white/5` y `border-white/20 bg-white/8`, link `/`, `backdrop-blur-xl` + `topbarStyle`.

## AdminLoginCard
- Source: `app/admin/login/page.jsx:64-125`
- Category: layout
- Description: Tarjeta de login centrada sobre madera vertical: logo, candado, título y 2 campos + botón pill claro.
- Extractable props: `errorMessage` (string | null, default: null), `isLoading` (boolean, default: false)
- Hardcoded: `woodBg` (`rgba(18,4,2,.55)→.7` + textura vertical), tarjeta `bg-white/15 backdrop-blur-xl` **sin radio**, logo 200×73, círculo `w-12 h-12 rounded-full border-white/30 bg-white/10` con `Lock`, textos `Panel Biarritz` / `Acceso restringido` / `Ingresar` / `Ingresando...`, placeholder `admin@biarritz.com`, botón "Volver a la tienda" pill flotante `top-6 left-6`.

---

## Basic

## ProductCard
- Source: `components/ProductCard.jsx`
- Category: basic
- Description: Tarjeta de producto del catálogo: imagen cuadrada, badge, corazón, categoría, nombre, descripción, precio y botón "Agregar".
- Extractable props: `isFavorite` (boolean, default: false), `href` (string, default: `/productos/{id}`), `showBadge` (boolean, default: true)
- Hardcoded: badge "Más vendido" **siempre** si `category === 'Facturas'`, iconos `Plus`/`Heart`, fondo `bg-[#FCFAF8]`, borde `border-[#EADFC8]` → `hover:border-[#C9A96E]`, `rounded-2xl`, corazón en círculo `w-9 h-9 bg-white/90`, botón `bg-[#2B0F0B] rounded-full`, precio `font-serif text-xl font-bold`, `line-clamp-2`.

## QuantityStepper
- Source: `components/AddToCartSection.jsx:31-48` (rectangular) y `components/cart/CartDrawer.jsx:88-96` (con borde, compacto) y `app/carrito/page.jsx:50-64` (circular, `bg-beige`)
- Category: basic
- Description: Control de cantidad −/+ con el número al centro. Existe en **tres variantes visuales distintas** para el mismo gesto.
- Extractable props: `value` (number, default: 1), `min` (number, default: 1)
- Hardcoded: iconos `Minus`/`Plus` (14-16px), variante A `border border-[#EADFC8] bg-white` + `w-10 h-10`, variante B `rounded-lg` + `p-1.5`, variante C `w-8 h-8 rounded-full bg-beige hover:bg-gold-soft`, `aria-label` ausente en las tres.

## AddToCartBar
- Source: `components/AddToCartSection.jsx`
- Category: basic
- Description: Bloque de compra del detalle: stepper + botón "Añadir al pedido" + botón de favorito cuadrado.
- Extractable props: `isFavorite` (boolean, default: false), `quantity` (number, default: 1), `isPending` (boolean, default: false)
- Hardcoded: textos `Cantidad` / `Añadir al pedido`, iconos `ShoppingBag`/`Heart`/`Minus`/`Plus`, botón principal `bg-[#2B0F0B] py-4` **sin radio** (a diferencia del resto de la tienda), favorito `w-14 h-14 border-[#EADFC8] bg-white`, corazón activo `fill-red-500`, `router.push('/carrito')` al agregar.

## OrderStatusBadge
- Source: `components/admin/OrdersBoard.jsx:43-81` — copia casi idéntica en `components/admin/OrdersTable.jsx:37-76` — tercer mapeo distinto en `app/admin/pedidos/[id]/page.jsx:20-28` — cuarto (neutro) en `app/admin/page.jsx:179`
- Category: basic
- Description: Badge pill con punto pulsante que representa el estado de un pedido. **Cuatro implementaciones con colores distintos para el mismo dato.**
- Extractable props: `status` ("pending_payment" | "payment_review" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"), `size` ("sm" | "md", default: "sm")
- Hardcoded: en `OrdersBoard`: pendiente `bg-gradient-to-r from-amber-600 to-amber-500 text-black` + punto `animate-pulse`, activo `emerald-500/20 text-emerald-300`, listo `cyan-500/20 text-cyan-300`, entregado `white/10 text-white/60`, cancelado `red-500/10 text-red-400`; `text-[9px] uppercase tracking-wider font-bold`; labels en español `Pendiente de pago / Revisar pago / Confirmado / Preparando / Listo / Entregado / Cancelado`.

## OrderStatusPanel
- Source: `components/admin/OrderStatusPanel.jsx`
- Category: basic
- Description: Panel de acciones del pedido con siguiente paso lógico, cancelación y grilla opcional de todos los estados.
- Extractable props: `status` (string), `nextStatus` (string | null, default: derivado de `FLOW`), `nextLabel` (string), `canCancel` (boolean, default: !delivered && !cancelled), `isBusy` (boolean, default: false), `showAll` (boolean, default: false)
- Hardcoded: mapa `FLOW` completo (`Confirmar pago` → `Empezar a preparar` → `Marcar como listo` → `Marcar como entregado`), `STATUS_LABELS`, `glass` variante A, botón principal `bg-[#E0C89A] text-[#2b0f0b] py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#E0C89A]/20`, botón cancelar `text-red-300 border-red-500/30 bg-red-500/10`, textos "Acciones del pedido" / "Ver todos los estados" / "Forzar cambio a cualquier estado".

## OrdersBoard
- Source: `components/admin/OrdersBoard.jsx`
- Category: basic
- Description: Tablero de pedidos con tabs sincronizadas a la URL, buscador, toggle grid/lista persistido, acciones por estado y modal de cancelación.
- Extractable props: `activeTab` ("all" | "new" | "preparing" | "ready" | "history", default: "all"), `view` ("grid" | "list", default: "grid"), `query` (string, default: ""), `expandedOrderId` (string | null), `cancelTargetId` (string | null)
- Hardcoded: `TABS` con labels y conteos, `STATUS_LABELS`, `formatDate` (`dd-mon, hh:mm` en español), `getCardBorder` (bordes ámbar/verde/cian/blanco/rojo), tarjeta `bg-[#2A1810]/90 backdrop-blur-md rounded-xl p-4`, toolbar con `bg-[#1a0806]` + `rounded-xl`, tabs pill activas `bg-[#C9A96E] text-[#2b0f0b]`, inactivas `bg-[#23120B]`, tabla `min-w-[700px]` con `font-mono` en el número, modal `bg-[#2A1810] border-red-500/30`, localStorage key `admin-orders-view`, textos `Buscar por número, nombre o teléfono...` / `No hay pedidos en esta categoría`.

## ProductsTable
- Source: `components/admin/ProductsTable.jsx`
- Category: basic
- Description: Listado admin de productos en grid o tabla, con búsqueda, orden y borrado.
- Extractable props: `view` ("grid" | "list", default: "grid"), `query` (string, default: ""), `sortBy` ("name-asc" | "name-desc" | "price-asc" | "price-desc", default: "name-asc"), `deletingId` (string | null)
- Hardcoded: `glass` variante B (`bg-[#2A1810]/80`), badge visible/oculto (`bg-emerald-500/20` / `bg-black/50`), iconos `Search`/`LayoutGrid`/`List`/`Pencil`/`Package`/`Trash2`/`Loader2`, `window.confirm` para borrar, localStorage key `admin-products-view`, opciones `A - Z / Z - A / Precio: Menor / Precio: Mayor`, textos `Buscar producto por nombre...` / `Todavía no hay productos cargados.` / `Crear el primer producto`.

## ProductForm
- Source: `components/admin/ProductForm.jsx`
- Category: basic
- Description: Formulario de alta/edición de producto con dropzone de imagen, validación zod y guardado en Supabase.
- Extractable props: `mode` ("create" | "edit", default: "create"), `isLoading` (boolean, default: false), `imagePreview` (string | null), `errors` (objeto de react-hook-form)
- Hardcoded: `CATEGORIES = ['Panes','Facturas','Dulces','Salados','Bocados calientes']`, labels `Nombre / Precio ($) / Categoría / Descripción / Producto visible y disponible en la tienda`, textos `Click para subir foto` / `Cambiar foto` / `Guardar producto` / `Guardando...` / `Cancelar`, `glass` variante A, dropzone `aspect-square border-2 border-dashed border-white/20`, checkbox `accent-[#E0C89A]`, grid `md:grid-cols-[1fr_300px]`, bucket `product-images`.

## PrintButton
- Source: `components/admin/PrintButton.jsx`
- Category: basic
- Description: Botón pill translúcido que dispara `window.print()`.
- Extractable props: ninguna
- Hardcoded: icono `Printer`, texto "Imprimir", `border-white/20 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-sm`.

## EmptyState (patrón, no existe como componente)
- Source: 4 implementaciones independientes — `components/cart/CartDrawer.jsx:61-68`, `app/checkout/page.jsx:52-67`, `app/favoritos/page.jsx:14-32`, `components/admin/ProductsTable.jsx:55-65` (+ `OrdersBoard.jsx:292-297`)
- Category: basic
- Description: Estado vacío = icono grande centrado + frase + CTA. Repetido con 4 combinaciones distintas de tamaño, color y CTA.
- Extractable props (propuesta): `icon` (string), `title` (string), `description` (string), `actionLabel` (string), `actionHref` (string)
- Hardcoded hoy: `ShoppingBag size={48} text-[#EADFC8]` (drawer), `ShoppingBag size={48} text-caramel/30` (checkout), `Heart size={48} text-caramel/30` (favoritos), `Package size={32} text-white/40` (admin, sin CTA); ningún caso comparte clases.

---

## Patrones repetidos que **no** existen como componente

No están en el repo como archivos; se listan porque son los candidatos naturales a `DraftComponent` nuevo. No inventar archivos existentes para ellos.

| Patrón | Repeticiones | Archivos |
|---|---|---|
| Barra de búsqueda + toggle grid/lista | 3 | `OrdersBoard.jsx:225-254`, `ProductsTable.jsx:70-105`, `OrdersTable.jsx:135-170` |
| Banda de madera (fondo + gradiente) | 12 objetos de estilo | `page.jsx`, `productos`, `eventos`, `contacto`, `admin/layout`, `admin/login`, `Footer` |
| Panel "glass" | 4 variantes | `admin/page.jsx`, `ProductsTable`, `pedidos/[id]`, `productos/page.jsx` |
| Header de página (título serif + subtítulo + acción) | 5 | `admin/page.jsx:76-79`, `admin/pedidos:32-35`, `admin/productos:24-31`, `admin/productos/nuevo:16-19`, `productos/[id]:56-62` |
| Tabs pill con contador | 2 | `OrdersBoard.jsx:270-289`, `OrdersTable.jsx:184-207` |
| Modal de confirmación | 2 | `OrdersBoard.jsx:382-402` (custom), `ProductsTable.jsx:32` (`window.confirm`) |
| Kicker/eyebrow en mayúsculas | 8+ | home, productos, eventos, detalle, admin topbar, `OrderStatusPanel` |
| Icono en círculo | 4 | `contacto:45`, `eventos:99`, `admin/page.jsx:88`, `admin/login:73` |
