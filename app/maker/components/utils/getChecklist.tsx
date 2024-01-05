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
    query: `
    {
      columnArraySnapshots(
        first: 1
        orderBy: enableTimestamp
        orderDirection: desc
        where: { mdc_: { owner: "${accountAddress.toLowerCase()}" }}
      ) {
        dealers
        ebcs
        chainIds
      }

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
