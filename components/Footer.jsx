// components/Footer.jsx
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

export default function Footer() {
  return (
    <footer
      className="text-cream mt-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(18,4,2,.75), rgba(18,4,2,.82)), url('/images/textura-madera.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-2xl mb-3">{SITE_CONFIG.businessName}</h3>
          <p className="text-sm text-cream/70">{SITE_CONFIG.businessShortDescription}</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Contacto</h4>
          <p className="text-sm text-cream/70">{SITE_CONFIG.address}</p>
          <p className="text-sm text-cream/70">WhatsApp: {SITE_CONFIG.phoneDisplay}</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Horarios</h4>
          <p className="text-sm text-cream/70">{SITE_CONFIG.hours.weekdays}</p>
          <p className="text-sm text-cream/70">{SITE_CONFIG.hours.sunday}</p>
        </div>
      </div>

      <div className="border-t border-cream/10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.businessName}. Todos los derechos reservados.</p>
          <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors group">
            <Lock size={12} className="group-hover:text-[#C9A96E] transition-colors" />
            <span>Acceso Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}