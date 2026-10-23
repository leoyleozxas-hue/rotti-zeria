// app/admin/productos/nuevo/page.jsx
import ProductForm from '@/components/admin/ProductForm'
import PageHeader from '@/components/ui/page-header'

export default function NuevoProductoPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Nuevo producto"
        description="Cargá los datos y la foto. Podés guardarlo oculto y publicarlo cuando esté listo."
        backHref="/admin/productos"
        backLabel="Volver a productos"
      />
      <ProductForm />
    </div>
  )
}
