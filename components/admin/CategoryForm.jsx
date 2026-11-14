// components/admin/CategoryForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Panel, { PanelHeader } from '@/components/ui/panel'
import Field, { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

const categorySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  slug: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0, 'Debe ser 0 o más'),
  is_active: z.boolean(),
})

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function CategoryForm({ initialData = null, productCount = 0 }) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      image_url: initialData?.image_url || '',
      sort_order: initialData?.sort_order ?? 100,
      is_active: initialData?.is_active ?? true,
    },
  })

  function handleNameBlur(e) {
    const slug = watch('slug')
    if (!slug || slug === slugify(initialData?.name || '')) {
      setValue('slug', slugify(e.target.value), { shouldValidate: true })
    }
  }

  async function onSubmit(data) {
    setLoading(true)
    try {
      const supabase = createClient()

      // Rename en cascada: si el nombre cambió y hay productos, actualizamos primero
      if (isEditing && data.name !== initialData.name && productCount > 0) {
        const { error: cascadeErr } = await supabase
          .from('products')
          .update({ category: data.name })
          .eq('category', initialData.name)
        if (cascadeErr) throw cascadeErr
      }

      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image_url || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', initialData.id)
        if (error) {
          if (error.code === '23505') throw new Error('Ese nombre o slug ya existe.')
          throw error
        }
        toast.success('Categoría actualizada')
      } else {
        const { error } = await supabase.from('categories').insert([payload])
        if (error) {
          if (error.code === '23505') throw new Error('Ese nombre o slug ya existe.')
          throw error
        }
        toast.success('Categoría creada')
      }

      router.push('/admin/categorias')
      router.refresh()
    } catch (err) {
      toast.error('No se pudo guardar', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Panel tone="glass" padded={false}>
        <PanelHeader title={isEditing ? 'Editar categoría' : 'Nueva categoría'} />
        <div className="space-y-4 p-5">
          <Field label="Nombre" required error={errors.name?.message}>
            {({ hasError }) => (
              <input
                {...register('name', { onBlur: handleNameBlur })}
                className={fieldClass(hasError)}
                placeholder="Ej: Pan dulce"
              />
            )}
          </Field>

          <Field
            label="Slug"
            required
            hint="Identificador único. Solo minúsculas, números y guiones."
            error={errors.slug?.message}
          >
            {({ hasError }) => (
              <input {...register('slug')} className={fieldClass(hasError)} placeholder="pan-dulce" />
            )}
          </Field>

          <Field
            label="Descripción"
            hint="Aparece debajo del título en el catálogo. Opcional."
            error={errors.description?.message}
          >
            {({ hasError }) => (
              <textarea
                rows={2}
                {...register('description')}
                className={fieldClass(hasError)}
                placeholder="Ej: Panes dulces artesanales para las fiestas."
              />
            )}
          </Field>

          <Field
            label="Imagen (URL)"
            hint="Opcional. Se usa en la sección de especialidades si la hacés dinámica."
            error={errors.image_url?.message}
          >
            {({ hasError }) => (
              <input
                type="url"
                {...register('image_url')}
                className={fieldClass(hasError)}
                placeholder="https://..."
              />
            )}
          </Field>

          <Field label="Orden" required hint="Menor número = aparece primero. Ej: 10, 20, 30…">
            {({ hasError }) => (
              <input
                type="number"
                {...register('sort_order')}
                className={fieldClass(hasError)}
              />
            )}
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-field border border-white/10 bg-white/[0.03] px-3.5 py-3 transition hover:border-white/20">
            <input
              type="checkbox"
              {...register('is_active')}
              className="h-4 w-4 cursor-pointer accent-gold-soft"
            />
            <span className="text-sm text-white/75">
              Visible en la tienda
              <span className="ml-1 text-xs text-white/35">
                (si lo desmarcás no aparece en filtros, pero los productos siguen accesibles por URL)
              </span>
            </span>
          </label>

          {isEditing && productCount > 0 && (
            <div className="rounded-field border border-pending/30 bg-pending/10 p-3 text-xs text-pending">
              Esta categoría tiene {productCount} {productCount === 1 ? 'producto' : 'productos'}.
              Si cambiás el nombre, se actualizan automáticamente.
            </div>
          )}
        </div>
      </Panel>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={loading}
          onClick={() => router.push('/admin/categorias')}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando…
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear categoría'
          )}
        </Button>
      </div>
    </form>
  )
}