# Theme — rotti-zeria (Biarritz)

Tailwind CSS **4** con configuración inline (`@theme` dentro de `app/globals.css`). **No existe `tailwind.config.js/ts`**; sólo `postcss.config.mjs` con `@tailwindcss/postcss`. Tampoco hay `ThemeProvider`, `data-theme`, ni modo oscuro: el sistema es de un único tema claro (tienda) + un tema oscuro hardcodeado exclusivo del admin.

---

# Parte 1 — Resumen compacto de tokens

## 1.1 Color (paleta real, definida en `app/globals.css:3-14`)

| Token | Valor | Uso previsto |
|---|---|---|
| `--color-cream` | `#F5EDE3` | fondo base del `body`, texto sobre fondos oscuros |
| `--color-beige` | `#EADFC8` | bordes suaves, fondos de miniatura, chips |
| `--color-wood` | `#3A1E14` | marrón de madera (**definido pero nunca usado como utilidad**) |
| `--color-caramel` | `#6B3A2C` | texto secundario |
| `--color-chocolate` | `#2B0F0B` | texto principal, botones primarios |
| `--color-gold` | `#C9A96E` | acento, precios, foco |
| `--color-gold-soft` | `#E0C89A` | acento claro sobre fondos oscuros |

Utilidades generadas por Tailwind 4: `bg-*`, `text-*`, `border-*`, `fill-*`, `from-*`, `to-*`, `accent-*` (`cream`, `beige`, `wood`, `caramel`, `chocolate`, `gold`, `gold-soft`).

`body { background-color: var(--color-cream); color: var(--color-chocolate) }` y `h1,h2,h3,h4 { font-family: var(--font-serif); font-weight: 600 }`.

**Hex fuera de la paleta que actúan como tokens de facto** (todos escritos a mano, ninguno definido en `@theme`):

| Hex | Rol en la UI | Apariciones |
|---|---|---|
| `#1a0806` | fondo oscuro de header, inputs de admin, tabla | 20 |
| `#150604` | fondo del shell admin, hero de productos | 9 |
| `#2A1810` | superficie de tarjetas del admin | 14 |
| `#341D14` | superficie secundaria del admin | 4 |
| `#23120B` | pill/tab inactivo del admin | 2 |
| `#3a130d` | marrón de acento de la tienda (home/eventos/contacto) | 17 |
| `#5a1a10` | hover de botones y links de la tienda | 9 |
| `#2C1E16` | texto del badge del carrito en el header | 1 |
| `#9a8b7a` | texto meta/eyebrow cálido | 7 |
| `#c4b5a5` | borde cálido | 2 |
| `#FAF7F2` | superficie clara del detalle de producto y del drawer | 6 |
| `#FCFAF8` | superficie de tarjeta de producto | 3 |

## 1.2 Tipografía

| Rol | Familia | Cómo llega |
|---|---|---|
| Display / títulos | **Fraunces** (serif) | `next/font/google`, `variable: '--font-fraunces'` → `--font-serif` |
| Cuerpo / UI | **Inter** (sans) | `next/font/google`, `variable: '--font-inter'` → `--font-sans` |
| Datos (nº de pedido) | mono del sistema | utilidad `font-mono` (no hay fuente mono cargada) |

`--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif` · `--font-serif: var(--font-fraunces), ui-serif, Georgia, serif`. Ambas con `subsets: ['latin']` y `display: 'swap'`. No hay pesos explícitos: se usan los defaults de la variable font.

Escala real usada (conteo de utilidades en 32 archivos `.jsx`):

