// components/admin/PrintButton.jsx
'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full text-sm text-white hover:bg-white/20 transition"
    >
      <Printer size={16} /> Imprimir
    </button>
  )
}