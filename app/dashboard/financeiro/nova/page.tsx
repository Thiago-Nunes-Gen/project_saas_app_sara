'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import { ArrowLeft, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  nome: string
  tipo: string
}

export default function NovaTransacaoPage() {
  const router = useRouter()
  const { client } = useClient()
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('saas_finance_categories')
      .select('id, nome, tipo')
      .eq('ativa', true)
      .order('ordem')
    
    if (data) {
      setCategories(data)
    }
  }

  // Categorias padrão caso não existam no banco
  const defaultCategories = {
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Compras', 'Outros'],
    income: ['Salário', 'Freelance', 'Vendas', 'Investimentos', 'Presente', 'Outros']
  }

  const filteredCategories = categories.filter(c => 
    c.tipo === type || c.tipo === 'ambos'
  )

  // Se não há categorias do banco, usa as padrão
  const displayCategories = filteredCategories.length > 0 
    ? filteredCategories.map(c => c.nome)
    : defaultCategories[type]

  const paymentMethods = [
    'Dinheiro',
    'Pix',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência',
    'Boleto'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!description.trim()) {
      setError('Digite uma descrição')
      setLoading(false)
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Digite um valor válido')
      setLoading(false)
      return
    }

    if (!client?.id) {
      setError('Erro: cliente não identificado. Tente recarregar a página.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('saas_finance_transactions')
        .insert({
          client_id: client.id,
          type,
          description: description.trim(),
          amount: parseFloat(amount),
          category: category || (type === 'income' ? 'Receita' : 'Outros'),
          date,
          payment_method: paymentMethod || null
        })

      if (insertError) {
        console.error('Erro ao criar transação:', insertError)
        throw insertError
      }

      router.push('/dashboard/financeiro')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar transação')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const amount = parseFloat(value) / 100
    setAmount(amount.toString())
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <Link href="/dashboard/financeiro" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar para financeiro
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Nova Transação</h1>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="mb-6">
          <label className="label">Tipo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <TrendingDown className="w-5 h-5" />
              <span className="font-medium">Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                type === 'income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Receita</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="label">Descrição</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Almoço no restaurante"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label htmlFor="amount" className="label">Valor</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
            <input
              id="amount"
              type="text"
              value={amount ? formatCurrency((parseFloat(amount) * 100).toString()) : ''}
              onChange={handleAmountChange}
              placeholder="0,00"
              className="input pl-12 text-xl font-semibold"
              disabled={loading}
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label htmlFor="category" className="label">Categoria</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
            disabled={loading}
          >
            <option value="">Selecione uma categoria</option>
            {displayCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="mb-6">
          <label htmlFor="date" className="label">Data</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            disabled={loading}
          />
        </div>

        {/* Payment Method (only for expenses) */}
        {type === 'expense' && (
          <div className="mb-6">
            <label htmlFor="paymentMethod" className="label">Forma de Pagamento</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
              disabled={loading}
            >
              <option value="">Selecione (opcional)</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Transação'
            )}
          </button>
          <Link href="/dashboard/financeiro" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
