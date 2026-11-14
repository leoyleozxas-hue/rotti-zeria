// lib/metadata.js
import { SITE_CONFIG } from '@/lib/config'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || SITE_CONFIG.siteUrl || 'https://rotti-zeria.vercel.app'

export const SITE_URL = BASE_URL

export function buildMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  type = 'website',
}) {
  const url = `${BASE_URL}${path}`
  const ogImage = image || `${BASE_URL}/opengraph-image`
  const fullTitle = title ? `${title} · ${SITE_CONFIG.businessName}` : SITE_CONFIG.businessName

  return {
    title,
    description: description || SITE_CONFIG.businessShortDescription,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: description || SITE_CONFIG.businessShortDescription,
      url,
      siteName: SITE_CONFIG.businessName,
      locale: 'es_AR',
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || SITE_CONFIG.businessShortDescription,
      images: [ogImage],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  }
}