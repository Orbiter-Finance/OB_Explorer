import { thegraphBaseUrl } from '@/config/env'
import { Address } from 'viem'

export interface IChainInfoUpdatedItem {
  id: string
  name?: string
}
export interface IDealerItem {
  id: string
  feeRatio?: string
}
export interface IEbcItem {
  id: string
}
export interface IMdcsItem {
  id: Address
  mapping: {
    chainIdMapping: { chainId: string }[]
    dealerMapping: { dealerAddr: string }[]
    ebcMapping: { ebcAddr: string }[]
  }
}
interface ICheckListResult {
  data: {
    chainRels: IChainInfoUpdatedItem[]
    dealers: IDealerItem[]
    ebcRels: IEbcItem[]
    mdcs: IMdcsItem[]
  }
}

export async function getCheckList(
  accountAddress: Address,
): Promise<ICheckListResult> {
  const body = JSON.stringify({
    query: `{
      dealers {
        id
        feeRatio
      }
      ebcRels {
        id
      }
      chainRels {
        id
      }
      mdcs (where: {owner: "${accountAddress.toLowerCase()}"}) {
        id
        mapping {
          chainIdMapping {
            chainId
          }
          dealerMapping {
            dealerAddr
          }
          ebcMapping {
            ebcAddr
          }
        }
      }
    }`,
  })

  const res: ICheckListResult = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  return res
}
