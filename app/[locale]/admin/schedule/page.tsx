'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Schedule {
  id: string
  order_id: string
  staff_id: string | null
  scheduled_time: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed'
  orders: { id: string; delivery_address: string }
  staff: { id: string; name: string; email: string } | null
}

export default function SchedulePage() {
  const locale = useLocale()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/deliveries/schedule')
      const data = await res.json()
      setSchedules(data)
    } catch (error) {
      console.error('[v0] Error fetching schedules:', error)
      toast.error(locale === 'en' ? 'Failed to load schedules' : 'Lỗi tải lịch')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/deliveries/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id, status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success(locale === 'en' ? 'Status updated!' : 'Cập nhật thành công!')
      fetchSchedules()
    } catch (error) {
      toast.error(locale === 'en' ? 'Failed to update status' : 'Lỗi cập nhật')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600'
      case 'in-progress':
        return 'bg-yellow-600'
      case 'completed':
        return 'bg-green-600'
      case 'failed':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { en: string; vi: string } } = {
      scheduled: { en: 'Scheduled', vi: 'Đã Lên Lịch' },
      'in-progress': { en: 'In Progress', vi: 'Đang Giao' },
      completed: { en: 'Completed', vi: 'Hoàn Thành' },
      failed: { en: 'Failed', vi: 'Thất Bại' },
    }
    return labels[status]?.[locale as 'en' | 'vi'] || status
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/admin`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {locale === 'en' ? 'Delivery Schedule' : 'Lịch Giao Hàng'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'en' ? 'Manage all scheduled deliveries' : 'Quản lý tất cả giao hàng đã lên lịch'}
            </p>
          </div>
        </div>

        {/* Schedules Grid */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {locale === 'en' ? 'Loading...' : 'Đang tải...'}
          </div>
        ) : schedules.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="py-16 text-center text-muted-foreground">
              {locale === 'en' ? 'No scheduled deliveries yet' : 'Chưa có giao hàng lên lịch'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {locale === 'en' ? 'Order' : 'Đơn Hàng'} #{schedule.order_id.slice(0, 8)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {locale === 'en' ? 'Schedule ID' : 'ID Lịch'}: {schedule.id.slice(0, 8)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(schedule.status)}>
                      {getStatusLabel(schedule.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scheduled Time */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'en' ? 'Scheduled Time' : 'Thời Gian Lên Lịch'}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(schedule.scheduled_time).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {locale === 'en' ? 'Delivery Address' : 'Địa Chỉ Giao'}
                      </p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {schedule.orders.delivery_address}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Staff */}
                  {schedule.staff ? (
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {locale === 'en' ? 'Assigned To' : 'Giao Cho'}
                        </p>
                        <p className="text-sm font-medium text-foreground">{schedule.staff.name}</p>
                        <p className="text-xs text-muted-foreground">{schedule.staff.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        {locale === 'en' ? 'Not assigned yet' : 'Chưa giao cho ai'}
                      </p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="pt-4 border-t border-border space-y-2">
                    {schedule.status === 'scheduled' && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                          onClick={() => handleUpdateStatus(schedule.id, 'in-progress')}
                        >
                          {locale === 'en' ? 'Mark In Progress' : 'Đang Giao'}
                        </Button>
                      </>
                    )}
                    {schedule.status === 'in-progress' && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                          onClick={() => handleUpdateStatus(schedule.id, 'completed')}
                        >
                          {locale === 'en' ? 'Mark Completed' : 'Hoàn Thành'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleUpdateStatus(schedule.id, 'failed')}
                        >
                          {locale === 'en' ? 'Mark Failed' : 'Thất Bại'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
