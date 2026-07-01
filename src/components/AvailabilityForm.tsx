'use client'
import { useState, useMemo } from 'react'
import { eachDayOfInterval, parseISO, getDay, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

interface AvailabilityFormProps {
  event: {
    id: string
    name: string
    date_start: string
    date_end: string
    days_of_week: number[]
    time_windows: string[]
  }
  initialFirstName?: string
  userId?: string
}

export default function AvailabilityForm({ event, initialFirstName, userId }: AvailabilityFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName || '')
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const validDates = useMemo(() => {
    const allDates = eachDayOfInterval({
      start: parseISO(event.date_start),
      end: parseISO(event.date_end),
    })
    return allDates.filter(d => event.days_of_week.includes(getDay(d)))
  }, [event])

  function toggleWindow(dateStr: string, window: string) {
    setSelections(prev => {
      const current = prev[dateStr] || []
      const updated = current.includes(window)
        ? current.filter(w => w !== window)
        : [...current, window]
      return { ...prev, [dateStr]: updated }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) { setError('Please enter your name'); return }
    setLoading(true)
    setError(null)

    const rows = Object.entries(selections)
      .filter(([, windows]) => windows.length > 0)
      .map(([dateStr, windows]) => ({
        event_id: event.id,
        user_id: userId || null,
        first_name: firstName.trim(),
        available_date: dateStr,
        time_windows: windows,
      }))

    if (rows.length === 0) {
      setError('Please select at least one time slot')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('availability').insert(rows)
    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ background: '#e8f5e9', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
        <h3 style={{ color: '#1E3A28', fontSize: '1.4rem', fontWeight: '700' }}>Availability saved!</h3>
        <p style={{ color: '#555', marginTop: '8px' }}>Thanks {firstName}! Your responses have been recorded.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Your name</label>
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          disabled={!!initialFirstName}
          required
          placeholder="Enter your name"
          style={{ padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #ddd', fontSize: '1rem', width: '100%', maxWidth: '300px', boxSizing: 'border-box', background: initialFirstName ? '#f5f5f5' : 'white' }}
        />
      </div>

      {error && <div style={{ background: '#fdecea', color: '#c62828', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {validDates.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const checked = selections[dateStr] || []
          return (
            <div key={dateStr} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: '700', color: '#1E3A28', marginBottom: '12px', fontSize: '0.95rem' }}>
                {format(date, 'EEE, MMM d')}
              </div>
              {event.time_windows.map(w => {
                const isChecked = checked.includes(w)
                return (
                  <label key={w} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px', fontSize: '0.9rem', color: '#444' }}>
                    <div
                      onClick={() => toggleWindow(dateStr, w)}
                      style={{
                        width: '20px', height: '20px', borderRadius: '6px', border: '2px solid', flexShrink: 0,
                        borderColor: isChecked ? '#1E3A28' : '#ccc',
                        background: isChecked ? '#1E3A28' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}
                    >
                      {isChecked && <Check size={12} color="white" />}
                    </div>
                    <span onClick={() => toggleWindow(dateStr, w)}>{w}</span>
                  </label>
                )
              })}
            </div>
          )
        })}
      </div>

      <button type="submit" disabled={loading} style={{ padding: '14px 32px', background: '#1E3A28', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
        {loading ? 'Saving...' : 'Save my availability'}
      </button>
    </form>
  )
}
