// lib/hooks/useViewMode.js
'use client'

// Preferencia de vista (tarjetas/lista) por pantalla, persistida en el
// navegador. Antes cada tabla reimplementaba este useEffect con su propia key.

import { useCallback, useEffect, useState } from 'react'

const VALID = ['grid', 'list']

export default function useViewMode(storageKey, fallback = 'grid') {
  const [view, setView] = useState(fallback)

  // Se lee después del primer render: localStorage no existe en el servidor y
  // leerlo durante el render rompería la hidratación. El tick diferido evita
  // además el render en cascada dentro del efecto.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey)
        if (VALID.includes(saved)) setView(saved)
      } catch {
        // localStorage puede estar bloqueado (modo privado); queda el fallback.
      }
    }, 0)
    return () => clearTimeout(id)
  }, [storageKey])

  const changeView = useCallback(
    (next) => {
      if (!VALID.includes(next)) return
      setView(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // sin persistencia, pero la vista cambia igual
      }
    },
    [storageKey]
  )

  return [view, changeView]
}
