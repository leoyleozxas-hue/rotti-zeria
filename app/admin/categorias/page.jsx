// app/admin/categorias/page.jsx
import { Plus } from 'lucide-react'
import PageHeader from '@/components/ui/page-header'
import { ButtonLink } from '@/components/ui/button'
import CategoriesTable from '@/components/admin/CategoriesTable'
import { getCategoriesWithCounts } from '@/lib/categories'

export default async function CategoriasPage() {
  const categories = await getCategoriesWithCounts()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Categorías"
        description={`${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}. Las inactivas no aparecen en la tienda pero conservan sus productos.`}
        actions={
          <ButtonLink href="/admin/categorias/nuevo" variant="primary" size="md">
            <Plus size={16} aria-hidden />
            Nueva categoría
          </ButtonLink>
        }
      />
      <CategoriesTable categories={categories} />
    </div>
  )
}