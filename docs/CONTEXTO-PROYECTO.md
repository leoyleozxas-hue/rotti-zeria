# Contexto del proyecto — Rotti Zeria / Biarritz

> Documento de orientación para asistentes de código (MCP, Copilot u otros) que necesiten entender el producto antes de modificarlo. Describe el estado del repositorio inspeccionado en `main`; no reemplaza la lectura del código ni las auditorías existentes. Revisar el estado actual de cada hallazgo antes de corregirlo.

## 1. Qué es la aplicación

Aplicación web de una panadería artesanal, construida con Next.js. Tiene dos áreas principales:

1. **Tienda pública:** permite explorar el catálogo, ver productos, gestionar favoritos y carrito, y completar un pedido con datos de retiro/entrega. También incluye páginas de contacto y eventos/lunch.
2. **Panel administrativo:** permite al equipo autenticado consultar métricas, gestionar pedidos y productos, configurar datos del negocio y revisar consultas. Incluye flujo de estados de pedidos, notificaciones en tiempo real y funciones de impresión.

El repositorio está publicado en Vercel (la metadata del repositorio apunta a `https://rotti-zeria.vercel.app`). La integración de datos y autenticación utiliza Supabase. Los nombres, contactos y datos bancarios en `lib/config.js` son valores genéricos/de ejemplo: **no asumir que sean datos reales ni reemplazarlos por datos inventados**.

## 2. Stack y convenciones

- **Next.js 16** con App Router; React 19; JavaScript/JSX (no TypeScript).
- **Tailwind CSS 4** y PostCSS. Los estilos globales, fuentes y tokens están en `app/globals.css`.
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) para datos y sesión.
- **Zustand** para estado cliente (carrito, favoritos y UI); carrito/favoritos usan persistencia local.
- **Zod** para esquemas de validación; formularios usan `react-hook-form` y `@hookform/resolvers` donde corresponde.
- **Lucide React** para iconos; **Sonner** para toasts. `motion` está en dependencias, pero confirmar uso antes de agregarlo a una solución.
- Alias `@/` configurado mediante `jsconfig.json`.
- Componentes por convención en PascalCase; utilidades y módulos en camelCase. Las páginas Next se definen en `page.jsx`, layouts en `layout.jsx`, y endpoints en `route.js`.

Comandos del `package.json`:

```bash
npm run dev      # servidor local
npm run build    # build de producción
npm run start    # servir build
npm run lint     # ESLint
```

No se observó un script de tests automatizados en `package.json`. Para cambios de lógica, no asumir que hay cobertura: ejecutar lint/build y probar manualmente flujos relevantes. Antes de usar o cambiar APIs de Next, leer las instrucciones de `AGENTS.md` y la documentación de la versión instalada en `node_modules/next/dist/docs/`: el repo advierte explícitamente que la versión tiene cambios incompatibles con convenciones anteriores.

## 3. Jerarquía de archivos

Árbol orientativo de los directorios principales (se omiten assets individuales y algunas rutas secundarias):

```text
.
├── app/                         # Rutas, layouts y API del App Router
│   ├── admin/                   # Panel privado y subrutas administrativas
│   │   ├── layout.jsx           # Shell, navegación y marco del admin
│   │   ├── page.jsx             # Dashboard
│   │   ├── login/               # Inicio de sesión
│   │   ├── pedidos/             # Tablero y detalle de pedidos
│   │   ├── productos/           # Catálogo administrativo, alta y edición
│   │   ├── configuracion/       # Configuración del negocio
│   │   ├── consultas/            # Consultas de clientes
│   │   ├── lunch/               # Área de lunch
│   │   └── preview/             # Preview de diseño; solo debe estar abierto en dev
│   ├── api/orders/route.js      # Creación de pedidos desde la tienda
│   ├── carrito/                 # Vista de carrito
│   ├── checkout/                # Formulario de checkout y confirmación
│   ├── contacto/                # Página/formulario de contacto
│   ├── eventos/                 # Lunch y eventos
│   ├── favoritos/               # Productos favoritos
│   ├── productos/               # Catálogo público y detalle dinámico [id]
│   ├── page.jsx                 # Inicio
│   ├── layout.jsx               # Layout raíz, fuentes y shell global
│   └── globals.css              # Tailwind, tokens, tipografía y estilos globales
├── components/                  # Componentes reutilizables de interfaz
│   ├── admin/                   # Componentes del panel (pedidos, productos, forms)
│   ├── cart/                    # Drawer del carrito
│   ├── ui/                      # Primitivos del sistema visual del admin
│   └── *.jsx                    # Header, Footer, ProductCard, formularios, etc.
├── lib/                         # Acceso a datos, estado, reglas y configuración
│   ├── constants/               # Catálogo, navegación y estados de pedidos
│   ├── hooks/                   # Hooks compartidos
│   ├── store/                   # Stores de Zustand
│   ├── supabase/                # Clientes Supabase browser/server
│   ├── validations/             # Esquemas Zod
│   ├── config.js                # Configuración/defaults de sitio
│   └── settings.js              # Lectura cacheada de settings
├── docs/                        # Documentación existente
├── public/                      # Imágenes, fuentes u otros assets públicos
├── proxy.js                     # Protección de rutas admin con sesión Supabase
├── next.config.mjs              # Configuración Next.js e imágenes remotas
├── package.json                 # Scripts y dependencias
├── AGENTS.md                    # Instrucciones específicas para agentes
├── AUDITORIA-FRONT.md           # Auditoría de código anterior
└── REVISION-2026-10-25.md       # Revisión posterior con ejecución/capturas
```

