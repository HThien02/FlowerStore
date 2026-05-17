import AdminOrdersTable from '@/components/admin/admin-orders-table'
import AdminOrdersCalendar from '@/components/admin/admin-orders-calendar'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AdminOrdersPage({ params }: Props) {
  const { locale } = await params
  const isVi = locale === 'vi'
  return (
    <div className="space-y-8 min-w-0">
      <h1 className="text-2xl font-bold">{isVi ? 'Đơn hàng' : 'Orders'}</h1>
      <AdminOrdersCalendar locale={locale} />
      <AdminOrdersTable locale={locale} />
    </div>
  )
}
