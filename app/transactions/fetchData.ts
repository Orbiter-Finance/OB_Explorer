import axiosService from '../../lib/request'
import { openapiBaseUrl } from '@/config/env'

export type ListItem = {
  fromHash: string
  toHash: string
  fromChainId: string
  toChainId: string
  fromValue: string
  toValue: string
  fromAmount: string
  toAmount: string
  fromSymbol: string
  status: string
  fromTimestamp: string
  toTimestamp: string
  sourceAddress: string
  sourceMaker: string
  targetMaker: string
}

export type Result = {
  data: {
    id: number
    jsonrpc: string
    result: {
      list: ListItem[] | []
      count: number
    }
  }
}

export interface ITxListParams {
  pageIndex: number
  pageSize: number
}

export async function fetchData(params: ITxListParams): Promise<Result> {
  try {
    return new Promise(async (resolve, reject) => {
      const res: Result = await axiosService.post(openapiBaseUrl, {
        id: 1,
        jsonrpc: '2.0',
        method: 'orbiter_txList',
        params: [0, params.pageSize, params.pageIndex],
      })
      if (res?.data?.result && Object.keys(res.data.result).length > 0) {
        return resolve(res)
      } else {
        return reject()
      }
    })
  } catch (error) {
    return Promise.reject(error)
  }
}
