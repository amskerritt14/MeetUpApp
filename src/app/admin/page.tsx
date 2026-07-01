import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: events } = await supabase
    .from('events')
    .select('*, profiles(first_name, email)')
    .order('created_at', { ascending: false })

  const { data: allAvailability } = await supabase
    .from('availability')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Nav userEmail={user.email} role={profile?.role} />
      <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--forest)' }}>Admin portal 🔐</h1>
          <p className="text-sm" style={{ color: 'var(--stone-light)' }}>Full visibility and control over all data</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--forest)' }}>{events?.length ?? 0}</p>
            <p className="text-xs" style={{ color: 'var(--stone-light)' }}>Events</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--forest)' }}>{allAvailability?.length ?? 0}</p>
            <p className="text-xs" style={{ color: 'var(--stone-light)' }}>Responses</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold" style={{ color: 'var(--forest)' }}>{allProfiles?.length ?? 0}</p>
            <p className="text-xs" style={{ color: 'var(--stone-light)' }}>Users</p>
          </div>
        </div>

        <AdminPanel
          events={events || []}
          availability={allAvailability || []}
          profiles={allProfiles || []}
        />
      </main>
    </div>
  )
}
