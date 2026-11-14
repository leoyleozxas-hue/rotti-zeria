// app/admin/categorias/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CategoryForm from '@/components/admin/CategoryForm'

export default function NuevaCategoriaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft size={16} /> Volver a categorías
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-white">Nueva categoría</h1>
        <p className="mt-1 text-sm text-white/60">
          Cargá una categoría nueva. Después podés asignarle productos.
        </p>
      </div>
      <CategoryForm />
    </div>
  )
}