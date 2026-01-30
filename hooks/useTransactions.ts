'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Transaction, FinanceSummary } from '@/types'

interface UseTransactionsOptions {
  limit?: number
  type?: 'income' | 'expense'
  startDate?: string
  endDate?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { limit = 50, type, startDate, endDate } = options

  useEffect(() => {
    fetchTransactions()
  }, [limit, type, startDate, endDate])

  async function fetchTransactions() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('saas_finance_transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (type) {
        query = query.eq('type', type)
      }

      if (startDate) {
        query = query.gte('date', startDate)
      }

      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        setError('Erro ao carregar transações')
        console.error(queryError)
      } else {
        setTransactions(data || [])
        
        // Calcula resumo
        if (data) {
          const totalIncome = data
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
          
          const totalExpense = data
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          setSummary({
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: totalIncome - totalExpense,
            transaction_count: data.length
          })
        }
      }
    } catch (err) {
      setError('Erro inesperado')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'client_id' | 'created_at'>) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('saas_finance_transactions')
      .insert(transaction)
      .select()
      .single()

    if (!error && data) {
      await fetchTransactions()
      return data
    }
    
    throw error
  }

  const deleteTransaction = async (id: number) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('saas_finance_transactions')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchTransactions()
    }
    
    return !error
  }

  return { 
    transactions, 
    summary,
    loading, 
    error, 
    refetch: fetchTransactions,
    addTransaction,
    deleteTransaction
  }
}

// Hook para resumo mensal
export function useMonthlyStats(year?: number, month?: number) {
  const [stats, setStats] = useState<FinanceSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const currentDate = new Date()
  const targetYear = year || currentDate.getFullYear()
  const targetMonth = month || currentDate.getMonth() + 1

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        
        const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('saas_finance_transactions')
          .select('type, amount')
          .gte('date', startDate)
          .lte('date', endDate)

        if (!error && data) {
          const totalIncome = data
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0)
          
          const totalExpense = data
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          setStats({
            total_income: totalIncome,
            total_expense: totalExpense,
            balance: totalIncome - totalExpense,
            transaction_count: data.length
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [targetYear, targetMonth])

  return { stats, loading }
}
