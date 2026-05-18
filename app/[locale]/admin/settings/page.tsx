import AdminShopSettings from '@/components/admin/admin-shop-settings'

export default function AdminShopSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shop settings</h1>
      <p className="text-gray-600 text-sm">Địa chỉ cửa hàng &amp; tính phí giao hàng theo km</p>
      <AdminShopSettings />
    </div>
  )
}
