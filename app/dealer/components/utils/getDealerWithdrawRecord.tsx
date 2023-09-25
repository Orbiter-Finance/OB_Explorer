import { thegraphBaseUrl } from '@/config/env'
import { Address, Hash } from 'viem'

export interface IWithdrawItem {
  user: Address
  amount: string
  chainId: string
  debt: string
  token: Address
  transactionHash: Hash
  blockTimestamp: number
}

interface IDealerWithDrawRecordResult {
  data: {
    withdraws: IWithdrawItem[]
  }
}

export async function getDealerWithDrawRecord(
  accountAddress: Address,
): Promise<IDealerWithDrawRecordResult> {
  const body = JSON.stringify({
    query: `{
      withdraws(
        where: {
          user: "${accountAddress.toLowerCase()}"
        }
        orderBy: blockTimestamp
        orderDirection: desc
      ) {
        chainId
        token
        amount
        blockTimestamp
        transactionHash
      }
    }`,
  })

  const res = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  return res
}
