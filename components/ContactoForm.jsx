// components/ContactoForm.jsx
'use client'

import { useState } from 'react'
import { Clock, MapPin, Phone, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/SocialIcons'
import { createClient } from '@/lib/supabase/client'

const fieldClass =
  'w-full rounded-xl border border-[#EADFC8] bg-white px-4 py-3 text-[#2B0F0B] placeholder:text-[#9a8b7a]/60 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition'

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
    <section className="min-h-screen bg-[#FAF7F2] py-16 md:py-24 -mt-[4.25rem] pt-[5.25rem]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
            Hablemos
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-[#2B0F0B] mb-4">Contacto</h1>
          <p className="text-[#6b3a2c] text-lg font-light max-w-lg mx-auto">
            Pedidos especiales, consultas o simplemente saludarnos. Estamos para vos.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] rounded-3xl overflow-hidden shadow-2xl border border-[#EADFC8]">
          {/* Panel izquierdo: info */}
          <div
            className="p-8 md:p-12 text-white relative overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(rgba(18,4,2,.85), rgba(18,4,2,.95)), url('/images/textura-madera-vertical.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10">
              <span className="text-[#E0C89A] text-[10px] uppercase tracking-[0.3em] font-bold block mb-3">
                {settings.businessName} · desde {settings.since}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6 text-white">
                Estamos para
                <br />
                <span className="text-[#E0C89A]">lo que necesites.</span>
              </h2>
              <p className="text-white/70 mb-10 text-sm leading-relaxed">
                Vení a visitarnos al local o escribinos por cualquiera de estos canales. Te
                respondemos a la brevedad.
              </p>

              <ul className="space-y-5">
                {INFO.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E0C89A]/30 bg-[#E0C89A]/10 text-[#E0C89A]">
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.18em] text-[#E0C89A]/70 font-semibold">
                        {label}
                      </p>
                      <p className="text-sm text-white font-medium mt-0.5">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {socials.length > 0 && (
                <div className="flex gap-3 mt-10 pt-6 border-t border-white/10">
                  {socials.map(({ name, url, icon: Icon }) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-[#C9A96E] hover:text-[#2b0f0b] hover:border-[#C9A96E] transition"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: form */}
          <div className="p-8 md:p-12 bg-white">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-[#C9A96E]" />
                </div>
                <h3 className="font-serif text-2xl text-[#2B0F0B] mb-2">
                  ¡Gracias por escribirnos!
                </h3>
                <p className="text-[#6b3a2c] mb-6 text-sm max-w-xs">
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
                <div className="mb-8">
                  <h3 className="font-serif text-2xl text-[#2B0F0B] mb-1">
                    Mandanos un mensaje
                  </h3>
                  <p className="text-sm text-[#6b3a2c]/70">
                    Completá los campos y te escribimos pronto.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">
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
                      <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">
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
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">
                      Teléfono{' '}
                      <span className="text-[#9a8b7a] normal-case font-normal">(opcional)</span>
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
                    <label className="block text-xs uppercase tracking-wider text-[#6b3a2c] font-semibold mb-1.5">
                      Mensaje *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${fieldClass} resize-none`}
                      placeholder="Contanos qué necesitás..."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#2B0F0B] text-white py-4 rounded-xl font-semibold hover:bg-[#5a1a10] transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Enviar consulta
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#9a8b7a] text-center pt-1">
                    Al enviar aceptás que te contactemos por email o WhatsApp.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}