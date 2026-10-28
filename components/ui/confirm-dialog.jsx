// components/ui/confirm-dialog.jsx
'use client'

// Diálogo de confirmación accesible. Reemplaza window.confirm (que rompe el
// estilo del panel, no se puede estilar y bloquea el hilo principal).
// Atrapa el foco, cierra con Escape y devuelve el foco al disparador.

import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './button'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel?.()
        return
      }
      if (event.key !== 'Tab') return

      // Foco atrapado dentro del diálogo.
      const focusable = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.()
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        className="w-full max-w-sm rounded-panel border border-white/12 bg-ink-850 p-6 shadow-lift"
      >
        <div className="mb-3 flex items-center gap-3">
          <span
            aria-hidden
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              destructive
                ? 'border-red-500/30 bg-red-500/15 text-red-300'
                : 'border-gold/30 bg-gold/15 text-gold-soft'
            }`}
          >
            <AlertTriangle size={18} />
          </span>
          <h2 id="confirm-title" className="font-serif text-lg text-white">
            {title}
          </h2>
        </div>

        {description && (
          <p id="confirm-desc" className="mb-6 text-sm leading-relaxed text-white/60">
            {description}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
            autoFocus
          >
            {loading ? 'Procesando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
