// src/components/layout/mobile-nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageSquare, BookOpen, Swords, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/pyqs', icon: BookOpen, label: 'PYQs' },
  { href: '/battle', icon: Swords, label: 'Battle' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <tab.icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}