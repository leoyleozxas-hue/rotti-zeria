// lib/settings.js
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createAnonClient } from '@/lib/supabase/anon'   // ← único cambio de import
import { SITE_CONFIG } from '@/lib/config'

// 1. Envolvemos la consulta real en unstable_cache.
//    Dentro del cache scope NO se pueden leer cookies, así que usamos
//    createAnonClient (sin sesión) — settings es público por RLS.
const getCachedSettings = unstable_cache(
  async () => {
    try {
      const supabase = createAnonClient()   // ← antes: await createClient()
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
  ['settings-cache'],
  {
    revalidate: 3600,
    tags: ['settings'],
  }
)

// 2. React.cache: memoiza por request (evita doble query dentro del mismo render)
export const getSettings = cache(async () => {
  const cachedData = await getCachedSettings()

  if (!cachedData) {
    return {
      businessName: SITE_CONFIG.businessName,
      businessTagline: SITE_CONFIG.businessTagline,
      businessShortDescription: SITE_CONFIG.businessShortDescription,
      since: SITE_CONFIG.since,
      siteUrl: SITE_CONFIG.siteUrl,
      ...SITE_CONFIG,
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