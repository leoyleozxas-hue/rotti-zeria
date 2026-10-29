// app/admin/login/page.jsx
//
// Puerta del panel. Usa los mismos primitivos que el resto: así el login no
// parece de otra aplicación.

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Panel from '@/components/ui/panel'
import Field, { FormMessage, fieldClass } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import SiteLogo from '@/components/SiteLogo'

const woodBg = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.62), rgba(18,4,2,.78)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Esta cuenta no tiene permisos de administración.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main
      className="admin-scope relative flex min-h-screen items-center justify-center px-4 py-16 text-cream"
      style={woodBg}
    >
      <Link
        href="/"
        className="absolute left-4 top-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3.5 py-2 text-xs text-white/70 backdrop-blur transition hover:bg-white/12 hover:text-white sm:left-6"
      >
        <ArrowLeft size={14} aria-hidden />
        Volver a la tienda
      </Link>

      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <SiteLogo variant="light" className="items-center mb-5" />
          <h1 className="font-serif text-xl text-white">Panel de administración</h1>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold-soft/70">
            <ShieldCheck size={12} aria-hidden />
            Acceso restringido
          </p>
        </div>

        <Panel tone="raised">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email" required>
              {({ hasError }) => (
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rotti-zeria.com"
                  className={fieldClass(hasError)}
                />
              )}
            </Field>

            <Field label="Contraseña" htmlFor="password" required>
              {({ hasError }) => (
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass(hasError)}
                />
              )}
            </Field>

            <FormMessage>{error}</FormMessage>

            <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 size={16} aria-hidden className="animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </Panel>

        <p className="mt-5 text-center text-[11px] text-white/30">
          Si perdiste el acceso, pedile a quien administra el sitio que resetee tu cuenta.
        </p>
      </div>
    </main>
  )
}
