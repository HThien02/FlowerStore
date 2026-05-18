/** Line items for PayOS payment link (sum of price×qty should equal link amount). */
export type PayosLineItem = {
  name: string
  quantity: number
  price: number
}

export function buildPayosLineItems(
  orderItems: { product_name: string; quantity: number; product_price: number }[],
  amountVnd: number
): PayosLineItem[] {
  const items: PayosLineItem[] = orderItems.map((row) => ({
    name: String(row.product_name || 'Sản phẩm').slice(0, 120),
    quantity: Math.max(1, Number(row.quantity) || 1),
    price: Math.round(Number(row.product_price) || 0),
  }))

  const sum = items.reduce((s, i) => s + i.price * i.quantity, 0)
  if (items.length > 0 && sum === amountVnd) {
    return items
  }

  return [{ name: 'Đơn hàng TFlowers', quantity: 1, price: amountVnd }]
}
