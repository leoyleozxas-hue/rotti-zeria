// components/admin/LunchForm.jsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Panel, { PanelHeader } from '@/components/ui/panel'
import Field, { fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { z } from 'zod'

const lunchSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 letras'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 letras'),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  lunch_type: z.enum(['Lunch', 'Evento']),
  is_available: z.boolean(),
})

function uniqueFileName(file) {
  const extension = file.name.split('.').pop()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
}

export default function LunchForm({ initialData = null }) {
  const router = useRouter()
  const isEditing = Boolean(initialData)
  const fileInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(lunchSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ?? '',
      lunch_type: initialData?.lunch_type || 'Lunch',
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
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const payload = { 
        ...data, 
        image_url: imageUrl, 
        category: 'Lunch' // Forzamos la categoría para que se diferencie
      }

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', initialData.id)
        if (error) throw error
        toast.success('Combo actualizado')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
        toast.success('Combo creado')
      }

      router.push('/admin/lunch')
      router.refresh()
    } catch (error) {
      toast.error('Error al guardar', { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
        
        <div className="space-y-5">
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Información del Combo" />
            <div className="space-y-4 p-5">
              <Field label="Nombre del combo" required error={errors.name?.message}>
                {({ hasError }) => <input {...register('name')} className={fieldClass(hasError)} />}
              </Field>
              
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio" required error={errors.price?.message}>
                  {({ hasError }) => <input type="number" step="0.01" {...register('price')} className={fieldClass(hasError)} />}
                </Field>
                <Field label="Tipo" required error={errors.lunch_type?.message}>
                  {({ hasError }) => (
                    <select {...register('lunch_type')} className={fieldClass(hasError)}>
                      <option value="Lunch">Lunch (Oficinas/Reuniones)</option>
                      <option value="Evento">Evento (Catering)</option>
                    </select>
                  )}
                </Field>
              </div>

              <Field label="Descripción e Incluye" required error={errors.description?.message} hint="Detallá qué trae el combo. Ej: Incluye 10 medialunas, 5 sánguches...">
                {({ hasError }) => <textarea rows={4} {...register('description')} className={fieldClass(hasError)} />}
              </Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel tone="glass" padded={false}>
            <PanelHeader title="Imagen del combo" />
            <div className="p-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-card border-2 border-dashed border-white/15 bg-white/[0.03] transition hover:border-gold/50"
              >
                {imagePreview ? (
                  <>
                    <Image src={imagePreview} alt="" fill className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition">
                      <UploadCloud size={16} className="mr-2" /> Cambiar foto
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-2 text-white/35">
                    <ImageIcon size={26} />
                    <span className="text-xs">Subir foto</span>
                  </span>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </Panel>

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Guardando...</> : 'Guardar Combo'}
          </Button>
        </div>
      </div>
    </form>
  )
}