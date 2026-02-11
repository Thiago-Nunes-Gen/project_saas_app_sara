import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono, Caveat, Outfit } from 'next/font/google'
import './globals.css'

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' })
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
const handwriting = Caveat({ subsets: ['latin'], variable: '--font-handwriting' })
const display = Outfit({ subsets: ['latin'], variable: '--font-display' })

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
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable} ${mono.variable} ${handwriting.variable} ${display.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
