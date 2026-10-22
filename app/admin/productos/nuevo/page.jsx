// app/admin/productos/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'

export default function NuevoProductoPage() {
  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm mb-2"
      >
        <ArrowLeft size={16} /> Volver a productos
      </Link>
      
      <div>
        <h1 className="font-serif text-4xl text-white">Nuevo producto</h1>
        <p className="text-white/65 mt-1">Agregá un producto al catálogo de la tienda</p>
      </div>

      <ProductForm />
    </div>
  )
}