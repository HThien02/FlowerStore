import type { VietnamUnit } from './types'

const BASE = 'https://provinces.open-api.vn/api'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`Vietnam address API error: ${res.status}`)
  return res.json() as Promise<T>
}

/** All provinces / cities (after 2025 reform this API reflects current divisions). */
export async function fetchProvinces(): Promise<VietnamUnit[]> {
  return fetchJson<VietnamUnit[]>('/p/')
}

/** Districts (quận/huyện) within a province. */
export async function fetchDistricts(provinceCode: string): Promise<VietnamUnit[]> {
  const data = await fetchJson<VietnamUnit & { districts?: VietnamUnit[] }>(`/p/${provinceCode}?depth=2`)
  return data.districts ?? []
}

/** Wards (phường/xã) within a district. */
export async function fetchWards(districtCode: string): Promise<VietnamUnit[]> {
  const data = await fetchJson<VietnamUnit & { wards?: VietnamUnit[] }>(`/d/${districtCode}?depth=2`)
  return data.wards ?? []
}
