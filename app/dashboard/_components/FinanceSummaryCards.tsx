'use client'

import React from 'react'
import { useFinancialSummary } from '@/hooks/useFinancialSummary'
import { TrendingUp, TrendingDown, DollarSign, ArrowUp, ArrowDown, Activity } from 'lucide-react'

export function FinanceSummaryCards() {
    const { summary, loading } = useFinancialSummary()
    const [hideValues, setHideValues] = React.useState(false)

    // Função auxiliar para esconder/mostrar valores
    const toggleValues = () => setHideValues(prev => !prev)

    // UseEffect para ouvir evento global de toggle (se quisermos sincronizar com o dashboard principal)
    // Por enquanto vamos manter estados locais ou receber via props se integrarmos mais

    const formatCurrency = (value: number) => {
        if (loading) return '...'
        if (hideValues) return 'R$ •••••'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    const getInsight = () => {
        if (!summary) return null

        const curExpense = summary.current_month.expense
        const lastExpense = summary.last_month.expense

        if (curExpense === 0) return { text: "Nenhuma despesa esse mês ainda. Ótimo começo!", sentiment: 'positive' }

        if (lastExpense === 0) {
            if (curExpense > 0) {
                return {
                    text: `Atenção: Você começou a ter gastos este mês.`,
                    sentiment: 'negative'
                }
            }
            return { text: "Seus gastos estão estáveis.", sentiment: 'neutral' }
        }

        if (curExpense < lastExpense) {
            const diff = ((lastExpense - curExpense) / lastExpense) * 100
            return {
                text: `Você economizou ${diff.toFixed(0)}% em relação ao mês passado! 🎉`,
                sentiment: 'positive'
            }
        } else if (curExpense > lastExpense) {
            const diff = ((curExpense - lastExpense) / lastExpense) * 100
            if (diff > 20) {
                return {
                    text: `Atenção: Seus gastos subiram ${diff.toFixed(0)}% este mês.`,
                    sentiment: 'negative'
                }
            }
        }

        return { text: "Seus gastos estão estáveis.", sentiment: 'neutral' }
    }

    const insight = getInsight()

    return (
        <div className="space-y-6">
            {/* Insight Banner */}
            {insight && !loading && (
                <div className={`p-4 rounded-xl border ${insight.sentiment === 'positive' ? 'bg-green-50 border-green-100 text-green-800' :
                    insight.sentiment === 'negative' ? 'bg-red-50 border-red-100 text-red-800' :
                        'bg-blue-50 border-blue-100 text-blue-800'
                    } flex items-center gap-3 animate-fade-in`}>
                    <Activity className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium text-sm">{insight.text}</p>
                </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Receitas */}
                <div className="p-5 rounded-xl bg-green-50 animate-fade-in-up transition-all hover:shadow-md cursor-default">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4" />
                            Receitas
                        </div>
                        {summary && summary.current_month.income > summary.last_month.income && (
                            <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                <ArrowUp className="w-3 h-3 mr-0.5" />
                                Súbida
                            </div>
                        )}
                    </div>
                    <p className="text-2xl font-semibold text-green-600">
                        {formatCurrency(summary?.current_month.income || 0)}
                    </p>
                </div>

                {/* Despesas */}
                <div className="p-5 rounded-xl bg-red-50 animate-fade-in-up transition-all hover:shadow-md cursor-default" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <TrendingDown className="w-4 h-4" />
                            Despesas
                        </div>
                        {summary && summary.current_month.expense < summary.last_month.expense && (
                            <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                <ArrowDown className="w-3 h-3 mr-0.5" />
                                Queda
                            </div>
                        )}
                    </div>
                    <p className="text-2xl font-semibold text-red-600">
                        {formatCurrency(summary?.current_month.expense || 0)}
                    </p>
                </div>

                {/* Saldo */}
                <div className="p-5 rounded-xl bg-blue-50 animate-fade-in-up transition-all hover:shadow-md cursor-default" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Saldo
                    </div>
                    <p className="text-2xl font-semibold text-blue-600">
                        {formatCurrency(summary?.current_month.balance || 0)}
                    </p>
                </div>
            </div>
        </div>
    )
}

