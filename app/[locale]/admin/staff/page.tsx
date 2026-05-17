'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  is_admin: boolean
  created_at: string
}

export default function StaffPage() {
  const locale = useLocale()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', is_admin: false })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      const data = await res.json()
      setStaffList(data)
    } catch (error) {
      console.error('[v0] Error fetching staff:', error)
      toast.error(locale === 'en' ? 'Failed to load staff' : 'Lỗi tải nhân sự')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(locale === 'en' ? 'Please fill all fields' : 'Vui lòng điền đầy đủ')
      return
    }

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create staff')
      
      toast.success(locale === 'en' ? 'Staff member added!' : 'Thêm nhân sự thành công!')
      setFormData({ name: '', email: '', phone: '', is_admin: false })
      setShowForm(false)
      fetchStaff()
    } catch (error) {
      toast.error(locale === 'en' ? 'Failed to add staff' : 'Lỗi thêm nhân sự')
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm(locale === 'en' ? 'Delete this staff member?' : 'Xoá nhân sự này?')) return

    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success(locale === 'en' ? 'Staff member deleted!' : 'Xoá thành công!')
      fetchStaff()
    } catch (error) {
      toast.error(locale === 'en' ? 'Failed to delete staff' : 'Lỗi xoá nhân sự')
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/admin`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {locale === 'en' ? 'Staff Management' : 'Quản Lý Nhân Sự'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {locale === 'en' ? 'Manage your team members' : 'Quản lý thành viên đội'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-secondary text-primary-foreground font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {locale === 'en' ? 'Add Staff' : 'Thêm Nhân Sự'}
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="border-2 border-primary mb-8">
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Add New Staff' : 'Thêm Nhân Sự Mới'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder={locale === 'en' ? 'Name' : 'Tên'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-2 border-border focus:border-primary"
                  />
                  <Input
                    type="email"
                    placeholder={locale === 'en' ? 'Email' : 'Email'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2 border-border focus:border-primary"
                  />
                  <Input
                    placeholder={locale === 'en' ? 'Phone' : 'Điện Thoại'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-2 border-border focus:border-primary"
                  />
                  <label className="flex items-center gap-2 p-2 border-2 border-border rounded-lg">
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      {locale === 'en' ? 'Admin' : 'Quản Lý'}
                    </span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary hover:bg-secondary font-semibold">
                    {locale === 'en' ? 'Add Staff' : 'Thêm Nhân Sự'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    {locale === 'en' ? 'Cancel' : 'Hủy'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>
              {locale === 'en' ? `All Staff (${staffList.length})` : `Tất Cả Nhân Sự (${staffList.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === 'en' ? 'Loading...' : 'Đang tải...'}
              </div>
            ) : staffList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {locale === 'en' ? 'No staff members yet' : 'Chưa có nhân sự'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Name' : 'Tên'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Email' : 'Email'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Phone' : 'Điện Thoại'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Role' : 'Vai Trò'}
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Status' : 'Trạng Thái'}
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground">
                        {locale === 'en' ? 'Actions' : 'Hành Động'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-3 px-4">{staff.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{staff.email}</td>
                        <td className="py-3 px-4 text-sm">{staff.phone}</td>
                        <td className="py-3 px-4">
                          {staff.is_admin ? (
                            <Badge className="bg-primary text-primary-foreground">
                              {locale === 'en' ? 'Admin' : 'Quản Lý'}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {locale === 'en' ? 'Staff' : 'Nhân Sự'}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={staff.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                            {staff.status === 'active'
                              ? locale === 'en' ? 'Active' : 'Hoạt Động'
                              : locale === 'en' ? 'Inactive' : 'Không Hoạt Động'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
