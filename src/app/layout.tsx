import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'See You Next Tuesday?',
  description: 'Stop the endless group chat. Find a time that actually works.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: '#F6F4F0', color: '#2A2820' }}>
        {children}
      </body>
    </html>
  )
}
