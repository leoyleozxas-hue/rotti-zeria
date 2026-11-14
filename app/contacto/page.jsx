// app/contacto/page.jsx
import { getSettings } from '@/lib/settings'
import { buildMetadata } from '@/lib/metadata'
import ContactoForm from '@/components/ContactoForm'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'Contacto',
  description: 'Escribinos por consultas, pedidos especiales o eventos. Te respondemos el mismo día hábil.',
  path: '/contacto',
})

export default async function ContactoPage() {
  const settings = await getSettings()
  return <ContactoForm settings={settings} />
}