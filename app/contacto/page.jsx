'use client'
// app/contacto/page.jsx
import { useState } from 'react'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.45), rgba(18,4,2,.65)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const INFO = [
  { icon: MapPin, label: 'Dirección', value: 'Av. Siempre Viva 123' },
  { icon: Clock, label: 'Horario', value: 'Lun a Sáb · 7:00 a 20:00' },
  { icon: Phone, label: 'Teléfono', value: '+598 00 000 000' },
  { icon: Mail, label: 'Email', value: 'hola@biarritz.com' },
]

const field =
  'w-full border border-[#c4b5a5] bg-white/90 px-4 py-3 text-[#2b0f0b] placeholder:text-[#6b3a2c]/50 focus:outline-none focus:border-[#5a1a10] focus:ring-2 focus:ring-[#5a1a10]/20'

export default function ContactoPage() {
  const [sent, setSent] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    // TODO: conectar con tu backend (Supabase / email) antes de publicar.
    setSent(true)
  }

  return (
    <>
      <section style={woodVertical} className="text-white -mt-[4.25rem] pt-[4.25rem]">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Contacto</h1>
          <p className="text-white/80">Estamos para lo que necesites.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-5 gap-12">
        <ul className="md:col-span-2 space-y-6">
          {INFO.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3a130d] text-white">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm text-[#6b3a2c]">{label}</p>
                <p className="font-serif text-lg text-[#3a130d]">{value}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="md:col-span-3">
          {sent ? (
            <div className="border border-[#9a8b7a] bg-white/90 p-8">
              <h2 className="font-serif text-2xl text-[#3a130d] mb-2">Mensaje enviado</h2>
              <p className="text-[#6b3a2c]">Te respondemos a la brevedad.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm mb-1.5 text-[#3a130d]">Nombre</label>
                <input id="nombre" name="nombre" required className={field} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-1.5 text-[#3a130d]">Email</label>
                <input id="email" name="email" type="email" required className={field} autoComplete="email" />
              </div>
              <div>
                <label htmlFor="mensaje" className="block text-sm mb-1.5 text-[#3a130d]">Mensaje</label>
                <textarea id="mensaje" name="mensaje" rows={5} required className={field} />
              </div>
              <button
                type="submit"
                className="bg-[#3a130d] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#5a1a10] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3a130d]"
              >
                Enviar mensaje
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
