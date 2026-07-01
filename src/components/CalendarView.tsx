'use client'
import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO,
  addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Recommendation from './Recommendation'

interface AvailabilityEntry {
  first_name: string
  available_date: string
  time_windows: string[]
}

interface CalendarViewProps {
  event: {
    id: string
    name: string
    date_start: string
    date_end: string
    days_of_week: number[]
    time_windows: string[]
  }
  availability: AvailabilityEntry[]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarView({ event, availability }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => parseISO(event.date_start))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const byDate = useMemo(() => {
    const map: Record<string, AvailabilityEntry[]> = {}
    availability.forEach(a => {
      if (!map[a.available_date]) map[a.available_date] = []
      map[a.available_date].push(a)
    })
    return map
  }, [availability])

  const totalRespondents = useMemo(() =>
    new Set(availability.map(a => a.first_name)).size
  , [availability])

  function isEventDay(date: Date) {
    return event.days_of_week.includes(getDay(date))
  }

  function navigate(dir: 1 | -1) {
    if (view === 'month') setCurrentDate(d => dir === 1 ? addMonths(d, 1) : subMonths(d, 1))
    if (view === 'week') setCurrentDate(d => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1))
    if (view === 'day') setCurrentDate(d => dir === 1 ? addDays(d, 1) : subDays(d, 1))
  }

  function navLabel() {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
      const we = endOfWeek(currentDate, { weekStartsOn: 0 })
      return `${format(ws, 'd MMM')} – ${format(we, 'd MMM yyyy')}`
    }
    return format(currentDate, 'EEEE, d MMMM yyyy')
  }

  // Shared day cell used in month + week views
  function DayCell({ date, tall = true }: { date: Date; tall?: boolean }) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const inMonth = view === 'week' ? true : isSameMonth(date, currentDate)
    const isEvent = isEventDay(date)
    const entries = byDate[dateStr] || []
    const uniqueHere = new Set(entries.map(e => e.first_name)).size
    const isSelected = selectedDate === dateStr

    function handleClick() {
      if (isEvent && inMonth) setSelectedDate(isSelected ? null : dateStr)
    }

    return (
      <div
        onClick={handleClick}
        style={{
          minHeight: tall ? '70px' : '56px',
          padding: '6px',
          borderRadius: '10px',
          background: isSelected ? '#1E3A28' : isEvent && inMonth ? 'white' : '#f0f0f0',
          color: isSelected ? 'white' : inMonth ? '#333' : '#bbb',
          cursor: isEvent && inMonth ? 'pointer' : 'default',
          boxShadow: isSelected ? '0 2px 8px rgba(30,58,40,0.3)' : isEvent && inMonth ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.15s',
          border: isSelected ? '2px solid #C8A87A' : '2px solid transparent',
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
          {view === 'week' ? (
            <span>{DAY_NAMES[getDay(date)]} {format(date, 'd')}</span>
          ) : (
            format(date, 'd')
          )}
        </div>
        {isEvent && inMonth && (
          <div style={{
            fontSize: '0.65rem',
            background: isSelected ? 'rgba(200,168,122,0.3)' : uniqueHere > 0 ? '#e8f5e9' : '#f5f5f5',
            color: isSelected ? '#C8A87A' : uniqueHere > 0 ? '#2e7d32' : '#999',
            borderRadius: '6px',
            padding: '2px 4px',
            fontWeight: '600',
          }}>
            {uniqueHere > 0 ? `${uniqueHere}/${totalRespondents} free` : 'No responses'}
          </div>
        )}
      </div>
    )
  }

  // Pre-compute days for month and week views at the top level (to avoid hook-in-condition issues)
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    })
  }, [currentDate])

  const weekDays = useMemo(() => {
    const ws = startOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: ws, end: endOfWeek(ws, { weekStartsOn: 0 }) })
  }, [currentDate])

  // Month grid
  function MonthGrid() {
    const days = monthDays

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#888', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map(date => <DayCell key={format(date, 'yyyy-MM-dd')} date={date} />)}
        </div>
      </>
    )
  }

  // Week view — horizontal grid, one column per day, names listed inside
  function WeekGrid() {
    const days = weekDays

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const isEvent = isEventDay(date)
          const entries = byDate[dateStr] || []
          const uniqueNames = [...new Set(entries.map(e => e.first_name))]

          return (
            <div
              key={dateStr}
              style={{
                background: isEvent ? 'white' : '#f0f0f0',
                borderRadius: '10px',
                padding: '8px 6px',
                boxShadow: isEvent ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                minHeight: '120px',
              }}
            >
              <p style={{ fontSize: '0.7rem', fontWeight: '700', color: isEvent ? '#1E3A28' : '#bbb', marginBottom: '2px' }}>
                {format(date, 'EEE')}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px' }}>{format(date, 'd')}</p>

              {isEvent && (
                <>
                  <div style={{
                    fontSize: '0.6rem', fontWeight: '700', padding: '2px 4px', borderRadius: '6px', marginBottom: '6px',
                    background: uniqueNames.length > 0 ? '#e8f5e9' : '#f5f5f5',
                    color: uniqueNames.length > 0 ? '#2e7d32' : '#999',
                  }}>
                    {uniqueNames.length}/{totalRespondents}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {uniqueNames.map(name => {
                      const windows = [...new Set(entries.filter(e => e.first_name === name).flatMap(e => e.time_windows))]
                      return (
                        <div key={name} title={windows.join(', ')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#1E3A28', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.6rem', flexShrink: 0 }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <p style={{ fontSize: '0.65rem', color: '#333', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Single day
  function DayDetail() {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const entries = byDate[dateStr] || []
    const isEvent = isEventDay(currentDate)

    if (!isEvent) {
      return (
        <div style={{ background: '#f5f5f5', borderRadius: '14px', padding: '24px', textAlign: 'center', color: '#888' }}>
          Not an event day.
        </div>
      )
    }

    if (entries.length === 0) {
      return (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', textAlign: 'center', color: '#888', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          No responses yet for this day.
        </div>
      )
    }

    const uniqueNames = [...new Set(entries.map(e => e.first_name))]

    return (
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ fontWeight: '700', color: '#1E3A28', marginBottom: '4px' }}>
          {uniqueNames.length}/{totalRespondents} free
        </p>
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '16px' }}>{uniqueNames.join(', ')}</p>
        {event.time_windows.map(w => {
          const free = [...new Set(entries.filter(e => e.time_windows.includes(w)).map(e => e.first_name))]
          return (
            <div key={w} style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{w}</p>
              {free.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#bbb' }}>None</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {free.map(name => (
                    <span key={name} style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '9999px', background: '#e8f5e9', color: '#1E3A28', fontWeight: '600' }}>
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Shared selected date detail panel (month + week views)
  const selectedEntries = selectedDate ? (byDate[selectedDate] || []) : []
  const uniqueOnSelected = selectedDate ? new Set(selectedEntries.map(e => e.first_name)).size : 0

  return (
    <div>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['month', 'week', 'day'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: view === v ? '700' : '400',
              background: view === v ? '#1E3A28' : '#e8e8e8',
              color: view === v ? 'white' : '#333',
              fontSize: '0.9rem',
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
          <ChevronLeft size={20} color="#1E3A28" />
        </button>
        <h3 style={{ fontWeight: '700', color: '#1E3A28', fontSize: '1rem' }}>{navLabel()}</h3>
        <button onClick={() => navigate(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
          <ChevronRight size={20} color="#1E3A28" />
        </button>
      </div>

      {/* Views */}
      {view === 'month' && MonthGrid()}
      {view === 'week' && WeekGrid()}
      {view === 'day' && DayDetail()}

      {/* Selected date detail (month + week only) */}
      {view !== 'day' && selectedDate && (
        <div style={{ marginTop: '24px', background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: '700', color: '#1E3A28', fontSize: '1rem' }}>
              {format(parseISO(selectedDate), 'EEEE, d MMMM')} — {uniqueOnSelected}/{totalRespondents} free
            </h4>
            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.1rem' }}>✕</button>
          </div>
          {selectedEntries.length === 0 ? (
            <p style={{ color: '#888' }}>No responses yet for this day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedEntries.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8f8f8', borderRadius: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1E3A28', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem', flexShrink: 0 }}>
                    {entry.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>{entry.first_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{entry.time_windows.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <Recommendation availability={availability} />
      </div>
    </div>
  )
}
