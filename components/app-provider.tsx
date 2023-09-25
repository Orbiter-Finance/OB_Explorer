'use client'

import { ChainInfoInterface, getChainInfos } from '@/lib/thegraphs/manager'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { useEffect, useState } from 'react'
import { createConfig, WagmiConfig } from 'wagmi'
import { goerli, mainnet } from 'wagmi/chains'
import { AppContext } from './app-context'
import { useTheme } from 'next-themes'
import { appMainnet } from '@/config/env'

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',

    // Required
    appName: process.env.NEXT_PUBLIC_APP_NAME || '',

    // Optional
    appDescription: '',
    appUrl: '',
    appIcon: '',

    chains: [appMainnet ? mainnet : goerli],
  }),
)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [chainInfos, setChainInfos] = useState<ChainInfoInterface[]>([])
  const { theme } = useTheme()

  useEffect(() => {
    getChainInfos().then((r) => {
      setChainInfos(r)
      setMounted(true)
    })
  }, [])

  return (
    <AppContext.Provider value={{ chainInfos: chainInfos }}>
      <WagmiConfig config={config}>
        <ConnectKitProvider
          mode={!theme || theme == 'system' ? 'auto' : (theme as any)}
        >
          {mounted && children}
        </ConnectKitProvider>
      </WagmiConfig>
    </AppContext.Provider>
  )
}
