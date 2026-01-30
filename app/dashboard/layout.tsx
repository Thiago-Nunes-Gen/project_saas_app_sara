import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ChatWidget from './components/ChatWidget'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-sara-bg">
      <Sidebar />
      <Header />
      <main className="ml-[72px] mt-16 p-6 min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}
