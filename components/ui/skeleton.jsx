// components/ui/skeleton.jsx
//
// Estados de carga reales en vez de "Cargando..." en texto plano.

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`anim-shimmer relative overflow-hidden rounded-field bg-white/6 ${className}`}
      aria-hidden
    />
  )
}

/** Grilla de tarjetas fantasma. */
export function SkeletonCards({ count = 6, className = '' }) {
  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
      role="status"
      aria-label="Cargando contenido"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-card border border-white/8 bg-white/[0.03] p-5"
          style={{ '--i': i }}
        >
          <SkeletonBlock className="mb-4 h-4 w-24" />
          <SkeletonBlock className="mb-2 h-5 w-3/4" />
          <SkeletonBlock className="mb-6 h-3 w-1/2" />
          <SkeletonBlock className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

/** Filas fantasma para la vista de lista. */
export function SkeletonRows({ count = 6 }) {
  return (
    <div className="space-y-2" role="status" aria-label="Cargando contenido">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
