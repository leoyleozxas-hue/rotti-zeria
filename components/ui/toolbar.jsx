// components/ui/toolbar.jsx
//
// Barra de herramientas de una grilla: buscador + filtros a la izquierda,
// contador + vista a la derecha. En pantallas chicas se apila.

export default function Toolbar({ children, aside }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:max-w-2xl">
        {children}
      </div>
      {aside && <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">{aside}</div>}
    </div>
  )
}

/** Contador de resultados: sostiene el orden mental de la grilla. */
export function ResultCount({ shown, total, noun = 'resultados' }) {
  const label = shown === total ? `${total} ${noun}` : `${shown} de ${total} ${noun}`
  return (
    <span className="tabular whitespace-nowrap text-xs text-white/45" aria-live="polite">
      {label}
    </span>
  )
}
