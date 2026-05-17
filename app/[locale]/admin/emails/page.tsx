'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface EmailLog {
  id: string
  order_id: string | null
  user_id: string | null
  email_type: string
  recipient_email: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  error_message: string | null
  retry_count: number
  created_at: string
}

export default function EmailLogsPage() {
  const locale = useLocale()
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all')

  useEffect(() => {
    fetchEmails()
  }, [filter])

  const fetchEmails = async () => {
    try {
      const url = filter === 'all' ? '/api/email-logs' : `/api/email-logs?status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      setEmails(data)
    } catch (error) {
      console.error('[v0] Error fetching emails:', error)
      toast.error(locale === 'en' ? 'Failed to load emails' : 'Lỗi tải email')
    } finally {
      setLoading(false)
    }
  }

  const getEmailTypeLabel = (type: string) => {
    const labels: { [key: string]: { en: string; vi: string } } = {
      'order-confirmation': { en: 'Order Confirmation', vi: 'Xác Nhận Đơn' },
      'payment-success': { en: 'Payment Success', vi: 'Thanh Toán Thành Công' },
      'delivery-reminder': { en: 'Delivery Reminder', vi: 'Nhắc Nhở Giao Hàng' },
      cancellation: { en: 'Order Cancelled', vi: 'Đơn Hủy' },
      'staff-assignment': { en: 'Staff Assignment', vi: 'Giao Việc Nhân Sự' },
      'admin-notification': { en: 'Admin Notification', vi: 'Thông Báo Admin' },
    }
    return labels[type]?.[locale as 'en' | 'vi'] || type
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEmails = filter === 'all' ? emails : emails.filter((e) => e.status === filter)

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
              {locale === 'en' ? 'Email Logs' : 'Nhật Ký Email'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {locale === 'en' ? 'Track all sent emails and their status' : 'Theo dõi tất cả email đã gửi'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'sent', 'failed', 'pending'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className={filter === f ? 'bg-primary hover:bg-secondary' : ''}
              onClick={() => setFilter(f)}
            >
              {f === 'all'
                ? locale === 'en' ? 'All' : 'Tất Cả'
                : f === 'sent'
                ? locale === 'en' ? 'Sent' : 'Đã Gửi'
                : f === 'failed'
                ? locale === 'en' ? 'Failed' : 'Lỗi'
                : locale === 'en' ? 'Pending' : 'Chờ'}
            </Button>
          ))}
        </div>

        {/* Email List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            {locale === 'en' ? 'Loading...' : 'Đang tải...'}
          </div>
        ) : filteredEmails.length === 0 ? (
          <Card className="border-2 border-border">
            <CardContent className="py-16 text-center text-muted-foreground">
              {locale === 'en' ? 'No emails found' : 'Không tìm thấy email'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEmails.map((email) => (
              <Card key={email.id} className="border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(email.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {email.subject}
                          </h3>
                          <Badge className={getStatusColor(email.status)}>
                            {email.status === 'sent'
                              ? locale === 'en' ? 'Sent' : 'Đã Gửi'
                              : email.status === 'failed'
                              ? locale === 'en' ? 'Failed' : 'Lỗi'
                              : locale === 'en' ? 'Pending' : 'Chờ'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">To:</span> {email.recipient_email}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{locale === 'en' ? 'Type' : 'Loại'}:</span>{' '}
                            {getEmailTypeLabel(email.email_type)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{locale === 'en' ? 'Sent' : 'Gửi'}:</span>{' '}
                            {new Date(email.created_at).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                          </div>
                        </div>

                        {email.error_message && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">{locale === 'en' ? 'Error' : 'Lỗi'}:</span> {email.error_message}
                            </p>
                          </div>
                        )}

                        {email.retry_count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {locale === 'en' ? 'Retry count' : 'Lần thử lại'}: {email.retry_count}
                          </p>
                        )}
                      </div>
                    </div>
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
