'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useExpensesByCategory, useDailyFlow } from '@/hooks/useFinancialSummary'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceCharts() {
    const { data: dailyData, loading: dailyLoading } = useDailyFlow()
    const { data: categoryData, loading: categoryLoading } = useExpensesByCategory()

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Gráfico de Fluxo Diário (Mês Atual) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up delay-100">
                <h3 className="text-base font-semibold text-gray-900 mb-6">Fluxo de Caixa (Este Mês)</h3>
                <div className="h-[300px] w-full">
                    {dailyLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="spinner" />
                        </div>
                    ) : dailyData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            Nenhuma movimentação este mês
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={dailyData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                    tickFormatter={(value) => `Dia ${value}`}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `R$ ${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
                                    labelFormatter={(label) => `Dia ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Receitas"
                                    stroke="#22c55e"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    name="Despesas"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Gráfico de Pizza (Categorias) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up delay-200">
                <h3 className="text-base font-semibold text-gray-900 mb-6">Despesas por Categoria</h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    {categoryLoading ? (
                        <div className="spinner" />
                    ) : categoryData.length === 0 ? (
                        <p className="text-gray-400 text-sm">Nenhuma despesa este mês</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="category"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}
