import { BigNumberish } from 'ethers'
import axiosService from '@/lib/request'
import { openapiBaseUrl } from '@/config/env'

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

interface GetChainListResult {
  data: {
    result: {
      chainList: ChainInterface[]
    }
  }
}

export let chainList: ChainInterface[] = []

export async function getChainList(): Promise<ChainInterface[]> {
  try {
    if (chainList.length > 0) {
      return chainList
    }
    const res: GetChainListResult = await axiosService.post(openapiBaseUrl, {
      id: 1,
      jsonrpc: '2.0',
      method: 'orbiter_getTradingPairs',
      params: [],
    })
    const result = res?.data?.result
    if (result && Object.keys(result).length > 0) {
      chainList = result?.chainList ?? []
      return chainList
    } else {
      return Promise.reject(res)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export function getChainName(chainId: number | string) {
  for (const chain of chainList) {
    if (chain.chainId == String(chainId)) return chain.name
  }
  return undefined
}

getChainList()
