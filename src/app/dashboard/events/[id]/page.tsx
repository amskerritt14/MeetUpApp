import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import CopyLinkButton from '@/components/CopyLinkButton'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  if (!event) notFound()
  if (event.created_by !== user.id && profile?.role !== 'admin') redirect('/dashboard')

  const { data: responses } = await supabase
    .from('availability')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false })

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/event/${event.token}`

  return (
    <div className="min-h-screen flex flex-col">
      <Nav userEmail={user.email} role={profile?.role} />
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <Link href="/dashboard" className="text-sm mb-4 inline-block" style={{ color: 'var(--stone-light)' }}>← Dashboard</Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--forest)' }}>{event.name}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--stone-light)' }}>
          {event.date_start} → {event.date_end} · {responses?.length ?? 0} response{responses?.length !== 1 ? 's' : ''}
        </p>

        <div className="card mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--forest)' }}>Shareable link</p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 text-xs p-2 rounded-lg truncate" style={{ background: 'var(--cream)' }}>
              {shareUrl}
            </code>
            <CopyLinkButton url={shareUrl} />
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Link
            href={`/event/${event.token}/calendar`}
            className="btn-primary flex-1 text-center text-sm"
          >
            📅 View calendar
          </Link>
        </div>

        <div className="card">
          <h2 className="font-bold mb-4" style={{ color: 'var(--forest)' }}>
            Responses ({responses?.length ?? 0})
          </h2>
          {!responses || responses.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--stone-light)' }}>No responses yet. Share the link!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {responses.map(r => (
                <div key={r.id} className="flex items-start justify-between py-2 border-b last:border-0" style={{ borderColor: '#e5e2dc' }}>
                  <div>
                    <p className="font-medium text-sm">{r.first_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--stone-light)' }}>
                      {r.available_date} · {r.time_windows.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
