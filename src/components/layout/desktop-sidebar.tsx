// src/components/layout/desktop-sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, BookOpen, Swords, User, GraduationCap, Sparkles, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserNav } from '@/components/layout/user-nav'

const links = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/pyqs', icon: BookOpen, label: 'PYQs' },
  { href: '/battle', icon: Swords, label: 'Battle Arena' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' }
]

export function DesktopSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-zinc-950 border-r border-zinc-800 z-40">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-zinc-50">NEET Ecosystem</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link key={link.href} href={link.href} className={cn('flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all', isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900')}>
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-zinc-400">Unlock advanced analytics, unlimited AI chats, and more.</p>
          <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white">Get Pro</Button>
        </div>
        
        {/* NEW: User Profile Section */}
        <div className="border-t border-zinc-800 pt-4">
          <UserNav />
        </div>
      </div>
    </aside>
  )
}