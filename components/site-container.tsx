import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
  /** Bỏ padding ngang (vd. section full-bleed bên trong) */
  noPadding?: boolean
}

/** Khung nội dung cố định 1280px — dùng chung nav, main, footer */
export default function SiteContainer({ children, className, noPadding }: Props) {
  return (
    <div
      className={cn(
        'site-container w-full flex flex-col',
        !noPadding && 'site-container-padding',
        className
      )}
    >
      {children}
    </div>
  )
}
