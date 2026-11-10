// app/admin/lunch/nuevo/page.jsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LunchForm from '@/components/admin/LunchForm'

export default function NuevoLunchPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/lunch"
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition"
      >
        <ArrowLeft size={16} /> Volver a combos
      </Link>
      <h1 className="font-serif text-3xl text-white">Crear nuevo combo</h1>
      <LunchForm />
    </div>
  )
}