// components/ui/view-toggle.jsx
'use client'

// Toggle tarjetas / lista. Es el mismo control en todas las pantallas y
// persiste la preferencia por pantalla en localStorage.

import { LayoutGrid, List } from 'lucide-react'

const OPTIONS = [
  { value: 'grid', label: 'Ver como tarjetas', Icon: LayoutGrid },
  { value: 'list', label: 'Ver como lista', Icon: List },
]

export default function ViewToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Modo de vista"
      className="inline-flex items-center gap-0.5 rounded-field border border-white/12 bg-ink-950/70 p-1"
    >
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={`flex h-8 w-9 items-center justify-center rounded-[9px] transition ${
              active
                ? 'bg-gold-soft text-chocolate shadow-sm'
                : 'text-white/45 hover:bg-white/8 hover:text-white'
            }`}
          >
            <Icon size={16} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
