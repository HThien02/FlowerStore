import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'

const BUCKET = 'product-images'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-').slice(-80)
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 })
    }

    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const baseName = safeName(file.name.replace(/\.[^.]+$/, '') || 'image')
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${baseName}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: upErr } = await guard.admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (upErr) throw upErr

    const { data: pub } = guard.admin.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({ url: pub.publicUrl, path })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    console.error('[admin/upload]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
