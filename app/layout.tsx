import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SARA - Portal do Cliente',
  description: 'Gerencie suas finanças, lembretes e muito mais com a SARA',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
