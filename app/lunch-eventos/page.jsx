// app/lunch-eventos/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/settings'
import { ArrowRight, Mail, Phone } from 'lucide-react'
import LunchGrid from '@/components/LunchGrid'
import ServiciosCarousel from '@/components/ServiciosCarousel'
import { buildMetadata } from '@/lib/metadata'

export const metadata = buildMetadata({
  title: 'Lunch & Eventos',
  description: 'Coffee breaks, catering, cumpleaños y eventos. Armamos combos a medida para oficinas y celebraciones.',
  path: '/lunch-eventos',
})

const woodSticky = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.82), rgba(18,4,2,.92)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodHorizontal = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.78), rgba(18,4,2,.92)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

const SERVICIOS = [
  {
    index: '01',
    title: 'Coffee break & oficina',
    desc: 'Facturas, medialunas, jugos y bandejas para reuniones de trabajo.',
    src: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1600&q=80',
    alt: 'Bandeja de medialunas y facturas para un coffee break',
    className: 'md:col-span-7 md:row-span-2',
  },
  {
    index: '02',
    title: 'Cumpleaños y celebraciones',
    desc: 'Mesas dulces, sánguches de miga y bocados calientes para armar la mesa.',
    src: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1400&q=80',
    alt: 'Mesa dulce para un cumpleaños',
    className: 'md:col-span-5',
  },
  {
    index: '03',
    title: 'Catering completo',
    desc: 'Servicio de mozos, mantelería y armado completo del evento.',
    src: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1400&q=80',
    alt: 'Mesa de catering servida',
    className: 'md:col-span-5',
  },
]

const PASOS = [
  { n: '01', t: 'Contanos', d: 'Fecha, cantidad de personas y si es oficina, cumple o evento.' },
  { n: '02', t: 'Armamos', d: 'Te pasamos opciones con el mismo horno de siempre.' },
  { n: '03', t: 'Llegamos', d: 'Retirás en el local o lo enviamos listo para servir.' },
]

