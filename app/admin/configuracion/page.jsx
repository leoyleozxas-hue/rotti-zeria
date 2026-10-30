// app/admin/configuracion/page.jsx
import { getSettings } from '@/lib/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const settings = (await getSettings()) || {}

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white">Configuración</h1>
        <p className="text-white/60 mt-1 text-sm">
          Editá los datos del negocio, contacto y datos bancarios.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}