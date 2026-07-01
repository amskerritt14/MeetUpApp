'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_DAYS = [4, 5, 6] // Thu, Fri, Sat
const DEFAULT_WINDOWS = ['Morning', 'Afternoon', 'Evening']

export default function NewEventPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(DEFAULT_DAYS)
  const [timeWindows, setTimeWindows] = useState<string[]>(DEFAULT_WINDOWS)
  const [newWindow, setNewWindow] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleDay(day: number) {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  function addWindow() {
    const trimmed = newWindow.trim()
    if (trimmed && !timeWindows.includes(trimmed)) {
      setTimeWindows(prev => [...prev, trimmed])
    }
    setNewWindow('')
  }

  function removeWindow(w: string) {
    setTimeWindows(prev => prev.filter(x => x !== w))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (daysOfWeek.length === 0) { setError('Pick at least one day of the week'); return }
    if (timeWindows.length === 0) { setError('Add at least one time window'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: err } = await supabase
      .from('events')
      .insert({
        name,
        date_start: dateStart,
        date_end: dateEnd,
        days_of_week: daysOfWeek,
        time_windows: timeWindows,
        created_by: user.id,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/events/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #e5e2dc', background: 'white' }}>
        <Link href="/dashboard" className="text-sm" style={{ color: 'var(--stone-light)' }}>← Back</Link>
        <span className="font-bold" style={{ color: 'var(--forest)' }}>New event</span>
      </nav>
      <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="card flex flex-col gap-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--forest)' }}>Event details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Event name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="Summer hangout 🌞"
                required
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">From</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">To</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="card flex flex-col gap-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--forest)' }}>Which days?</h2>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: daysOfWeek.includes(i) ? 'var(--forest)' : 'var(--cream)',
                    color: daysOfWeek.includes(i) ? 'white' : 'var(--stone)',
                    border: '2px solid',
                    borderColor: daysOfWeek.includes(i) ? 'var(--forest)' : '#e5e2dc',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card flex flex-col gap-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--forest)' }}>Time windows</h2>
            <div className="flex flex-wrap gap-2">
              {timeWindows.map(w => (
                <span
                  key={w}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--cream)', border: '2px solid #e5e2dc' }}
                >
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
                className="input"
                placeholder="Add custom window…"
              />
              <button type="button" onClick={addWindow} className="btn-secondary px-4 py-2 text-sm whitespace-nowrap">
                Add
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create event 🎉'}
          </button>
        </form>
      </main>
    </div>
  )
}
