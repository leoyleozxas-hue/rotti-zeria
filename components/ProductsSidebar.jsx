// components/ProductsSidebar.jsx
import Link from 'next/link'
import { ArrowRight, ChevronRight, Briefcase, Cake, Croissant, Flame, LayoutGrid, Sandwich, Wheat } from 'lucide-react'

const CATEGORIES = [
  { value: 'Todos', label: 'Todos', icon: LayoutGrid },
  { value: 'Panes', label: 'Panes', icon: Wheat },
  { value: 'Facturas', label: 'Facturas', icon: Croissant },
  { value: 'Dulces', label: 'Dulces', icon: Cake },
  { value: 'Salados', label: 'Salados', icon: Sandwich },
  { value: 'Bocados calientes', label: 'Bocados', icon: Flame },
  { value: 'Lunch', label: 'Lunch', icon: Briefcase },
]

function buildUrl({ categoria, q, page = 1 }) {
  const params = new URLSearchParams()
  if (categoria && categoria !== 'Todos') params.set('categoria', categoria)
  if (page && page > 1) params.set('page', String(page))
  if (q && q.trim()) params.set('q', q.trim())
  const qs = params.toString()
  return qs ? `/productos?${qs}` : '/productos'
}

export default function ProductsSidebar({ categoria = 'Todos', q = '' }) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-32">
        <nav aria-label="Categorías">
          <ul className="space-y-1">
            {CATEGORIES.map((cat) => {
              const active = categoria === cat.value
              const Icon = cat.icon
              return (
                <li key={cat.value}>
                  <Link
                    href={buildUrl({ categoria: cat.value, q })}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center justify-between border-l-2 py-2.5 pl-4 pr-3 text-body transition-all ${
                      active
                        ? 'border-gold bg-beige/60 font-semibold text-chocolate'
                        : 'border-transparent text-caramel hover:border-gold/60 hover:bg-beige/40 hover:text-chocolate'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={active ? 'text-gold' : 'text-stone group-hover:text-gold'}
                      />
                      {cat.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`transition ${
                        active
                          ? 'text-gold opacity-100'
                          : '-translate-x-1 text-gold opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Link
          href="/lunch-eventos"
          className="group mt-10 block bg-mahogany p-6 text-cream transition hover:bg-wood"
        >
          <p className="font-serif text-h3 leading-tight">Combos para eventos</p>
          <p className="mt-2 text-caption text-cream/70">
            Bandejas a medida para reuniones y celebraciones.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 border-b border-gold/50 pb-0.5 text-caption font-medium text-gold-soft transition group-hover:border-gold-soft">
            Ver combos
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </aside>
  )
}