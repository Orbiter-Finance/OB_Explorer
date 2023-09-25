'use client'

import { ChainInfoInterface } from '@/lib/thegraphs/manager'
import { createContext } from 'react'

export const AppContext = createContext({
  chainInfos: [] as ChainInfoInterface[],
})
