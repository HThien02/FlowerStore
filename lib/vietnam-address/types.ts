export type VietnamUnit = {
  name: string
  code: number
  division_type: string
  codename?: string
  phone_code?: number
}

export type VietnamAddressParts = {
  addressDetail: string
  provinceCode: string
  provinceName: string
  districtCode: string
  districtName: string
  wardCode: string
  wardName: string
}

export function formatVietnamAddress(parts: VietnamAddressParts): string {
  const street = parts.addressDetail.trim()
  const ward = parts.wardName.trim()
  const district = parts.districtName.trim()
  const province = parts.provinceName.trim()
  return [street, ward, district, province, 'Việt Nam'].filter(Boolean).join(', ')
}
