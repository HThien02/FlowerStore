'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { ShopSettings } from '@/lib/shop/settings'

type Unit = { code: number; name: string }

export default function AdminShopSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [addressDetail, setAddressDetail] = useState('')
  const [provinceCode, setProvinceCode] = useState('')
  const [provinceName, setProvinceName] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [wardCode, setWardCode] = useState('')
  const [wardName, setWardName] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null)

  const [provinces, setProvinces] = useState<Unit[]>([])
  const [districts, setDistricts] = useState<Unit[]>([])
  const [wards, setWards] = useState<Unit[]>([])

  useEffect(() => {
    fetch('/api/vietnam-address/provinces')
      .then((r) => r.json())
      .then((d) => setProvinces(d.provinces ?? []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([])
      return
    }
    fetch(`/api/vietnam-address/districts?province=${provinceCode}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts ?? []))
      .catch(console.error)
  }, [provinceCode])

  useEffect(() => {
    if (!districtCode) {
      setWards([])
      return
    }
    fetch(`/api/vietnam-address/wards?district=${districtCode}`)
      .then((r) => r.json())
      .then((d) => setWards(d.wards ?? []))
      .catch(console.error)
  }, [districtCode])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          setError('Not signed in')
          return
        }
        const res = await fetch('/api/admin/shop-settings', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Load failed')
        const s = data.settings as ShopSettings | null
        if (s) {
          setAddressDetail(s.addressDetail ?? '')
          setProvinceCode(s.provinceCode ?? '')
          setProvinceName(s.provinceName ?? '')
          setDistrictCode(s.districtCode ?? '')
          setDistrictName(s.districtName ?? '')
          setWardCode(s.wardCode ?? '')
          setWardName(s.wardName ?? '')
          setLatitude(s.latitude)
          setLongitude(s.longitude)
          if (s.latitude != null) setManualLat(String(s.latitude))
          if (s.longitude != null) setManualLng(String(s.longitude))
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Not signed in')

      const res = await fetch('/api/admin/shop-settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressDetail,
          provinceCode,
          provinceName,
          districtCode,
          districtName,
          wardCode,
          wardName,
          latitude: manualLat.trim() ? Number(manualLat) : undefined,
          longitude: manualLng.trim() ? Number(manualLng) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      const s = data.settings as ShopSettings
      setLatitude(s.latitude)
      setLongitude(s.longitude)
      if (s.latitude != null) setManualLat(String(s.latitude))
      if (s.longitude != null) setManualLng(String(s.longitude))
      setResolvedAddress(data.formattedAddress ?? null)
      if (data.geocoded && s.latitude != null) {
        const via =
          data.precision === 'manual'
            ? 'tọa độ bạn nhập'
            : data.precision === 'street'
              ? 'đúng số nhà (tự động)'
              : `mức ${data.precision} (tự động)`
        setMessage(`Đã lưu. Tọa độ: ${via}. Kiểm tra link bản đồ bên dưới.`)
      } else {
        setError(
          data.warning ??
            'Chưa có tọa độ. Mở Google Maps → chuột phải điểm cửa hàng → copy tọa độ → dán vào ô Lat/Lng.'
        )
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <p className="text-gray-500 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </p>
    )
  }

  return (
    <div className="max-w-xl space-y-6 bg-white rounded-lg border p-6">
      <p className="text-sm text-gray-600">
        Địa chỉ cửa hàng dùng làm điểm xuất phát khi tính khoảng cách giao hàng. Chạy{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">scripts/setup-shop-settings.sql</code> trên
        Supabase nếu chưa có bảng.
      </p>

      <div className="space-y-2">
        <Label>Tỉnh / Thành phố</Label>
        <Select
          value={provinceCode || undefined}
          onValueChange={(code) => {
            const p = provinces.find((x) => String(x.code) === code)
            setProvinceCode(code)
            setProvinceName(p?.name ?? '')
            setDistrictCode('')
            setDistrictName('')
            setWardCode('')
            setWardName('')
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn tỉnh/thành" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={String(p.code)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quận / Huyện</Label>
          <Select
            value={districtCode || undefined}
            onValueChange={(code) => {
              const d = districts.find((x) => String(x.code) === code)
              setDistrictCode(code)
              setDistrictName(d?.name ?? '')
              setWardCode('')
              setWardName('')
            }}
            disabled={!provinceCode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn quận/huyện" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Phường / Xã</Label>
          <Select
            value={wardCode || undefined}
            onValueChange={(code) => {
              const w = wards.find((x) => String(x.code) === code)
              setWardCode(code)
              setWardName(w?.name ?? '')
            }}
            disabled={!districtCode}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn phường/xã" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={String(w.code)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Số nhà, tên đường</Label>
        <Input value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} />
      </div>

      <div className="space-y-2 border-t pt-4">
        <Label className="font-semibold">Tọa độ GPS (chính xác nhất)</Label>
        <p className="text-xs text-gray-500">
          Mở Google Maps → chuột phải đúng vị trí cửa hàng → copy tọa độ → dán vào đây. Tránh để hệ
          thống tự đoán sai sang phường/quận khác.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Vĩ độ (lat)</Label>
            <Input value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="10.762622" />
          </div>
          <div>
            <Label className="text-xs">Kinh độ (lng)</Label>
            <Input value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="106.660172" />
          </div>
        </div>
      </div>

      {latitude != null && longitude != null ? (
        <div className="text-xs space-y-2">
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
            Đã lưu: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-600 underline block"
          >
            Kiểm tra vị trí trên Google Maps
          </a>
          {resolvedAddress && <p className="text-gray-500">Geocode tự động: {resolvedAddress}</p>}
        </div>
      ) : (
        provinceCode &&
        wardCode && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
            Chưa có tọa độ — dán lat/lng từ Google Maps rồi bấm Lưu, hoặc thêm GOONG_API_KEY.
          </p>
        )
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <Button onClick={() => void handleSave()} disabled={saving}>
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Lưu địa chỉ shop
      </Button>

      <p className="text-xs text-gray-500 border-t pt-4">
        Tùy chọn: thêm <code>GOONG_API_KEY</code> vào env để geocode và khoảng cách đường chính xác hơn
        (Việt Nam). Không có key vẫn chạy được qua OpenStreetMap + ước lượng.
      </p>
    </div>
  )
}



