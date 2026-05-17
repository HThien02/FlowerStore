import ProductForm from '@/components/admin/product-form'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminEditProductPage({ params }: Props) {
  const { locale, id } = await params
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm locale={locale} mode="edit" productId={id} />
    </div>
  )
}
