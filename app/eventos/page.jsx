import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, Cake, Briefcase } from 'lucide-react'

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.45), rgba(18,4,2,.65)), url('/images/textura-madera-vertical.png')",
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
    icon: Users,
    title: 'Eventos a medida',
    desc: 'Armamos el pedido según cantidad de invitados y tipo de ocasión.',
  },
]

const COMBOS = [
  {
    name: 'Bandeja clásica',
    detail: 'Sánguches de miga surtidos · 20 porciones',
    note: 'Precio a consultar',
  },
  {
    name: 'Mesa dulce',
    detail: 'Masas finas, facturas y budines · para 15–20 personas',
    note: 'Precio a consultar',
  },
  {
    name: 'Combo oficina',
    detail: 'Facturas + medialunas + jugos · 10 personas',
    note: 'Precio a consultar',
  },
]

export default function EventosPage() {
  return (
    <>
        <section style={woodVertical} className="text-white -mt-16 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Lunch & Eventos</h1>
          <p className="text-white/80">
            Catering para tus reuniones, cumpleaños y eventos.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">
            Qué armamos
          </h2>
          <p className="text-[#6b3a2c] max-w-lg mx-auto">
            El mismo horno de siempre, pensado para tu mesa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SERVICIOS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center md:text-left">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#3a130d] text-[#F5EDE3] mb-4">
                <Icon size={20} />
              </span>
              <h3 className="font-serif text-xl text-[#3a130d] mb-2">{title}</h3>
              <p className="text-sm text-[#6b3a2c] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-16 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1600&q=80"
          alt="Bandejas para eventos"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div aria-hidden className="absolute inset-0 bg-[#1a0806]/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Desde el coffee break hasta el festejo grande
          </h2>
          <p className="text-white/80">
            Contanos cuántos son y qué necesitás: te armamos una propuesta.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">
            Ideas de combos
          </h2>
          <p className="text-[#6b3a2c]">
            Orientativos — los precios y cantidades se cierran por consulta.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {COMBOS.map((combo) => (
            <div
              key={combo.name}
              className="border border-[#c4b5a5] bg-white/80 p-6 text-center"
            >
              <h3 className="font-serif text-xl text-[#3a130d] mb-2">{combo.name}</h3>
              <p className="text-sm text-[#6b3a2c] mb-4">{combo.detail}</p>
              <p className="text-xs uppercase tracking-wider text-[#9a8b7a]">{combo.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.7)), url('/images/textura-madera-vertical.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Pedí tu presupuesto
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Escribinos por WhatsApp o el formulario de contacto y te respondemos
            con opciones y tiempos de entrega.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-7 py-3.5 rounded-full font-medium hover:bg-white transition"
          >
            Ir a contacto <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
