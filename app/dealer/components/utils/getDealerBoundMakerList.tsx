import { thegraphBaseUrl } from '@/config/env'
import { Address } from 'viem'

export interface IBoundMakers {
  id: Address
  owner: Address
}

export interface IDealerItem {
  id: Address
  mdcs: IBoundMakers[]
}

interface IBoundMakerResult {
  data: {
    dealers: IDealerItem[]
  }
}

export async function getDealerBoundMaker(
  accountAddress: Address,
): Promise<IBoundMakers[]> {
  const body = JSON.stringify({
    query: `{
      dealers(where: {id: "${accountAddress.toLowerCase()}"}) {
        id
        mdcs {
          id
          owner
        }
      }
    }`,
  })

  const {
    data: { dealers = [] },
  }: IBoundMakerResult = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  const boundMakers: IBoundMakers[] =
    dealers?.[0]?.mdcs
      .map((item: IBoundMakers) => {
        return (item?.id && item) || undefined
      })
      .filter((v: any) => v) || []

  return boundMakers
}
