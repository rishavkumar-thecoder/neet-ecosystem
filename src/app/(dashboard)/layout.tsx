// src/app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double-check profile existence
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-zinc-950 text-zinc-50">
        <DesktopSidebar />
        <MobileNav />
        
        <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
          <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            {children}
          </div>
        </main>
        
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    </ThemeProvider>
  )
}