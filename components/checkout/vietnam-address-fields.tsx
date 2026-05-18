'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import PriceDisplay from '@/components/price-display'
import type { DeliveryInfo } from '@/lib/checkout-context'
import { isShippingOutOfRange, type ShippingQuoteResult } from '@/lib/shipping/tiers'
import { AlertCircle } from 'lucide-react'

type Unit = { code: number; name: string }

type Props = {
  locale: string
  deliveryInfo: DeliveryInfo
  onChange: (patch: Partial<DeliveryInfo>) => void
  onQuote: (quote: ShippingQuoteResult | null, loading: boolean) => void
  errors: Record<string, string>
}

export default function VietnamAddressFields({
  locale,
  deliveryInfo,
  onChange,
  onQuote,
  errors,
}: Props) {
  const vi = locale === 'vi'
  const [provinces, setProvinces] = useState<Unit[]>([])
  const [districts, setDistricts] = useState<Unit[]>([])
  const [wards, setWards] = useState<Unit[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quote, setQuote] = useState<ShippingQuoteResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/vietnam-address/provinces')
      .then((r) => r.json())
      .then((data) => setProvinces(data.provinces ?? []))
      .catch(console.error)
      .finally(() => setLoadingProvinces(false))
  }, [])

  useEffect(() => {
    if (!deliveryInfo.provinceCode) {
      setDistricts([])
      return
    }
    setLoadingDistricts(true)
    fetch(`/api/vietnam-address/districts?province=${deliveryInfo.provinceCode}`)
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts ?? []))
      .catch(console.error)
      .finally(() => setLoadingDistricts(false))
  }, [deliveryInfo.provinceCode])

  useEffect(() => {
    if (!deliveryInfo.districtCode) {
      setWards([])
      return
    }
    setLoadingWards(true)
    fetch(`/api/vietnam-address/wards?district=${deliveryInfo.districtCode}`)
      .then((r) => r.json())
      .then((data) => setWards(data.wards ?? []))
      .catch(console.error)
      .finally(() => setLoadingWards(false))
  }, [deliveryInfo.districtCode])

  const fetchQuote = useCallback(async () => {
    const {
      address,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
    } = deliveryInfo

    if (!address.trim() || !provinceCode || !districtCode || !wardCode) {
      setQuote(null)
      onQuote(null, false)
      return
    }

    setQuoteLoading(true)
    onQuote(null, true)
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressDetail: address,
          provinceCode,
          provinceName,
          districtCode,
          districtName,
          wardCode,
          wardName,
        }),
      })
      const data = await res.json()
      const q = data.quote as ShippingQuoteResult
      setQuote(q)
      onQuote(q, false)
    } catch {
      setQuote(null)
      onQuote(null, false)
    } finally {
      setQuoteLoading(false)
    }
  }, [deliveryInfo, onQuote])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchQuote()
    }, 600)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    deliveryInfo.address,
    deliveryInfo.provinceCode,
    deliveryInfo.districtCode,
    deliveryInfo.wardCode,
    fetchQuote,
  ])

  const selectProvince = (code: string) => {
    const p = provinces.find((x) => String(x.code) === code)
    onChange({
      provinceCode: code,
      provinceName: p?.name ?? '',
      state: p?.name ?? '',
      districtCode: '',
      districtName: '',
      city: '',
      wardCode: '',
      wardName: '',
    })
  }

  const selectDistrict = (code: string) => {
    const d = districts.find((x) => String(x.code) === code)
    onChange({
      districtCode: code,
      districtName: d?.name ?? '',
      city: d?.name ?? '',
      wardCode: '',
      wardName: '',
    })
  }

  const selectWard = (code: string) => {
    const w = wards.find((x) => String(x.code) === code)
    onChange({
      wardCode: code,
      wardName: w?.name ?? '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{vi ? 'Tỉnh / Thành phố' : 'Province / City'}</Label>
        <Select
          value={deliveryInfo.provinceCode || undefined}
          onValueChange={selectProvince}
          disabled={loadingProvinces}
        >
          <SelectTrigger className={`w-full ${errors.province ? 'border-red-500' : ''}`}>
            <SelectValue placeholder={vi ? 'Chọn tỉnh/thành' : 'Select province'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.code} value={String(p.code)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.province && <p className="text-sm text-red-500">{errors.province}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{vi ? 'Quận / Huyện' : 'District'}</Label>
          <Select
            value={deliveryInfo.districtCode || undefined}
            onValueChange={selectDistrict}
            disabled={!deliveryInfo.provinceCode || loadingDistricts}
          >
            <SelectTrigger className={`w-full ${errors.district ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={vi ? 'Chọn quận/huyện' : 'Select district'} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.code} value={String(d.code)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
        </div>

        <div className="space-y-2">
          <Label>{vi ? 'Phường / Xã' : 'Ward'}</Label>
          <Select
            value={deliveryInfo.wardCode || undefined}
            onValueChange={selectWard}
            disabled={!deliveryInfo.districtCode || loadingWards}
          >
            <SelectTrigger className={`w-full ${errors.ward ? 'border-red-500' : ''}`}>
              <SelectValue placeholder={vi ? 'Chọn phường/xã' : 'Select ward'} />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.code} value={String(w.code)}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ward && <p className="text-sm text-red-500">{errors.ward}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="street">{vi ? 'Số nhà, tên đường' : 'Street address'}</Label>
        <Input
          id="street"
          value={deliveryInfo.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder={vi ? 'VD: 123 Nguyễn Huệ' : 'e.g. 123 Nguyen Hue St'}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
      </div>

      {(quoteLoading || quote) && (
        <div className="rounded-lg border p-3 text-sm">
          {quoteLoading && (
            <p className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {vi ? 'Đang tính phí giao hàng…' : 'Calculating delivery fee…'}
            </p>
          )}
          {!quoteLoading && quote?.supported && (
            <div className="space-y-1">
              <p className="text-gray-600">
                {vi ? 'Khoảng cách' : 'Distance'}:{' '}
                <span className="font-medium text-gray-900">{quote.distanceKm} km</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">{vi ? 'Phí giao hàng' : 'Delivery fee'}</span>
                <span className="font-semibold text-rose-600">
                  {quote.deliveryFee === 0 ? (
                    vi ? 'Miễn phí' : 'Free'
                  ) : (
                    <PriceDisplay amountVnd={quote.deliveryFee} />
                  )}
                </span>
              </p>
            </div>
          )}
          {!quoteLoading && isShippingOutOfRange(quote) && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-950">
              <p className="flex items-start gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {vi ? 'Địa chỉ quá xa (> 20 km)' : 'Address is over 20 km away'}
              </p>
              <p className="mt-1 text-amber-900/90 text-xs leading-relaxed">
                {vi
                  ? `Khoảng cách ${quote.distanceKm} km — không thanh toán trực tuyến. Bạn vẫn có thể gửi đơn; nhân viên sẽ liên hệ báo phí ship và hỗ trợ.`
                  : `Distance ${quote.distanceKm} km — online payment is not available. You can still submit your order; our staff will contact you with a shipping quote.`}
              </p>
            </div>
          )}
          {!quoteLoading && quote && !quote.supported && !isShippingOutOfRange(quote) && (
            <p className="text-red-600">
              {quote.reason === 'shop_not_configured'
                ? vi
                  ? 'Cửa hàng chưa có tọa độ để tính ship. Admin vào Shop → Lưu lại địa chỉ (hoặc thêm GOONG_API_KEY).'
                  : 'Shop location not ready for shipping quotes. Admin: re-save shop address in Settings.'
                : vi
                  ? 'Không xác định được địa chỉ. Vui lòng kiểm tra lại.'
                  : 'Could not verify address. Please check your details.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}


