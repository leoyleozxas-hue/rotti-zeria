// components/ui/select.jsx
//
// Select nativo estilizado. El <select> por defecto del sistema rompe el tema
// oscuro del panel; estilizarlo con appearance-none mantiene la accesibilidad
// nativa (teclado, lector de pantalla) sin reimplementarla.

import { ChevronDown } from 'lucide-react'

export default function Select({ value, onChange, options, label, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 w-full cursor-pointer appearance-none rounded-field border border-white/12 bg-ink-950/70 pl-3 pr-9 text-sm text-cream transition hover:border-white/20 focus:border-gold/70"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-900 text-cream">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
      />
    </div>
  )
}
