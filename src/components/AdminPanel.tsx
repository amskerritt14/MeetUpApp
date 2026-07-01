'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  date_start: string
  date_end: string
  token: string
  created_at: string
  profiles?: { first_name: string; email: string }
}

interface AvailabilityRow {
  id: string
  event_id: string
  first_name: string
  available_date: string
  time_windows: string[]
  created_at: string
}

interface Profile {
  id: string
  first_name: string
  email: string
  role: string
  created_at: string
}

interface Props {
  events: Event[]
  availability: AvailabilityRow[]
  profiles: Profile[]
}

type Tab = 'events' | 'responses' | 'users'

export default function AdminPanel({ events, availability, profiles }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('events')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event and all its responses?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
  }

  async function deleteResponse(id: string) {
    if (!confirm('Delete this response?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', id)
    router.refresh()
    setDeleting(null)
  }

  async function updateRole(userId: string, role: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ role }).eq('id', userId)
    router.refresh()
  }

  const tabs: Tab[] = ['events', 'responses', 'users']

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'white', border: '1px solid #e5e2dc' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: tab === t ? 'var(--forest)' : 'transparent',
              color: tab === t ? 'white' : 'var(--stone-light)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="flex flex-col gap-3">
          {events.length === 0 && <p className="text-sm card" style={{ color: 'var(--stone-light)' }}>No events yet.</p>}
          {events.map(e => (
            <div key={e.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate" style={{ color: 'var(--forest)' }}>{e.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  {e.date_start} → {e.date_end}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  by {e.profiles?.first_name} ({e.profiles?.email})
                </p>
              </div>
              <button
                onClick={() => deleteEvent(e.id)}
                disabled={deleting === e.id}
                className="text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                style={{ background: '#fee2e2', color: '#991b1b' }}
              >
                {deleting === e.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'responses' && (
        <div className="flex flex-col gap-3">
          {availability.length === 0 && <p className="text-sm card" style={{ color: 'var(--stone-light)' }}>No responses yet.</p>}
          {availability.map(a => (
            <div key={a.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold" style={{ color: 'var(--forest)' }}>{a.first_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  {a.available_date} · {a.time_windows.join(', ')}
                </p>
              </div>
              <button
                onClick={() => deleteResponse(a.id)}
                disabled={deleting === a.id}
                className="text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                style={{ background: '#fee2e2', color: '#991b1b' }}
              >
                {deleting === a.id ? '…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="flex flex-col gap-3">
          {profiles.length === 0 && <p className="text-sm card" style={{ color: 'var(--stone-light)' }}>No users yet.</p>}
          {profiles.map(p => (
            <div key={p.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold" style={{ color: 'var(--forest)' }}>{p.first_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>{p.email}</p>
              </div>
              <select
                value={p.role}
                onChange={e => updateRole(p.id, e.target.value)}
                className="text-xs rounded-lg px-2 py-1"
                style={{ border: '1px solid #e5e2dc', background: 'var(--cream)' }}
              >
                <option value="friend">Friend</option>
                <option value="organiser">Organiser</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
