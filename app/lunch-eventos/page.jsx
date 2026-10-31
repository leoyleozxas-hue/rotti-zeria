// app/lunch-eventos/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Briefcase, Cake, UtensilsCrossed } from 'lucide-react'
import LunchGrid from '@/components/LunchGrid'

const woodHorizontal = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.78), rgba(18,4,2,.88)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.75), rgba(18,4,2,.88)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const SERVICIOS = [
  {
    icon: Briefcase,
    title: 'Coffee break & oficina',
    desc: 'Facturas, medialunas, jugos y bandejas para reuniones de trabajo.',
  },
  {
    icon: Cake,
    title: 'Cumpleaños y celebraciones',
    desc: 'Mesas dulces, sánguches de miga y bocados calientes para armar la mesa.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Catering completo',
    desc: 'Servicio de mozos, mantelería y armado completo del evento.',
  },
]

export default async function LunchEventosPage() {
  const supabase = await createClient()

  const { data: lunches } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Lunch')
    .eq('is_available', true)

  const { data: eventos } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'Lunch')
    .eq('lunch_type', 'Evento')
    .eq('is_available', true)

  return (
    <>
      {/* HERO — full-screen, texto abajo siempre */}
      <section className="relative min-h-[100svh] flex items-end text-white overflow-hidden -mt-[6.75rem]">
        <Image
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=85"
          alt="Catering"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply opacity-60"
          style={{
            backgroundImage: "url('/images/textura-madera-vertical.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#1a0806]/95 via-[#1a0806]/55 to-[#1a0806]/20"
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-28 pb-20 md:pt-32 md:pb-24">
          <p className="text-[#E0C89A] text-sm tracking-[0.2em] uppercase mb-4">
            Catering & Eventos
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.05] mb-5 max-w-3xl text-white drop-shadow-lg">
            Tu evento,<br />nuestra mesa.
          </h1>
          <p className="text-white/85 max-w-lg mb-9 text-base md:text-lg font-light">
            Desde coffee breaks para la oficina hasta bandejas para celebraciones grandes. Armamos todo a medida.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#lunch"
              className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-4 rounded-full font-semibold hover:bg-white transition shadow-lg group"
            >
              Ver combos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="#contacto-eventos"
              className="inline-flex items-center gap-2 border border-white/60 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Pedir presupuesto
            </Link>
          </div>
        </div>
      </section>

      {/* WRAPPER — fondo crema */}
      <div className="relative bg-[#FAF7F2]">

        {/* QUÉ ARMAMOS — sticky wrapper con margen crema siempre visible */}
        <section className="sticky top-[6.75rem] z-0 bg-[#FAF7F2] py-6 md:py-8">
          <div
            className="relative overflow-hidden"
            style={woodHorizontal}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
              <div className="text-center mb-10 anim-rise">
                <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
                  Servicios
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-3 text-white">
                  Qué armamos
                </h2>
                <p className="text-white/70 max-w-lg mx-auto">
                  El mismo horno de siempre, pensado para tu mesa.
                </p>
              </div>

              {/* Mobile: carrusel */}
              <div className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
                {SERVICIOS.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="relative snap-start shrink-0 w-[80vw] max-w-[320px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 overflow-hidden"
                  >
                    {/* Watermark ícono esquina */}
                    <Icon
                      size={100}
                      aria-hidden
                      className="absolute -top-4 -right-4 text-white/[0.06] pointer-events-none"
                    />

                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E0C89A]/20 border border-[#E0C89A]/40 text-[#E0C89A] mb-5">
                      <Icon size={22} />
                    </span>
                    <h3 className="relative font-serif text-lg mb-2 text-white">{title}</h3>
                    <p className="relative text-sm text-white/70 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Desktop: grid 3 columnas */}
              <div className="hidden md:grid md:grid-cols-3 gap-5">
                {SERVICIOS.map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    style={{ animationDelay: `${i * 100}ms` }}
                    className="anim-rise relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 overflow-hidden hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Watermark ícono esquina */}
                    <Icon
                      size={120}
                      aria-hidden
                      className="absolute -top-4 -right-4 text-white/[0.06] pointer-events-none"
                    />

                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E0C89A]/20 border border-[#E0C89A]/40 text-[#E0C89A] mb-5">
                      <Icon size={22} />
                    </span>
                    <h3 className="relative font-serif text-xl mb-2 text-white">{title}</h3>
                    <p className="relative text-sm text-white/70 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* LUNCH — sin border radius */}
        <section
          id="lunch"
          className="relative z-10 bg-[#FAF7F2] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] scroll-mt-24"
        >
          <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-12">
              <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
                Lunch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B0F0B] mb-3">
                Lunch para Oficinas
              </h2>
              <p className="text-[#6b3a2c]">
                Viandas y bandejas listas para retirar o enviar.
              </p>
            </div>

            {lunches && lunches.length > 0 ? (
              <>
                <LunchGrid lunches={lunches} />
                <div className="flex justify-end mt-10">
                  <Link
                    href="/productos?categoria=Lunch"
                    className="inline-flex items-center gap-2 text-[#2B0F0B] border-b-2 border-[#2B0F0B] pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition font-medium text-sm sm:text-base group"
                  >
                    Ver todos los combos
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-center text-[#6b3a2c]">Pronto vas a ver los combos disponibles.</p>
            )}
          </div>
        </section>

        {/* CATERING — sin border radius */}
        {eventos && eventos.length > 0 && (
          <section className="relative z-10 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.2)] py-16 md:py-24">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-12">
                <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
                  Catering
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B0F0B] mb-3">
                  Servicios de Catering
                </h2>
                <p className="text-[#6b3a2c]">
                  Llevamos la panadería a tu evento con mozos y montaje.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {eventos.map((evento, i) => (
                  <div
                    key={evento.id}
                    style={{ animationDelay: `${i * 100}ms` }}
                    className="anim-rise bg-[#FAF7F2] border border-[#EADFC8] rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center hover:shadow-xl hover:-translate-y-1 hover:border-[#C9A96E] transition-all duration-300"
                  >
                    {evento.image_url && (
                      <div className="relative w-full sm:w-1/3 aspect-square rounded-xl overflow-hidden shrink-0 bg-[#EADFC8]">
                        <Image
                          src={evento.image_url}
                          alt={evento.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-[#2B0F0B] mb-2">{evento.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{evento.description}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#9a8b7a] font-semibold">
                        Precio a consultar
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA FINAL — sin border radius */}
        <section
          className="relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
          style={woodVertical}
          id="contacto-eventos"
        >
          <div className="max-w-3xl mx-auto px-4 py-20 md:py-28 text-center text-white">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl mb-5 drop-shadow-md">
              Pedí tu presupuesto
            </h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto text-base sm:text-lg font-light">
              Escribinos por WhatsApp o el formulario de contacto y te respondemos con opciones y tiempos de entrega.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-4 rounded-full font-semibold hover:bg-white transition shadow-lg"
            >
              Ir a contacto <ArrowRight size={18} />
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}