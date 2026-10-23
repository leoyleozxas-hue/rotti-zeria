// components/ui/page-header.jsx
//
// Cabecera de pantalla del panel. Antes cada página repetía h1 + subtítulo con
// tamaños distintos (text-2xl, text-3xl, text-4xl) y márgenes propios.

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = 'Volver',
  actions,
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/50 transition hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden />
            {backLabel}
          </Link>
        )}

        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-soft">
            {eyebrow}
          </p>
        )}

        <h1 className="font-serif text-3xl leading-tight text-white md:text-4xl">{title}</h1>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-white/55">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
