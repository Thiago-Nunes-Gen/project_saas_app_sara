'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
    MessageCircle,
    Wallet,
    Bell,
    ListTodo,
    Calendar,
    Search,
    BarChart3,
    Check,
    ArrowRight,
    Sparkles,
    Shield,
    Smartphone,
    ChevronDown,
    Star,
    Zap,
    Crown,
    Building2,
    Menu,
    X
} from 'lucide-react'

// Componente de animação de número
function AnimatedCounter({ target, duration = 2000, suffix = '' }: { target: number, duration?: number, suffix?: string }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])

    return <span>{count.toLocaleString('pt-BR')}{suffix}</span>
}

// Card de funcionalidade com hover
function FeatureCard({ icon: Icon, title, description, color }: {
    icon: any,
    title: string,
    description: string,
    color: string
}) {
    return (
        <div className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    )
}

// Card de plano
function PlanCard({ name, price, features, popular, icon: Icon, color }: {
    name: string,
    price: string,
    features: string[],
    popular?: boolean,
    icon: any,
    color: string
}) {
    return (
        <div className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${popular ? 'border-purple-500 scale-105' : 'border-gray-100'}`}>
            {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                </div>
            )}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{name}</h3>
            <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{price}</span>
                {price !== 'Grátis' && <span className="text-gray-500">/mês</span>}
            </div>
            <ul className="space-y-3 mb-6">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                ))}
            </ul>
            <Link
                href={`/auth/cadastro?plano=${name.toLowerCase()}`}
                className={`block w-full py-3 px-4 rounded-xl text-center font-semibold transition-all duration-300 ${popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
            >
                Começar Agora
            </Link>
        </div>
    )
}

// Passo do processo
function StepCard({ number, title, description }: { number: number, title: string, description: string }) {
    return (
        <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                {number}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    )
}

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>SARA</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-8">
                            <a href="#funcionalidades" className={`font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>Funcionalidades</a>
                            <a href="#como-funciona" className={`font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>Como Funciona</a>
                            <a href="#planos" className={`font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>Planos</a>
                            <Link href="/auth/login" className={`font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-purple-600' : 'text-white/80 hover:text-white'}`}>Entrar</Link>
                            <Link href="/auth/cadastro" className="bg-white text-purple-600 px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                                Comece Grátis
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2"
                        >
                            {mobileMenuOpen ? <X className={scrolled ? 'text-gray-900' : 'text-white'} /> : <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t shadow-lg">
                        <div className="px-4 py-4 space-y-3">
                            <a href="#funcionalidades" className="block py-2 text-gray-600 font-medium">Funcionalidades</a>
                            <a href="#como-funciona" className="block py-2 text-gray-600 font-medium">Como Funciona</a>
                            <a href="#planos" className="block py-2 text-gray-600 font-medium">Planos</a>
                            <Link href="/auth/login" className="block py-2 text-gray-600 font-medium">Entrar</Link>
                            <Link href="/auth/cadastro" className="block w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center py-3 rounded-xl font-semibold">
                                Comece Grátis
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#21154d] via-[#2d1856] to-[#23639f]">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-white/90 text-sm font-medium">Assistente com Inteligência Artificial</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                                Sua vida organizada
                                <span className="block bg-gradient-to-r from-[#aab2e8] to-[#3d9af4] bg-clip-text text-transparent">
                                    direto no WhatsApp
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                                Conheça a <strong className="text-white">SARA</strong>, sua assistente pessoal que organiza finanças, lembretes, listas e agenda. Tudo conversando naturalmente pelo WhatsApp.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/auth/cadastro" className="group inline-flex items-center justify-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                    Comece Grátis
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#funcionalidades" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                                    Saiba Mais
                                    <ChevronDown className="w-5 h-5" />
                                </a>
                            </div>

                            {/* Social Proof - Frases de Impacto */}
                            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8">
                                <div className="text-center lg:text-left">
                                    <div className="text-xl font-bold text-white">Mais organização</div>
                                    <div className="text-white/60 text-sm">Menos esforço</div>
                                </div>
                                <div className="hidden lg:block w-px h-10 bg-white/20"></div>
                                <div className="text-center lg:text-left">
                                    <div className="text-xl font-bold text-white">Lembretes e finanças</div>
                                    <div className="text-white/60 text-sm">Em segundos</div>
                                </div>
                                <div className="hidden lg:block w-px h-10 bg-white/20"></div>
                                <div className="text-center lg:text-left">
                                    <div className="text-xl font-bold text-white">100% no WhatsApp</div>
                                    <div className="text-white/60 text-sm">E no Chat do Portal</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Phone Mockup */}
                        <div className="relative hidden lg:block">
                            <div className="relative w-[300px] h-[600px] mx-auto">
                                {/* Phone Frame */}
                                <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-gray-800">
                                    {/* Screen */}
                                    <div className="absolute inset-3 bg-[#ECE5DD] rounded-[2.5rem] overflow-hidden">
                                        {/* WhatsApp Header */}
                                        <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <MessageCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">SARA</div>
                                                <div className="text-xs text-green-300">online</div>
                                            </div>
                                        </div>

                                        {/* Chat Messages */}
                                        <div className="p-3 space-y-2">
                                            <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                                                <p className="text-sm text-gray-800">Oi! Gastei 150 no mercado hoje</p>
                                                <span className="text-[10px] text-gray-500">10:30</span>
                                            </div>
                                            <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[80%] ml-auto shadow-sm">
                                                <p className="text-sm text-gray-800">✅ Registrado! Despesa de R$ 150,00 na categoria Alimentação.</p>
                                                <p className="text-sm text-gray-800 mt-1">💡 Seu saldo do mês: R$ 2.350,00</p>
                                                <span className="text-[10px] text-gray-500 block text-right">10:30</span>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                                                <p className="text-sm text-gray-800">Me lembra de pagar a conta de luz amanhã às 10h</p>
                                                <span className="text-[10px] text-gray-500">10:31</span>
                                            </div>
                                            <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[80%] ml-auto shadow-sm">
                                                <p className="text-sm text-gray-800">🔔 Pronto! Vou te lembrar amanhã às 10:00.</p>
                                                <span className="text-[10px] text-gray-500 block text-right">10:31</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <div className="absolute -left-16 top-20 bg-white rounded-xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                                    <Wallet className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="absolute -right-16 top-40 bg-white rounded-xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>
                                    <Bell className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="absolute -left-12 bottom-32 bg-white rounded-xl p-3 shadow-xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                                    <Calendar className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section id="funcionalidades" className="py-20 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                            FUNCIONALIDADES
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            Tudo que você precisa em um só lugar
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            A SARA foi criada para simplificar seu dia a dia. Fale naturalmente e deixe ela cuidar do resto.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        <FeatureCard
                            icon={Wallet}
                            title="Finanças"
                            description="Controle gastos e receitas com comandos simples. Veja relatórios e entenda para onde vai seu dinheiro."
                            color="from-green-500 to-emerald-600"
                        />
                        <FeatureCard
                            icon={Bell}
                            title="Lembretes"
                            description="Nunca mais esqueça compromissos. Crie lembretes por voz e receba notificações na hora certa."
                            color="from-orange-500 to-red-500"
                        />
                        <FeatureCard
                            icon={ListTodo}
                            title="Listas"
                            description="Organize compras, tarefas e objetivos. Adicione, marque e compartilhe suas listas."
                            color="from-blue-500 to-cyan-500"
                        />
                        <FeatureCard
                            icon={Calendar}
                            title="Agenda"
                            description="Gerencie compromissos com data e hora. Receba alertas antes de cada evento."
                            color="from-purple-500 to-pink-500"
                        />
                        <FeatureCard
                            icon={Search}
                            title="Pesquisas"
                            description="Pergunte sobre clima, preços, receitas e lugares. Respostas rápidas e precisas."
                            color="from-indigo-500 to-purple-600"
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Relatórios"
                            description="Visualize seu desempenho financeiro em PDFs elegantes. Gráficos e insights automáticos."
                            color="from-teal-500 to-green-500"
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="como-funciona" className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                            COMO FUNCIONA
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            Comece em 3 passos simples
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Em menos de 5 minutos você já estará conversando com a SARA
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300" />

                        <StepCard
                            number={1}
                            title="Crie sua conta"
                            description="Cadastre-se gratuitamente em segundos. Sem cartão de crédito."
                        />
                        <StepCard
                            number={2}
                            title="Vincule e Pronto"
                            description="Após o cadastro, vincule seu WhatsApp de forma simples. Você pode acessar a SARA no WhatsApp e Chat do Portal."
                        />
                        <StepCard
                            number={3}
                            title="Comece a usar"
                            description="Fale naturalmente e deixe a SARA organizar sua vida."
                        />
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/auth/cadastro" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            Criar Minha Conta Grátis
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="planos" className="py-20 lg:py-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-green-100 text-green-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                            PLANOS
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                            Escolha o plano ideal para você
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Comece grátis e faça upgrade quando precisar
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                        <PlanCard
                            name="Gratuito"
                            price="Grátis"
                            icon={Star}
                            color="from-gray-400 to-gray-500"
                            features={[
                                "10 lembretes ativos",
                                "3 listas com 8 itens cada",
                                "15 transações/mês",
                                "3 agendamentos/mês",
                                "Ideal para experimentar"
                            ]}
                        />
                        <PlanCard
                            name="Starter"
                            price="R$ 19,90"
                            icon={Zap}
                            color="from-yellow-400 to-orange-500"
                            features={[
                                "50 lembretes ativos",
                                "10 listas com 50 itens",
                                "60 transações/mês",
                                "10 agendamentos/mês",
                                "10 pesquisas web/mês"
                            ]}
                        />
                        <PlanCard
                            name="Profissional"
                            price="R$ 49,90"
                            icon={Crown}
                            color="from-purple-500 to-pink-500"
                            popular
                            features={[
                                "100 lembretes ativos",
                                "50 listas com 100 itens",
                                "150 transações/mês",
                                "40 agendamentos/mês",
                                "25 pesquisas web/mês",
                                "Relatórios em PDF"
                            ]}
                        />
                        <PlanCard
                            name="Enterprise"
                            price="R$ 99,90"
                            icon={Building2}
                            color="from-blue-500 to-cyan-500"
                            features={[
                                "Lembretes ilimitados",
                                "Listas ilimitadas",
                                "Transações ilimitadas",
                                "Agendamentos ilimitados",
                                "50 pesquisas web/mês",
                                "Suporte prioritário"
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* About Genesis */}
            <section className="py-20 lg:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                                QUEM SOMOS
                            </span>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                                Desenvolvido pela <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Genesis</span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Somos uma empresa brasileira especializada em <strong>Inteligência Artificial</strong> e soluções inovadoras. A SARA é fruto de anos de pesquisa para criar uma assistente que realmente entende você.
                            </p>
                            <p className="text-lg text-gray-600 mb-8">
                                Nossa missão é democratizar o acesso à tecnologia de ponta, permitindo que qualquer pessoa organize sua vida de forma simples e eficiente.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">100% Seguro</div>
                                        <div className="text-sm text-gray-500">Dados criptografados</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Made in Brazil</div>
                                        <div className="text-sm text-gray-500">Empresa brasileira</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                                    <Image
                                        src="https://vkohkliecwxxruceocxo.supabase.co/storage/v1/object/public/Imagens%20Sara/logo_genesis.png"
                                        alt="Genesis Logo"
                                        width={300}
                                        height={100}
                                        className="mx-auto"
                                    />
                                    <div className="mt-6 text-center">
                                        <div className="text-2xl font-bold text-gray-900">GENESIS</div>
                                        <div className="text-gray-500">Soluções em Inteligência Artificial</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-[#21154d] via-[#2d1856] to-[#23639f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
                        Pronto para organizar sua vida?
                    </h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Junte-se a centenas de pessoas que já estão usando a SARA para simplificar o dia a dia.
                    </p>
                    <Link href="/auth/cadastro" className="inline-flex items-center gap-2 bg-white text-purple-600 px-10 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        Comece Grátis Agora
                        <ArrowRight className="w-6 h-6" />
                    </Link>
                    <p className="mt-4 text-white/60 text-sm">Sem cartão de crédito • Cancele quando quiser</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">SARA</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Sua assistente pessoal inteligente, disponível 24/7 no WhatsApp.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                                <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
                                <li><Link href="/auth/cadastro" className="hover:text-white transition-colors">Comece Grátis</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="https://iagenes.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Genesis IA</a></li>
                                <li><a href="mailto:suporte@iagenes.com.br" className="hover:text-white transition-colors">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                                <li><Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} GENESIS SOLUÇÕES EM IA LTDA. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
            >
                <MessageCircle className="w-7 h-7 text-white" />
            </a>
        </div>
    )
}
