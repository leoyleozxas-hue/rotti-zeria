// components/admin/CategoriesTable.jsx
'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, Power, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Panel, { PanelHeader } from '@/components/ui/panel'
import EmptyState from '@/components/ui/empty-state'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { Button, ButtonLink, IconButton, IconLink } from '@/components/ui/button'

export default function CategoriesTable({ categories = [] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  async function handleToggleActive(cat) {
    setTogglingId(cat.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)
    setTogglingId(null)

    if (error) {
      toast.error('No se pudo cambiar el estado', { description: error.message })
      return
    }
    toast.success(cat.is_active ? 'Categoría oculta' : 'Categoría publicada')
    startTransition(() => router.refresh())
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)

    // Bloqueo: si tiene productos, no se puede eliminar
    if (pendingDelete.product_count > 0) {
      setDeleting(false)
      toast.error('No se puede eliminar', {
        description: `"${pendingDelete.name}" tiene ${pendingDelete.product_count} ${
          pendingDelete.product_count === 1 ? 'producto' : 'productos'
        }. Movelos a otra categoría primero.`,
      })
      setPendingDelete(null)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', pendingDelete.id)
    setDeleting(false)

    if (error) {
      toast.error('No se pudo eliminar', { description: error.message })
      return
    }
    toast.success('Categoría eliminada', { description: pendingDelete.name })
    setPendingDelete(null)
    startTransition(() => router.refresh())
  }

  if (categories.length === 0) {
    return (
      <Panel tone="glass" padded={false}>
        <EmptyState
          icon={Tag}
          title="Todavía no hay categorías"
          description="Creá la primera para organizar el catálogo."
          action={
            <ButtonLink href="/admin/categorias/nuevo" variant="primary" size="md">
              <Plus size={16} aria-hidden />
              Crear categoría
            </ButtonLink>
          }
        />
      </Panel>
    )
  }

  return (
    <>
      <Panel tone="glass" padded={false}>
        <PanelHeader title="Todas las categorías" />

        <ul className="divide-y divide-white/8">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03] md:px-5"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  cat.is_active
                    ? 'border-gold/35 bg-gold/15 text-gold-soft'
                    : 'border-white/10 bg-white/5 text-white/40'
                }`}
              >
                <Tag size={14} aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{cat.name}</p>
                  {!cat.is_active && (
                    <span className="rounded-full border border-white/15 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/50">
                      Oculta
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/40">
                  <span className="font-mono">{cat.slug}</span>
                  {' · '}
                  {cat.product_count} {cat.product_count === 1 ? 'producto' : 'productos'}
                  {' · '}
                  orden {cat.sort_order}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <IconButton
                  label={cat.is_active ? 'Ocultar categoría' : 'Publicar categoría'}
                  variant={cat.is_active ? 'ghost' : 'secondary'}
                  size="icon"
                  disabled={togglingId === cat.id || isPending}
                  onClick={() => handleToggleActive(cat)}
                >
                  <Power size={14} aria-hidden />
                </IconButton>
                <IconLink
                  href={`/admin/categorias/${cat.id}`}
                  label={`Editar ${cat.name}`}
                  variant="secondary"
                  size="icon"
                >
                  <Pencil size={14} aria-hidden />
                </IconLink>
                <IconButton
                  label={`Eliminar ${cat.name}`}
                  variant="danger"
                  size="icon"
                  onClick={() => setPendingDelete(cat)}
                >
                  <Trash2 size={14} aria-hidden />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        destructive
        loading={deleting}
        title="¿Eliminar categoría?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" se va a borrar. ${
                pendingDelete.product_count > 0
                  ? `Tiene ${pendingDelete.product_count} productos — movelos primero.`
                  : 'Esta acción no se puede deshacer.'
              }`
            : ''
        }
        confirmLabel="Sí, eliminar"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}