'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  X,
  FileText,
  Calendar,
  DollarSign,
  ListTodo,
  StickyNote
} from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  type: 'transaction' | 'reminder' | 'list' | 'note' | 'document'
  id: string
  title: string
  subtitle?: string
  url: string
}

export default function Header() {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [userName, setUserName] = useState('')
  const [userInitial, setUserInitial] = useState('U')

  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Carrega dados do usuário
  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: client } = await supabase
          .from('saas_clients')
          .select('name, apelido')
          .eq('auth_user_id', user.id)
          .single()

        if (client) {
          setUserName(client.apelido || client.name || 'Usuário')
          setUserInitial((client.apelido || client.name || 'U').charAt(0).toUpperCase())
        }
      }
    }
    loadUser()
  }, [])

  // Carrega notificações (lembretes de hoje)
  useEffect(() => {
    async function loadNotifications() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('saas_reminders')
        .select('id, title, remind_at')
        .eq('status', 'pending')
        .gte('remind_at', today)
        .lte('remind_at', today + 'T23:59:59')
        .order('remind_at', { ascending: true })
        .limit(5)

      if (data) setNotifications(data)
    }
    loadNotifications()
  }, [])

  // Busca global
  async function handleSearch(query: string) {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    const supabase = createClient()
    const results: SearchResult[] = []

    // Busca transações
    const { data: transactions } = await supabase
      .from('saas_finance_transactions')
      .select('id, description, category, type')
      .ilike('description', `%${query}%`)
      .limit(3)

    transactions?.forEach(t => {
      results.push({
        type: 'transaction',
        id: t.id.toString(),
        title: t.description,
        subtitle: `${t.type === 'income' ? 'Receita' : 'Despesa'} • ${t.category || 'Sem categoria'}`,
        url: '/dashboard/financeiro'
      })
    })

    // Busca lembretes
    const { data: reminders } = await supabase
      .from('saas_reminders')
      .select('id, title, status')
      .ilike('title', `%${query}%`)
      .limit(3)

    reminders?.forEach(r => {
      results.push({
        type: 'reminder',
        id: r.id.toString(),
        title: r.title,
        subtitle: r.status === 'pending' ? 'Pendente' : 'Concluído',
        url: '/dashboard/lembretes'
      })
    })

    // Busca listas
    const { data: lists } = await supabase
      .from('saas_lists')
      .select('id, title')
      .ilike('title', `%${query}%`)
      .limit(3)

    lists?.forEach(l => {
      results.push({
        type: 'list',
        id: l.id,
        title: l.title,
        subtitle: 'Lista',
        url: '/dashboard/listas'
      })
    })

    // Busca notas
    const { data: notes } = await supabase
      .from('saas_client_notes')
      .select('id, title')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(3)

    notes?.forEach(n => {
      results.push({
        type: 'note',
        id: n.id,
        title: n.title,
        subtitle: 'Nota',
        url: '/dashboard/notas'
      })
    })

    setSearchResults(results)
    setSearching(false)
  }

  // Logout
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <DollarSign className="w-4 h-4" />
      case 'reminder': return <Calendar className="w-4 h-4" />
      case 'list': return <ListTodo className="w-4 h-4" />
      case 'note': return <StickyNote className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search - Centralizado */}
      <div ref={searchRef} className="relative flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar transações, lembretes, listas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            spellCheck="true"
            lang="pt-BR"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && searchQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            {searching ? (
              <div className="p-4 text-center">
                <div className="spinner w-5 h-5 mx-auto" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Nenhum resultado encontrado
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                      {getIcon(result.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500">{result.subtitle}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href="/dashboard/lembretes"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-500">
                          Hoje às {new Date(notif.remind_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/lembretes"
                onClick={() => setShowNotifications(false)}
                className="block p-3 text-center text-sm text-blue-500 hover:bg-gray-50 border-t border-gray-100"
              >
                Ver todos os lembretes
              </Link>
            </div>
          )}
        </div>

        {/* Feedback */}
        <Link href="/dashboard/feedback" className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-500" />
        </Link>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {userInitial}
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Conta SARA</p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                </Link>
                <Link
                  href="/dashboard/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
              </div>
              <div className="p-1 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
