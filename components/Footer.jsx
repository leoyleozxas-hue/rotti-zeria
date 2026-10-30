// components/Footer.jsx
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { InstagramIcon, FacebookIcon, XIcon } from '@/components/SocialIcons'
import { getSettings } from '@/lib/settings'

export default async function Footer() {
  const settings = await getSettings()

  const socials = [
    { name: 'Instagram', url: settings.instagram, icon: InstagramIcon },
    { name: 'Facebook', url: settings.facebook, icon: FacebookIcon },
    { name: 'X', url: settings.x, icon: XIcon },
  ].filter((s) => s.url && s.url.trim() !== '')

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
          <h3 className="font-serif text-2xl mb-3">{settings.businessName}</h3>
          <p className="text-sm text-cream/70">{settings.businessShortDescription}</p>

          {socials.length > 0 && (
            <div className="flex gap-3 mt-5">
              {socials.map(({ name, url, icon: Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="w-9 h-9 rounded-full bg-cream/5 border border-cream/15 flex items-center justify-center text-cream/70 hover:bg-[#C9A96E] hover:text-[#2b0f0b] hover:border-[#C9A96E] transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Contacto</h4>
          <p className="text-sm text-cream/70">{settings.address}</p>
          <p className="text-sm text-cream/70">Tel: {settings.phone}</p>
          {settings.email && (
            <p className="text-sm text-cream/70 mt-1">
              <a href={`mailto:${settings.email}`} className="hover:text-[#C9A96E] transition">
                {settings.email}
              </a>
            </p>
          )}
        </div>

        <div>
          <h4 className="font-serif text-lg mb-3">Horarios</h4>
          <p className="text-sm text-cream/70">{settings.hours.weekdays}</p>
          <p className="text-sm text-cream/70">{settings.hours.sunday}</p>
        </div>
      </div>

      <div className="border-t border-cream/10 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. Todos los derechos reservados.
          </p>
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 hover:text-[#C9A96E] transition-colors group"
          >
            <Lock size={12} className="group-hover:text-[#C9A96E] transition-colors" />
            <span>Acceso Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}