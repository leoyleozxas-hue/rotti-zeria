// app/admin/lunch/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LunchForm from '@/components/admin/LunchForm'

export default async function NuevoLunchPage({ searchParams }) {
  const params = await searchParams
  const tipo = params?.tipo === 'Evento' ? 'Evento' : 'Lunch'
  const isEvento = tipo === 'Evento'

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/lunch?tipo=${tipo}`}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} />
        {isEvento ? 'Volver a Eventos / Catering' : 'Volver a Lunch para oficinas'}
      </Link>
      <div>
        <h1 className="font-serif text-3xl text-white">
          {isEvento ? 'Nuevo evento / catering' : 'Nuevo lunch para oficinas'}
        </h1>
        <p className="text-white/60 mt-1 text-sm">
          {isEvento
            ? 'Cargá un servicio de catering para eventos, oficinas o celebraciones.'
            : 'Cargá un combo de lunch para oficinas y reuniones.'}
        </p>
      </div>
      <LunchForm defaultTipo={tipo} />
    </div>
  )
}