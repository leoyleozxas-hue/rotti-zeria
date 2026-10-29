// app/admin/consultas/page.jsx
import { createClient } from '@/lib/supabase/server'
import ConsultasTable from '@/components/admin/ConsultasTable'

export default async function ConsultasPage() {
  const supabase = await createClient()
  const { data: consultas } = await supabase
    .from('consultas')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white">Consultas</h1>
        <p className="text-white/60 mt-1 text-sm">
          Mensajes recibidos desde el formulario de contacto
        </p>
      </div>
      <ConsultasTable consultas={consultas || []} />
    </div>
  )
}