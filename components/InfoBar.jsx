// components/InfoBar.jsx
'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Wheat } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/config'

const woodVertical = {
  backgroundImage:
    "linear-gradient(rgba(18,4,2,.55), rgba(18,4,2,.72)), url('/images/textura-madera-vertical.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
}

const ITEMS = [
  { icon: Clock, text: SITE_CONFIG.hours.weekdays },
  { icon: MapPin, text: SITE_CONFIG.address },
  { icon: Wheat, text: 'Elaboración 100% artesanal' },
]

export default function InfoBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section style={woodVertical} className="text-[#F5EDE3]">
      {/* Mobile: rota */}
      <div className="md:hidden max-w-6xl mx-auto px-4 py-5">
        <div className="relative h-6">
          {ITEMS.map((item, i) => {
            const Icon = item.icon
            const active = i === index
            return (
              <div
                key={i}
                className={`absolute inset-0 flex items-center justify-center gap-3 text-sm transition-all duration-700 ${
                  active
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <Icon size={18} className="text-[#E0C89A] shrink-0" />
                <span>{item.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop: fila completa */}
      <div className="hidden md:grid max-w-6xl mx-auto px-4 py-7 grid-cols-3 gap-6 text-sm">
        {ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon size={20} className="text-[#E0C89A] shrink-0" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}