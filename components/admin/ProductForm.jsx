// components/admin/ProductForm.jsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { productSchema } from '@/lib/validations/product'
import { toast } from 'sonner'

const CATEGORIES = ['Panes', 'Facturas', 'Dulces', 'Salados', 'Bocados calientes']

const glass =
  'relative border border-white/20 bg-white/8 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.25)]'

export default function ProductForm({ initialData = null }) {
  const router = useRouter()
  const isEditing = !!initialData
  const fileInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image_url || null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || '',
      category: initialData?.category || CATEGORIES[0],
      is_available: initialData?.is_available ?? true,
    },
  })

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      const supabase = createClient()
      let finalImageUrl = initialData?.image_url || null

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        finalImageUrl = urlData.publicUrl
      }

      const productData = {
        ...data,
        image_url: finalImageUrl,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData.id)
        if (error) throw error
        toast.success('Producto actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])
        if (error) throw error
        toast.success('Producto creado correctamente')
      }

      router.push('/admin/productos')
      router.refresh()

    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        
        <div className={`${glass} rounded-2xl p-6 space-y-5`}>
          <h2 className="font-serif text-xl text-white border-b border-white/10 pb-3">
            Información del producto
          </h2>

          <div>
            <label className="block text-sm text-white/70 mb-1">Nombre</label>
            <input
              {...register('name')}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Categoría</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#150604] text-white focus:border-[#E0C89A] focus:outline-none appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Descripción</label>
            <textarea
              rows={4}
              {...register('description')}
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-[#E0C89A] focus:outline-none transition resize-none"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isAvailable"
              {...register('is_available')}
              className="w-5 h-5 accent-[#E0C89A] cursor-pointer"
            />
            <label htmlFor="isAvailable" className="text-sm text-white/80 cursor-pointer">
              Producto visible y disponible en la tienda
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${glass} rounded-2xl p-6`}>
            <h2 className="font-serif text-lg text-white mb-4">Imagen</h2>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
            >
              {imagePreview ? (
                <>
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <UploadCloud size={16} /> Cambiar foto
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon size={32} className="mx-auto text-white/30 mb-2" />
                  <p className="text-sm text-white/60">Click para subir foto</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#E0C89A] text-[#2b0f0b] py-3.5 rounded-full font-bold hover:bg-white transition disabled:opacity-50"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Guardando...</> : 'Guardar producto'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/productos')}
              disabled={loading}
              className="w-full py-3 rounded-full text-sm text-white/60 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </form>
  )
}