La jerarquía exacta se puede consultar desde el árbol GitHub; no crear carpetas/rutas solo porque aparezcan en este esquema orientativo.

## 4. Recorrido de los flujos principales

### Tienda → pedido

1. Las páginas públicas consultan productos desde Supabase y los presentan con componentes como `ProductCard` y `ProductGallery`.
2. `lib/store/cartStore.js` guarda los ítems en Zustand con persistencia `site-cart`. Cada ítem incluye `product_id`, nombre, precio, imagen y cantidad. Esos datos del navegador sirven para la interfaz, **no son autoridad para cobrar**.
3. El checkout valida/recopila información de cliente, tipo de entrega o retiro y fecha/hora.
4. `app/api/orders/route.js` recibe el pedido y escribe en `orders` y `order_items`; actualmente el código inspeccionado toma precios, nombres e imágenes enviados por el cliente, calcula el total desde esos valores e inserta orden y detalles en operaciones separadas. Tratar esto como una prioridad de lógica/seguridad: validar el body en el servidor, buscar precios y disponibilidad vigentes en la base de datos, calcular el total allí y hacer escritura atómica (por ejemplo RPC transaccional). No confiar en controles visuales ni en el store del carrito.
5. La API devuelve datos de pedido y datos bancarios/WhatsApp obtenidos mediante `getSettings()`.

### Administración

- `proxy.js` sincroniza sesión Supabase y protege `/admin/*`: sin usuario dirige al login; con usuario sin `app_metadata.role === 'admin'` redirige al inicio.
- `/admin/login` es la excepción al bloqueo. `/admin/preview` está exceptuado únicamente cuando `NODE_ENV !== 'production'`; preservar esa condición y revisar también el comportamiento de la propia página antes de tocar seguridad.
- `components/admin/OrdersBoard.jsx` es el componente principal del tablero. Los estados centralizados están en `lib/constants/orders.js`; usar `ORDER_STATUS`, `ORDER_TONES`, `ORDER_TABS` y `NEXT_STATUS` como fuente común en vez de redefinir labels/transiciones en pantallas.
- `components/admin/ProductsTable.jsx` y `ProductForm.jsx` cubren catálogo administrativo.
- `components/admin/OrderNotifications.jsx` contiene avisos/realtime de pedidos.
- `components/ui/` alberga primitivos pensados especialmente para admin: botones, campos, paneles, tabla, estados vacíos, skeletons y confirmaciones.

## 5. Archivos clave para entender la lógica

