// components/ui/button.jsx
//
// Un solo botón para todo el panel. Antes cada pantalla definía sus paddings,
// radios y estados de hover, y por eso dos botones del mismo nivel se veían
// distintos. Todo control interactivo del admin debería salir de acá.

import Link from 'next/link'

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap'

const VARIANTS = {
  // Acción principal de la pantalla (una sola por vista).
  primary: 'bg-gold-soft text-chocolate hover:bg-white active:scale-[0.98] shadow-md shadow-black/30',
  // Acción secundaria: misma jerarquía visual que el contenido.
  secondary: 'border border-white/15 bg-white/6 text-white hover:bg-white/12 hover:border-white/25 active:scale-[0.98]',
  // Terciaria: no compite.
  ghost: 'text-white/70 hover:bg-white/8 hover:text-white',
  // Destructiva: única.
  danger: 'border border-red-500/30 bg-red-500/12 text-red-200 hover:bg-red-500/25 hover:text-white',
  // Acento suave: estados "en curso".
  success: 'border border-active/35 bg-active/15 text-active hover:bg-active hover:text-ink-950',
}

const SIZES = {
  sm: 'h-9 rounded-field px-3 text-xs',
  md: 'h-10 rounded-field px-4 text-sm',
  lg: 'h-12 rounded-full px-6 text-base',
  // Cuadrado para botones de sólo icono (mínimo 36px de área táctil).
  icon: 'h-9 w-9 rounded-field',
  iconSm: 'h-8 w-8 rounded-[10px]',
}

export function buttonClass(variant = 'secondary', size = 'md', extra = '') {
  return [BASE, VARIANTS[variant] || VARIANTS.secondary, SIZES[size] || SIZES.md, extra]
    .filter(Boolean)
    .join(' ')
}

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...rest }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />
}

export function ButtonLink({ href, variant = 'secondary', size = 'md', className = '', ...rest }) {
  return <Link href={href} className={buttonClass(variant, size, className)} {...rest} />
}

/**
 * Botón de sólo icono. `label` es obligatorio a propósito: sin `aria-label`
 * un lector de pantalla lee el icono como nada.
 */
export function IconButton({ label, variant = 'ghost', size = 'icon', className = '', children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Igual que IconButton, pero navega. */
export function IconLink({ href, label, variant = 'ghost', size = 'icon', className = '', children, ...rest }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {children}
    </Link>
  )
}
