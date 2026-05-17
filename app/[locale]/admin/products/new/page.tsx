import ProductForm from '@/components/admin/product-form'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminNewProductPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm locale={locale} mode="create" />
    </div>
  )
}
