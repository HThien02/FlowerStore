import AdminOrderDetail from '@/components/admin/admin-order-detail'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { locale, id } = await params
  return <AdminOrderDetail locale={locale} orderId={id} />
}
