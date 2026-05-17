'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { toast } from 'sonner'

type ProductRow = {
  id: string
  name: string
  slug: string
  price: number
  stock: number | null
  featured: boolean | null
  image_url: string | null
}

export default function AdminProductsTable({ locale }: { locale: string }) {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id,name,slug,price,stock,featured,image_url')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error(error.message)
      setRows([])
    } else {
      setRows((data ?? []) as unknown as ProductRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setBusyId(id)
    try {
      const res = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      toast.success('Deleted')
      setRows((prev) => prev.filter((p) => p.id !== id))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setBusyId(null)
    }
  }

  const filtered = rows.filter((p) => {
    const q = search.trim().toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 w-16"></th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-center">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-10">
                  No products found.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-12 h-12 rounded object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-100" />
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-2 text-gray-600">{p.slug}</td>
                <td className="px-4 py-2 text-right">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{p.stock ?? 0}</td>
                <td className="px-4 py-2 text-center">{p.featured ? '✓' : '—'}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap space-x-2">
                  <Link href={`/${locale}/admin/products/${p.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={busyId === p.id}
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    {busyId === p.id ? '…' : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
