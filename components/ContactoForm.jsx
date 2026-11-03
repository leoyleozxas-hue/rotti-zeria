// components/ContactoForm.jsx
'use client'

import { useState } from 'react'
import { Clock, MapPin, Phone, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/SocialIcons'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'w-full rounded-lg border border-[#EADFC8] bg-white px-3.5 py-2.5 text-sm text-[#2B0F0B] placeholder:text-[#9a8b7a]/60 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/15 transition'

export default function ContactoForm({ settings }) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const INFO = [
    { icon: MapPin, label: 'Dirección', value: settings.address },
    { icon: Clock, label: 'Horario', value: settings.hours.weekdays },
    { icon: Phone, label: 'Teléfono', value: settings.phone },
    { icon: Mail, label: 'Email', value: settings.email },
  ]

  const socials = [
    { name: 'Instagram', url: settings.instagram, icon: InstagramIcon },
    { name: 'Facebook', url: settings.facebook, icon: FacebookIcon },
    { name: 'X', url: settings.x, icon: XIcon },
  ].filter((s) => s.url && s.url.trim() !== '')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('consultas').insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          message: form.message,
          status: 'new',
        },
      ])

      if (dbError) throw dbError

      setSent(true)
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setError('No pudimos enviar tu consulta. Intentá de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-[#FAF7F2] -mt-[6.75rem]">
      {/* HERO mínimo, alineado a la izquierda */}
      <div
        className="pt-[6.75rem] pb-24 md:pb-28 text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,4,2,.78), rgba(18,4,2,.92)), url('/images/textura-madera-vertical.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-8">
          <span className="text-[#E0C89A] text-[10px] uppercase tracking-[0.3em] font-bold block mb-2">
            Hablemos
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Contacto
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-2 max-w-md">
            Estamos para lo que necesites. Escribinos y te respondemos a la brevedad.
          </p>
        </div>
      </div>

      {/* FORM superpuesto sobre el hero */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 md:-mt-20 pb-10 md:pb-14 relative z-10">
        <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(43,15,11,0.18)] border border-[#EADFC8] bg-white">
          <div className="grid lg:grid-cols-[1fr_1.5fr]">

            {/* ─── Panel izquierdo: info ─── */}
            <aside
              className="relative p-6 md:p-7 text-white"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(18,4,2,.9), rgba(18,4,2,.96)), url('/images/textura-madera-vertical.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <span className="text-[#E0C89A] text-[9px] uppercase tracking-[0.3em] font-bold block mb-2">
                {settings.businessName} · desde {settings.since}
              </span>
              <h2 className="font-serif text-2xl leading-tight mb-2 text-white">
                Estamos para <span className="text-[#E0C89A]">vos.</span>
              </h2>
              <p className="text-white/60 mb-5 text-xs leading-relaxed">
                Vení a visitarnos o escribinos por cualquiera de estos canales.
              </p>

              <ul className="space-y-3">
                {INFO.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E0C89A]/25 bg-[#E0C89A]/10 text-[#E0C89A]">
                      <Icon size={13} />
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#E0C89A]/60 font-semibold">
                        {label}
                      </p>
                      <p className="text-sm text-white mt-0.5 leading-snug">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {socials.length > 0 && (
                <div className="flex gap-2 mt-5 pt-4 border-t border-white/10">
                  {socials.map(({ name, url, icon: Icon }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#E0C89A] hover:text-[#2b0f0b] hover:border-[#E0C89A] transition"
                    >
                      <Icon size={13} />
                    </a>
                  ))}
                </div>
              )}
            </aside>

            {/* ─── Panel derecho: formulario ─── */}
            <div className="p-6 md:p-7 bg-white">
              {sent ? (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center mb-4">
                    <CheckCircle2 size={26} className="text-[#C9A96E]" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#2B0F0B] mb-2">
                    ¡Gracias por escribirnos!
                  </h3>
                  <p className="text-[#6b3a2c] mb-5 text-sm max-w-xs">
                    Recibimos tu consulta y te respondemos a la brevedad.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="text-sm text-[#C9A96E] hover:text-[#2B0F0B] transition underline underline-offset-4"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="font-serif text-xl text-[#2B0F0B]">Mandanos un mensaje</h3>
                    <p className="text-xs text-[#6b3a2c]/70 mt-0.5">
                      Te respondemos dentro del día hábil.
                    </p>
                  </div>

                  <form onSubmit={onSubmit} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1">
                          Nombre *
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={fieldClass}
                          placeholder="Tu nombre"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={fieldClass}
                          placeholder="tu@email.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1">
                        Teléfono <span className="text-[#9a8b7a] normal-case font-normal">(opcional)</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={fieldClass}
                        placeholder="11 1234-5678"
                        autoComplete="tel"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1">
                        Mensaje *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={`${fieldClass} resize-none`}
                        placeholder="Contanos qué necesitás..."
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-[#2B0F0B] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#5a1a10] transition disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Enviar consulta
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}