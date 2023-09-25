import { BigNumberish } from 'ethers'
import chainListMainnet from './chainList.mainnet'
import chainListTestnet from './chainList.testnet'
import { appMainnet } from '@/config/env'

export interface ChainInterface {
  chainId: string | number
  networkId: string | number
  internalId: string | number
  name: string

  api?: {
    url: string
    key: string
    intervalTime?: number
  }
  nativeCurrency?: {
    name: string
    symbol: string
    decimals: number
    address: BigNumberish
  }
  rpc?: string[]
  watch?: string[]
  alchemyApi?: {
    category: string[]
  }
  contracts?: string[]
  tokens?: {
    name: string
    symbol: string
    decimals: number
    address: BigNumberish
    id?: number
  }[]
  xvmList?: BigNumberish[]
  infoURL?: string
}

// @ts-ignore
export const chainList: ChainInterface[] = appMainnet
  ? chainListMainnet
  : chainListTestnet

export function getChainName(chainId: number | string) {
  for (const chain of chainList) {
    if (chain.chainId == String(chainId)) return chain.name
  }
  return undefined
}
