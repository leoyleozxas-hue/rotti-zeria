// components/ui/search-field.jsx
'use client'

// Buscador único del panel: icono, botón de limpiar accesible y área táctil
// de 40px. Antes había tres inputs de búsqueda con paddings distintos.

import { Search, X } from 'lucide-react'

export default function SearchField({
  value,
  onChange,
  placeholder = 'Buscar…',
  label = 'Buscar',
  className = '',
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-field border border-gold/25 bg-ink-950/70 pl-10 pr-10 text-sm text-cream shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] transition placeholder:text-white/30 focus:border-gold/70 focus:bg-ink-950"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
        >
          <X size={14} aria-hidden />
        </button>
      )}
    </div>
  )
}
