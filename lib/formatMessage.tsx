// Utilitário para formatar mensagens da SARA
// Converte markdown para HTML

export function formatMessage(text: string): string {
    if (!text) return ''

    return text
        // Títulos: ## Título ou # Título
        .replace(/^##\s+(.+)$/gm, '<h3 class="msg-title">$1</h3>')
        .replace(/^#\s+(.+)$/gm, '<h2 class="msg-title-lg">$1</h2>')

        // Negrito: **texto**
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

        // Bullets com asterisco: * item (início da linha)
        .replace(/^\*\s+(.+)$/gm, '<span class="bullet">• $1</span>')

        // Bullets com traço: - item ou • item
        .replace(/^[-•]\s+(.+)$/gm, '<span class="bullet">• $1</span>')

        // Itálico: _texto_
        .replace(/_(.+?)_/g, '<em>$1</em>')

        // Linhas divisórias: ━━━ ou === ou ---
        .replace(/[━═\-]{3,}/g, '<hr class="divider" />')

        // Preserva quebras de linha
        .replace(/\n/g, '<br />')
}

// Componente React para renderizar mensagem formatada
export function FormattedMessage({ content }: { content: string }) {
    const formattedHtml = formatMessage(content)

    return (
        <span
            className="formatted-message"
            dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
    )
}
