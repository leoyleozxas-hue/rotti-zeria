// app/layout.jsx
import { Suspense } from 'react'
import { Fraunces, Inter } from 'next/font/google'
import StoreShell from '@/components/StoreShell'
import Footer from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/config'
import { SITE_URL } from '@/lib/metadata'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  metadataBase: new URL(SITE_URL),           // ← nuevo
  title: {
    default: `${SITE_CONFIG.businessName} | ${SITE_CONFIG.businessTagline}`,
    template: `%s · ${SITE_CONFIG.businessName}`,   // ← nuevo (no duplica el nombre)
  },
  description: SITE_CONFIG.businessShortDescription,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_CONFIG.businessName,
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col">
        <StoreShell
          footer={
            <Suspense fallback={<div className="h-64 bg-ink-950" />}>
              <Footer />
            </Suspense>
          }
        >
          {children}
        </StoreShell>
      </body>
    </html>
  )
}