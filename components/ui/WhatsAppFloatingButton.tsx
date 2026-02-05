'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloatingButton() {
    return (
        <a
            href="https://wa.me/5516992706593?text=Ol%C3%A1%20SARA!"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 py-4 bg-green-500 text-white text-sm font-medium shadow-lg hover:bg-green-600 transition-all active:scale-95 safe-area-bottom"
            title="Falar com SARA no WhatsApp"
        >
            <MessageCircle className="w-5 h-5" />
            <span>Abrir WhatsApp SARA</span>
        </a>
    )
}
