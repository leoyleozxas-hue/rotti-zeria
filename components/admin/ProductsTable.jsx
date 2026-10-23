// components/admin/ProductsTable.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, LayoutGrid, List, Pencil, Package, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const glass = 'border border-[#C9A96E]/20 bg-[#2A1810]/80 backdrop-blur-md shadow-lg shadow-black/40'

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
    if (!window.confirm(`¿Estás seguro que querés eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) toast.error('Error al eliminar: ' + error.message)
    else { toast.success('Producto eliminado'); router.refresh() }
    setDeletingId(null)
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...products]
    if (query.trim()) result = result.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
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
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1 w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A96E]/70" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9A96E]/30 bg-[#1a0806] text-[#F5EDE3] placeholder:text-white/30 focus:border-[#C9A96E] focus:outline-none transition text-sm shadow-inner"
          />
        </div>

        {/* Filtros y Toggle de Vista */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 w-full lg:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/20 bg-[#1a0806] text-white text-sm focus:border-[#C9A96E] focus:outline-none appearance-none cursor-pointer flex-1 sm:flex-none"
          >
            <option value="name-asc">A - Z</option>
            <option value="name-desc">Z - A</option>
            <option value="price-asc">Precio: Menor</option>
            <option value="price-desc">Precio: Mayor</option>
          </select>

          <div className="flex items-center bg-[#1a0806] rounded-xl border border-white/20 p-1 shrink-0">
            <button onClick={() => changeView('grid')} className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Tarjetas">
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => changeView('list')} className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-[#C9A96E] text-[#2b0f0b]' : 'text-white/60 hover:text-white'}`} title="Lista">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {filteredAndSorted.length === 0 ? (
        <div className={`${glass} rounded-2xl p-12 text-center`}>
          <p className="text-white/65">No se encontraron productos con "{query}".</p>
        </div>
      ) : view === 'grid' ? (
        /* VISTA DE TARJETAS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full">
          {filteredAndSorted.map((p) => (
            <div key={p.id} className="bg-[#2A1810]/80 border border-[#C9A96E]/20 rounded-2xl overflow-hidden group hover:border-[#C9A96E]/50 transition-colors flex flex-col shadow-lg shadow-black/20">
              <div className="relative aspect-square bg-[#1a0806]">
                {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width: 768px) 100vw, 25vw" />}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.is_available ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : 'bg-black/50 text-white/60 border-white/10'}`}>
                    {p.is_available ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] text-[#C9A96E] uppercase tracking-wider mb-1">{p.category}</span>
                <h3 className="text-[#F5EDE3] font-medium text-sm leading-tight mb-2 line-clamp-2">{p.name}</h3>
                <p className="text-[#F5EDE3] font-bold mt-auto mb-3">${Number(p.price).toLocaleString('es-AR')}</p>
                <div className="flex gap-2">
                  <Link href={`/admin/productos/${p.id}`} className="flex-1 text-center py-2 rounded-xl bg-white/5 text-white/80 hover:bg-[#C9A96E] hover:text-[#2b0f0b] transition text-xs font-semibold flex items-center justify-center gap-1 border border-white/10">
                    <Pencil size={12} /> Editar
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="px-3 py-2 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white transition disabled:opacity-50 border border-red-500/20">
                    {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE LISTA (TABLA) */
        <div className={`${glass} rounded-2xl w-full max-w-full overflow-hidden`}>
          {/* Este div es el que permite el scroll horizontal interno sin romper la página */}
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#1a0806] text-[#C9A96E]/70 border-b border-white/10">
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
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="40px" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#F5EDE3] font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-[#C9A96E]/70">{p.category}</td>
                    <td className="px-4 py-3 text-[#F5EDE3]">${Number(p.price).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/productos/${p.id}`} className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-[#C9A96E] hover:text-[#2b0f0b] transition border border-white/10">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition disabled:opacity-50 border border-red-500/20">
                          {deletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}