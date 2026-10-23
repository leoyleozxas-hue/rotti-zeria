// components/admin/ProductsTable.jsx
//
// Vista de productos del panel: grilla de tarjetas o lista, con la misma
// información y las mismas acciones en ambos modos. Todo el estilo sale de los
// primitivos de components/ui; acá sólo quedan las decisiones de esta pantalla.

'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ImageOff, Pencil, Plus, SearchX, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import DataTable, { Cell, Row } from '@/components/ui/data-table'
import EmptyState from '@/components/ui/empty-state'
import SearchField from '@/components/ui/search-field'
import Select from '@/components/ui/select'
import Toolbar, { ResultCount } from '@/components/ui/toolbar'
import ViewToggle from '@/components/ui/view-toggle'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { Button, ButtonLink, IconButton, IconLink } from '@/components/ui/button'
import useViewMode from '@/lib/hooks/useViewMode'

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nombre · A → Z' },
  { value: 'name-desc', label: 'Nombre · Z → A' },
  { value: 'price-asc', label: 'Precio · menor primero' },
  { value: 'price-desc', label: 'Precio · mayor primero' },
]

const money = (value) => `$${Number(value).toLocaleString('es-AR')}`

function VisibilityChip({ available }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ${
        available
          ? 'border-active/35 bg-active/15 text-active'
          : 'border-white/15 bg-white/8 text-white/55'
      }`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-active' : 'bg-white/35'}`} />
      {available ? 'Publicado' : 'Oculto'}
    </span>
  )
}

function Thumb({ product, className = '' }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-field bg-ink-950 ${className}`}>
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt=""
          fill
          sizes="120px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-white/20">
          <ImageOff size={18} aria-hidden />
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, index, onDelete }) {
  return (
    <article
      style={{ '--i': index }}
      className="anim-rise group relative flex flex-col overflow-hidden rounded-card border border-white/10 bg-ink-800/70 shadow-panel transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-950">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/15">
            <ImageOff size={26} aria-hidden />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="rounded-full bg-ink-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-soft backdrop-blur">
            {product.category}
          </span>
          <VisibilityChip available={product.is_available} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-serif text-base leading-snug text-white">{product.name}</h3>
        <p className="tabular mt-2 text-lg font-semibold text-gold-soft">{money(product.price)}</p>

        <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-3">
          <ButtonLink
            href={`/admin/productos/${product.id}`}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <Pencil size={13} aria-hidden />
            Editar
          </ButtonLink>
          <IconButton
            label={`Eliminar ${product.name}`}
            variant="danger"
            size="icon"
            onClick={() => onDelete(product)}
          >
            <Trash2 size={14} aria-hidden />
          </IconButton>
        </div>
      </div>
    </article>
  )
}

export default function ProductsTable({ products = [] }) {
  const router = useRouter()
  const [view, changeView] = useViewMode('admin-products-view')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? products.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        )
      : products

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return Number(a.price) - Number(b.price)
        case 'price-desc':
          return Number(b.price) - Number(a.price)
        case 'name-desc':
          return String(b.name).localeCompare(String(a.name), 'es')
        default:
          return String(a.name).localeCompare(String(b.name), 'es')
      }
    })
  }, [products, query, sortBy])

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)

    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', pendingDelete.id)

    setDeleting(false)

    if (error) {
      toast.error('No se pudo eliminar', { description: error.message })
      return
    }

    toast.success('Producto eliminado', { description: pendingDelete.name })
    setPendingDelete(null)
    router.refresh()
  }

  // Catálogo vacío: no es un error, es el primer paso.
  if (products.length === 0) {
    return (
      <div className="rounded-card border border-white/10 bg-ink-900/60 shadow-panel">
        <EmptyState
          icon={Plus}
          title="Todavía no hay productos"
          description="Cargá el primero y va a aparecer en la tienda cuando lo marques como publicado."
          action={
            <ButtonLink href="/admin/productos/nuevo" variant="primary" size="md">
              <Plus size={16} aria-hidden />
              Crear producto
            </ButtonLink>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Toolbar
        aside={
          <>
            <ResultCount shown={filtered.length} total={products.length} noun="productos" />
            <ViewToggle value={view} onChange={changeView} />
          </>
        }
      >
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre o categoría…"
          label="Buscar productos"
          className="sm:max-w-xs"
        />
        <Select
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
          label="Ordenar productos"
          className="sm:w-56"
        />
      </Toolbar>

      {filtered.length === 0 ? (
        <div className="rounded-card border border-white/10 bg-ink-900/60 shadow-panel">
          <EmptyState
            icon={SearchX}
            title="Sin resultados"
            description={`Ningún producto coincide con "${query}".`}
            action={
              <Button variant="secondary" size="md" onClick={() => setQuery('')}>
                Limpiar búsqueda
              </Button>
            }
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      ) : (
        <DataTable
          minWidth="720px"
          columns={[
            { key: 'product', label: 'Producto' },
            { key: 'category', label: 'Categoría' },
            { key: 'price', label: 'Precio', align: 'right' },
            { key: 'status', label: 'Estado' },
            { key: 'actions', label: 'Acciones', align: 'right' },
          ]}
        >
          {filtered.map((product, index) => (
            <Row key={product.id} index={index}>
              <Cell>
                <div className="flex items-center gap-3">
                  <Thumb product={product} className="h-11 w-11" />
                  <span className="font-medium text-white">{product.name}</span>
                </div>
              </Cell>
              <Cell className="text-white/55">{product.category}</Cell>
              <Cell align="right" className="tabular font-semibold text-gold-soft">
                {money(product.price)}
              </Cell>
              <Cell>
                <VisibilityChip available={product.is_available} />
              </Cell>
              <Cell align="right">
                <div className="flex items-center justify-end gap-1.5">
                  <IconLink
                    href={`/admin/productos/${product.id}`}
                    label={`Editar ${product.name}`}
                    variant="secondary"
                    size="icon"
                  >
                    <Pencil size={14} aria-hidden />
                  </IconLink>
                  <IconButton
                    label={`Eliminar ${product.name}`}
                    variant="danger"
                    size="icon"
                    onClick={() => setPendingDelete(product)}
                  >
                    <Trash2 size={14} aria-hidden />
                  </IconButton>
                </div>
              </Cell>
            </Row>
          ))}
        </DataTable>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        loading={deleting}
        title="¿Eliminar producto?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" se va a borrar del catálogo. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
