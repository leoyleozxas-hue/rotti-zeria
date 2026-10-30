// app/layout.jsx
import { Fraunces, Inter } from 'next/font/google'
import StoreShell from '@/components/StoreShell'
import Footer from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/config'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: `${SITE_CONFIG.businessName} | ${SITE_CONFIG.businessTagline}`,
  description: SITE_CONFIG.businessShortDescription,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col">
        <StoreShell footer={<Footer />}>
          {children}
        </StoreShell>
      </body>
    </html>
  )
}