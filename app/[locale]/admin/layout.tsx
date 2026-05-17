import { ReactNode } from 'react'
import AdminGuard from '@/components/admin/admin-guard'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params
  return <AdminGuard locale={locale}>{children}</AdminGuard>
}
