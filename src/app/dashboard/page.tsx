import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Nav userEmail={user.email} role={profile?.role} />
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--forest)' }}>
              Hey {profile?.first_name} 👋
            </h1>
            <p className="text-sm" style={{ color: 'var(--stone-light)' }}>Your hangout events</p>
          </div>
          <Link href="/dashboard/events/new" className="btn-primary text-sm">
            + New event
          </Link>
        </div>

        {!events || events.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="font-medium mb-1" style={{ color: 'var(--forest)' }}>No events yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--stone-light)' }}>Create your first event and share the link with your friends</p>
            <Link href="/dashboard/events/new" className="btn-primary">
              Create an event
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(event => (
              <div key={event.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--forest)' }}>{event.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                    {event.date_start} → {event.date_end}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--cream)', color: 'var(--forest)' }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
