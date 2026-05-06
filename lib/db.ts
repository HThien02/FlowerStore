import { getSupabaseClient } from './supabase'

// Product operations
export async function getProducts(category?: string) {
  const supabase = getSupabaseClient()
  let query = supabase.from('products').select('*')

  if (category) {
    query = query.eq('category_id', category)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProductBySlug(slug: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getFeaturedProducts() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(6)

  if (error) throw error
  return data
}

// Category operations
export async function getCategories() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getCategoryBySlug(slug: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

// Delivery operations
export async function getDeliveryOptions() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .order('base_price')

  if (error) throw error
  return data
}

// Cart operations
export async function getCart(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity,
    })

  if (error) throw error
  return data
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)

  if (error) throw error
  return data
}

export async function removeFromCart(cartItemId: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) throw error
}

// Order operations
export async function createOrder(
  userId: string,
  orderData: {
    subtotal: number
    delivery_cost: number
    delivery_id: string
    delivery_address: string
    delivery_phone: string
    delivery_notes?: string
    total: number
  }
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      ...orderData,
      status: 'pending',
      payment_status: 'pending',
    })
    .select()

  if (error) throw error
  return data?.[0]
}

export async function addOrderItems(
  orderId: string,
  items: Array<{
    product_id: string
    product_name: string
    product_price: number
    quantity: number
  }>
) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('order_items')
    .insert(
      items.map((item) => ({
        order_id: orderId,
        ...item,
      }))
    )

  if (error) throw error
  return data
}

export async function getOrders(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(orderId: string, userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw error
  return data
}

// User profile operations
export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserProfile(userId: string, profile: Partial<any>) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('id', userId)

  if (error) throw error
  return data
}
