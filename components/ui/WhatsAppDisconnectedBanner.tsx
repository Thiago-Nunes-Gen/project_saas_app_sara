'use client'

import { useClient } from '@/hooks/useClient'
import { Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function WhatsAppDisconnectedBanner() {
    const { client, loading } = useClient()

    // Não mostrar banner enquanto carrega ou se WhatsApp está conectado
    if (loading || client?.whatsapp_id) {
        return null
    }

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-md">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium">
                        Seu WhatsApp não está conectado. Conecte para usar a SARA!
                    </p>
                </div>
                <Link
                    href="/dashboard/configurar-whatsapp"
                    className="flex items-center gap-2 px-4 py-1.5 bg-white text-amber-600 rounded-full text-sm font-semibold hover:bg-amber-50 transition-colors whitespace-nowrap"
                >
                    Conectar agora
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
