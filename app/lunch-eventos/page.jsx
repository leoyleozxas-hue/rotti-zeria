// app/lunch-eventos/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Users, Cake, Briefcase, UtensilsCrossed } from 'lucide-react'

const SERVICIOS = [
  { icon: Briefcase, title: 'Coffee break & oficina', desc: 'Facturas, medialunas, jugos y bandejas para reuniones de trabajo.' },
  { icon: Cake, title: 'Cumpleaños y celebraciones', desc: 'Mesas dulces, sánguches de miga y bocados calientes para armar la mesa.' },
  { icon: UtensilsCrossed, title: 'Catering completo', desc: 'Servicio de mozos, mantelería y armado completo del evento.' },
]

export default async function LunchEventosPage() {
  const supabase = await createClient()
  
  // Buscamos los combos de tipo "Lunch"
  const { data: lunches } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Lunch')
    .eq('is_available', true)

  // Buscamos los servicios de tipo "Evento"
  const { data: eventos } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Evento')
    .eq('is_available', true)

  return (
    <>
      {/* Hero Partido */}
      <section className="relative -mt-[4.25rem] pt-[4.25rem] bg-[#150604] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch min-h-[60vh]">
          
          <div className="w-full md:w-1/2 p-8 md:p-16 relative z-10 flex flex-col justify-center">
            <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold mb-4 block">
              Catering & Eventos
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-md">
              Tu evento,<br />nuestra mesa.
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-md font-light">
              Desde coffee breaks para la oficina hasta bandejas para celebraciones grandes. Armamos todo a medida.
            </p>
            <div>
              <Link
                href="#contacto-eventos"
                className="inline-flex items-center gap-2 bg-[#E0C89A] text-[#2b0f0b] px-8 py-4 rounded-full font-semibold hover:bg-white transition shadow-lg"
              >
                Pedir presupuesto
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1000&q=85"
              alt="Catering"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#150604] via-transparent to-transparent hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#150604] via-transparent to-transparent md:hidden" />
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">Qué armamos</h2>
          <p className="text-[#6b3a2c] max-w-lg mx-auto">El mismo horno de siempre, pensado para tu mesa.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {SERVICIOS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center md:text-left bg-[#FCFAF8] p-6 rounded-2xl border border-[#EADFC8] shadow-sm">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#3a130d] text-[#F5EDE3] mb-5 shadow-md">
                <Icon size={22} />
              </span>
              <h3 className="font-serif text-xl text-[#3a130d] mb-2">{title}</h3>
              <p className="text-sm text-[#6b3a2c] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Combos de Lunch (Si hay) */}
      {lunches && lunches.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">Lunch para Oficinas</h2>
            <p className="text-[#6b3a2c]">Viandas y bandejas listas para retirar o enviar.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {lunches.map((combo) => (
              <div key={combo.id} className="border border-[#EADFC8] bg-[#FCFAF8] rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                {combo.image_url && (
                  <div className="relative h-48 w-full">
                    <Image src={combo.image_url} alt={combo.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl text-[#3a130d] mb-2">{combo.name}</h3>
                  <p className="text-sm text-[#6b3a2c] mb-4 flex-1 whitespace-pre-wrap">{combo.description}</p>
                  <p className="text-lg font-bold text-[#3a130d] mt-auto">${Number(combo.price).toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Servicios de Eventos (Si hay) */}
      {eventos && eventos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">Servicios de Catering</h2>
            <p className="text-[#6b3a2c]">Llevamos la panadería a tu evento con mozos y montaje.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {eventos.map((evento) => (
              <div key={evento.id} className="border border-[#EADFC8] bg-[#FCFAF8] p-8 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
                {evento.image_url && (
                  <div className="relative w-full md:w-1/3 aspect-square rounded-xl overflow-hidden shrink-0">
                    <Image src={evento.image_url} alt={evento.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-2xl text-[#3a130d] mb-2">{evento.name}</h3>
                  <p className="text-sm text-[#6b3a2c] mb-4 whitespace-pre-wrap">{evento.description}</p>
                  <p className="text-xs uppercase tracking-wider text-[#9a8b7a] font-semibold">Precio a consultar</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section
        className="text-white"
        style={{
          backgroundImage: "linear-gradient(rgba(18,4,2,.65), rgba(18,4,2,.8)), url('/images/textura-madera-vertical.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-20 text-center" id="contacto-eventos">
          <h2 className="font-serif text-4xl md:text-5xl mb-5 drop-shadow-md">Pedí tu presupuesto</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto text-lg font-light">
            Escribinos por WhatsApp o el formulario de contacto y te respondemos con opciones y tiempos de entrega.
          </p>
          <Link href="/contacto" className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-4 rounded-full font-semibold hover:bg-white transition shadow-lg">
            Ir a contacto <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}