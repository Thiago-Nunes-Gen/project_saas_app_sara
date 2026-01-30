export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sara-bg flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Sua assistente pessoal inteligente
          </h1>
          <p className="text-lg text-white/80">
            Gerencie suas finanças, lembretes, listas e muito mais em um só lugar. 
            A SARA está aqui para simplificar sua vida.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40" />
            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40" />
            <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40" />
          </div>
          <span className="text-sm text-white/70">+500 pessoas já usam a SARA</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
