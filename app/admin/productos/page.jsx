import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package } from 'lucide-react'

const glass = 'border border-white/25 bg-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })
  return data || []
}

export default async function AdminProductosPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6 text-[#F5EDE3]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl text-white">Productos</h1>
          <p className="text-white/65 mt-1">
            {products.length} en el catálogo · gestión completa en el próximo paso
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={`${glass} p-12 text-center`}>
          <Package className="mx-auto mb-3 text-white/40" size={32} />
          <p className="text-white/65">Todavía no hay productos cargados.</p>
        </div>
      ) : (
        <div className={`${glass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10 text-white/60">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Nombre</th>
                  <th className="text-left px-5 py-3 font-medium">Categoría</th>
                  <th className="text-left px-5 py-3 font-medium">Precio</th>
                  <th className="text-left px-5 py-3 font-medium">Disponible</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/10 last:border-0 hover:bg-white/5 transition"
                  >
                    <td className="px-5 py-4 text-white font-medium">{p.name}</td>
                    <td className="px-5 py-4 text-white/70">{p.category}</td>
                    <td className="px-5 py-4 text-white">
                      ${Number(p.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          p.is_available
                            ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30'
                            : 'bg-white/10 text-white/50 border-white/15'
                        }`}
                      >
                        {p.is_available ? 'Sí' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-white/45 text-sm">
        La edición (alta, baja, stock y fotos) la armamos cuando pasemos a la lógica.{' '}
        <Link href="/productos" className="text-[#E0C89A] hover:text-white underline-offset-2 hover:underline">
          Ver tienda
        </Link>
      </p>
    </div>
  )
}
