// components/ui/button.jsx
//
// Un solo botón para toda la app. Antes cada pantalla definía sus paddings,
// radios y estados de hover, y por eso dos botones del mismo nivel se veían
// distintos. Todo control interactivo debería salir de acá.
//
// `tone` separa los dos mundos sin duplicar el componente:
//   dark  → panel de admin (superficie de madera)
//   light → tienda (superficie crema)
// El default es `dark`, así ninguna llamada existente del panel cambia.

import Link from 'next/link'

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap'

const VARIANTS = {
  dark: {
    // Acción principal de la pantalla (una sola por vista).
    primary: 'bg-gold-soft text-chocolate hover:bg-white active:scale-[0.98] shadow-md shadow-black/30',
    // Acción secundaria: misma jerarquía visual que el contenido.
    secondary: 'border border-white/15 bg-white/6 text-white hover:bg-white/12 hover:border-white/25 active:scale-[0.98]',
    // Terciaria: no compite.
    ghost: 'text-white/70 hover:bg-white/8 hover:text-white',
    // Icono sobre superficie oscura con acento cálido (header de la tienda).
    accent: 'text-white/75 hover:bg-white/10 hover:text-gold-soft',
    // Destructiva: única.
    danger: 'border border-red-500/30 bg-red-500/12 text-red-200 hover:bg-red-500/25 hover:text-white',
    // Acento suave: estados "en curso".
    success: 'border border-active/35 bg-active/15 text-active hover:bg-active hover:text-ink-950',
  },
  light: {
    primary: 'bg-chocolate text-cream hover:bg-ember active:scale-[0.98] shadow-card',
    secondary: 'border border-chocolate/15 bg-paper text-chocolate hover:bg-beige hover:border-sand',
    ghost: 'text-chocolate/65 hover:bg-chocolate/6 hover:text-chocolate',
    danger: 'border border-red-600/25 bg-red-50 text-red-700 hover:bg-red-100',
    success: 'border border-emerald-700/25 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
  },
}

const SIZES = {
  sm: 'h-9 rounded-field px-3 text-xs',
  md: 'h-10 rounded-field px-4 text-sm',
  lg: 'h-12 rounded-full px-6 text-base',
  // Cuadrado para botones de sólo icono (mínimo 36px de área táctil).
  icon: 'h-9 w-9 rounded-field',
  iconSm: 'h-8 w-8 rounded-[10px]',
  // Área táctil cómoda en móvil (44px), para iconos de cabecera y tarjetas.
  iconLg: 'h-11 w-11 rounded-full',
}

export function buttonClass(variant = 'secondary', size = 'md', extra = '', tone = 'dark') {
  const toneSet = VARIANTS[tone] || VARIANTS.dark
  return [BASE, toneSet[variant] || toneSet.secondary, SIZES[size] || SIZES.md, extra]
    .filter(Boolean)
    .join(' ')
}

export function Button({ variant = 'secondary', size = 'md', tone = 'dark', className = '', type = 'button', ...rest }) {
  return <button type={type} className={buttonClass(variant, size, className, tone)} {...rest} />
}

export function ButtonLink({ href, variant = 'secondary', size = 'md', tone = 'dark', className = '', ...rest }) {
  return <Link href={href} className={buttonClass(variant, size, className, tone)} {...rest} />
}

/**
 * Botón de sólo icono. `label` es obligatorio a propósito: sin `aria-label`
 * un lector de pantalla lee el icono como nada.
 */
export function IconButton({ label, variant = 'ghost', size = 'icon', tone = 'dark', className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={buttonClass(variant, size, className, tone)}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Igual que IconButton, pero navega. */
export function IconLink({ href, label, variant = 'ghost', size = 'icon', tone = 'dark', className = '', children, ...rest }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={buttonClass(variant, size, className, tone)}
      {...rest}
    >
      {children}
    </Link>
  )
}

