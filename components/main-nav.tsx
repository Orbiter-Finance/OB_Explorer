'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

export function MainNav() {
  const pathname = usePathname()

  const params = new URLSearchParams(location.search)

  const hideTransactions = Number(params.get('hide_transactions')) === 1
  const showMaker = Number(params.get('show_maker')) === 1
  const showDealer = Number(params.get('show_dealer')) === 1
  const showManager = Number(params.get('show_manager')) === 1

  return (
    <div className="mr-4 hidden md:flex">
      <Link
        href={hideTransactions ? '#' : `/${location.search}`}
        className="mr-6 flex items-center space-x-2"
      >
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {/* <Link
          href="/"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/'
              ? 'text-foreground font-bold'
              : 'text-foreground/60',
          )}
        >
          Dashboard
        </Link> */}
        {!hideTransactions && (
          <Link
            href={`/${location.search}`}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === '/'
                ? 'text-foreground font-bold'
                : 'text-foreground/60',
            )}
          >
            Transactions
          </Link>
        )}
        {showMaker && (
          <Link
            href={`/maker/${location.search}`}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname?.startsWith('/maker')
                ? 'text-foreground font-bold'
                : 'text-foreground/60',
            )}
          >
            Maker
          </Link>
        )}

        {showDealer && (
          <Link
            href={`/dealer/${location.search}`}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname?.startsWith('/dealer')
                ? 'text-foreground font-bold'
                : 'text-foreground/60',
            )}
          >
            Dealer
          </Link>
        )}

        {showManager && (
          <Link
            href={`/manager/${location.search}`}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname?.startsWith('/manager')
                ? 'text-foreground font-bold'
                : 'text-foreground/60',
            )}
          >
            Manager
          </Link>
        )}
      </nav>
    </div>
  )
}
