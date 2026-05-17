import AdminOrdersTable from '@/components/admin/admin-orders-table'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <AdminOrdersTable locale={locale} />
    </div>
  )
}
