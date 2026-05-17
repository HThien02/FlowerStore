import AdminScheduleBoard from '@/components/admin/admin-schedule-board'

type Props = { params: Promise<{ locale: string }> }

export default async function AdminSchedulePage({ params }: Props) {
  const { locale } = await params
  return <AdminScheduleBoard locale={locale} />
}
