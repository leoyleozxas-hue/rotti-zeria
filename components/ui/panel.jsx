// components/ui/panel.jsx
//
// Superficie base del panel. Reemplaza las 4 variantes de "glass" que estaban
// copiadas a mano en cada pantalla con valores distintos entre sí.

const TONES = {
  // Cristal sobre madera: paneles principales, tarjetas.
  glass: 'border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-panel',
  // Madera sólida: tablas y bloques que necesitan contraste.
  solid: 'border-white/10 bg-ink-900 shadow-panel',
  // Un escalón por encima: cabeceras, bloques destacados.
  raised: 'border-white/12 bg-ink-800 shadow-lift',
  // Fondo apenas insinuado: filas, sub-bloques.
  quiet: 'border-white/8 bg-white/[0.02]',
}

export default function Panel({
  as: Tag = 'div',
  tone = 'glass',
  padded = true,
  className = '',
  ...rest
}) {
  return (
    <Tag
      className={[
        'relative rounded-panel border',
        TONES[tone] || TONES.glass,
        padded ? 'p-5 md:p-6' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  )
}

/** Cabecera de panel con título y acción a la derecha. */
export function PanelHeader({ title, action, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6 ${className}`}
    >
      <h2 className="font-serif text-lg text-white">{title}</h2>
      {action}
    </div>
  )
}
