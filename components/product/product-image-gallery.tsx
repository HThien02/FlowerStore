'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isDisplayableImageUrl } from '@/lib/product-images'

type Props = {
  images: string[]
  alt: string
  className?: string
  priority?: boolean
}

export default function ProductImageGallery({ images, alt, className, priority }: Props) {
  const urls = images.filter(isDisplayableImageUrl)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [urls.join('|')])

  const go = useCallback(
    (delta: number) => {
      if (urls.length <= 1) return
      setIndex((i) => (i + delta + urls.length) % urls.length)
    },
    [urls.length]
  )

  if (urls.length === 0) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-rose-100 to-pink-100 rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center',
          className
        )}
      >
        <span className="text-8xl">🌹</span>
      </div>
    )
  }

  const current = urls[Math.min(index, urls.length - 1)]
  const hasMultiple = urls.length > 1

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-[4/3] group">
        <Image
          src={current}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-90 shadow-md"
              onClick={() => go(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-90 shadow-md"
              onClick={() => go(1)}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
              {index + 1} / {urls.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-5 gap-2">
          {urls.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'relative aspect-square rounded-md overflow-hidden border-2 transition ring-offset-1',
                i === index
                  ? 'border-rose-500 ring-2 ring-rose-300'
                  : 'border-transparent hover:border-rose-200 opacity-80 hover:opacity-100'
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
