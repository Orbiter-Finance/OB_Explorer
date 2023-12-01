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
  targetAddress: string
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

export enum StatusEnum {
  all,
  unRefunded,
  refunded,
}

const statusLabel = {
  all: 'All',
  unRefunded: 'Not refunded',
  refunded: 'Refunded',
}

export enum Versions {
  all = '',
  v1 = '1',
  v3 = '2',
}

const versionLabelList = {
  all: 'All',
  v1: 'Version 1',
  v3: 'Dealer version',
}

export const statusList = [
  {
    label: statusLabel.all,
    value: StatusEnum.all,
  },
  {
    label: statusLabel.unRefunded,
    value: StatusEnum.unRefunded,
  },
  {
    label: statusLabel.refunded,
    value: StatusEnum.refunded,
  },
]

export const versionList = [
  {
    label: versionLabelList.all,
    value: Versions.all,
  },
  {
    label: versionLabelList.v1,
    value: Versions.v1,
  },
  {
    label: versionLabelList.v3,
    value: Versions.v3,
  },
]

const selectHashLabels = {
  source: 'Source Hash',
  dest: 'Dest Hash',
}

export const selectHashValues = {
  source: 'source',
  dest: 'dest',
}

export const selectHashList = [
  {
    label: selectHashLabels.source,
    value: selectHashValues.source,
  },
  {
    label: selectHashLabels.dest,
    value: selectHashValues.dest,
  },
]

export interface ITxListParams {
  status?: StatusEnum
  pageIndex: number
  pageSize: number
  version: string
  sourceChainId: string
  destChainId: string
  sourceHash: string
  destHash: string
  startTime?: Date
  endTime?: Date
  makerAddress?: string
}

export async function fetchData(params: ITxListParams): Promise<Result> {
  const {
    status = 0,
    pageSize,
    pageIndex,
    makerAddress = '',
    startTime = 0,
    endTime = new Date().valueOf(),
    sourceChainId = '',
    destChainId = '',
    sourceHash = '',
    destHash = '',
    version = '',
  } = params
  try {
    const cParams = [
      status,
      pageSize,
      pageIndex,
      makerAddress,
      [startTime, endTime],
      sourceChainId,
      destChainId,
      sourceHash,
      destHash,
      version,
    ]
    const res: Result = await axiosService.post(openapiBaseUrl, {
      id: 1,
      jsonrpc: '2.0',
      method: 'orbiter_txList',
      params: cParams,
    })
    if (res?.data?.result && Object.keys(res.data.result).length > 0) {
      return res
    } else {
      return Promise.reject(res)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}
