// components/admin/ProductForm.jsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ImageIcon, Loader2, UploadCloud, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { productSchema } from '@/lib/validations/product'
import { CATEGORIES } from '@/lib/constants/catalog'
import Panel, { PanelHeader } from '@/components/ui/panel'
import Field, { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'

function uniqueFileName(file) {
  const extension = file.name.split('.').pop()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
}

export default function ProductForm({ initialData = null }) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null)

  // Galería: URLs existentes + archivos nuevos pendientes de subir
  const [existingGallery, setExistingGallery] = useState(
    Array.isArray(initialData?.gallery) ? initialData.gallery : []
  )
  const [newGalleryFiles, setNewGalleryFiles] = useState([])

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

  function handleMainImageChange(event) {
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

  function handleGalleryChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast.error('Los archivos tienen que ser imágenes')
      return
    }

    const readers = imageFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve({ file, preview: reader.result })
          reader.readAsDataURL(file)
        })
    )

    Promise.all(readers).then((results) => {
      setNewGalleryFiles((prev) => [...prev, ...results])
    })

    event.target.value = '' // reset para poder subir el mismo archivo
  }

  function removeExistingGalleryImage(index) {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index))
  }

  function removeNewGalleryImage(index) {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data) {
    setLoading(true)

    try {
      const supabase = createClient()
      let imageUrl = initialData?.image_url || null

      // 1. Subir imagen principal si cambió
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

      // 2. Subir imágenes nuevas de la galería
      const uploadedGalleryUrls = []
      for (const item of newGalleryFiles) {
        const fileName = uniqueFileName(item.file)
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, item.file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        uploadedGalleryUrls.push(urlData.publicUrl)
      }

      // 3. Galería final = existentes que se quedaron + nuevas subidas
      const finalGallery = [...existingGallery, ...uploadedGalleryUrls]

      const payload = {
        ...data,
        image_url: imageUrl,
        gallery: finalGallery,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', initialData.id)
        if (error) {
          if (error.code === '23505') {
            throw new Error('Ya existe un producto con ese nombre. Elegí otro.')
          }
          throw error
        }
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) {
          if (error.code === '23505') {
            throw new Error('Ya existe un producto con ese nombre. Elegí otro.')
          }
          throw error
        }
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

  const totalGalleryImages = existingGallery.length + newGalleryFiles.length
  const hasUnsavedChanges =
    isDirty ||
    Boolean(imageFile) ||
    newGalleryFiles.length > 0 ||
    existingGallery.length !==
      (Array.isArray(initialData?.gallery) ? initialData.gallery.length : 0)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
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
              hint="Mín. 10 caracteres. Usá saltos de línea para crear listas."
              error={errors.description?.message}
            >
              {({ errorId, hasError }) => (
                <textarea
                  id="description"
                  rows={6}
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
          {/* Imagen principal */}
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Imagen principal" />

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
                    <span className="text-xs">Click para subir</span>
                  </span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="hidden"
              />
              <p className="mt-2 text-[10px] text-white/30">
                Cuadrada se ve mejor. Máx. 5 MB.
              </p>
            </div>
          </Panel>

          {/* Galería adicional */}
          <Panel tone="glass" padded={false}>
            <PanelHeader
              title={`Galería (${totalGalleryImages})`}
              action={
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-medium text-gold-soft hover:text-white transition"
                >
                  <Plus size={12} /> Agregar
                </button>
              }
            />

            <div className="p-5 space-y-3">
              {totalGalleryImages === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">
                  Sin imágenes adicionales.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {existingGallery.map((url, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"
                    >
                      <Image src={url} alt="" fill sizes="100px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        aria-label="Eliminar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {newGalleryFiles.map((item, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold/40 group"
                    >
                      <Image src={item.preview} alt="" fill sizes="100px" className="object-cover" />
                      <span className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-gold text-ink-950 uppercase">
                        Nueva
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewGalleryImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                        aria-label="Eliminar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
              <p className="text-[10px] text-white/30">
                Podés subir varias a la vez.
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

            {isEditing && hasUnsavedChanges && (
              <p className="text-center text-[10px] text-gold-soft/70">
                Tenés cambios sin guardar
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}