| Utilidad | px / rem | Veces | Dónde |
|---|---|---|---|
| `text-[9px]` | 9px | 7 | kickers y badges del admin |
| `text-[10px]` | 10px | 12 | categorías, badges, pills |
| `text-[11px]` | 11px | 6 | kickers, chips de topbar |
| `text-xs` | 12px | 56 | metadatos, tablas, ayudas |
| `text-sm` | 14px | 115 | **cuerpo por defecto de la UI** |
| `text-base` | 16px | 4 | casos sueltos |
| `text-lg` | 18px | 30 | subtítulos, precios de tarjeta |
| `text-xl` | 20px | 15 | `h2` de panel |
| `text-2xl` | 24px | 10 | títulos de drawer / cifras |
| `text-3xl` | 30px | 12 | totales, `h1` de admin |
| `text-4xl` | 36px | 24 | `h1` de página |
| `text-5xl` | 48px | 11 | hero de eventos/producto |
| `text-6xl` | 60px | 3 | hero de home/productos |
| `text-7xl` | 72px | 2 | hero de eventos y detalle de producto |

No hay tokens de tipografía: 14 tamaños + 3 px arbitrarios, sin nombres semánticos.

Tracking (eyebrows en mayúsculas): `tracking-wider` ×23, `tracking-wide` ×23, `tracking-[0.2em]` ×3, `tracking-[0.3em]` ×4, `tracking-[0.18em]` ×1, `tracking-tight` ×1.

## 1.3 Espaciado

Escala por defecto de Tailwind 4 (paso 0.25rem). Ritmo observado, no tokenizado:

| Contexto | Valores usados |
|---|---|
| Sección vertical | `py-20` (home/eventos/productos), `py-16`, `py-12`, `py-7` (barra de info) |
| Contenedor horizontal | `px-4` siempre |
| Ancho de contenido | `max-w-6xl` ×9 · `max-w-4xl` ×7 · `max-w-5xl` ×5 · `max-w-3xl` ×3 · `max-w-2xl` ×3 · `max-w-7xl` ×3 |
| Gap de grillas | `gap-4` / `gap-6` / `gap-8` / `gap-10` / `gap-12` |
| Padding de tarjeta | `p-4` / `p-5` / `p-6` / `p-8` / `p-12` |
| Altura del header de tienda | `h-[4.25rem]` = 68px (offset replicado como `pt-[4.25rem]` / `-mt-[4.25rem]`) |
| Sidebar admin | `w-72` = 288px |

## 1.4 Radios (sin tokens; conteo real)

| Utilidad | Veces |
|---|---|
| `rounded-full` | 60 |
| `rounded-xl` | 46 |
| `rounded-2xl` | 34 |
| `rounded-lg` | 30 |
| `rounded-md` | 3 |
| Total | **173** |

Sin regla de asignación: la tarjeta de producto es `rounded-2xl` (`ProductCard.jsx:37`), la de pedido `rounded-xl` (`OrdersBoard.jsx:303`), el panel de métrica `rounded-2xl` (`admin/page.jsx:108`); los inputs alternan `rounded-xl` (checkout), `rounded-lg` (drawer) y esquina recta (`AddToCartSection.jsx:54`, `contacto`, `admin/login`).

## 1.5 Sombras

| Patrón | Definición | Dónde |
|---|---|---|
| Glass (A) | `shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]` | `admin/page.jsx:17`, `OrderStatusPanel.jsx:30`, `ProductForm.jsx:16`, `app/admin/productos/[id]/page.jsx:30` |
| Glass (B) | `shadow-xl` | `app/admin/pedidos/[id]/page.jsx:30` |
| Superficie admin | `shadow-lg shadow-black/40` | `OrdersBoard`, `OrdersTable`, `ProductsTable` |
| Tienda | `shadow-sm` → `hover:shadow-2xl` | `ProductCard.jsx:37`, tarjetas de carrito/checkout |
| Overlay | `shadow-2xl` | `CartDrawer.jsx:41`, sidebar admin |

Conteo: `shadow-sm` ×15, `shadow-md` ×12, `shadow-lg` ×14, `shadow-2xl` ×5, `shadow-inner` ×3, `shadow-xl` ×2, más ~20 sombras arbitrarias `shadow-[…]`.

## 1.6 Breakpoints

