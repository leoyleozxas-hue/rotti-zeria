// app/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, Clock, MapPin, Wheat } from 'lucide-react'

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.72)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const woodHorizontal = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.5), rgba(18,4,2,.55)), url('/images/textura-madera.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

async function FeaturedProducts() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .limit(4)

  if (!products?.length) return null

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

const CATEGORIES = [
  {
    name: 'Panes',
    desc: 'De campo, integrales y masa madre',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80',
  },
  {
    name: 'Facturas',
    desc: 'Medialunas, croissants y más',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
  },
  {
    name: 'Dulces',
    desc: 'Masas finas, secas y húmedas',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  },
  {
    name: 'Salados',
    desc: 'Sánguches de miga y tartas',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
  },
  {
    name: 'Bocados calientes',
    desc: 'Chipá, prepizzas y calentitos',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  },
]

export default function Home() {
  return (
    <>
      {/* HERO — foto producto full-bleed + madera */}
      <section className="relative min-h-[100svh] flex items-end md:items-center text-white overflow-hidden -mt-[4.25rem]">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=85"
          alt="Pan y facturas recién horneados"
          fill
          priority
          className="object-cover object-center animate-hero-zoom"
          sizes="100vw"
        />
        {/* Textura madera encima de la foto */}
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
            Biarritz · desde 1935
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
              className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-7 py-3.5 rounded-full font-medium hover:bg-white transition group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver productos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 border border-white/60 text-white px-7 py-3.5 rounded-full hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Lunch & Eventos
            </Link>
          </div>
        </div>
      </section>

      {/* BARRA DE INFO — madera */}
      <section style={woodVertical} className="text-[#F5EDE3]">
        <div className="max-w-6xl mx-auto px-4 py-7 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[#E0C89A] shrink-0" />
            <span>Lun a Sáb · 7:00 a 20:00</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-[#E0C89A] shrink-0" />
            <span>Av. Siempre Viva 123</span>
          </div>
          <div className="flex items-center gap-3">
            <Wheat size={20} className="text-[#E0C89A] shrink-0" />
            <span>Elaboración 100% artesanal</span>
          </div>
        </div>
      </section>

      {/* ESPECIALIDADES */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-[#3a130d] mb-3">
            Nuestras especialidades
          </h2>
          <p className="text-[#6b3a2c] max-w-lg mx-auto">
            Todo lo que encontrás en el local, ahora a un click.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
              className="group overflow-hidden bg-white/80 border border-[#c4b5a5] hover:border-[#5a1a10] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5a1a10]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eadfc8]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-serif text-lg text-[#3a130d] mb-1">{cat.name}</h3>
                <p className="text-xs text-[#6b3a2c] leading-snug">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS — madera como el footer */}
      <section style={woodHorizontal} className="py-20 text-[#F5EDE3]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <h2 className="font-serif text-4xl md:text-5xl text-white">
              Recién salidos del horno
            </h2>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-[#E0C89A] border-b border-[#E0C89A] pb-1 hover:text-white hover:border-white transition self-start md:self-auto"
            >
              Ver todo <ArrowRight size={16} />
            </Link>
          </div>

          <Suspense fallback={<p className="text-white/70">Cargando...</p>}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square overflow-hidden order-2 md:order-1 ring-1 ring-[#2b0f0b]/15">
          <Image
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=85"
            alt="Nuestra historia"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply opacity-40"
            style={{
              backgroundImage: "url('/images/textura-madera.png')",
              backgroundSize: 'cover',
            }}
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="font-serif text-4xl md:text-5xl text-[#3a130d] mb-6">
            Casi 90 años<br />amasando lo mismo
          </h2>
          <p className="text-[#6b3a2c] mb-4 max-w-prose">
            En Biarritz creemos que el pan es un acto de paciencia. Fermentamos lento,
            horneamos temprano y tratamos cada pieza como si fuera para nuestra propia mesa.
          </p>
          <p className="text-[#6b3a2c] mb-8 max-w-prose">
            Sin conservantes, sin apuro. Solo harina, agua, sal, tiempo y manos que saben.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 text-[#3a130d] border-b-2 border-[#9a8b7a] pb-1 hover:text-[#5a1a10] transition"
          >
            Visitanos <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA EVENTOS — madera */}
      <section style={woodHorizontal} className="text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-5">
            Armamos el catering de tu evento
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Bandejas de sánguches de miga, masas finas, bocados calientes y combos
            a medida para reuniones, cumpleaños y empresas.
          </p>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-3.5 rounded-full font-medium hover:bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ver combos <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
