// lib/validations/product.js
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  category: z.string().min(1, 'Seleccioná una categoría'),
  is_available: z.boolean(),
})