Tailwind 4, defaults sin override: `sm` 40rem (640px) · `md` 48rem (768px) · `lg` 64rem (1024px) · `xl` 80rem (1280px) · `2xl` 96rem (1536px). En el código sólo se usan `sm`, `md`, `lg` y `xl`; `2xl` no aparece. Los cortes propios del proyecto: header colapsa a hamburguesa en `md`, sidebar admin aparece en `md`, grilla de productos pasa a 3 columnas en `xl`, checkout a 2 columnas en `lg`.

## 1.7 Animación

| Nombre | Keyframes | Uso |
|---|---|---|
| `animate-hero-rise` | `hero-rise`: opacity 0→1, translateY 1.25rem→0, 0.9s ease-out both | contenido del hero de la home |
| `animate-hero-zoom` | `hero-zoom`: scale 1.06→1, 1.4s ease-out both | foto del hero de la home |

Ambas se anulan con `@media (prefers-reduced-motion: reduce)`. No hay transiciones declaradas fuera de utilidades (`transition`, `duration-300`, `duration-500`). El paquete `motion` está instalado pero no se usa.

## 1.8 Patrones de estilo repetidos (lo que hay que reproducir)

### Glass paneles (3 variantes que deberían ser una)
| Variante | Clases | Archivos |
|---|---|---|
| A — admin "cristal" | `relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]` | `admin/page.jsx`, `OrderStatusPanel.jsx`, `ProductForm.jsx`, `admin/productos/[id]` |
| B — admin "madera traslúcida" | `border border-[#C9A96E]/20 bg-[#2A1810]/80 backdrop-blur-md shadow-lg shadow-black/40` | `ProductsTable.jsx:12` |
| C — admin "negro traslúcido" | `relative border border-white/10 bg-[#1a0806]/60 backdrop-blur-xl shadow-xl` | `admin/pedidos/[id]/page.jsx:30` |
| D — tienda | `bg-[#150604]/60 backdrop-blur-md border border-white/20` | `productos/page.jsx:94` |

También hay glass de tienda en `Footer`/heros de madera (ver abajo) y en `admin/login` (`bg-white/15 backdrop-blur-xl`, sin `rounded`).

### Madera como fondo (el patrón más extendido: 12 objetos de estilo inline en 9 archivos)

| Archivo | Imagen | Gradiente |
|---|---|---|
| `app/page.jsx:9-14` (`woodVertical`) | `textura-madera-vertical.png` | `rgba(18,4,2,.55)`→`.72` |
| `app/page.jsx:16-21` (`woodHorizontal`) | `textura-madera.png` | `rgba(18,4,2,.5)`→`.55` |
| `app/productos/page.jsx:8-14` (`woodCatalog`) | `textura-madera.png`, `fixed` | `rgba(18,4,2,.85)`→`.90` |
| `app/eventos/page.jsx:136-141` | `textura-madera-vertical.png` | `rgba(18,4,2,.65)`→`.8` |
| `app/contacto/page.jsx:6-11` (`woodVertical`) | `textura-madera-vertical.png` | `rgba(18,4,2,.45)`→`.65` |
| `app/checkout/exito` | — | usa `bg-beige` (no madera) |
| `app/admin/layout.jsx:46-51` (`woodSidebar`) | `textura-madera-vertical.png` | `rgba(10,3,1,.72)`→`.85` |
| `app/admin/layout.jsx:53-60` (`woodMain`) | `textura-madera.png` + 2 radiales + `#150604` | `rgba(10,3,1,.88)`→`.92` |
| `app/admin/layout.jsx:62-67` (`topbarStyle`) | `textura-madera.png` | `rgba(10,3,1,.75)`→`.85` |
| `app/admin/login/page.jsx:11-16` (`woodBg`) | `textura-madera-vertical.png` | `rgba(18,4,2,.55)`→`.7` |
| `components/Footer.jsx:8-14` | `textura-madera.png` | `rgba(18,4,2,.75)`→`.82` |

Dos familias de overlay conviven: tienda `rgba(18,4,2,…)` y admin `rgba(10,3,1,…)`. La textura horizontal (2018 KB) y la vertical (1667 KB) son PNG sin optimizar usados como `background-image`.

