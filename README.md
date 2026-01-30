# 🚀 SARA Portal - Cliente Web

Portal do cliente para a SARA, desenvolvido com Next.js 14 e Supabase.

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (gratuita)

## 🛠️ Instalação

### 1. Clone ou extraia o projeto

```bash
cd sara-portal
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados do Supabase:

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Onde encontrar?** No painel do Supabase: Project Settings > API

### 4. Execute os scripts SQL

Antes de rodar o portal, certifique-se de que executou os scripts SQL das fases 1-3 no seu Supabase.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
sara-portal/
├── app/
│   ├── auth/                    # Páginas de autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   ├── recuperar-senha/
│   │   └── callback/
│   ├── dashboard/               # Área logada
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── financeiro/
│   │   ├── lembretes/
│   │   ├── listas/
│   │   ├── notas/
│   │   └── configuracoes/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/
├── hooks/
│   ├── useClient.ts            # Dados do cliente
│   ├── useTransactions.ts      # Transações financeiras
│   └── useReminders.ts         # Lembretes
├── lib/
│   ├── supabase-browser.ts     # Cliente Supabase (browser)
│   └── supabase-server.ts      # Cliente Supabase (server)
├── types/
│   └── index.ts                # Tipos TypeScript
├── middleware.ts               # Proteção de rotas
└── ...config files
```

## 🔐 Autenticação

O sistema usa Supabase Auth com:

- ✅ Login com email/senha
- ✅ Cadastro com confirmação por email
- ✅ Recuperação de senha
- ✅ Proteção automática de rotas
- ✅ Vinculação com saas_clients existente

## 🎨 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Backend (Auth + Database)
- **Lucide Icons** - Ícones
- **date-fns** - Manipulação de datas

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

```bash
npm run build
```

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 📝 Configuração do Supabase

### 1. URLs de Redirecionamento

Em Authentication > Settings, adicione:

```
https://seu-dominio.com/**
http://localhost:3000/**
```

### 2. Templates de Email

Customize os templates em Authentication > Email Templates para incluir a marca SARA.

### 3. Ativar RLS

Após testar o portal, execute o script `fase_4_ativar_rls.sql` para ativar a segurança em nível de linha.

## 🐛 Solução de Problemas

### "Invalid API key"
Verifique se as variáveis de ambiente estão corretas no `.env.local`

### "User not found"
Execute os scripts SQL das fases 1-2 para criar o trigger de vinculação

### Erro de CORS
Adicione seu domínio nas configurações de URL do Supabase

## 📞 Suporte

Dúvidas? Entre em contato!

---

Desenvolvido por **Gênesis I.A.** 🚀
