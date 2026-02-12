// Rate limiter simples em memória para API routes
// Protege contra abuso sem dependências externas

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key)
        }
    }
}, 5 * 60 * 1000)

interface RateLimitConfig {
    maxRequests: number    // Máximo de requests no intervalo
    windowMs: number       // Janela de tempo em milissegundos
}

interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetIn: number        // Segundos até o reset
}

export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now()
    const entry = rateLimitMap.get(identifier)

    // Se não tem entrada ou expirou, cria uma nova
    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        })
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: Math.ceil(config.windowMs / 1000),
        }
    }

    // Incrementa o contador
    entry.count++

    if (entry.count > config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        }
    }

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    }
}

// Configurações padrão por rota
export const RATE_LIMITS = {
    chat: { maxRequests: 20, windowMs: 60 * 1000 },        // 20 msgs por minuto
    checkout: { maxRequests: 5, windowMs: 60 * 1000 },      // 5 tentativas por minuto
} as const
