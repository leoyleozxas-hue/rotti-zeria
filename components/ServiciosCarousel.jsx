// components/ServiciosCarousel.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function ServiciosCarousel({ servicios }) {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const intervalRef = useRef(null)
  const isAutoScrollRef = useRef(false)

  // Resetear el interval cuando cambia el índice manualmente
  function resetInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % servicios.length)
    }, 5000)
  }

  // Auto-avance
  useEffect(() => {
    resetInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicios.length])

  // Al cambiar el índice (por auto o por click), scrollear al item
  useEffect(() => {
    const container = containerRef.current
    const item = itemRefs.current[current]
    if (!container || !item) return

    isAutoScrollRef.current = true
    container.scrollTo({
      left: item.offsetLeft - container.offsetLeft,
      behavior: 'smooth',
    })
    // Reset flag después del scroll
    setTimeout(() => {
      isAutoScrollRef.current = false
    }, 600)
  }, [current])

  // Detectar scroll manual del usuario
  function handleScroll() {
    if (isAutoScrollRef.current) return
    const container = containerRef.current
    if (!container) return

    const scrollLeft = container.scrollLeft
    const itemWidth = container.offsetWidth * 0.85 + 12 // 85vw + gap
    const newIndex = Math.round(scrollLeft / itemWidth)

    if (newIndex !== current && newIndex >= 0 && newIndex < servicios.length) {
      setCurrent(newIndex)
      resetInterval()
    }
  }

  function handleDotClick(i) {
    setCurrent(i)
    resetInterval()
  }

  return (
    <div className="relative">
      {/* Carrusel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-3"
      >
        {servicios.map((s, i) => (
          <div
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            className="snap-center shrink-0 w-[85vw] aspect-[4/5] relative overflow-hidden rounded-2xl"
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              className="object-cover"
              sizes="85vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0806] via-[#1a0806]/35 to-[#1a0806]/10" />
            <div className="absolute inset-x-0 bottom-0 p-5 pb-8">
              <span className="font-serif text-sm text-[#E0C89A]">{s.index}</span>
              <h3 className="mt-1 font-serif text-2xl leading-tight text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicadores */}
      <div className="flex justify-center gap-2 mt-4">
        {servicios.map((_, i) => {
          const active = i === current
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDotClick(i)}
              aria-label={`Ver servicio ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                active ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}