// app/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import MarqueeBanner from '@/components/MarqueeBanner'
import InfoBar from '@/components/InfoBar'
import { ArrowRight, Wheat } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

async function FeaturedProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .limit(4)

  if (!products?.length) return null

  return (
    <>
      {/* Mobile: carrusel */}
      <div className="md:hidden -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[72vw] max-w-[300px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Desktop: grilla uniforme de 4 */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {products.map((p) => (
          <div key={p.id} className="h-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </>
  )
}

const CATEGORIES = [
  {
    name: 'Panes',
    desc: 'De campo, integrales y masa madre',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80',
  },
  {
    name: 'Facturas',
    desc: 'Medialunas, croissants y más',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
  },
  {
    name: 'Dulces',
    desc: 'Masas finas, secas y húmedas',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  },
  {
    name: 'Salados',
    desc: 'Sánguches de miga y tartas',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
  },
  {
    name: 'Bocados calientes',
    desc: 'Chipá, prepizzas y calentitos',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  },
]

function Divider() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="h-px w-16 bg-[#C9A96E]/30" />
      <Wheat size={16} className="text-[#C9A96E]/60" />
      <div className="h-px w-16 bg-[#C9A96E]/30" />
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* HERO — textura madera */}
      <section className="relative min-h-[100svh] flex items-end md:items-center text-white overflow-hidden -mt-[6.75rem]">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=85"
          alt="Pan y facturas recién horneados"
          fill
          priority
          className="object-cover object-center animate-hero-zoom"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-multiply opacity-70"
          style={{
            backgroundImage: "url('/images/textura-madera-vertical.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#1a0806]/90 via-[#1a0806]/45 to-[#1a0806]/25"
        />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-28 pb-16 md:pt-32 md:pb-24 animate-hero-rise">
          <p className="text-[#E0C89A] text-sm tracking-[0.2em] uppercase mb-4">
            {SITE_CONFIG.businessName} · desde {SITE_CONFIG.since}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-4 max-w-2xl text-white">
            Facturas, panes y delicias recién horneadas
          </h1>
          <p className="text-white/80 max-w-md mb-9 text-base md:text-lg">
            Pedí online y retirá por el local.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-7 py-3.5 rounded-full font-medium hover:bg-white transition group"
            >
              Ver productos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/lunch-eventos"
              className="inline-flex items-center gap-2 border border-white/60 text-white px-7 py-3.5 rounded-full hover:bg-white/10 transition"
            >
              Lunch & Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE solo desktop */}
      <div className="hidden md:block">
        <MarqueeBanner />
      </div>

      {/* INFO BAR — fondo sólido oscuro */}
      <InfoBar />

      {/* ESPECIALIDADES — fondo crema, cards verticales */}
      <section className="scroll-fade bg-[#FAF7F2] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B0F0B] mb-3">
              Nuestras especialidades
            </h2>
            <p className="text-[#6b3a2c] max-w-lg mx-auto">
              Todo lo que encontrás en el local, ahora a un click.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0806] via-[#1a0806]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-serif text-lg sm:text-xl text-white mb-1 leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/70 leading-snug">
                    {cat.desc}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#E0C89A] font-semibold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    Ver más <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* DESTACADOS — fondo crema más oscuro */}
      <section className="scroll-fade bg-[#EFE3D3] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B0F0B]">
              Recién salidos del horno
            </h2>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-[#2B0F0B] border-b border-[#2B0F0B] pb-1 hover:text-[#5a1a10] hover:border-[#5a1a10] transition self-start md:self-auto"
            >
              Ver todo <ArrowRight size={16} />
            </Link>
          </div>

          <Suspense fallback={<p className="text-[#6b3a2c]">Cargando...</p>}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* HISTORIA — fondo blanco, imagen solapa + stats */}
      <section className="relative z-10 bg-white scroll-fade">
        <div className="max-w-6xl mx-auto px-4 pt-20 pb-10 grid md:grid-cols-2 gap-12 items-end">
          <div className="relative aspect-square overflow-hidden md:-mb-16 shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=85"
              alt="Nuestra historia"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-multiply opacity-30"
              style={{
                backgroundImage: "url('/images/textura-madera.png')",
                backgroundSize: 'cover',
              }}
            />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B0F0B] mb-6">
              Hecho a mano<br />todos los días
            </h2>
            <p className="text-[#6b3a2c] mb-4 max-w-prose">
              En {SITE_CONFIG.businessName} creemos que el pan es un acto de paciencia. Fermentamos lento, horneamos temprano y tratamos cada pieza como si fuera para nuestra propia mesa.
            </p>
            <p className="text-[#6b3a2c] mb-8 max-w-prose">
              Sin conservantes, sin apuro. Solo harina, agua, sal, tiempo y manos que saben.
            </p>

            {/* 3 stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 pt-6 border-t border-[#EADFC8]">
              <div>
                <p className="font-serif text-3xl md:text-4xl text-[#2B0F0B] leading-none">
                  +30
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[#9a8b7a] font-semibold mt-1">
                  Productos
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-[#2B0F0B] leading-none">
                  7:00
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[#9a8b7a] font-semibold mt-1">
                  Desde las
                </p>
              </div>
              <div>
                <p className="font-serif text-3xl md:text-4xl text-[#2B0F0B] leading-none">
                  0
                </p>
                <p className="text-[10px] uppercase tracking-wider text-[#9a8b7a] font-semibold mt-1">
                  Conservantes
                </p>
              </div>
            </div>

            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 text-[#3a130d] border-b-2 border-[#9a8b7a] pb-1 hover:text-[#5a1a10] transition"
            >
              Visitanos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CATERING — fondo sólido profundo, split con collage */}
      <section className="relative z-0 bg-[#2B0F0B] text-white scroll-fade">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-4 pt-24 pb-20 md:pt-28 md:pb-24">
          {/* Texto */}
          <div>
            <span className="text-[#E0C89A] text-xs uppercase tracking-[0.3em] font-bold block mb-3">
              Catering & Eventos
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mb-5 leading-tight">
              Armamos el catering de tu evento
            </h2>
            <p className="text-white/75 max-w-md mb-8 leading-relaxed">
              Bandejas de sánguches de miga, masas finas, bocados calientes y combos a medida para reuniones, cumpleaños y empresas.
            </p>
            <Link
              href="/lunch-eventos"
              className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-3.5 rounded-full font-medium hover:bg-white transition group"
            >
              Ver combos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Collage de fotos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80"
                alt="Catering"
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80"
                  alt="Facturas"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80"
                  alt="Mesa dulce"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}