export default async function LunchEventosPage() {
  const supabase = await createClient()
  const settings = await getSettings()

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
      {/* HERO */}
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

      {/* QUÉ ARMAMOS — con scroll-3d */}
      <section
        className="relative text-white py-16 md:py-24"
        style={woodSticky}
      >
        <div className="scroll-3d max-w-6xl mx-auto w-full px-4 sm:px-6">
          <div className="flex items-end justify-between gap-6 mb-6 md:mb-8">
            <div>
              <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold block mb-2">
                Servicios
              </span>
              <h2 className="font-serif text-4xl md:text-5xl text-white">Qué armamos</h2>
              <p className="mt-2 max-w-xs text-sm text-white/70 md:hidden">
                El mismo horno de siempre, pensado para tu mesa.
              </p>
            </div>
            <p className="hidden max-w-xs text-right text-sm text-white/70 md:block">
              El mismo horno de siempre, pensado para tu mesa.
            </p>
          </div>

          {/* MOBILE: carrusel */}
          <div className="md:hidden">
            <ServiciosCarousel servicios={SERVICIOS} />
          </div>

          {/* DESKTOP: grid editorial */}
          <div className="hidden md:grid md:grid-cols-12 md:grid-rows-2 gap-3 min-h-[600px]">
            {SERVICIOS.map(({ index, title, desc, src, alt, className }) => (
              <article
                key={index}
                className={`group relative overflow-hidden rounded-2xl md:h-full ${className}`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0806] via-[#1a0806]/35 to-[#1a0806]/10" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 pb-6 md:pb-8">
                  <span className="font-serif text-sm text-[#E0C89A]">{index}</span>
                  <h3 className="mt-1 max-w-sm font-serif text-2xl md:text-3xl leading-tight text-white">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">{desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LUNCH */}
      <section
        id="lunch"
        className="relative bg-[#FAF7F2] scroll-fade scroll-mt-24"
      >
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="mb-10 md:mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-2">
                Lunch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#2B0F0B]">
                Lunch para Oficinas
              </h2>
              <p className="mt-3 text-[#6b3a2c]">
                Viandas y bandejas listas para retirar o enviar.
              </p>
            </div>
            <Link
              href="/productos?categoria=Lunch"
              className="inline-flex items-center gap-2 self-start text-[#2B0F0B] border-b-2 border-[#2B0F0B] pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition font-medium text-sm sm:text-base group"
            >
              Ver todos los combos
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
            </Link>
          </div>

          {lunches && lunches.length > 0 ? (
            <LunchGrid lunches={lunches} />
          ) : (
            <p className="text-center text-[#6b3a2c]">Pronto vas a ver los combos disponibles.</p>
          )}
        </div>
      </section>

      {/* CATERING */}
      {eventos && eventos.length > 0 && (
        <section className="relative bg-white scroll-fade py-16 md:py-24">
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

      {/* PRESUPUESTO */}
      <section
        id="contacto-eventos"
        className="relative text-white scroll-fade scroll-mt-24"
        style={woodSticky}
      >
        <div className="relative h-56 md:h-80 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1920&q=80"
            alt=""
            fill
            className="object-cover object-[center_55%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0806]/10 via-[#1a0806]/45 to-[#1a0806]" />
        </div>

        <div className="max-w-6xl mx-auto grid gap-12 px-4 sm:px-6 pt-10 md:pt-14 pb-20 md:pb-28 md:grid-cols-12">
          <div className="md:col-span-7">
            <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
              Presupuesto
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] max-w-xl">
              Pedí tu presupuesto
            </h2>
            <p className="mt-5 max-w-md text-base sm:text-lg font-light text-white/75">
              Escribinos por WhatsApp o el formulario de contacto y te respondemos con opciones y tiempos de entrega.
            </p>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {PASOS.map((paso) => (
                <li key={paso.n} className="border-t border-white/15 pt-4">
                  <span className="font-serif text-sm text-[#E0C89A]">{paso.n}</span>
                  <p className="mt-3 font-serif text-2xl">{paso.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{paso.d}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="md:col-span-5">
            <div className="rounded-3xl bg-[#fffdf8] p-1.5 text-[#2B0F0B] shadow-2xl">
              <div className="rounded-[1.25rem] border border-dashed border-[#C9A96E]/70 px-6 py-7 md:px-7">
                <span className="text-[#C9A96E] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
                  Nota de pedido
                </span>
                <h3 className="font-serif text-3xl">Te respondemos hoy</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b3a2c]">
                  Sin compromiso. En el día hábil, con lo que hay en el horno.
                </p>

                <ul className="mt-6 divide-y divide-[#EADFC8]">
                  {settings.email && (
                    <li>
                      <a
                        href={`mailto:${settings.email}?subject=Presupuesto%20Lunch%20y%20eventos`}
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <Mail size={18} className="text-[#C9A96E] shrink-0" />
                        <span>
                          <span className="block font-medium">Mail</span>
                          <span className="text-[#6b3a2c] break-all">{settings.email}</span>
                        </span>
                      </a>
                    </li>
                  )}
                  {settings.phone && (
                    <li>
                      <a
                        href={`tel:${settings.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-3 py-3 text-sm"
                      >
                        <Phone size={18} className="text-[#C9A96E] shrink-0" />
                        <span>
                          <span className="block font-medium">Teléfono</span>
                          <span className="text-[#6b3a2c]">{settings.phone}</span>
                        </span>
                      </a>
                    </li>
                  )}
                </ul>

                <Link
                  href="/contacto"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2B0F0B] px-6 py-3.5 font-semibold text-[#F5EDE3] hover:bg-[#24110d] transition"
                >
                  Ir a contacto
                  <ArrowRight size={16} />
                </Link>
                <p className="mt-4 text-center text-xs leading-relaxed text-[#9a8b7a]">
                  {settings.address}
                  <br />
                  {settings.hours.weekdays}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}