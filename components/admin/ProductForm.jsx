// components/admin/ProductForm.jsx
//
// Alta y edición de producto. Misma estructura en los dos modos: el formulario
// no sabe si está creando o editando, sólo recibe initialData.

'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ImageIcon, Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { productSchema } from '@/lib/validations/product'
import { CATEGORIES } from '@/lib/constants/catalog'
import Panel, { PanelHeader } from '@/components/ui/panel'
import Field, { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

// Fuera del componente: Date.now() y Math.random() son impuros y no pueden
// evaluarse durante el render (regla de pureza de React).
function uniqueFileName(file) {
  const extension = file.name.split('.').pop()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
}

export default function ProductForm({ initialData = null }) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const fileInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ?? '',
      category: initialData?.category || CATEGORIES[0],
      is_available: initialData?.is_available ?? true,
    },
  })

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo tiene que ser una imagen')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  async function onSubmit(data) {
    setLoading(true)

    try {
      const supabase = createClient()
      let imageUrl = initialData?.image_url || null

      if (imageFile) {
        const fileName = uniqueFileName(imageFile)

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const payload = { ...data, image_url: imageUrl }

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', initialData.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
        toast.success('Producto creado')
      }

      router.push('/admin/productos')
      router.refresh()
    } catch (error) {
      toast.error('No se pudo guardar', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Panel tone="glass" padded={false}>
          <PanelHeader title="Información del producto" />

          <div className="space-y-4 p-5 md:p-6">
            <Field label="Nombre" htmlFor="name" required error={errors.name?.message}>
              {({ errorId, hasError }) => (
                <input
                  id="name"
                  {...register('name')}
                  aria-invalid={hasError}
                  aria-describedby={errorId}
                  className={fieldClass(hasError)}
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Precio"
                htmlFor="price"
                required
                hint="En pesos, sin puntos"
                error={errors.price?.message}
              >
                {({ errorId, hasError }) => (
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    {...register('price')}
                    aria-invalid={hasError}
                    aria-describedby={errorId}
                    className={`tabular ${fieldClass(hasError)}`}
                  />
                )}
              </Field>

              <Field label="Categoría" htmlFor="category" required error={errors.category?.message}>
                {({ errorId, hasError }) => (
                  <div className="relative">
                    <select
                      id="category"
                      {...register('category')}
                      aria-invalid={hasError}
                      aria-describedby={errorId}
                      className={`cursor-pointer appearance-none pr-9 ${fieldClass(hasError)}`}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category} className="bg-ink-900 text-cream">
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                    />
                  </div>
                )}
              </Field>
            </div>

            <Field
              label="Descripción"
              htmlFor="description"
              required
              hint="Mínimo 10 caracteres"
              error={errors.description?.message}
            >
              {({ errorId, hasError }) => (
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  aria-invalid={hasError}
                  aria-describedby={errorId}
                  className={`${fieldClass(hasError)} h-auto resize-none py-2.5`}
                />
              )}
            </Field>

            <label
              htmlFor="is_available"
              className="flex cursor-pointer items-center gap-3 rounded-field border border-white/10 bg-white/[0.03] px-3.5 py-3 transition hover:border-white/20"
            >
              <input
                id="is_available"
                type="checkbox"
                {...register('is_available')}
                className="h-4 w-4 cursor-pointer accent-gold-soft"
              />
              <span className="text-sm text-white/75">
                Visible en la tienda
                <span className="ml-1 text-xs text-white/35">
                  (si lo desmarcás queda cargado pero oculto)
                </span>
              </span>
            </label>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Imagen" />

            <div className="p-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border-2 border-dashed border-white/15 bg-white/[0.03] transition hover:border-gold/50 hover:bg-white/[0.06]"
              >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="" fill sizes="300px" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                      <UploadCloud size={16} aria-hidden className="mr-1.5" />
                      Cambiar foto
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-white/35">
                    <ImageIcon size={26} aria-hidden />
                    <span className="text-xs">Click para subir una foto</span>
                  </span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="mt-2 text-[10px] text-white/30">
                Cuadrada se ve mejor en la grilla. Máx. 5 MB.
              </p>
            </div>
          </Panel>

          <div className="flex flex-col gap-2">
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 size={16} aria-hidden className="animate-spin" />
                  Guardando…
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear producto'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={loading}
              className="w-full"
              onClick={() => router.push('/admin/productos')}
            >
              Cancelar
            </Button>

            {isEditing && isDirty && (
              <p className="text-center text-[10px] text-gold-soft/70">Tenés cambios sin guardar</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