| Archivo | Responsabilidad |
|---|---|
| `app/layout.jsx` | Layout raíz, fuentes y proveedores globales. |
| `app/globals.css` | Tailwind 4, estilos globales, paletas/tokens de tienda y admin. |
| `app/page.jsx` | Página de inicio de la tienda. |
| `app/productos/page.jsx` | Catálogo público. |
| `app/productos/[id]/page.jsx` | Detalle de producto. Verificar disponibilidad también en servidor y en carrito/API al modificar compras. |
| `app/checkout/page.jsx` | Captura de datos del pedido y proceso de checkout. |
| `app/api/orders/route.js` | Endpoint POST de creación de pedidos; es crítico para precio, validación y consistencia. |
| `app/admin/page.jsx` | Dashboard y métricas. |
| `app/admin/pedidos/page.jsx` | Página del tablero administrativo. |
| `components/admin/OrdersBoard.jsx` | UI y acciones del flujo de pedidos. |
| `lib/constants/orders.js` | Máquina de estados/labels/transiciones del pedido y grupos de pestañas. |
| `lib/constants/catalog.js` | Categorías y filtros del catálogo. |
| `lib/store/cartStore.js` | Estado persistente del carrito. No usarlo para autoridad de precios. |
| `lib/store/favoritesStore.js` | Estado persistente de favoritos. |
| `lib/supabase/client.js` | Cliente Supabase para el navegador. |
| `lib/supabase/server.js` | Cliente Supabase para servidor, con cookies. |
| `lib/settings.js` | Lectura cacheada de `settings` con fallback a `SITE_CONFIG`. |
| `lib/config.js` | Defaults de identidad/contacto/banco; verificar su carácter placeholder antes de publicarlos. |
| `lib/validations/order.js` | Reglas Zod del formulario/pedido; comprobar que el servidor también las aplique y que reflejen reglas de negocio actuales. |
| `lib/validations/product.js` | Esquema de producto. |
| `proxy.js` | Control de sesión/rol en rutas admin. |
| `docs/DISENO-ADMIN.md` | Especificación visual y reglas de componentes del panel. |

## 6. Modelo de dominio que se desprende del código

