'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Package, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const locale = useLocale()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalStaff: 0,
    scheduledDeliveries: 0,
    emailsSent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const [staffRes, scheduleRes, emailRes] = await Promise.all([
          fetch('/api/staff?active=true'),
          fetch('/api/deliveries/schedule?status=scheduled'),
          fetch('/api/email-logs?limit=100'),
        ])

        const staffList = await staffRes.json()
        const schedules = await scheduleRes.json()
        const emailLogs = await emailRes.json()

        setStats({
          totalOrders: schedules.length,
          totalStaff: staffList.length,
          scheduledDeliveries: schedules.filter((s: any) => s.status === 'scheduled').length,
          emailsSent: emailLogs.filter((e: any) => e.status === 'sent').length,
        })
      } catch (error) {
        console.error('[v0] Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {locale === 'en' ? 'Admin Dashboard' : 'Bảng Điều Khiển'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {locale === 'en' ? 'Manage your flower shop operations' : 'Quản lý hoạt động cửa hàng hoa của bạn'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {locale === 'en' ? 'Staff Members' : 'Nhân Sự'}
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'en' ? 'Active members' : 'Thành viên hoạt động'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-accent/50 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {locale === 'en' ? 'Scheduled' : 'Đã Lên Lịch'}
                </CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.scheduledDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'en' ? 'Deliveries' : 'Giao hàng'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-secondary/50 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {locale === 'en' ? 'Emails Sent' : 'Email Đã Gửi'}
                </CardTitle>
                <Mail className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.emailsSent}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'en' ? 'This month' : 'Tháng này'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-destructive/50 hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {locale === 'en' ? 'Total Orders' : 'Tổng Đơn'}
                </CardTitle>
                <Package className="h-4 w-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === 'en' ? 'All time' : 'Tổng cộng'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Staff Management' : 'Quản Lý Nhân Sự'}</CardTitle>
              <CardDescription>
                {locale === 'en' ? 'Add, edit, and manage staff members' : 'Thêm, chỉnh sửa và quản lý nhân sự'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${locale}/admin/staff`}>
                <Button className="w-full bg-primary hover:bg-secondary text-primary-foreground font-semibold">
                  {locale === 'en' ? 'Manage Staff' : 'Quản Lý Nhân Sự'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Delivery Schedule' : 'Lịch Giao Hàng'}</CardTitle>
              <CardDescription>
                {locale === 'en' ? 'View and manage delivery schedules' : 'Xem và quản lý lịch giao hàng'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${locale}/admin/schedule`}>
                <Button className="w-full bg-accent hover:bg-primary text-accent-foreground font-semibold">
                  {locale === 'en' ? 'View Schedule' : 'Xem Lịch'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Email Logs' : 'Nhật Ký Email'}</CardTitle>
              <CardDescription>
                {locale === 'en' ? 'Track all sent emails and their status' : 'Theo dõi tất cả email đã gửi'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${locale}/admin/emails`}>
                <Button className="w-full bg-secondary hover:bg-primary text-secondary-foreground font-semibold">
                  {locale === 'en' ? 'View Emails' : 'Xem Email'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'System Settings' : 'Cài Đặt Hệ Thống'}</CardTitle>
              <CardDescription>
                {locale === 'en' ? 'Configure SMTP and other settings' : 'Cấu hình SMTP và các cài đặt khác'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/${locale}/admin/settings`}>
                <Button variant="outline" className="w-full font-semibold">
                  {locale === 'en' ? 'Settings' : 'Cài Đặt'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Recent Activity' : 'Hoạt Động Gần Đây'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              {locale === 'en' ? 'No recent activity' : 'Không có hoạt động gần đây'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