### Botones pill (patrón dominante de la tienda)
`rounded-full` + `px-7/px-8 py-3/3.5` + `font-medium|semibold` + `transition`:
- primario claro: `bg-[#F5EDE3] text-[#2b0f0b] hover:bg-white` (home, eventos, login)
- primario oscuro: `bg-[#2B0F0B] text-white hover:bg-[#5a1a10]` (ProductCard, checkout con tokens `bg-chocolate`)
- fantasma sobre foto: `border border-white/60 text-white hover:bg-white/10`
- acento dorado: `bg-[#E0C89A] text-[#2b0f0b] hover:bg-white` (admin CTAs, eventos)
- El admin usa además pills chicos con borde: `border border-white/20 bg-white/8 px-3 py-1 rounded-full` (topbar) y `bg-white/10 backdrop-blur-xl px-4 py-2` (PrintButton).
- **Excepciones rectangulares**: `AddToCartSection`, `CartDrawer` (`py-4`, sin radio), `contacto` (inputs rectangulares), `admin/login` (tarjeta y inputs sin radio).

### Badges y estados
- Badge de categoría: `text-[10px] uppercase tracking-wider font-semibold text-[#9a8b7a]`.
- Kicker/eyebrow: `text-[11px] uppercase tracking-[0.2em]|0.3em] font-bold text-[#E0C89A]` sobre oscuro, `text-[#9a8b7a]` sobre claro.
- Badge "Más vendido": `bg-[#C9A96E] text-[#2b0f0b] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full`.
- Badge de carrito: `bg-[#C9A96E] text-[#2C1E16]`; badge de favoritos: `bg-red-500 text-white`. Dos estilos para el mismo gesto.
- Iconos en círculo: `h-10 w-10 rounded-full bg-[#3a130d] text-white` (contacto) y `h-12 w-12 rounded-full bg-[#3a130d] text-[#F5EDE3]` (eventos).

### Formato de datos
Precios siempre `${Number(price).toLocaleString('es-AR')}`. Fechas con `toLocaleDateString('es-AR', …)`; en el admin, `font-mono` para `order_number`.

---

# Parte 2 — Volcados de fuente

No hay archivos de tema adicionales: no existe `tailwind.config.*`, ni `theme.ts`, ni `ThemeProvider`, ni `[data-theme]`, ni `.dark`. Los únicos archivos que definen estilo global son los tres de abajo.

## 2.1 `app/globals.css` (completo, 93 líneas)

```css
@import "tailwindcss";

@theme {
  --color-cream: #F5EDE3;
  --color-beige: #EADFC8;
  --color-wood: #3A1E14;
  --color-caramel: #6B3A2C;
  --color-chocolate: #2B0F0B;
  --color-gold: #C9A96E;
  --color-gold-soft: #E0C89A;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-fraunces), ui-serif, Georgia, serif;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-cream);
  color: var(--color-chocolate);
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
  font-weight: 600;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-zoom {
  from {
    transform: scale(1.06);
  }
  to {
    transform: scale(1);
  }
}

.animate-hero-rise {
  animation: hero-rise 0.9s ease-out both;
}

.animate-hero-zoom {
  animation: hero-zoom 1.4s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-hero-rise,
  .animate-hero-zoom {
    animation: none;
  }
}
@media print {
  aside,
  header,
  button,
  nav {
    display: none !important;
  }
  main {
    margin-left: 0 !important;
    padding: 0 !important;
  }
  body {
    background: white !important;
    color: black !important;
  }
}
/* Scrollbar personalizado para el Admin */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(224, 200, 154, 0.15); /* Dorado con baja opacidad */
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(224, 200, 154, 0.4); /* Dorado más visible al pasar el mouse */
}
```

## 2.2 `postcss.config.mjs` (completo)

```js
// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

## 2.3 Carga de fuentes — `app/layout.jsx:2-16` (completo)

```jsx
import { Fraunces, Inter } from 'next/font/google'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

