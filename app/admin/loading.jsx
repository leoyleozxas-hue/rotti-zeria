// app/admin/loading.jsx
//
// Estado de carga del panel. Antes cada página mostraba "Cargando..." en texto
// plano; ahora se ve la forma de lo que viene.

import { SkeletonBlock, SkeletonCards } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-3.5 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-[104px] w-full rounded-panel" />
        ))}
      </div>

      <SkeletonCards count={3} />
    </div>
  )
}
