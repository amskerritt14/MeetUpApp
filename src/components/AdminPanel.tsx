'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import CopyLinkButton from './CopyLinkButton'

interface Event {
  id: string
  name: string
  date_start: string
  date_end: string
  time_windows: string[]
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

type Tab = 'events' | 'users'

export default function AdminPanel({ events, availability, profiles }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('events')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [editWindows, setEditWindows] = useState<string[]>([])
  const [newWindow, setNewWindow] = useState('')
  const [saving, setSaving] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event and all its responses?')) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    setSelectedEvent(null)
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

  async function saveEventEdits() {
    if (!selectedEvent) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('events').update({
      name: editName,
      date_start: editStart,
      date_end: editEnd,
      time_windows: editWindows,
    }).eq('id', selectedEvent.id)
    router.refresh()
    setEditing(false)
    setSaving(false)
  }

  function addWindow() {
    const trimmed = newWindow.trim()
    if (trimmed && !editWindows.includes(trimmed)) {
      setEditWindows(prev => [...prev, trimmed])
    }
    setNewWindow('')
  }

  function removeWindow(w: string) {
    setEditWindows(prev => prev.filter(x => x !== w))
  }

  async function updateRole(userId: string, role: string) {
    const supabase = createClient()
    await supabase.from('profiles').update({ role }).eq('id', userId)
    router.refresh()
  }

  function openEvent(event: Event) {
    setSelectedEvent(event)
    setEditName(event.name)
    setEditStart(event.date_start)
    setEditEnd(event.date_end)
    setEditWindows(event.time_windows || [])
    setEditing(false)
  }

  // Event detail view
  if (selectedEvent) {
    const responses = availability.filter(a => a.event_id === selectedEvent.id)
    const shareUrl = `${appUrl}/event/${selectedEvent.token}`

    return (
      <div>
        <button
          onClick={() => setSelectedEvent(null)}
          className="text-sm mb-4 inline-flex items-center gap-1"
          style={{ color: 'var(--stone-light)' }}
        >
          ← All events
        </button>

        {/* Event info */}
        <div className="card mb-4">
          {editing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="admin-event-name" className="block text-xs font-medium mb-1" style={{ color: 'var(--stone-light)' }}>Event name</label>
                <input id="admin-event-name" value={editName} onChange={e => setEditName(e.target.value)} className="input" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="admin-start" className="block text-xs font-medium mb-1" style={{ color: 'var(--stone-light)' }}>From</label>
                  <input id="admin-start" type="date" value={editStart} onChange={e => setEditStart(e.target.value)} className="input" />
                </div>
                <div className="flex-1">
                  <label htmlFor="admin-end" className="block text-xs font-medium mb-1" style={{ color: 'var(--stone-light)' }}>To</label>
                  <input id="admin-end" type="date" value={editEnd} onChange={e => setEditEnd(e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--stone-light)' }}>Time windows</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editWindows.map(w => (
                    <span key={w} className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm" style={{ background: 'var(--cream)', border: '1px solid #e5e2dc' }}>
                      {w}
                      <button type="button" onClick={() => removeWindow(w)} className="ml-1 text-xs" style={{ color: 'var(--stone-light)' }}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWindow}
                    onChange={e => setNewWindow(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addWindow())}
                    className="input text-sm"
                    placeholder="Add time window…"
                  />
                  <button type="button" onClick={addWindow} className="btn-secondary text-sm px-3 py-1 whitespace-nowrap">Add</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveEventEdits} disabled={saving} className="btn-primary text-sm px-4 py-2">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-lg" style={{ color: 'var(--forest)' }}>{selectedEvent.name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  {selectedEvent.date_start} → {selectedEvent.date_end}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  {selectedEvent.time_windows?.join(', ')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                  by {selectedEvent.profiles?.first_name} ({selectedEvent.profiles?.email})
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: 'var(--cream)', color: 'var(--forest)', border: '1px solid #e5e2dc' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  disabled={deleting === selectedEvent.id}
                  className="text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                  style={{ background: '#fee2e2', color: '#991b1b' }}
                >
                  {deleting === selectedEvent.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share link */}
        <div className="card mb-4">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--stone-light)' }}>SHARE LINK</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 text-xs p-2 rounded-lg truncate" style={{ background: 'var(--cream)' }}>
              {shareUrl}
            </code>
            <CopyLinkButton url={shareUrl} />
          </div>
        </div>

        {/* Responses */}
        <div className="card">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--stone-light)' }}>
            RESPONSES ({responses.length})
          </p>
          {responses.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--stone-light)' }}>No responses yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {responses.map(a => (
                <div key={a.id} className="flex items-start justify-between gap-3 py-2 border-b last:border-0" style={{ borderColor: '#e5e2dc' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--forest)' }}>{a.first_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                      {a.available_date} · {a.time_windows.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteResponse(a.id)}
                    disabled={deleting === a.id}
                    className="text-xs px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0"
                    style={{ background: '#fee2e2', color: '#991b1b' }}
                  >
                    {deleting === a.id ? '…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main panel
  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'white', border: '1px solid #e5e2dc' }}>
        {(['events', 'users'] as Tab[]).map(t => (
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
          {events.map(e => {
            const responseCount = availability.filter(a => a.event_id === e.id).length
            return (
              <button
                key={e.id}
                onClick={() => openEvent(e)}
                className="card text-left flex items-center justify-between gap-3 w-full hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate" style={{ color: 'var(--forest)' }}>{e.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                    {e.date_start} → {e.date_end} · {responseCount} response{responseCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                    by {e.profiles?.first_name}
                  </p>
                </div>
                <span style={{ color: 'var(--stone-light)', fontSize: '1.2rem' }}>›</span>
              </button>
            )
          })}
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
