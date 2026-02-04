'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermosPage() {
    const dataAtualizacao = '04 de fevereiro de 2026'

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/auth/cadastro"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Termos de Uso</h1>
                        <p className="text-sm text-gray-500">Última atualização: {dataAtualizacao}</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-8">

                    {/* Introdução */}
                    <section>
                        <p className="text-gray-700 leading-relaxed">
                            Bem-vindo à <strong>SARA</strong> (Sistema de Assistência e Relatórios com IA).
                            Ao utilizar nossos serviços, você concorda com os termos descritos abaixo.
                            Leia atentamente antes de prosseguir.
                        </p>
                    </section>

                    {/* 1. Descrição do Serviço */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">1. O que é a SARA?</h2>
                        <p className="text-gray-700 leading-relaxed">
                            A SARA é uma assistente pessoal com inteligência artificial que auxilia você a:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                            <li>Gerenciar lembretes e compromissos</li>
                            <li>Organizar listas de tarefas</li>
                            <li>Controlar suas finanças pessoais (receitas e despesas)</li>
                            <li>Armazenar notas e documentos</li>
                            <li>Gerar relatórios personalizados</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            O acesso pode ser feito pelo <strong>Portal Web</strong> ou pelo <strong>WhatsApp</strong>.
                        </p>
                    </section>

                    {/* 2. Elegibilidade */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Quem pode usar?</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Para utilizar a SARA, você deve ter pelo menos <strong>18 anos</strong> ou ser
                            emancipado legalmente. Ao criar uma conta, você declara que atende a este requisito.
                        </p>
                    </section>

                    {/* 3. Conta do Usuário */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Sua Conta</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Você é responsável por manter a confidencialidade da sua senha e por todas as
                            atividades realizadas em sua conta. Notifique-nos imediatamente caso suspeite
                            de uso não autorizado.
                        </p>
                    </section>

                    {/* 4. Planos e Pagamentos */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Planos e Pagamentos</h2>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-green-800 font-medium">✅ Sem fidelidade. Sem multas. Cancele quando quiser.</p>
                        </div>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>Plano Gratuito:</strong> Acesso limitado às funcionalidades básicas, sem custo.</li>
                            <li><strong>Planos Pagos:</strong> Cobrança mensal via cartão de crédito ou PIX, processada pelo Asaas.</li>
                            <li><strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento, sem multa e sem carência. O acesso aos recursos pagos permanece até o fim do período já pago.</li>
                            <li><strong>Reembolso:</strong> Não oferecemos reembolso proporcional para períodos não utilizados após o cancelamento.</li>
                        </ul>
                    </section>

                    {/* 5. Uso Permitido */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Uso Permitido</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">Você concorda em usar a SARA apenas para fins lícitos e pessoais. É proibido:</p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>Tentar acessar contas de outros usuários</li>
                            <li>Utilizar a plataforma para atividades ilegais</li>
                            <li>Enviar conteúdo que viole direitos de terceiros</li>
                            <li>Tentar explorar vulnerabilidades do sistema</li>
                            <li>Revender ou redistribuir o serviço</li>
                        </ul>
                    </section>

                    {/* 6. Limitação de Responsabilidade */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Limitação de Responsabilidade</h2>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                            <p className="text-amber-800">
                                ⚠️ <strong>Importante:</strong> A SARA é uma ferramenta de organização pessoal e NÃO constitui
                                aconselhamento financeiro, jurídico ou profissional.
                            </p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Decisões tomadas com base nas informações fornecidas pela SARA são de sua inteira responsabilidade.
                            Não nos responsabilizamos por perdas financeiras, danos diretos ou indiretos decorrentes do uso da plataforma.
                        </p>
                    </section>

                    {/* 7. Disponibilidade */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Disponibilidade</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nos esforçamos para manter a SARA disponível 24/7, mas não garantimos disponibilidade
                            ininterrupta. Manutenções programadas e eventuais instabilidades podem ocorrer.
                        </p>
                    </section>

                    {/* 8. Propriedade Intelectual */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Propriedade Intelectual</h2>
                        <p className="text-gray-700 leading-relaxed">
                            A marca SARA, logotipos, interface e código são propriedade exclusiva de nossa empresa.
                            Os dados que você insere na plataforma permanecem seus. Não reivindicamos propriedade
                            sobre seu conteúdo.
                        </p>
                    </section>

                    {/* 9. Suspensão */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Suspensão e Cancelamento</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Reservamo-nos o direito de suspender ou cancelar contas que violem estes termos,
                            sem aviso prévio. Em caso de inadimplência, sua conta pode ser limitada ao plano gratuito.
                        </p>
                    </section>

                    {/* 10. Alterações */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Alterações nos Termos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Podemos atualizar estes termos periodicamente. Você será notificado por email ou
                            WhatsApp sobre mudanças significativas. O uso continuado após alterações implica
                            aceitação dos novos termos.
                        </p>
                    </section>

                    {/* 11. Foro */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Foro</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Este contrato é regido pelas leis brasileiras. Qualquer disputa será resolvida
                            no foro da comarca de Araraquara/SP, com exclusão de qualquer outro.
                        </p>
                    </section>

                    {/* Contato */}
                    <section className="pt-6 border-t border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Dúvidas?</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Entre em contato conosco pelo email: <a href="mailto:contato@sara.app.br" className="text-blue-600 hover:underline">contato@sara.app.br</a>
                        </p>
                    </section>

                    {/* Botão voltar */}
                    <div className="pt-6 flex justify-center">
                        <Link
                            href="/auth/cadastro"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Voltar para o Cadastro
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    )
}
