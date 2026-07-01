'use client'

import { useState } from 'react'
import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths,
  getDay, eachWeekOfInterval,
} from 'date-fns'

interface AvailabilityRow {
  first_name: string
  available_date: string
  time_windows: string[]
}

interface Event {
  date_start: string
  date_end: string
  days_of_week: number[]
  time_windows: string[]
}

interface Props {
  availability: AvailabilityRow[]
  event: Event
  dateStart: string
  dateEnd: string
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarView({ availability, event }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(() => parseISO(event.date_start))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const countsByDate: Record<string, string[]> = {}
  const windowsByDate: Record<string, Record<string, string[]>> = {}

  for (const row of availability) {
    if (!countsByDate[row.available_date]) countsByDate[row.available_date] = []
    if (!countsByDate[row.available_date].includes(row.first_name)) {
      countsByDate[row.available_date].push(row.first_name)
    }
    if (!windowsByDate[row.available_date]) windowsByDate[row.available_date] = {}
    for (const w of row.time_windows) {
      if (!windowsByDate[row.available_date][w]) windowsByDate[row.available_date][w] = []
      if (!windowsByDate[row.available_date][w].includes(row.first_name)) {
        windowsByDate[row.available_date][w].push(row.first_name)
      }
    }
  }

  const totalRespondents = new Set(availability.map(a => a.first_name)).size

  function isEligibleDay(date: Date) {
    return event.days_of_week.includes(getDay(date))
  }

  function DayCell({ date, mini = false }: { date: Date; mini?: boolean }) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = countsByDate[dateStr]?.length ?? 0
    const isInMonth = isSameMonth(date, currentDate)
    const isSelected = selectedDate === dateStr
    const eligible = isEligibleDay(date)

    return (
      <button
        onClick={() => eligible && count > 0 ? setSelectedDate(isSelected ? null : dateStr) : null}
        className="w-full flex flex-col items-center py-1 rounded-lg transition-colors"
        style={{
          opacity: isInMonth ? 1 : 0.3,
          background: isSelected ? 'var(--forest)' : eligible && count > 0 ? '#f0f7f3' : 'transparent',
          cursor: eligible && count > 0 ? 'pointer' : 'default',
          minHeight: mini ? undefined : '4rem',
        }}
      >
        <span
          className="text-xs font-medium mb-0.5"
          style={{ color: isSelected ? 'white' : eligible ? 'var(--forest)' : 'var(--stone-light)' }}
        >
          {format(date, 'd')}
        </span>
        {eligible && count > 0 && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: isSelected ? 'var(--sand)' : 'var(--forest)',
              color: isSelected ? 'var(--stone)' : 'white',
              fontSize: '0.6rem',
            }}
          >
            {count}/{totalRespondents}
          </span>
        )}
      </button>
    )
  }

  function MonthView() {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const weeks = eachWeekOfInterval(
      { start: startOfWeek(monthStart), end: endOfWeek(monthEnd) },
      { weekStartsOn: 0 }
    )

    return (
      <div>
        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-medium py-1" style={{ color: 'var(--stone-light)' }}>{d}</div>
          ))}
        </div>
        {weeks.map((weekStart, wi) => {
          const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 0 }) })
          return (
            <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
              {days.map((day, di) => <DayCell key={di} date={day} />)}
            </div>
          )
        })}
      </div>
    )
  }

  function WeekView() {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 0 }) })
    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <p className="text-xs mb-1" style={{ color: 'var(--stone-light)' }}>{format(day, 'EEE')}</p>
            <DayCell date={day} mini />
          </div>
        ))}
      </div>
    )
  }

  function DayView() {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const names = countsByDate[dateStr] || []
    const windows = windowsByDate[dateStr] || {}

    return (
      <div className="card">
        <p className="font-bold mb-3" style={{ color: 'var(--forest)' }}>
          {format(currentDate, 'EEEE, d MMMM yyyy')}
        </p>
        {names.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--stone-light)' }}>Nobody marked this day yet.</p>
        ) : (
          <>
            <p className="text-sm mb-3" style={{ color: 'var(--stone-light)' }}>
              <strong style={{ color: 'var(--fern)' }}>{names.length}</strong> of {totalRespondents} free: {names.join(', ')}
            </p>
            {event.time_windows.map(w => (
              <div key={w} className="mb-2">
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--stone-light)' }}>{w}</p>
                <p className="text-sm" style={{ color: 'var(--stone)' }}>
                  {windows[w]?.join(', ') || <span style={{ color: 'var(--stone-light)' }}>None</span>}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  const selectedDetails = selectedDate ? {
    names: countsByDate[selectedDate] || [],
    windows: windowsByDate[selectedDate] || {},
  } : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => viewMode === 'month' ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(new Date(currentDate.getTime() - (viewMode === 'week' ? 7 : 1) * 86400000))}
          className="p-2 rounded-lg"
          style={{ background: 'white', border: '1px solid #e5e2dc' }}
        >
          ‹
        </button>
        <div className="text-center">
          <p className="font-bold" style={{ color: 'var(--forest)' }}>
            {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') :
             viewMode === 'week' ? `Week of ${format(startOfWeek(currentDate), 'd MMM')}` :
             format(currentDate, 'd MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => viewMode === 'month' ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(new Date(currentDate.getTime() + (viewMode === 'week' ? 7 : 1) * 86400000))}
          className="p-2 rounded-lg"
          style={{ background: 'white', border: '1px solid #e5e2dc' }}
        >
          ›
        </button>
      </div>

      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'white', border: '1px solid #e5e2dc' }}>
        {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: viewMode === mode ? 'var(--forest)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--stone-light)',
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="card mb-4">
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
      </div>

      {selectedDetails && selectedDate && (
        <div className="card" style={{ borderLeft: '4px solid var(--fern)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold" style={{ color: 'var(--forest)' }}>
              {format(parseISO(selectedDate), 'EEEE, d MMMM')}
            </p>
            <button onClick={() => setSelectedDate(null)} style={{ color: 'var(--stone-light)' }}>✕</button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--stone-light)' }}>
            <strong style={{ color: 'var(--fern)' }}>{selectedDetails.names.length}</strong> of {totalRespondents} free:{' '}
            {selectedDetails.names.join(', ')}
          </p>
          {event.time_windows.map(w => (
            <div key={w} className="mb-2">
              <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--stone-light)' }}>{w}</p>
              <div className="flex flex-wrap gap-1">
                {selectedDetails.windows[w]?.length > 0
                  ? selectedDetails.windows[w].map(name => (
                      <span key={name} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cream)', color: 'var(--stone)' }}>
                        {name}
                      </span>
                    ))
                  : <span className="text-xs" style={{ color: 'var(--stone-light)' }}>None</span>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
