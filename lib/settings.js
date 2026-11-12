// lib/settings.js
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/config'

// 1. Envolvemos la consulta real en unstable_cache
const getCachedSettings = unstable_cache(
  async () => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (error || !data) return null

      return {
        address: data.address || SITE_CONFIG.address,
        phone: data.phone || SITE_CONFIG.phone,
        whatsapp: data.whatsapp || SITE_CONFIG.whatsapp,
        email: data.email || SITE_CONFIG.email,
        instagram: data.instagram || SITE_CONFIG.instagram,
        facebook: data.facebook_url || '',
        x: data.x_url || '',
        hours: {
          weekdays: data.hours_weekdays || SITE_CONFIG.hours.weekdays,
          sunday: data.hours_sunday || SITE_CONFIG.hours.sunday,
        },
        bank: {
          name: data.bank_name || SITE_CONFIG.bank.name,
          holder: data.bank_holder || SITE_CONFIG.bank.holder,
          alias: data.bank_alias || SITE_CONFIG.bank.alias,
          cbu: data.bank_cbu || SITE_CONFIG.bank.cbu,
          accountNumber: data.bank_account_number || SITE_CONFIG.bank.accountNumber,
        },
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      return null
    }
  },
  ['settings-cache'], // clave única para la caché
  {
    revalidate: 3600, // Se refresca cada 1 hora (3600 segundos)
    tags: ['settings'], // Opcional: para invalidar caché manualmente desde el admin
  }
)

// 2. Mantenemos React.cache para que en un mismo request no se haga doble query
export const getSettings = cache(async () => {
  const cachedData = await getCachedSettings()

  // Si la DB falló o está vacía, devolvemos el fallback de SITE_CONFIG
  if (!cachedData) {
    return {
      businessName: SITE_CONFIG.businessName,
      businessTagline: SITE_CONFIG.businessTagline,
      businessShortDescription: SITE_CONFIG.businessShortDescription,
      since: SITE_CONFIG.since,
      siteUrl: SITE_CONFIG.siteUrl,
      ...SITE_CONFIG, // Usamos los valores por defecto
    }
  }

  return {
    businessName: SITE_CONFIG.businessName,
    businessTagline: SITE_CONFIG.businessTagline,
    businessShortDescription: SITE_CONFIG.businessShortDescription,
    since: SITE_CONFIG.since,
    siteUrl: SITE_CONFIG.siteUrl,
    ...cachedData,
  }
})