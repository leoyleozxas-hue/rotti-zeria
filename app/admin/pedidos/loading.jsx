// app/admin/pedidos/loading.jsx
import { SkeletonBlock, SkeletonCards } from '@/components/ui/skeleton'

export default function PedidosLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-2.5 w-24" />
        <SkeletonBlock className="h-8 w-44" />
        <SkeletonBlock className="h-3.5 w-96 max-w-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      <SkeletonCards count={6} className="md:grid-cols-2 2xl:grid-cols-3" />
    </div>
  )
}
