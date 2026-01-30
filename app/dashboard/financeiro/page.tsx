'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { 
  Plus, 
  Search, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  description: string
  amount: number
  category: string
  payment_method: string | null
  date: string
  created_at: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [hideValues, setHideValues] = useState(false)

  // Datas do mês atual
  const now = new Date()
  const startDate = format(startOfMonth(now), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(now), 'yyyy-MM-dd')

  useEffect(() => {
    fetchTransactions()
  }, [filterType])

  async function fetchTransactions() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('saas_finance_transactions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    const { data, error } = await query

    if (!error && data) {
      setTransactions(data)
    }
    setLoading(false)
  }

  async function deleteTransaction(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    const supabase = createClient()
    await supabase
      .from('saas_finance_transactions')
      .delete()
      .eq('id', id)
    
    fetchTransactions()
  }

  const formatCurrency = (value: number) => {
    if (hideValues) return 'R$ •••••'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular totais do mês
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  const currentMonth = format(now, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 capitalize">{currentMonth}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideValues(!hideValues)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          <Link href="/dashboard/financeiro/nova" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Transação
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 bg-green-50 border-green-100">
          <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
            <TrendingUp className="w-4 h-4" />
            Receitas
          </div>
          <p className="text-2xl font-semibold text-green-700">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        
        <div className="card p-5 bg-red-50 border-red-100">
          <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
            <TrendingDown className="w-4 h-4" />
            Despesas
          </div>
          <p className="text-2xl font-semibold text-red-700">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        
        <div className="card p-5 bg-blue-50 border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
            <DollarSign className="w-4 h-4" />
            Saldo do Mês
          </div>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              spellCheck="true"
              lang="pt-BR"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'income' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Receitas
            </button>
            <button 
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'expense' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Despesas
            </button>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Forma Pgto</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Valor</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Nenhuma transação neste mês
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(parseISO(transaction.date), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' 
                            ? <TrendingUp className="w-4 h-4" />
                            : <TrendingDown className="w-4 h-4" />
                          }
                        </div>
                        <span className="text-sm font-medium text-gray-900">{transaction.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{transaction.category || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{transaction.payment_method || '-'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTransaction(transaction.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
