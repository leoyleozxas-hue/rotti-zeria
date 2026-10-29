// components/SiteLogo.jsx
import { SITE_CONFIG } from '@/lib/config'

export default function SiteLogo({ variant = 'light', className = '' }) {
  const color = variant === 'dark' ? 'text-[#2B0F0B]' : 'text-white'
  const accent = variant === 'dark' ? 'text-[#C9A96E]' : 'text-[#E0C89A]'

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <span className={`font-serif text-2xl md:text-3xl tracking-tight ${color}`}>
        {SITE_CONFIG.businessName}
      </span>
      <span className={`text-[9px] uppercase tracking-[0.3em] mt-1 ${accent}`}>
        {SITE_CONFIG.businessTagline}
      </span>
    </div>
  )
}