// components/ui/field.jsx
//
// Campo de formulario: etiqueta asociada + error accesible. Sin esto cada input
// del panel tenía su propio margen, su propio borde y ningún mensaje de error
// vinculado por aria-describedby.

export function fieldClass(hasError = false) {
  return [
    'h-11 w-full rounded-field border bg-white/[0.04] px-3.5 text-sm text-white',
    'placeholder:text-white/25 transition',
    hasError
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-white/12 hover:border-white/20 focus:border-gold/60',
  ].join(' ')
}

export default function Field({ label, htmlFor, error, hint, required, children }) {
  const errorId = error ? `${htmlFor}-error` : undefined

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-medium text-white/55">
          {label}
          {required && <span className="ml-0.5 text-gold/70">*</span>}
        </label>
        {hint && <span className="text-[10px] text-white/30">{hint}</span>}
      </div>

      {children({ errorId, hasError: Boolean(error) })}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[11px] text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

/** Contenedor de error/exito de un formulario completo. */
export function FormMessage({ children, tone = 'error' }) {
  if (!children) return null
  const styles =
    tone === 'success'
      ? 'border-active/35 bg-active/12 text-active'
      : 'border-red-500/35 bg-red-500/12 text-red-200'
  return (
    <p role="alert" className={`rounded-field border px-3.5 py-2.5 text-xs ${styles}`}>
      {children}
    </p>
  )
}
