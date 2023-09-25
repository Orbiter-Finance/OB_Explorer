'use client'

import { MainNav } from '@/components/main-nav'
import { MobileNav } from '@/components/mobile-nav'
import { ConnectKitButton } from 'connectkit'

export function SiteHeader() {
  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {/* <ModeToggle /> */}
            <ConnectKitButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
