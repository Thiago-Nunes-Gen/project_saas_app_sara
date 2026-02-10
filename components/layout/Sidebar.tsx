'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  CalendarDays,
  FileText,
  DollarSign,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  FolderOpen,
  Menu,
  X,
  MessageCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: CalendarDays, label: 'Agenda', href: '/dashboard/agenda' },
  { icon: Bell, label: 'Lembretes', href: '/dashboard/lembretes' },
  { icon: FileText, label: 'Listas', href: '/dashboard/listas' },
  { icon: MessageSquare, label: 'Central de Memória', href: '/dashboard/conversas' },
  { icon: FolderOpen, label: 'Documentos', href: '/dashboard/documentos' },
  { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
  { icon: ClipboardList, label: 'Notas', href: '/dashboard/notas' },
  { icon: BarChart3, label: 'Relatórios', href: '/dashboard/relatorios' },
]

// Itens principais para bottom nav mobile (5 itens mais usados)
const mobileNavItems = [
  { icon: Home, label: 'Início', href: '/dashboard' },
  { icon: CalendarDays, label: 'Agenda', href: '/dashboard/agenda' },
  { icon: Bell, label: 'Lembretes', href: '/dashboard/lembretes' },
  { icon: DollarSign, label: 'Financeiro', href: '/dashboard/financeiro' },
  { icon: Menu, label: 'Menu', href: '#menu' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Desktop Sidebar - escondido no mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[72px] bg-white border-r border-sara-border flex-col items-center py-5 z-50">
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.slice(0, 3).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors
                  ${isActive ? 'text-primary-500' : 'text-gray-500'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </Link>
            )
          })}
          {/* WhatsApp SARA Button */}
          <a
            href="https://wa.me/5516992706593?text=Ol%C3%A1%20SARA!"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center flex-1 h-full text-green-500"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] mt-1">WhatsApp</span>
          </a>
          {/* Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-[60] animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Menu</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* All Nav Items */}
            <div className="p-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                      ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link
                  href="/dashboard/configuracoes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${pathname === '/dashboard/configuracoes' ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Configurações</span>
                </Link>

                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
