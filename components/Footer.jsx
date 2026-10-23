// components/Footer.jsx
import Link from 'next/link'
import { Lock } from 'lucide-react'

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
          <h3 className="font-serif text-2xl mb-3">Biarritz</h3>
          <p className="text-sm text-cream/70">
            Panadería artesanal. Elaborado a mano, todos los días.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Contacto</h4>
          <p className="text-sm text-cream/70">Av. Siempre Viva 123</p>
          <p className="text-sm text-cream/70">WhatsApp: 11 1234-5678</p>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Horarios</h4>
          <p className="text-sm text-cream/70">Lun a Sáb: 7:00 - 20:00</p>
          <p className="text-sm text-cream/70">Dom: 8:00 - 13:00</p>
        </div>
      </div>

      {/* Barra inferior del Footer */}
      <div className="border-t border-cream/10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Biarritz. Todos los derechos reservados.</p>
          
          {/* Botón de Acceso Admin */}
          <Link 
            href="/admin/login" 
            className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors group"
            title="Acceso al panel de administración"
          >
            <Lock size={12} className="group-hover:text-[#C9A96E] transition-colors" />
            <span>Acceso Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}