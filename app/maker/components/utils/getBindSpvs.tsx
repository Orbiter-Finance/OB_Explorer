import { thegraphBaseUrl } from '@/config/env'
import { Address } from 'viem'
export interface BindSpv {
  spv: Address
  chainId: string
}
export type BindSPVs = {
  currBoundSpvInfo: BindSpv[]
}
export interface IBindSpvResult {
  data: {
    mdcs: BindSPVs[]
  }
}

export async function getBindSpvs(
  accountAddress: Address,
): Promise<IBindSpvResult> {
  const body = JSON.stringify({
    query: `{
      mdcs(
        where: {owner: "${accountAddress.toLowerCase()}"}
        orderBy: createblockTimestamp
        orderDirection: desc
        first: 1
      ) {
        currBoundSpvInfo {
          spv
          chainId
        }
      }
    }`,
  })

  const res: IBindSpvResult = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  return res
}
