// app/admin/login/page.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const woodBg = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.7)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales inválidas')
      setLoading(false)
      return
    }

    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('No tenés permisos para acceder')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative" style={woodBg}>
      {/* Botón volver */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm border border-white/20 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full"
      >
        <ArrowLeft size={16} />
        Volver a la tienda
      </Link>

      <div className="w-full max-w-md border border-white/25 bg-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.2)] p-8 text-[#F5EDE3]">
        <div className="text-center mb-8">
          <Image
            src="/images/logo-biarritz-blanco.png"
            alt="Biarritz"
            width={200}
            height={73}
            className="h-12 w-auto mx-auto mb-4 mix-blend-screen"
          />
          <div className="w-12 h-12 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} />
          </div>
          <h1 className="font-serif text-3xl text-white">Panel Biarritz</h1>
          <p className="text-white/65 text-sm mt-2">Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-white/25 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none transition"
              placeholder="admin@biarritz.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-white/25 bg-white/10 backdrop-blur-md text-white focus:border-white/50 focus:outline-none transition"
            />
          </div>

          {error && (
            <p className="text-red-200 text-sm bg-red-500/20 border border-red-400/30 p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] py-3.5 rounded-full hover:bg-white transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}