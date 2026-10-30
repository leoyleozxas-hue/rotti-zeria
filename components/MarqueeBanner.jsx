// components/MarqueeBanner.jsx
export default function MarqueeBanner({
  messages = [
    'Elaboración artesanal',
    'Pedidos online',
    'Retirá en el local',
    'Productos del día',
    'Lunch para empresas',
    'Envíos coordinados',
  ],
}) {
  return (
    <div className="bg-ink-950 border-y border-gold/20 overflow-hidden">
      <div className="flex animate-marquee will-change-transform">
        {[0, 1].map((repeat) => (
          <div
            key={repeat}
            className="flex shrink-0"
            aria-hidden={repeat === 1 ? 'true' : undefined}
          >
            {messages.map((msg, i) => (
              <span
                key={`${repeat}-${i}`}
                className="flex items-center gap-6 px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-gold-soft/90 whitespace-nowrap"
              >
                {msg}
                <span aria-hidden className="text-gold/50 text-sm">
                  ◆
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}