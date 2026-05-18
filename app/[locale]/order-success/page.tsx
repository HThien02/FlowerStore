import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import OrderSuccessPayosStatus from '@/components/order/order-success-payos-status'
import { isPayOSConfigured } from '@/lib/payos'
import { syncPayosOrderPayment } from '@/lib/orders/payos-payment'
import { resolveOrderIdForPayosReturn } from '@/lib/orders/payos-return'
import { getSupabaseServerClient } from '@/lib/supabase'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    orderId?: string
    type?: string
    payos?: string
    orderCode?: string
    code?: string
    status?: string
    cancel?: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Order Successful | Flower Shop' : 'Đặt Hàng Thành Công | Flower Shop',
  }
}

function OrderSuccess({
  locale,
  variant,
  orderId,
  payosReturn,
}: {
  locale: string
  variant: 'default' | 'home-request'
  orderId?: string
  payosReturn?: boolean
}) {
  const isHomeRequest = variant === 'home-request'

  return (
    <div className="w-full py-20">
      <div className="max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold">
          {isHomeRequest
            ? locale === 'en'
              ? 'Request received!'
              : 'Đã nhận yêu cầu!'
            : locale === 'en'
              ? 'Order Successful!'
              : 'Đặt Hàng Thành Công!'}
        </h1>

        <p className="text-gray-600 text-lg max-w-md mx-auto">
          {isHomeRequest
            ? locale === 'en'
              ? 'We sent a confirmation email with your order details, delivery fee, and total.'
              : 'Chúng tôi đã gửi email xác nhận kèm chi tiết đơn, phí giao hàng và tổng thanh toán.'
            : payosReturn
              ? locale === 'en'
                ? 'Thank you! We are confirming your payOS payment.'
                : 'Cảm ơn bạn! Chúng tôi đang xác nhận thanh toán payOS.'
              : locale === 'en'
                ? 'Thank you for your order. We will process it shortly and you will receive a confirmation email.'
                : 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý nó ngay và bạn sẽ nhận được email xác nhận.'}
        </p>

        {payosReturn && orderId && (
          <OrderSuccessPayosStatus orderId={orderId} locale={locale} />
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
          <h2 className="font-semibold text-rose-900 mb-3">
            {locale === 'en' ? 'What happens next?' : 'Tiếp theo?'}
          </h2>
          <ul className="space-y-2 text-sm text-rose-900/90">
            {isHomeRequest ? (
              <>
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    {locale === 'en'
                      ? 'Check your inbox for the confirmation email'
                      : 'Kiểm tra hộp thư email xác nhận đơn hàng'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    {locale === 'en'
                      ? 'A staff member calls or messages you within 1 hour'
                      : 'Nhân viên gọi hoặc nhắn tin trong vòng 1 giờ'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    {locale === 'en'
                      ? 'Agree on delivery time and final price'
                      : 'Thống nhất giờ giao và giá cuối'}
                  </span>
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    {locale === 'en'
                      ? 'Check your inbox — the email includes items, fees, and total'
                      : 'Kiểm tra email — có chi tiết sản phẩm, phí ship và tổng tiền'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    {locale === 'en'
                      ? 'Our team prepares your bouquet before pickup time'
                      : 'Shop chuẩn bị hoa trước giờ nhận bạn đã chọn'}
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    {locale === 'en'
                      ? 'Visit the store at your scheduled time'
                      : 'Đến cửa hàng đúng giờ hẹn'}
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href={`/${locale}`}>
            <Button size="lg" variant="outline">
              {locale === 'en' ? 'Back to Home' : 'Về Trang Chủ'}
            </Button>
          </Link>
          <Link href={`/${locale}/shop`}>
            <Button size="lg" className="rounded-full btn-bloom">
              {locale === 'en' ? 'Continue Shopping' : 'Tiếp Tục Mua Hàng'}
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  )
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params
  const sp = await searchParams
  const variant = sp?.type === 'home-request' ? 'home-request' : 'default'
  const payosReturn =
    sp?.payos === '1' ||
    sp?.orderCode != null ||
    sp?.code === '00' ||
    String(sp?.status ?? '').toUpperCase() === 'PAID'

  let orderId = sp?.orderId
  if (payosReturn && isPayOSConfigured()) {
    try {
      const admin = getSupabaseServerClient()
      if (!orderId) {
        orderId =
          (await resolveOrderIdForPayosReturn(admin, {
            orderId: sp?.orderId,
            orderCode: sp?.orderCode,
          })) ?? undefined
      }
      if (orderId) {
        await syncPayosOrderPayment(admin, orderId)
      }
    } catch (e) {
      console.error('[order-success] payos sync', e)
    }
  }

  return (
    <OrderSuccess
      locale={locale}
      variant={variant}
      orderId={orderId}
      payosReturn={payosReturn}
    />
  )
}
