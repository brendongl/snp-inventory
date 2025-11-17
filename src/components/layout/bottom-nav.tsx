'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/items',
    label: 'Items',
    icon: '📦',
  },
  {
    href: '/low-stock',
    label: 'Low Stock',
    icon: '🔻',
  },
  {
    href: '/logs',
    label: 'Logs',
    icon: '📊',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: '⚙️',
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground min-h-[48px] min-w-[48px]',
                isActive
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
