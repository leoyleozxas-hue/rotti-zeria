// app/admin/preview/page.jsx
//
// Banco de pruebas visual, SÓLO DESARROLLO. Renderiza las pantallas del panel
// con datos de mentira, sin sesión, para poder revisar diseño y responsive sin
// tocar la base ni ensuciar el panel real.
//
// En producción esta ruta no existe (devuelve 404) y `proxy.js` tampoco la deja
// pasar. Para borrarla: eliminá esta carpeta y el bloque de preview en proxy.js.

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import OrdersBoard from '@/components/admin/OrdersBoard'
import ProductsTable from '@/components/admin/ProductsTable'
import { FIXTURE_ORDERS, FIXTURE_PRODUCTS } from './fixtures'

export const metadata = { title: 'Preview · Panel Biarritz' }

export default function PreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="space-y-12">
      <div className="rounded-panel border border-dashed border-gold/40 bg-gold/5 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">
          Banco de pruebas · sólo desarrollo
        </p>
        <p className="mt-1 text-xs text-white/50">
          Datos de mentira. No lee ni escribe en Supabase. En producción da 404.
        </p>
      </div>

      <section className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-soft">
            Operación
          </p>
          <h1 className="font-serif text-3xl text-white md:text-4xl">Pedidos</h1>
        </div>
        <Suspense fallback={<p className="text-sm text-white/40">Cargando tablero…</p>}>
          <OrdersBoard initialOrders={FIXTURE_ORDERS} />
        </Suspense>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-soft">
            Catálogo
          </p>
          <h1 className="font-serif text-3xl text-white md:text-4xl">Productos</h1>
        </div>
        <ProductsTable products={FIXTURE_PRODUCTS} />
      </section>
    </div>
  )
}
