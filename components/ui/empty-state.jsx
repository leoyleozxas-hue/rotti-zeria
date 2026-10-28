// components/ui/empty-state.jsx
//
// Un vacío es una oportunidad de guiar, no un párrafo centrado. Siempre:
// icono + qué pasó + qué hacer.

export default function EmptyState({ icon: Icon, title, description, action, tone = 'neutral' }) {
  const ring =
    tone === 'error'
      ? 'border-red-500/25 bg-red-500/10 text-red-300'
      : 'border-white/10 bg-white/5 text-gold-soft'

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <span
          aria-hidden
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${ring}`}
        >
          <Icon size={24} />
        </span>
      )}
      <p className="font-serif text-lg text-white">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
