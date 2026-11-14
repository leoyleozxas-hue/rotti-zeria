// app/pedido/page.jsx
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import OrderStatusLookup from '@/components/OrderStatusLookup'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Seguimiento de pedido',
  description: 'Consultá el estado de tu pedido con el número y el teléfono.',
  path: '/pedido',
})

export default function PedidoPage() {
  return (
    <main className="min-h-[80vh] bg-cream px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-full border border-sand/60 bg-paper text-gold">
            <PackageSearch size={24} />
          </span>
          <h1 className="mt-5 font-serif text-h1 text-chocolate">
            Seguimiento de pedido
          </h1>
          <p className="mt-2 text-body text-caramel">
            Ingresá el número de pedido y el teléfono con el que lo hiciste.
          </p>
        </div>

        <div className="mt-10">
          <OrderStatusLookup />
        </div>

        <p className="mt-10 text-center text-caption text-stone">
          ¿Problemas para encontrar tu pedido?{' '}
          <Link href="/contacto" className="underline underline-offset-4 hover:text-chocolate">
            Escribinos
          </Link>
          .
        </p>
      </div>
    </main>
  )
}