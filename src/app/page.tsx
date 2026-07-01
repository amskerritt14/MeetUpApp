import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <div className="max-w-md w-full">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--forest)' }}>
          See You Next Tuesday?
        </h1>
        <p className="text-lg mb-2" style={{ color: 'var(--stone-light)' }}>
          Stop the endless group chat. Find a time your whole crew can actually make it.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--stone-light)' }}>
          ✨ Pick your dates · Share the link · Let everyone vote · Done.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/login" className="btn-primary w-full">
            Log in
          </Link>
          <Link href="/signup" className="btn-secondary w-full">
            Create an account
          </Link>
        </div>
        <p className="mt-6 text-sm" style={{ color: 'var(--stone-light)' }}>
          Got a link from a friend?{' '}
          <span className="font-medium" style={{ color: 'var(--fern)' }}>
            Just open it — no account needed to vote.
          </span>
        </p>
      </div>
    </main>
  )
}
