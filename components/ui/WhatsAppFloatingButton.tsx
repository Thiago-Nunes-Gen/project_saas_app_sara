'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppFloatingButton() {
    return (
        <a
            href="https://wa.me/5516992706593?text=Ol%C3%A1%20SARA!"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg hover:bg-green-600 transition-all active:scale-95"
            title="Falar com SARA no WhatsApp"
        >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp SARA</span>
        </a>
    )
}
