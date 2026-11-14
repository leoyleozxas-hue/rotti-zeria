// app/sitemap.js
import { createAnonClient } from '@/lib/supabase/anon'
import { SITE_URL } from '@/lib/metadata'

export const revalidate = 3600 // 1h

export default async function sitemap() {
  const staticPages = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/productos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/lunch-eventos`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/pedido`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let productUrls = []
  try {
    const supabase = createAnonClient()
    const { data } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_available', true)
      .order('updated_at', { ascending: false })
      .limit(1000)

    productUrls = (data || []).map((p) => ({
      url: `${SITE_URL}/productos/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    // Si falla la query, sitemap queda con las páginas estáticas
  }

  return [...staticPages, ...productUrls]
}