import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AdminProductsTable from '@/components/admin/admin-products-table'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminProductsPage({ params }: Props) {
  const { locale } = await params

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href={`/${locale}/admin/products/new`}>
          <Button>New product</Button>
        </Link>
      </div>
      <AdminProductsTable locale={locale} />
    </div>
  )
}
