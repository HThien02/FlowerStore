import AdminStaffTable from '@/components/admin/admin-staff-table'

export default async function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>
      <p className="text-sm text-gray-600">
        Promote sign-ups to <strong>staff</strong> (read-only orders) or{' '}
        <strong>admin</strong> (full access). Users must register on the site first.
      </p>
      <AdminStaffTable />
    </div>
  )
}
