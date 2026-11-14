// lib/categories.js
//
// Lectura de categorías desde la DB. Todas las pantallas (admin + storefront)
// leen desde acá. Si la DB falla, cae al array hardcodeado de catalog.js para
// no romper nunca el sitio.

import { createClient } from '@/lib/supabase/server'
import { CATEGORIES as FALLBACK } from '@/lib/constants/catalog'

function buildFallback() {
  return FALLBACK.map((name, i) => ({
    id: `fallback-${i}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: null,
    image_url: null,
    sort_order: i * 10,
    is_active: true,
  }))
}

/** Todas las categorías, incluidas las inactivas. Para admin. */
export async function getAllCategories() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    if (!data?.length) throw new Error('empty')
    return data
  } catch (err) {
    console.warn('[categories] fallback:', err?.message)
    return buildFallback()
  }
}

/** Solo categorías activas. Para storefront. */
export async function getActiveCategories() {
  const all = await getAllCategories()
  return all.filter((c) => c.is_active)
}

/** Categorías con conteo de productos. Solo admin. */
export async function getCategoriesWithCounts() {
  try {
    const supabase = await createClient()
    const [{ data: cats, error: catsErr }, { data: products, error: prodErr }] =
      await Promise.all([
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('products').select('category'),
      ])

    if (catsErr || prodErr || !cats) throw catsErr || prodErr || new Error('empty')

    const counts = {}
    for (const p of products || []) {
      counts[p.category] = (counts[p.category] || 0) + 1
    }

    return cats.map((c) => ({ ...c, product_count: counts[c.name] || 0 }))
  } catch {
    return buildFallback().map((c) => ({ ...c, product_count: 0 }))
  }
}

/**
 * Nombres planos para selects del ADMIN.
 * Incluye inactivas: el admin puede asignar cualquier categoría.
 * La activación solo afecta al storefront público.
 */
export async function getCategoryNames() {
  const all = await getAllCategories()
  return all.map((c) => c.name)
}