Las variables se aplican en `<html className={`${fraunces.variable} ${inter.variable}`}>` y `<body className="font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col">`.

## 2.4 `next.config.mjs` (completo) — configuración de imágenes que condiciona el estilo

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lqjeijiqwevvaircywdl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
        search: '',
      },
    ],
  },
}

export default nextConfig
```

Sólo se pueden renderizar `<Image>` de Unsplash y del bucket público de Supabase de ese proyecto; cualquier otra URL externa rompe en runtime.

## 2.5 Assets de marca

| Asset | Ruta | Uso |
|---|---|---|
| Logo blanco | `public/images/logo-biarritz-blanco.png` (50 KB) | Header, sidebar admin, login. Siempre con `mix-blend-screen` porque el PNG es de fondo negro |
| Textura madera horizontal | `public/images/textura-madera.png` (2018 KB) | Footer, topbar/`woodMain` del admin, hero de productos, home |
| Textura madera vertical | `public/images/textura-madera-vertical.png` (1667 KB) | Sidebar admin, hero de home/eventos/contacto/login |
| Sonido de pedido | `public/sounds/new-order.mp3` (154 KB) | `OrderNotifications` |
| Favicon | `app/favicon.ico` | genérico de Next |

---

# Inconsistencias de color y deuda de estilos detectadas

Medición: regex de literales `#RRGGBB` sobre los 32 archivos `.jsx` de `app/` + `components/` y sobre `app/globals.css`.

