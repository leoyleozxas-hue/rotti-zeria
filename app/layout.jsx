// app/layout.jsx
import { Fraunces, Inter } from 'next/font/google'
import StoreShell from '@/components/StoreShell'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Biarritz | Panadería desde 1935',
  description: 'Panadería artesanal con pedidos online. Facturas, panes y delicias recién horneadas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-cream text-chocolate antialiased min-h-screen flex flex-col">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  )
}
