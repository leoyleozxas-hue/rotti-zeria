// components/ProductSearch.jsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function ProductSearch({ categoria }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  // Sincronizar con la URL (por si vuelven con el botón "atrás" o clickean "Ver todos")
  useEffect(() => {
    setValue(searchParams.get('q') || '')
  }, [searchParams])

  // Limpiar el timer al desmontar
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  function navigate(q) {
    const params = new URLSearchParams()
    if (categoria && categoria !== 'Todos') params.set('categoria', categoria)
    if (q && q.trim()) params.set('q', q.trim())
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleChange(e) {
    const v = e.target.value
    setValue(v)
    clearTimeout(timerRef.current)
    // Debounce: navega 400ms después de que el usuario deja de escribir
    timerRef.current = setTimeout(() => navigate(v), 400)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      clearTimeout(timerRef.current)
      navigate(value)
    }
  }

  function handleClear() {
    setValue('')
    clearTimeout(timerRef.current)
    navigate('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-md">
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar productos…"
        aria-label="Buscar productos"
        className="h-11 w-full border border-sand/60 bg-paper pl-11 pr-10 text-body text-chocolate placeholder:text-stone/70 transition focus:border-chocolate focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-stone transition hover:text-chocolate"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}