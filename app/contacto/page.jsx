// app/contacto/page.jsx
import { getSettings } from '@/lib/settings'
import ContactoForm from '@/components/ContactoForm'

export const dynamic = 'force-dynamic'

export default async function ContactoPage() {
  const settings = await getSettings()
  return <ContactoForm settings={settings} />
}