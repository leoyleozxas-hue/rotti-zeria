// app/admin/productos/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        Volver a productos
      </Link>

      <div>
        <h1 className="font-serif text-3xl text-white">Nuevo producto</h1>
        <p className="text-white/60 mt-1 text-sm">Cargá un producto para que aparezca en la tienda</p>
      </div>

      <ProductForm />
    </div>
  )
}