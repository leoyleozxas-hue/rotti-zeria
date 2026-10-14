// app/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, Clock, MapPin, Wheat } from 'lucide-react'

// ---------- Destacados ----------
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

// ---------- Categorías ----------
const CATEGORIES = [
  { name: 'Panes', emoji: '🥖', desc: 'De campo, integrales y masa madre' },
  { name: 'Facturas', emoji: '🥐', desc: 'Medialunas, croissants y más' },
  { name: 'Dulces', emoji: '🍰', desc: 'Masas finas, secas y húmedas' },
  { name: 'Salados', emoji: '🥪', desc: 'Sánguches de miga y tartas' },
  { name: 'Bocados calientes', emoji: '🧀', desc: 'Chipá, prepizzas y calentitos' },
]

// ---------- Página ----------
export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-beige overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-medium">
              Panadería Artesanal · Desde 1998
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-chocolate mt-5 mb-6 leading-[1.05]">
              El sabor de lo<br />
              <em className="text-caramel">hecho a mano</em>
            </h1>
            <p className="text-lg text-caramel max-w-md mb-8">
              Facturas, panes y delicias recién horneadas. Pedí online y retirá por el local.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-chocolate text-cream px-7 py-3.5 rounded-full hover:bg-caramel transition group"
              >
                Ver productos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/eventos"
                className="inline-flex items-center gap-2 border border-chocolate text-chocolate px-7 py-3.5 rounded-full hover:bg-chocolate hover:text-cream transition"
              >
                Lunch & Eventos
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=85"
              alt="Panadería artesanal"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* BARRA DE INFO */}
      <section className="border-y border-beige bg-cream">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3 text-caramel">
            <Clock size={20} className="text-gold" />
            <span>Lun a Sáb · 7:00 a 20:00</span>
          </div>
          <div className="flex items-center gap-3 text-caramel">
            <MapPin size={20} className="text-gold" />
            <span>Av. Siempre Viva 123</span>
          </div>
          <div className="flex items-center gap-3 text-caramel">
            <Wheat size={20} className="text-gold" />
            <span>Elaboración 100% artesanal</span>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-gold uppercase tracking-[0.3em] text-xs">Explorá</span>
          <h2 className="font-serif text-4xl md:text-5xl text-chocolate mt-3 mb-3">
            Nuestras categorías
          </h2>
          <p className="text-caramel max-w-lg mx-auto">
            Todo lo que encontrás en el local, ahora a un click.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/productos?categoria=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-beige"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition">
                {cat.emoji}
              </div>
              <h3 className="font-serif text-lg text-chocolate mb-1">{cat.name}</h3>
              <p className="text-xs text-caramel/80 leading-snug">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="bg-beige/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <span className="text-gold uppercase tracking-[0.3em] text-xs">Favoritos</span>
              <h2 className="font-serif text-4xl md:text-5xl text-chocolate mt-3">
                Recién salidos del horno
              </h2>
            </div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-chocolate border-b-2 border-gold pb-1 hover:text-gold transition self-start md:self-auto"
            >
              Ver todo <ArrowRight size={16} />
            </Link>
          </div>

          <Suspense fallback={<p className="text-caramel">Cargando...</p>}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl order-2 md:order-1">
          <Image
            src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=85"
            alt="Nuestra historia"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="order-1 md:order-2">
          <span className="text-gold uppercase tracking-[0.3em] text-xs">Nuestra historia</span>
          <h2 className="font-serif text-4xl md:text-5xl text-chocolate mt-3 mb-6">
            Más de 25 años<br />amasando lo mismo
          </h2>
          <p className="text-caramel mb-4">
            En Biarritz creemos que el pan es un acto de paciencia. Fermentamos lento,
            horneamos temprano y tratamos cada pieza como si fuera para nuestra propia mesa.
          </p>
          <p className="text-caramel mb-8">
            Sin conservantes, sin apuro. Solo harina, agua, sal, tiempo y manos que saben.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 text-chocolate border-b-2 border-gold pb-1 hover:text-gold transition"
          >
            Visitanos <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA EVENTOS */}
      <section className="bg-wood text-cream">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="text-gold uppercase tracking-[0.3em] text-xs">
            Lunch & Eventos
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3 mb-5">
            Armamos el catering de tu evento
          </h2>
          <p className="text-cream/80 max-w-xl mx-auto mb-8">
            Bandejas de sánguches de miga, masas finas, bocados calientes y combos
            a medida para reuniones, cumpleaños y empresas.
          </p>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 bg-gold text-chocolate px-8 py-3.5 rounded-full hover:bg-gold-soft transition"
          >
            Ver combos <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}