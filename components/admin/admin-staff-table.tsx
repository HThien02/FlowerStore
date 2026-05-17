'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'user' | 'staff' | 'admin'
  created_at: string
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-rose-100 text-rose-700',
  staff: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-700',
}

export default function AdminStaffTable() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'admin' | 'staff' | 'user'>('all')
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('role', filter)
      if (search.trim()) params.set('q', search.trim())
      const res = await adminFetch(`/api/admin/users${params.toString() ? `?${params}` : ''}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setRows((body.users ?? []) as UserRow[])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const updateRole = async (id: string, role: UserRow['role']) => {
    setSavingId(id)
    try {
      const res = await adminFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      toast.success('Role updated')
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-44">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Full name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Change role</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-10">
                  No users.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 text-gray-600">{u.full_name ?? '—'}</td>
                <td className="px-4 py-2 text-gray-600">{u.phone ?? '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role] ?? ''}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <div className="w-32">
                      <Select
                        value={u.role}
                        onValueChange={(v) => updateRole(u.id, v as UserRow['role'])}
                        disabled={savingId === u.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="staff">staff</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
