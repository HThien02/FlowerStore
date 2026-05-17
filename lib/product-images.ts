/** Số ảnh tối đa mỗi sản phẩm: 1 main + 4 gallery. */
export const PRODUCT_GALLERY_SIZE = 5
export const PRODUCT_EXTRA_IMAGE_COUNT = PRODUCT_GALLERY_SIZE - 1

export function isDisplayableImageUrl(url: string): boolean {
  const t = url.trim()
  return t.length > 0 && !t.startsWith('emoji:')
}

/** Gộp image_url + images_urls thành tối đa 5 URL (main trước). */
export function productImageList(
  image_url: string | null | undefined,
  images_urls?: string[] | null
): string[] {
  const extras = (images_urls ?? [])
    .map((raw) => raw?.trim() ?? '')
    .filter(isDisplayableImageUrl)

  // Định dạng mới: images_urls chứa đủ 5 ảnh (ảnh đầu = main).
  if (extras.length >= PRODUCT_GALLERY_SIZE) {
    return extras.slice(0, PRODUCT_GALLERY_SIZE)
  }

  // Định dạng cũ: image_url + tối đa 4 ảnh trong images_urls.
  const list: string[] = []
  const main = image_url?.trim()
  if (main && isDisplayableImageUrl(main)) list.push(main)

  for (const u of extras) {
    if (!list.includes(u) && list.length < PRODUCT_GALLERY_SIZE) list.push(u)
  }

  return list
}

/** 5 ô form admin (ô trống = ''). */
export function toImageSlots(
  image_url: string | null | undefined,
  images_urls?: string[] | null
): string[] {
  const list = productImageList(image_url, images_urls)
  return Array.from({ length: PRODUCT_GALLERY_SIZE }, (_, i) => list[i] ?? '')
}

/** Lưu DB: slot 0 → image_url; images_urls = đủ 5 URL (để gallery đủ 5 ảnh). */
export function splitProductImages(slots: string[]): {
  image_url: string
  images_urls: string[]
} {
  const cleaned = slots.map((s) => s.trim()).filter((s) => s.length > 0).slice(0, PRODUCT_GALLERY_SIZE)
  return {
    image_url: cleaned[0] ?? '',
    images_urls: cleaned,
  }
}