- **Producto:** se consume en storefront y se administra en el panel. Las categorías compartidas se definen en `lib/constants/catalog.js`. El código utiliza campos como `id`, `name`, `price`, `image_url` y `is_available`.
- **Pedido (`orders`):** datos de cliente, retiro/entrega, total, método de pago y estado.
- **Ítems del pedido (`order_items`):** relación con el pedido/producto, cantidad, precio unitario y subtotal; nombre/imagen copiados como snapshot ayudan a conservar el historial, pero el snapshot debe generarse desde datos confiables del servidor.
- **Configuración (`settings`):** datos del local, horarios, redes y banco; lectura mediante `getSettings()` con caché de Next y fallback a `SITE_CONFIG`.
- **Estados del pedido:** `pending_payment`, `payment_review`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`. La ruta normal es pendiente/revisión → confirmado → preparando → listo → entregado; cancelado es terminal. Antes de añadir estados, revisar UI, filtros, métricas y reglas de transición.

No hay migraciones ni esquema SQL incluidos en los archivos inspeccionados de esta guía; confirmar el esquema real de Supabase antes de cambiar columnas, RPC, RLS o relaciones.

## 7. Deuda importante a tener presente al tocar lógica

Estos puntos se apoyan en archivos actuales y/o en `REVISION-2026-10-25.md`; revisar si ya fueron corregidos en un commit posterior:

1. **Crear pedido no debe confiar en precios/nombres/imágenes del cliente.** El endpoint leído todavía calcula total con `items[].price`, no muestra validación con `orderSchema` y escribe pedido e ítems por separado. Agregar validación server-side, verificación de disponibilidad y cálculo desde productos de la base; definir transacción y número de pedido sin colisiones.
2. **No asumir que la confirmación implica pago.** El flujo usa `pending_payment` y `transfer`; verificar cuidadosamente cualquier promesa de pago o pantalla de éxito.
3. **Datos de ejemplo:** `lib/config.js` contiene local, contacto, banco y URL genéricos. `getSettings()` usa esos defaults cuando falta configuración. No mostrar datos bancarios/contacto ficticios como reales.
4. **Contacto:** la auditoría señala que el formulario puede mostrar éxito sin persistir/enviar. Inspeccionar la implementación actual antes de cambiar copy/UX; el éxito debe reflejar una entrega real.
5. **Disponibilidad:** el detalle y la UI no bastan como enforcement; comprobar disponibilidad al agregar/confirmar pedido en servidor para evitar compra de producto oculto o agotado.
6. **Carrito persistente:** limpiar carrito en un montaje global puede afectar otras pestañas/sesiones. Limpiarlo solo después de confirmar el pedido y de forma asociada al flujo correcto.
7. **Fechas y zona horaria:** reglas como “mañana” y días cerrados deben evaluarse en la zona horaria del negocio, no depender accidentalmente de UTC o del momento de importación del módulo.
8. **Imágenes remotas:** las revisiones registran problemas con imágenes de Unsplash y carga en frío. Confirmar URLs vivas y fallback visual; no dar por hecho que `next/image` resuelve un upstream caído.
9. **Consistencia de configuración:** contacto/horarios pueden aparecer en varios lugares. Preferir una fuente de verdad y settings del negocio antes que sumar nuevos datos hardcodeados.
10. **Auditorías como historial, no como estado garantizado:** `AUDITORIA-FRONT.md` y `REVISION-2026-10-25.md` son documentos fechados; algunas observaciones ya se marcaron como resueltas allí. Contrastar contra código actual y commits recientes antes de implementar una solución repetida.

## 8. Guía para realizar cambios de forma segura

- Antes de editar una lógica, seguir el dato de punta a punta: UI → store/form → API/server → Supabase → respuesta → UI/estado siguiente.
- La validación del cliente mejora UX, pero toda regla relevante debe validarse de nuevo en el servidor.
- No aceptar del body valores derivados que el servidor puede obtener: precios, subtotales, totales, permisos, rol, nombre de producto o disponibilidad.
- En operaciones relacionadas (pedido + ítems), asegurar atomicidad y errores legibles; no dejar datos parciales.
- Conservar los snapshots históricos de pedidos, pero generarlos a partir del producto obtenido en servidor al comprar.
- Mantener un mapa único de estados y categorías. Actualizar conjuntamente transición, filtro, badge, dashboard y realtime si se cambia dominio.
- En admin, seguir `docs/DISENO-ADMIN.md`: reutilizar `components/ui/`, tokens `@theme`, `ORDER_STATUS` y `NEXT_STATUS`; no añadir hex/reglas visuales aisladas. Los tokens del admin y la tienda no son intercambiables sin revisar diseño.
- Respetar Server/Client Components: no importar APIs de navegador en módulos servidor ni exponer secretos Supabase al cliente. La anon key pública puede existir como `NEXT_PUBLIC_*`; nunca exponer service-role key.
- Las políticas RLS de Supabase son parte de la seguridad: revisar las existentes antes de crear rutas o mutaciones. El proxy de frontend no sustituye autorización en la base/API.
- No eliminar ni reiniciar datos de producción, no inventar migraciones y no cambiar datos reales de contacto/pago sin confirmación explícita.
- Probar al menos: caso correcto, datos inválidos, producto no disponible, fallo de Supabase, doble envío/reintento y efectos sobre el total/historial.

## 9. Variables de entorno y preparación local

Los clientes Supabase y `proxy.js` leen al menos:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Usar las credenciales de un entorno de desarrollo y obtener el resto de variables desde la configuración real del proyecto (Vercel/administrador del repo). No poner secretos en archivos versionados, logs, screenshots ni este documento. No se verificó aquí la lista exhaustiva de variables ni la configuración de base de datos.

Pasos básicos:

```bash
npm install
# Configurar variables de entorno localmente, sin subirlas al repo
npm run dev
```

Luego probar las rutas públicas y, con un usuario de Supabase autorizado, `/admin`. Para validar cambios antes de entregar:

```bash
npm run lint
npm run build
```

Si dev/build falla, revisar primero `AGENTS.md`, la versión concreta de Next instalada y los logs; no aplicar instrucciones de una versión distinta a ciegas.

## 10. Checklist para el MCP antes de empezar una tarea

1. Leer este archivo y `AGENTS.md`.
2. Confirmar branch/estado actual y revisar el archivo objetivo, sus importadores y la ruta completa del flujo.
3. Comparar con `AUDITORIA-FRONT.md`, `REVISION-2026-10-25.md` y `docs/DISENO-ADMIN.md`, teniendo en cuenta sus fechas.
4. Aclarar cuál es la regla de negocio esperada si el código o los documentos se contradicen; no inferir decisiones de precios, pagos, horarios o país.
5. Proponer un cambio acotado y cubrir validaciones de servidor, estados de error y casos límite.
6. Correr lint/build y resumir qué se verificó y qué quedó sin probar.

## 11. Referencias del repositorio

- [`AGENTS.md`](../AGENTS.md): instrucciones para agentes y advertencia de versión Next.
- [`AUDITORIA-FRONT.md`](../AUDITORIA-FRONT.md): auditoría de código fechada 23/10/2026.
- [`REVISION-2026-10-25.md`](../REVISION-2026-10-25.md): revisión posterior con app ejecutada y hallazgos de lógica/UX.
- [`docs/DISENO-ADMIN.md`](DISENO-ADMIN.md): sistema visual y reglas de componentes del panel.
- [`lib/constants/orders.js`](../lib/constants/orders.js): estados y transiciones del pedido.
- [`app/api/orders/route.js`](../app/api/orders/route.js): creación de pedido.
- [`lib/validations/order.js`](../lib/validations/order.js): esquema de validación del pedido.
