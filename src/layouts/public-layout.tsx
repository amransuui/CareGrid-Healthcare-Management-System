import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export function PublicLayout() {
  return (
    <div id="top" className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}