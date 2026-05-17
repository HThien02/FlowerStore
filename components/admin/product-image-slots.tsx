'use client'

import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PRODUCT_GALLERY_SIZE } from '@/lib/product-images'
import { X } from 'lucide-react'

type Props = {
  slots: string[]
  onChange: (slots: string[]) => void
  onUpload: (file: File, index: number) => Promise<void>
  uploadingIndex: number | null
  isVi?: boolean
}

export default function ProductImageSlots({
  slots,
  onChange,
  onUpload,
  uploadingIndex,
  isVi = false,
}: Props) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const setSlot = (index: number, value: string) => {
    const next = [...slots]
    while (next.length < PRODUCT_GALLERY_SIZE) next.push('')
    next[index] = value
    onChange(next.slice(0, PRODUCT_GALLERY_SIZE))
  }

  const clearSlot = (index: number) => setSlot(index, '')

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        {isVi
          ? 'Tối đa 5 ảnh: ảnh 1 là ảnh chính (shop & giỏ hàng), 2–5 là gallery trên trang chi tiết.'
          : 'Up to 5 images: #1 is main (shop & cart), #2–5 appear in the product gallery.'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: PRODUCT_GALLERY_SIZE }, (_, index) => {
          const url = slots[index] ?? ''
          const label =
            index === 0
              ? isVi
                ? 'Ảnh chính'
                : 'Main'
              : isVi
                ? `Ảnh ${index + 1}`
                : `Image ${index + 1}`
          const busy = uploadingIndex === index

          return (
            <div key={index} className="space-y-1.5">
              <Label className="text-xs text-gray-600">{label}</Label>
              <div className="relative aspect-square rounded-md border bg-gray-50 overflow-hidden">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
                    {busy ? (isVi ? 'Đang tải…' : 'Uploading…') : isVi ? 'Chưa có' : 'Empty'}
                  </span>
                )}
                {url && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full shadow"
                    onClick={() => clearSlot(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <input
                ref={(el) => {
                  fileRefs.current[index] = el
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="text-[10px] w-full"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void onUpload(f, index)
                  e.target.value = ''
                }}
              />
              <Input
                className="h-8 text-xs"
                placeholder="URL"
                value={url}
                onChange={(e) => setSlot(index, e.target.value)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
