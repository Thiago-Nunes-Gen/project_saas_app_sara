'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Database, Eye, Trash2, Download, Mail } from 'lucide-react'

export default function PrivacidadePage() {
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
                        <h1 className="text-xl font-bold text-gray-900">Política de Privacidade</h1>
                        <p className="text-sm text-gray-500">Última atualização: {dataAtualizacao}</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 space-y-8">

                    {/* Introdução */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Transparência Total</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Na SARA, acreditamos que você tem o direito de saber <strong>exatamente</strong> quais
                            dados coletamos, como usamos e onde armazenamos. Esta política foi escrita de forma
                            clara e direta, sem juridiquês desnecessário.
                        </p>
                    </section>

                    {/* LGPD */}
                    <section className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-green-800 mb-3">🇧🇷 Conformidade com a LGPD</h2>
                        <p className="text-green-700">
                            Esta política está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                            Você tem direitos garantidos por lei e pode exercê-los a qualquer momento.
                        </p>
                    </section>

                    {/* Dados Coletados */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Database className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">Dados que Coletamos</h2>
                        </div>

                        <p className="text-gray-700 mb-4">Aqui está a lista <strong>completa e transparente</strong> dos dados que armazenamos:</p>

                        {/* Dados de Cadastro */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-2">📌 Dados de Cadastro</h3>
                            <ul className="text-gray-700 space-y-1 ml-4">
                                <li>• <strong>Nome completo</strong> - para personalizar sua experiência</li>
                                <li>• <strong>Email</strong> - para login e comunicações importantes</li>
                                <li>• <strong>Número de WhatsApp</strong> - para integração com o assistente</li>
                                <li>• <strong>Apelido</strong> - como você prefere ser chamado</li>
                                <li>• <strong>Cidade e Estado</strong> - para regionalização de relatórios</li>
                            </ul>
                        </div>

                        {/* Dados de Faturamento */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-2">💳 Dados de Faturamento (apenas para planos pagos)</h3>
                            <ul className="text-gray-700 space-y-1 ml-4">
                                <li>• <strong>CPF ou CNPJ</strong> - para emissão de nota fiscal</li>
                                <li>• <strong>Nome de cobrança</strong> - como aparece na NF</li>
                                <li>• <strong>Endereço completo</strong> - obrigatório para NF</li>
                                <li>• <strong>Email de cobrança</strong> - para receber faturas</li>
                            </ul>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    <strong>Importante:</strong> NÃO armazenamos dados de cartão de crédito.
                                    Os pagamentos são processados pelo <strong>Asaas</strong>, nosso gateway de pagamento certificado.
                                </p>
                            </div>
                        </div>

                        {/* Dados de Uso */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-2">📊 Dados de Uso (o que você cria na SARA)</h3>
                            <ul className="text-gray-700 space-y-1 ml-4">
                                <li>• <strong>Lembretes</strong> - títulos, descrições, datas e horários</li>
                                <li>• <strong>Agendamentos</strong> - compromissos com data, hora e local</li>
                                <li>• <strong>Listas</strong> - listas de tarefas e seus itens</li>
                                <li>• <strong>Transações financeiras</strong> - descrição, valor e categoria (receitas e despesas que você registra)</li>
                                <li>• <strong>Notas pessoais</strong> - anotações que você salva</li>
                                <li>• <strong>Documentos</strong> - arquivos que você envia para consulta</li>
                                <li>• <strong>Conversas</strong> - histórico de conversas com a assistente via WhatsApp</li>
                            </ul>
                        </div>

                        {/* O que NÃO coletamos */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">❌ O que NÃO coletamos</h3>
                            <ul className="text-gray-600 space-y-1 ml-4">
                                <li>• Dados de cartão de crédito ou débito</li>
                                <li>• Senhas de outros serviços</li>
                                <li>• Dados bancários (agência, conta)</li>
                                <li>• Localização em tempo real</li>
                                <li>• Dados de outros aplicativos do seu celular</li>
                            </ul>
                        </div>
                    </section>

                    {/* Finalidade */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Para que usamos seus dados?</h2>
                        <ul className="text-gray-700 space-y-2">
                            <li><strong>1. Fornecer o serviço:</strong> Seus lembretes, listas e transações são essenciais para a SARA funcionar.</li>
                            <li><strong>2. Personalização:</strong> Usamos seu nome e preferências para deixar a experiência mais pessoal.</li>
                            <li><strong>3. Comunicação:</strong> Email e WhatsApp são usados para notificações importantes e lembretes.</li>
                            <li><strong>4. Faturamento:</strong> CPF/CNPJ e endereço são usados exclusivamente para emitir notas fiscais.</li>
                            <li><strong>5. Melhorias:</strong> Analisamos dados agregados (não identificáveis) para melhorar a plataforma.</li>
                        </ul>
                    </section>

                    {/* Compartilhamento */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Com quem compartilhamos?</h2>
                        <p className="text-gray-700 mb-4">
                            Compartilhamos dados apenas com parceiros essenciais para o funcionamento do serviço:
                        </p>
                        <div className="space-y-3">
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-medium text-gray-900">Supabase (Banco de Dados)</p>
                                <p className="text-sm text-gray-600">Armazena seus dados com criptografia. Servidores nos EUA.</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-medium text-gray-900">OpenAI (Inteligência Artificial)</p>
                                <p className="text-sm text-gray-600">Processa conversas para gerar respostas inteligentes. Dados não são usados para treinar modelos.</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-medium text-gray-900">Asaas (Pagamentos)</p>
                                <p className="text-sm text-gray-600">Processa cobranças e emite boletos/PIX. Gateway brasileiro certificado.</p>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-medium text-gray-900">Evolution API (WhatsApp)</p>
                                <p className="text-sm text-gray-600">Permite a integração com o WhatsApp para envio e recebimento de mensagens.</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mt-4">
                            <strong>Nunca vendemos seus dados</strong> para terceiros para fins de marketing ou publicidade.
                        </p>
                    </section>

                    {/* Armazenamento */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Armazenamento e Segurança</h2>
                        <ul className="text-gray-700 space-y-2">
                            <li>• <strong>Criptografia:</strong> Todos os dados são criptografados em trânsito (HTTPS) e em repouso.</li>
                            <li>• <strong>Servidores:</strong> Utilizamos servidores seguros da Supabase.</li>
                            <li>• <strong>Retenção:</strong> Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, removemos em até 30 dias.</li>
                            <li>• <strong>Backups:</strong> Realizamos backups diários para garantir a recuperação em caso de falhas.</li>
                        </ul>
                    </section>

                    {/* Direitos LGPD */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seus Direitos (LGPD)</h2>
                        <p className="text-gray-700 mb-4">Você tem os seguintes direitos garantidos por lei:</p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Acesso</p>
                                    <p className="text-sm text-gray-600">Solicitar uma cópia de todos os seus dados</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Database className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Correção</p>
                                    <p className="text-sm text-gray-600">Corrigir dados incompletos ou incorretos</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Exclusão</p>
                                    <p className="text-sm text-gray-600">Solicitar a exclusão completa dos seus dados</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Download className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">Portabilidade</p>
                                    <p className="text-sm text-gray-600">Receber seus dados em formato legível</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-700 mt-4">
                            Para exercer qualquer direito, envie um email para{' '}
                            <a href="mailto:privacidade@sara.app.br" className="text-blue-600 hover:underline">
                                privacidade@sara.app.br
                            </a>
                            {' '}com o assunto "Direitos LGPD" e responderemos em até 15 dias úteis.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Utilizamos apenas cookies essenciais para manter sua sessão ativa e preferências de uso.
                            Não utilizamos cookies de rastreamento ou publicidade.
                        </p>
                    </section>

                    {/* Menores */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Menores de Idade</h2>
                        <p className="text-gray-700 leading-relaxed">
                            A SARA não é destinada a menores de 18 anos. Se tomarmos conhecimento de que coletamos
                            dados de menores, excluiremos imediatamente essas informações.
                        </p>
                    </section>

                    {/* Alterações */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Alterações nesta Política</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas
                            por email ou notificação no portal. Recomendamos revisar esta página regularmente.
                        </p>
                    </section>

                    {/* Contato DPO */}
                    <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-semibold text-blue-900">Contato</h2>
                        </div>
                        <p className="text-blue-800">
                            Para dúvidas sobre privacidade ou para exercer seus direitos:
                        </p>
                        <p className="text-blue-900 font-medium mt-2">
                            📧 Email: <a href="mailto:privacidade@sara.app.br" className="underline">privacidade@sara.app.br</a>
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
