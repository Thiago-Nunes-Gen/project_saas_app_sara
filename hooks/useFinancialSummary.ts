import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export interface FinancialSummary {
    current_month: {
        income: number
        expense: number
        balance: number
    }
    last_month: {
        income: number
        expense: number
        balance: number
    }
}

export function useFinancialSummary() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSummary() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase.rpc('get_financial_summary')

                if (error) throw error

                setSummary(data as FinancialSummary)
            } catch (err: any) {
                console.error('Error fetching financial summary:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchSummary()
    }, [])

    return { summary, loading, error }
}

export interface ExpenseByCategory {
    category: string
    value: number
}

export function useExpensesByCategory() {
    const [data, setData] = useState<ExpenseByCategory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase.rpc('get_expenses_by_category')

                if (error) {
                    console.error('Error fetching expenses by category:', error)
                    return
                }

                if (data) {
                    // O RPC retorna um array de objetos { "category": "...", "value": ... }
                    // Precisamos garantir que os valores sejam números
                    const formattedData = data.map((item: any) => ({
                        category: item.category || 'Outros',
                        value: Number(item.value)
                    }))
                    setData(formattedData)
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading }
}

export interface DailyFlow {
    day: string
    income: number
    expense: number
}

export function useDailyFlow() {
    const [data, setData] = useState<DailyFlow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const supabase = createClient()
                const { data, error } = await supabase.rpc('get_daily_financial_flow')

                if (error) {
                    console.error('Error fetching daily flow:', error)
                    return
                }

                if (data) {
                    // Formata os dados para garantir números
                    const formattedData = data.map((item: any) => ({
                        day: item.day,
                        income: Number(item.income),
                        expense: Number(item.expense)
                    }))
                    setData(formattedData)
                }
            } catch (err) {
                console.error('Unexpected error:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return { data, loading }
}
