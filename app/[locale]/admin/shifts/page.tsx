import AdminShiftsPanel from '@/components/admin/admin-shifts-panel'

type Props = { params: Promise<{ locale: string }> }

export default async function AdminShiftsPage({ params }: Props) {
  const { locale } = await params
  return <AdminShiftsPanel locale={locale} />
}
