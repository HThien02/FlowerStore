'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import ProductImageSlots from '@/components/admin/product-image-slots'
import { splitProductImages, toImageSlots } from '@/lib/product-images'

type Category = { id: string; name: string }

type FormState = {
  name: string
  name_vi: string
  slug: string
  description: string
  description_vi: string
  category_id: string
  price: string
  stock: string
  featured: boolean
  image_url: string
}

const empty: FormState = {
  name: '',
  name_vi: '',
  slug: '',
  description: '',
  description_vi: '',
  category_id: '',
  price: '',
  stock: '0',
  featured: false,
  image_url: '',
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

type Props = {
  locale: string
  mode: 'create' | 'edit'
  productId?: string
}

export default function ProductForm({ locale, mode, productId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [imageSlots, setImageSlots] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => '')
  )
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  useEffect(() => {
    const run = async () => {
      const cats = await supabase.from('categories').select('id,name').order('name')
      if (cats.data) setCategories(cats.data as unknown as Category[])

      if (mode === 'edit' && productId) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()
        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }
        const r = data as Record<string, unknown>
        setForm({
          name: String(r.name ?? ''),
          name_vi: String(r.name_vi ?? ''),
          slug: String(r.slug ?? ''),
          description: String(r.description ?? ''),
          description_vi: String(r.description_vi ?? ''),
          category_id: String(r.category_id ?? ''),
          price: String(r.price ?? ''),
          stock: String(r.stock ?? 0),
          featured: Boolean(r.featured),
          image_url: String(r.image_url ?? ''),
        })
        setImageSlots(
          toImageSlots(
            String(r.image_url ?? ''),
            (r.images_urls as string[] | null) ?? null
          )
        )
        setLoading(false)
      }
    }
    run()
  }, [mode, productId])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleUpload = async (file: File, index: number) => {
    setUploadingIndex(index)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      const url = String(body.url)
      setImageSlots((prev) => {
        const next = [...prev]
        while (next.length < 5) next.push('')
        next[index] = url
        return next
      })
      if (index === 0) update('image_url', url)
      toast.success('Image uploaded')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { image_url, images_urls } = splitProductImages(imageSlots)
    if (!form.name || !form.slug || !form.price || !image_url || !form.category_id) {
      toast.error('Please fill name, slug, price, category and upload a main image.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        image_url,
        images_urls,
        price: Number(form.price),
        stock: Number(form.stock),
      }
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      toast.success(mode === 'create' ? 'Product created' : 'Saved')
      router.push(`/${locale}/admin/products`)
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-lg p-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Name (English)</Label>
          <Input
            value={form.name}
            onChange={(e) => {
              const v = e.target.value
              update('name', v)
              if (mode === 'create' && !form.slug) update('slug', slugify(v))
            }}
          />
        </div>
        <div>
          <Label>Name (Vietnamese)</Label>
          <Input value={form.name_vi} onChange={(e) => update('name_vi', e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} />
          <p className="text-xs text-gray-500 mt-1">Used in URL: /shop/{form.slug || 'slug'}</p>
        </div>
        <div>
          <Label>Category</Label>
          <select
            value={form.category_id}
            onChange={(e) => update('category_id', e.target.value)}
            className="w-full h-9 border rounded-md px-3 text-sm bg-white"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Price (USD)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
          />
        </div>
        <div>
          <Label>Stock</Label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update('stock', e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Description (English)</Label>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
        <div>
          <Label>Description (Vietnamese)</Label>
          <Textarea
            rows={4}
            value={form.description_vi}
            onChange={(e) => update('description_vi', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>{locale === 'vi' ? 'Hình ảnh (tối đa 5)' : 'Images (up to 5)'}</Label>
        <div className="mt-2">
          <ProductImageSlots
            slots={imageSlots}
            onChange={(slots) => {
              setImageSlots(slots)
              update('image_url', slots[0] ?? '')
            }}
            onUpload={handleUpload}
            uploadingIndex={uploadingIndex}
            isVi={locale === 'vi'}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="featured"
          checked={form.featured}
          onCheckedChange={(v) => update('featured', Boolean(v))}
        />
        <Label htmlFor="featured" className="cursor-pointer">
          Featured on homepage
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Link href={`/${locale}/admin/products`}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={saving || uploadingIndex !== null}>
          {saving ? 'Saving…' : mode === 'create' ? 'Create product' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
