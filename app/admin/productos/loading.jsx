// app/admin/productos/loading.jsx
import { SkeletonBlock, SkeletonCards } from '@/components/ui/skeleton'

export default function ProductosLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonBlock className="h-3.5 w-72" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <SkeletonCards count={8} className="sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" />
    </div>
  )
}
