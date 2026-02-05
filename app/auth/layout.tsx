import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sara-bg flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-genesis-purple-dark via-genesis-purple to-genesis-purple-darker p-12 flex-col justify-between">
        <div />

        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sua assistente pessoal inteligente
          </h1>
          <p className="text-lg text-primary-300">
            Gerencie suas finanças, lembretes, listas e muito mais em um só lugar.
            A SARA está aqui para simplificar sua vida.
          </p>
        </div>

        {/* Footer com logo Gênesis */}
        <div className="flex items-center gap-2 opacity-70">
          <span className="text-sm text-white/70">Desenvolvido por</span>
          <Image
            src="https://vkohkliecwxxruceocxo.supabase.co/storage/v1/object/public/Imagens%20Sara/logo_genesis.png"
            alt="Gênesis I.A."
            width={80}
            height={24}
            className="h-5 w-auto"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer mobile */}
        <div className="p-4 flex items-center justify-center gap-2 opacity-60">
          <span className="text-xs text-sara-muted">Desenvolvido por</span>
          <Image
            src="https://vkohkliecwxxruceocxo.supabase.co/storage/v1/object/public/Imagens%20Sara/logo_genesis.png"
            alt="Gênesis I.A."
            width={60}
            height={20}
            className="h-4 w-auto"
          />
        </div>
      </div>
    </div>
  )
}
