import { NextRequest, NextResponse } from 'next/server'
import { placeOrder } from '@/lib/orders/place-order'
import type { HomeDeliveryForm } from '@/lib/email/templates/home-delivery-request'
import { formatVietnamAddress } from '@/lib/vietnam-address/types'
import { calculateShippingQuote } from '@/lib/shipping/quote'
import { isShippingOutOfRange } from '@/lib/shipping/tiers'

type Body = HomeDeliveryForm & {
  locale?: string
  userId?: string | null
  scheduledAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const { locale = 'en', deliveryInfo, items, subtotal, userId, scheduledAt } = body

    if (!deliveryInfo?.email?.trim() || !items?.length) {
      return NextResponse.json({ error: 'Missing email or items' }, { status: 400 })
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: 'Missing scheduled delivery time' }, { status: 400 })
    }

    const address =
      deliveryInfo.provinceCode && deliveryInfo.wardCode
        ? formatVietnamAddress({
            addressDetail: deliveryInfo.address,
            provinceCode: deliveryInfo.provinceCode,
            provinceName: deliveryInfo.provinceName ?? '',
            districtCode: deliveryInfo.districtCode ?? '',
            districtName: deliveryInfo.districtName ?? '',
            wardCode: deliveryInfo.wardCode,
            wardName: deliveryInfo.wardName ?? '',
          })
        : [deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode]
            .filter(Boolean)
            .join(', ')

    let deliveryCost = 0
    let deliveryNotes = deliveryInfo.notes?.trim() ?? ''

    if (deliveryInfo.provinceCode && deliveryInfo.districtCode && deliveryInfo.wardCode) {
      const quote = await calculateShippingQuote({
        addressDetail: deliveryInfo.address,
        provinceCode: deliveryInfo.provinceCode,
        provinceName: deliveryInfo.provinceName ?? '',
        districtCode: deliveryInfo.districtCode,
        districtName: deliveryInfo.districtName ?? '',
        wardCode: deliveryInfo.wardCode,
        wardName: deliveryInfo.wardName ?? '',
      })
      if (!quote.supported) {
        if (isShippingOutOfRange(quote)) {
          const tag = `[Giao xa >20km: ${quote.distanceKm}km — chờ NV báo phí ship]`
          deliveryNotes = deliveryNotes ? `${deliveryNotes}\n${tag}` : tag
        } else {
          return NextResponse.json({ error: quote.message }, { status: 400 })
        }
      } else {
        deliveryCost = quote.deliveryFee
      }
    }

    const customerName = `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim()

    const result = await placeOrder({
      userId: userId ?? null,
      customerEmail: deliveryInfo.email.trim(),
      customerName,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
      deliveryCost,
      deliveryAddress: address || deliveryInfo.address,
      deliveryPhone: deliveryInfo.phone,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod: 'pending_staff',
      fulfillmentType: 'home',
      scheduledAt,
      locale: locale === 'vi' ? 'vi' : 'en',
      paymentStatus: 'pending',
      status: 'pending',
    })

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      prepScheduledAt: result.assignment.prepAt.toISOString(),
    })
  } catch (e) {
    console.error('[checkout-home-request]', e)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
