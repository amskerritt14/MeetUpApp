'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format, eachDayOfInterval, parseISO, getDay } from 'date-fns'

interface Event {
  id: string
  name: string
  date_start: string
  date_end: string
  days_of_week: number[]
  time_windows: string[]
  token: string
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [firstName, setFirstName] = useState('')
  const [step, setStep] = useState<'landing' | 'form' | 'done'>('landing')
  const [selectedDates, setSelectedDates] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('token', token)
        .single()
      setEvent(eventData)

      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u ? { id: u.id, email: u.email } : null)

      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', u.id)
          .single()
        if (profile?.first_name) setFirstName(profile.first_name)
      }

      setLoading(false)
    }
    load()
  }, [token])

  function getEligibleDays(): Date[] {
    if (!event) return []
    const days = eachDayOfInterval({
      start: parseISO(event.date_start),
      end: parseISO(event.date_end),
    })
    return days.filter(d => event.days_of_week.includes(getDay(d)))
  }

  function toggleWindow(dateStr: string, window: string) {
    setSelectedDates(prev => {
      const current = prev[dateStr] || []
      const updated = current.includes(window)
        ? current.filter(w => w !== window)
        : [...current, window]
      return { ...prev, [dateStr]: updated }
    })
  }

  function toggleDate(dateStr: string) {
    setSelectedDates(prev => {
      if (prev[dateStr] !== undefined) {
        const { [dateStr]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [dateStr]: [] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const activeDates = Object.entries(selectedDates).filter(([, windows]) => windows.length > 0)
    if (activeDates.length === 0) { setError('Select at least one day with a time window'); return }
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()

    const rows = activeDates.map(([date, windows]) => ({
      event_id: event!.id,
      user_id: u?.id ?? null,
      first_name: firstName.trim(),
      available_date: date,
      time_windows: windows,
    }))

    const { error: err } = await supabase.from('availability').insert(rows)
    if (err) { setError(err.message); setSubmitting(false) }
    else setStep('done')
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--stone-light)' }}>Loading…</p>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--forest)' }}>Event not found</h1>
        <p style={{ color: 'var(--stone-light)' }}>That link doesn't look right.</p>
      </main>
    )
  }

  if (step === 'done') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="card max-w-sm w-full">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--forest)' }}>You&apos;re in!</h1>
          <p className="mb-4" style={{ color: 'var(--stone-light)' }}>
            Thanks {firstName}! Your availability for <strong>{event.name}</strong> has been saved.
          </p>
          {user ? (
            <Link href={`/event/${token}/calendar`} className="btn-primary w-full">
              View the calendar 📅
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="btn-primary w-full">Log in to view results</Link>
              <Link href="/signup" className="btn-secondary w-full">Create an account</Link>
            </div>
          )}
        </div>
      </main>
    )
  }

  if (step === 'landing') {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-4xl mb-3">📅</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--forest)' }}>{event.name}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--stone-light)' }}>
            Let everyone know when you&apos;re free!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep('form')}
              className="btn-primary w-full"
            >
              {user ? `Continue as ${firstName || 'me'} 👋` : 'Continue as guest'}
            </button>
            {!user && (
              <>
                <Link href={`/login?redirect=/event/${token}`} className="btn-secondary w-full">
                  Log in first
                </Link>
                <p className="text-xs" style={{ color: 'var(--stone-light)' }}>
                  Logged-in users can view everyone&apos;s availability
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    )
  }

  const eligibleDays = getEligibleDays()

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e2dc', background: 'white' }}>
        <span className="font-bold" style={{ color: 'var(--forest)' }}>📅 {event.name}</span>
        {user ? (
          <Link href={`/event/${token}/calendar`} className="text-sm" style={{ color: 'var(--fern)' }}>View calendar →</Link>
        ) : (
          <Link href="/login" className="text-sm" style={{ color: 'var(--fern)' }}>Log in</Link>
        )}
      </nav>
      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--forest)' }}>When are you free?</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--stone-light)' }}>
          Tap a day to select it, then choose your time windows.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!user && (
            <div className="card">
              <label className="block text-sm font-medium mb-2">Your first name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input"
                placeholder="Alex"
                required
              />
            </div>
          )}

          {eligibleDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isSelected = dateStr in selectedDates
            const selectedWindows = selectedDates[dateStr] || []

            return (
              <div
                key={dateStr}
                className="card"
                style={{ borderLeft: isSelected ? '4px solid var(--forest)' : '4px solid transparent' }}
              >
                <button
                  type="button"
                  onClick={() => toggleDate(dateStr)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-semibold" style={{ color: 'var(--forest)' }}>
                      {format(day, 'EEEE')}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--stone-light)' }}>
                      {format(day, 'd MMMM yyyy')}
                    </p>
                  </div>
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: isSelected ? 'var(--forest)' : 'var(--cream)',
                      color: isSelected ? 'white' : 'var(--stone-light)',
                      border: '2px solid',
                      borderColor: isSelected ? 'var(--forest)' : '#e5e2dc',
                    }}
                  >
                    {isSelected ? '✓' : '+'}
                  </span>
                </button>

                {isSelected && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #e5e2dc' }}>
                    {event.time_windows.map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleWindow(dateStr, w)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: selectedWindows.includes(w) ? 'var(--sand)' : 'var(--cream)',
                          color: selectedWindows.includes(w) ? 'var(--stone)' : 'var(--stone-light)',
                          border: '2px solid',
                          borderColor: selectedWindows.includes(w) ? 'var(--sand)' : '#e5e2dc',
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Saving…' : "I'm in! 🙌"}
          </button>
        </form>
      </div>
    </main>
  )
}
