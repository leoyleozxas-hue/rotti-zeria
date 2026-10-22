// app/eventos/page.jsx
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, Cake, Briefcase } from 'lucide-react'

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
      {/* Hero Partido */}
      <section className="relative -mt-[4.25rem] pt-[4.25rem] bg-[#150604] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch min-h-[60vh]">
          
          {/* Texto */}
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

          {/* Imagen superpuesta */}
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1000&q=85"
              alt="Catering"
              fill
              priority
              className="object-cover"
            />
            {/* Gradiente para mezclar la imagen con el fondo oscuro de la izquierda */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#150604] via-transparent to-transparent hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#150604] via-transparent to-transparent md:hidden" />
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl text-[#3a130d] mb-3">
            Qué armamos
          </h2>
          <p className="text-[#6b3a2c] max-w-lg mx-auto">
            El mismo horno de siempre, pensado para tu mesa.
          </p>
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

      <section className="max-w-5xl mx-auto px-4 pb-20">
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
              className="border border-[#EADFC8] bg-[#FCFAF8] p-8 text-center rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-serif text-xl text-[#3a130d] mb-3">{combo.name}</h3>
              <p className="text-sm text-[#6b3a2c] mb-6">{combo.detail}</p>
              <p className="text-xs uppercase tracking-wider text-[#9a8b7a] font-semibold">{combo.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(18,4,2,.65), rgba(18,4,2,.8)), url('/images/textura-madera-vertical.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-20 text-center" id="contacto-eventos">
          <h2 className="font-serif text-4xl md:text-5xl mb-5 drop-shadow-md">
            Pedí tu presupuesto
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto text-lg font-light">
            Escribinos por WhatsApp o el formulario de contacto y te respondemos
            con opciones y tiempos de entrega.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-[#F5EDE3] text-[#2b0f0b] px-8 py-4 rounded-full font-semibold hover:bg-white transition shadow-lg"
          >
            Ir a contacto <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}