// lib/hooks/useHydrated.js
'use client'

import { useSyncExternalStore } from 'react'

// Los stores persistidos (carrito, favoritos) tienen estado distinto en el
// servidor y en el cliente. Este hook dice "ya hidraté" sin efectos ni renders
// extra: en el servidor devuelve false, en el cliente true.
const subscribe = () => () => {}

export default function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
