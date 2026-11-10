// components/StoreShell.jsx
'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'
import Header from '@/components/Header'
import CartDrawer from '@/components/cart/CartDrawer'

export default function StoreShell({ children, footer }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      {/* Header envuelto en Suspense para que useSearchParams no rompa el build */}
      <Suspense fallback={<div className="h-[4.25rem] bg-ink-950" />}>
        <Header />
      </Suspense>

      <main className="flex-1 pt-[6.75rem]">{children}</main>
      {footer}
      <CartDrawer />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { fontFamily: 'inherit' } }}
      />
    </>
  )
}