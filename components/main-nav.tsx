'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function MainNav() {
  const pathname = usePathname()

  const params = new URLSearchParams(location.search)

  const hideTransactions = Number(params.get('hide_transactions')) === 1
  const showMaker = Number(params.get('show_maker')) === 1
  const showDealer = Number(params.get('show_dealer')) === 1

  return (
    <div className="mr-4 hidden md:flex">
      <Link
        href={hideTransactions ? '#' : `/${location.search}`}
        className="mr-6 flex items-center space-x-2"
      >
        <Icons.logo className="h-6 w-6" />
        <span className="font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {!hideTransactions && (
            <NavigationMenuItem>
              <Link href={`/${location.search}`} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname === '/'
                      ? 'text-foreground font-bold'
                      : 'text-foreground/60',
                  )}
                >
                  Transactions
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
          {showMaker && (
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname?.startsWith('/maker')
                    ? 'text-foreground font-bold'
                    : 'text-foreground/60',
                )}
              >
                Maker
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex w-full flex-col items-center p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href={`/maker/${location.search}`}
                        className={cn(
                          'transition-colors hover:text-foreground/80',
                          pathname === '/maker'
                            ? 'text-foreground font-bold'
                            : 'text-foreground/60',
                        )}
                      >
                        Manage
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a
                        href={`/maker/transactions/${location.search}`}
                        className={cn(
                          'transition-colors hover:text-foreground/80',
                          pathname === '/maker/transactions'
                            ? 'text-foreground font-bold'
                            : 'text-foreground/60',
                        )}
                      >
                        Transactions
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
          {showDealer && (
            <NavigationMenuItem>
              <Link href={`/dealer/${location.search}`} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    'transition-colors hover:text-foreground/80',
                    pathname?.startsWith('/dealer')
                      ? 'text-foreground font-bold'
                      : 'text-foreground/60',
                  )}
                >
                  Dealer
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
