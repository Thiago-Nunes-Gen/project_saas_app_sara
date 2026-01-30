'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Calendar,
  CalendarDays,
  FileText,
  MessageSquare,
  FolderOpen,
  DollarSign,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const navItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: CalendarDays, label: 'Agenda', href: '/dashboard/agenda' },
  { icon: Bell, label: 'Lembretes', href: '/dashboard/lembretes' },
  { icon: FileText, label: 'Listas', href: '/dashboard/listas' },
  { icon: MessageSquare, label: 'Conversas', href: '/dashboard/conversas' },
  { icon: FolderOpen, label: 'Documentos', href: '/dashboard/documentos' },
  { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
  { icon: ClipboardList, label: 'Notas', href: '/dashboard/notas' },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/relatorios' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] bg-white border-r border-sara-border flex flex-col items-center py-5 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg flex items-center justify-center mb-8">
        <span className="text-white font-bold text-lg">S</span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tooltip-trigger relative w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-sara-light hover:bg-gray-100 hover:text-sara-text'
                }`}
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="tooltip">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/configuracoes"
          className={`tooltip-trigger relative w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200
            ${pathname === '/dashboard/configuracoes'
              ? 'bg-primary-50 text-primary-500'
              : 'text-sara-light hover:bg-gray-100 hover:text-sara-text'
            }`}
        >
          <Settings className="w-[22px] h-[22px]" />
          <span className="tooltip">Configurações</span>
        </Link>

        <button
          onClick={handleLogout}
          className="tooltip-trigger relative w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 text-sara-light hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="w-[22px] h-[22px]" />
          <span className="tooltip">Sair</span>
        </button>
      </div>
    </aside>
  )
}
