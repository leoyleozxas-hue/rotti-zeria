// components/admin/ProductsTable.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, LayoutGrid, List, Pencil, Package, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const glass = 'border border-white/25 bg-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.2)]'

export default function ProductsTable({ products }) {
  const router = useRouter()
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const savedView = localStorage.getItem('admin-products-view')
    if (savedView) setView(savedView)
  }, [])

  const changeView = (newView) => {
    setView(newView)
    localStorage.setItem('admin-products-view', newView)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro que querés eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Producto eliminado correctamente')
      router.refresh() // Recarga los datos del servidor
    }
    setDeletingId(null)
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...products]
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return Number(a.price) - Number(b.price)
        case 'price-desc': return Number(b.price) - Number(a.price)
        case 'name-desc': return b.name.localeCompare(a.name)
        default: return a.name.localeCompare(b.name)
      }
    })
    return result
  }, [products, query, sortBy])

  if (products.length === 0) {
    return (
      <div className={`${glass} rounded-2xl p-12 text-center`}>
        <Package className="mx-auto mb-3 text-white/40" size={32} />
        <p className="text-white/65 mb-4">Todavía no hay productos cargados.</p>
        <Link href="/admin/productos/nuevo" className="text-[#E0C89A] hover:text-white underline underline-offset-4">
          Crear el primer producto
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-[#E0C89A] focus:outline-none transition text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/20 bg-[#150604] text-white text-sm focus:border-[#E0C89A] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="name-asc">Nombre: A - Z</option>
            <option value="name-desc">Nombre: Z - A</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>

          <div className="flex items-center bg-white/5 rounded-xl border border-white/20 p-1">
            <button onClick={() => changeView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-[#E0C89A] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Tarjetas">
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => changeView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-[#E0C89A] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Lista">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {filteredAndSorted.length === 0 ? (
        <div className={`${glass} rounded-2xl p-12 text-center`}>
          <p className="text-white/65">No se encontraron productos con "{query}".</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSorted.map((p) => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/10 transition flex flex-col">
              <div className="relative aspect-square bg-[#2b0f0b]/40">
                {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="25vw" />}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_available ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-black/50 text-white/60 border-white/10'}`}>
                    {p.is_available ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] text-[#E0C89A] uppercase tracking-wider mb-1">{p.category}</span>
                <h3 className="text-white font-medium text-sm leading-tight mb-2 line-clamp-2">{p.name}</h3>
                <p className="text-white/80 font-bold mt-auto mb-3">${Number(p.price).toLocaleString('es-AR')}</p>
                <div className="flex gap-2">
                  <Link href={`/admin/productos/${p.id}`} className="flex-1 text-center py-2 rounded-xl bg-white/10 text-white/80 hover:bg-[#E0C89A] hover:text-[#2b0f0b] transition text-xs font-semibold flex items-center justify-center gap-1">
                    <Pencil size={12} /> Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deletingId === p.id}
                    className="px-3 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                  >
                    {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`${glass} rounded-2xl overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-white/60">
              <tr>
                <th className="text-left px-4 py-4 font-medium w-16">Foto</th>
                <th className="text-left px-4 py-4 font-medium">Nombre</th>
                <th className="text-left px-4 py-4 font-medium">Categoría</th>
                <th className="text-left px-4 py-4 font-medium">Precio</th>
                <th className="text-center px-4 py-4 font-medium w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((p) => (
                <tr key={p.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                      {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="40px" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-white/70">{p.category}</td>
                  <td className="px-4 py-3 text-white">${Number(p.price).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/productos/${p.id}`} className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-[#E0C89A] hover:text-[#2b0f0b] transition">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50">
                        {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-white/45 text-sm">Mostrando {filteredAndSorted.length} de {products.length} productos.</p>
    </div>
  )
}