// components/StoreShell.jsx
'use client'

import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function StoreShell({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[4.25rem]">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
    </>
  )
}