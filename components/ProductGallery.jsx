// components/ProductGallery.jsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ mainImage, gallery = [] }) {
  // Juntamos imagen principal + galería, sin duplicados ni nulls
  const allImages = [mainImage, ...(gallery || [])].filter(Boolean)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (allImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#9a8b7a] bg-[#EADFC8]">
        Sin imagen
      </div>
    )
  }

  const currentImage = allImages[selectedIndex]

  return (
    <div className="flex flex-col h-full bg-[#EADFC8]">
      {/* Imagen principal */}
      <div className="relative flex-1 min-h-[300px]">
        <Image
          src={currentImage}
          alt=""
          fill
          priority
          className="object-cover contrast-[1.05] saturate-[1.1] brightness-[0.98]"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>

      {/* Thumbnails (solo si hay más de 1 imagen) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-[#FAF7F2]/80 backdrop-blur-sm">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-[#C9A96E] ring-2 ring-[#C9A96E]/30'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#C9A96E]/50'
              }`}
              aria-label={`Ver imagen ${idx + 1}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}