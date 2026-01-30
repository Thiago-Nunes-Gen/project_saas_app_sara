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
      <main className="md:ml-[72px] mt-14 md:mt-16 px-4 pt-2 md:p-6 pb-24 md:pb-6 min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <ChatWidget />
    </div>
  )
}
