// app/admin/productos/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import { getCategoryNames } from '@/lib/categories'

export default async function NuevoProductoPage() {
  const categories = await getCategoryNames()

  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Volver a productos
      </Link>

      <div>
        <h1 className="font-serif text-3xl text-white">Nuevo producto</h1>
        <p className="mt-1 text-sm text-white/60">
          Cargá un producto para que aparezca en la tienda
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  )
}