| # | Hallazgo | Evidencia | Impacto |
|---|---|---|---|
| 1 | **Los tokens casi no se usan.** 360 apariciones de hex literal; sólo 7 son las definiciones de `@theme`, las otras **353 son colores escritos a mano** dentro de clases arbitrarias | `grep '#[0-9a-f]{6}'` en `app/`+`components/` | Cambiar la paleta hoy exige tocar ~20 archivos |
| 2 | **8 marrones compitiendo** por el mismo rol: `#150604`, `#1a0806`, `#23120B`, `#2A1810`, `#2C1E16`, `#341D14`, `#3a130d`, `#5a1a10` (+ tokens `#2B0F0B` y `#3A1E14`) | todos los archivos | No hay un único "negro cálido": el admin usa 4 y la tienda 3, distintos entre sí |
| 3 | **`--color-wood` (`#3A1E14`) nunca se usa como utilidad** — el marrón real de la tienda es `#3a130d` y el del admin `#150604` | `globals.css:6` vs `app/page.jsx`, `admin/layout.jsx` | Token muerto |
| 4 | **Mismo color, dos capitalizaciones**: `#2B0F0B` y `#2b0f0b` conviven incluso en el mismo archivo | `ProductCard.jsx:37` vs `:41`, `:77`, `:85` | Ruido; impide buscar/reemplazar |
| 5 | **Casi-blancos fuera de paleta**: `#FAF7F2` (6×) y `#FCFAF8` (3×) usados como superficie clara junto a `cream #F5EDE3` y `bg-white` | `CartDrawer`, `AddToCartSection`, `productos/[id]`, `ProductCard`, `eventos` | 4 "blancos" distintos en la tienda |
| 6 | **Grises cálidos no tokenizados**: `#9a8b7a` (texto meta) y `#c4b5a5` (borde) | `ProductCard`, `CartDrawer`, `page.jsx`, `contacto`, `eventos` | Funcionan como tokens de facto sin estar en `@theme` |
| 7 | **Tres mapeos distintos de color por estado de pedido**: A) `OrdersBoard` ámbar/verde/cian/neutro/rojo; B) `admin/pedidos/[id]` ámbar/naranja/sky/violeta/verde; C) `admin/page.jsx` un badge neutro para todos | `OrdersBoard.jsx:43-100`, `pedidos/[id]/page.jsx:20-28`, `admin/page.jsx:179` | El mismo estado se ve de tres colores según la pantalla |
| 8 | **`emerald`/`cyan`/`sky`/`violet` son colores de Tailwind ajenos a la paleta cálida** | `OrdersBoard.jsx`, `products/[id]/page.jsx`, `OrderStatusPanel.jsx` | Único lugar con verdes/azules/violetas; rompe el sistema |
| 9 | **Tres definiciones de "glass" + una cuarta** (A/B/C/D) con distinto `backdrop-blur`, borde y opacidad | `admin/page.jsx:17`, `ProductsTable.jsx:12`, `pedidos/[id]:30`, `productos/page.jsx:94` | Cuatro profundidades visuales para el mismo gesto |
| 10 | **Opacidades arbitrarias de blanco**: `bg-white/8`, `/5`, `/10`, `/15`, `/20`, `/25`, `/30`, `/40`, `/50`, `/55`, `/60`, `/65`, `/70`, `/75`, `/80` todas presentes | admin + tienda | No hay escala de superficies |
| 11 | **Contraste flojo sobre madera**: `text-white/30` en placeholders, `text-white/50`, `text-[#C9A96E]/60` en kickers | `OrdersBoard.jsx:232,317`, `ProductsTable.jsx:79`, `OrdersTable.jsx:145` | Texto bajo WCAG AA sobre `#1a0806` |
| 12 | **El admin es otro sistema de diseño**: paleta oscura + `#E0C89A` como acento, textos `text-[#F5EDE3]`, sin ningún uso de `bg-cream`/`text-chocolate` | todos los archivos de `app/admin/*` y `components/admin/*` | Dos lenguajes en una app; no hay tokens para el admin (los fondos son imágenes) |
| 13 | **173 radios en 4 escalas sin criterio** (full 60 / xl 46 / 2xl 34 / lg 30 / md 3) | conteo sobre 32 archivos | Tarjetas y paneles cambian de radio entre pantallas equivalentes |
| 14 | **`rounded-full` se usa tanto para pills como para avatares, badges, iconos y controles de cantidad** | `ProductCard.jsx:49`, `carrito:51`, `Header.jsx:73` | El radio no comunica jerarquía |
| 15 | **14 tamaños tipográficos + 3 px arbitrarios**, sin escala semántica; `text-sm` (115) y `text-xs` (56) hacen el 57% del texto | conteo | La jerarquía se decide por archivo |
| 16 | **4 lenguajes de sombra**: inset-glass, `shadow-lg shadow-black/40`, `shadow-sm`→`hover:shadow-2xl`, `shadow-2xl` | ver 1.5 | La profundidad no es consistente entre tienda y admin |
| 17 | **La lista de categorías está duplicada 5 veces** (con y sin `Todos`): 5 en la home con imagen, 6 en `/productos`, 5 en `ProductForm`, 5 en el sidebar admin, e implícita en `ProductCard` (badge si `category === 'Facturas'`) | `app/page.jsx:42-68`, `productos/page.jsx:16-23`, `ProductForm.jsx:14`, `admin/layout.jsx:33-40` | Agregar una categoría exige 4 ediciones + la DB |
| 18 | **Datos del local replicados con valores distintos**: dirección `Av. Siempre Viva 123` (home/footer/contacto), teléfono `11 1234-5678` (footer) vs `+598 00 000 000` (contacto), email `hola@biarritz.com` (contacto) | `Footer.jsx:26-27`, `contacto/page.jsx:14-17`, `page.jsx:131-136` | Inconsistencia de país (AR vs UY) mientras los precios son `es-AR` |
| 19 | **`@media print` global oculta `aside`, `header`, `button`, `nav`** — no distingue admin de tienda y borra los botones de la propia hoja de impresión | `globals.css:61-76` | El detalle de pedido se imprime sucio: `PrintButton` no tiene `print:hidden` en la versión viva |
| 20 | **`mix-blend-screen` como sustituto de transparencia** en las 3 apariciones del logo | `Header.jsx:46`, `admin/layout.jsx:151`, `login:71` | Depende del fondo: sobre superficies claras el logo desaparece |
