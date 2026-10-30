// lib/settings.js
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SITE_CONFIG } from '@/lib/config'

// Fallback súper seguro por si SITE_CONFIG tuviera algún campo faltante
const FALLBACK = {
  businessName: SITE_CONFIG?.businessName || 'Mi Negocio',
  businessTagline: SITE_CONFIG?.businessTagline || '',
  businessShortDescription: SITE_CONFIG?.businessShortDescription || '',
  since: SITE_CONFIG?.since || new Date().getFullYear(),
  siteUrl: SITE_CONFIG?.siteUrl || '',
  address: SITE_CONFIG?.address || '',
  phone: SITE_CONFIG?.phone || '',
  whatsapp: SITE_CONFIG?.whatsapp || '',
  email: SITE_CONFIG?.email || '',
  instagram: SITE_CONFIG?.instagram || '',
  facebook: '',
  x: '',
  hours: {
    weekdays: SITE_CONFIG?.hours?.weekdays || '',
    sunday: SITE_CONFIG?.hours?.sunday || '',
  },
  bank: {
    name: SITE_CONFIG?.bank?.name || '',
    holder: SITE_CONFIG?.bank?.holder || '',
    alias: SITE_CONFIG?.bank?.alias || '',
    cbu: SITE_CONFIG?.bank?.cbu || '',
    accountNumber: SITE_CONFIG?.bank?.accountNumber || '',
  },
}

export const getSettings = cache(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) return FALLBACK

    return {
      ...FALLBACK,
      address: data.address || FALLBACK.address,
      phone: data.phone || FALLBACK.phone,
      whatsapp: data.whatsapp || FALLBACK.whatsapp,
      email: data.email || FALLBACK.email,
      instagram: data.instagram || FALLBACK.instagram,
      facebook: data.facebook_url || '',
      x: data.x_url || '',
      hours: {
        weekdays: data.hours_weekdays || FALLBACK.hours.weekdays,
        sunday: data.hours_sunday || FALLBACK.hours.sunday,
      },
      bank: {
        name: data.bank_name || FALLBACK.bank.name,
        holder: data.bank_holder || FALLBACK.bank.holder,
        alias: data.bank_alias || FALLBACK.bank.alias,
        cbu: data.bank_cbu || FALLBACK.bank.cbu,
        accountNumber: data.bank_account_number || FALLBACK.bank.accountNumber,
      },
    }
  } catch (err) {
    console.error('Error loading settings:', err)
    return FALLBACK
  }
})