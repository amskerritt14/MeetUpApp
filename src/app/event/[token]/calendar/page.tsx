import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import CalendarView from '@/components/CalendarView'
import Recommendation from '@/components/Recommendation'

export default async function CalendarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/event/${token}/calendar`)
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
  if (!event) notFound()

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('event_id', event.id)
    .order('available_date', { ascending: true })

  const uniqueRespondents = new Set((availability || []).map((a: { first_name: string }) => a.first_name)).size

  return (
    <div className="min-h-screen flex flex-col">
      <Nav userEmail={user.email} role={profile?.role} />
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <Link href={`/event/${token}`} className="text-sm mb-3 inline-block" style={{ color: 'var(--stone-light)' }}>
          ← Back to event
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--forest)' }}>{event.name}</h1>
        <p className="text-sm mb-5" style={{ color: 'var(--stone-light)' }}>
          {uniqueRespondents} friend{uniqueRespondents !== 1 ? 's' : ''} responded
        </p>

        <Recommendation availability={availability || []} event={event} />

        <CalendarView
          availability={availability || []}
          event={event}
          dateStart={event.date_start}
          dateEnd={event.date_end}
        />
      </main>
    </div>
  )
}
