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
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', initialData.id)
      if (error) {
        // 🚨 Manejo de duplicado
        if (error.code === '23505') {
          throw new Error('Ya existe un producto con ese nombre. Elegí otro.')
        }
        throw error
      }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase.from('products').insert([payload])
      if (error) {
        // 🚨 Manejo de duplicado
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