import axiosService from '@/lib/request'
import { Address, Hex } from 'viem'
import { submitterBaseUrl } from '@/config/env'

export type ListItem = {
  balance: string
  debt: string
  token: Address
  token_chain_id: number
  total_profit: string
  total_withdrawn: string
  inputAmount?: string
}

export interface txListParams {
  pageIndex: number
  pageSize: number
}

interface IMergeWithZero {
  MergeWithZero: {
    base_node: string
    zero_bits: string
    zero_count: number
  }
}

interface IValue {
  Value: string
}

interface IShortCut {
  height: string
  key: string
  value: string
}

export interface IProofItem {
  leave_bitmap: string
  no1_merge_value: [number, Address]
  path: Hex
  siblings: Array<IMergeWithZero & IValue & IShortCut>
  token: {
    balance: string
    debt: string
    token: Address
    token_chain_id: number
  }
}

type Result<T> = {
  status: number
  data: {
    id: number
    jsonrpc: string
    result: T[] | []
  }
}

export type ProfitProofResult = Result<IProofItem>
export type ProfitInfoResult = Result<ListItem>

interface ResultTExtends {
  status: number
}

const handlerResReturn = <T extends ResultTExtends>(
  res: T,
): T | Promise<never> => {
  return res?.status === 200 ? res : Promise.reject()
}

export async function submitter_getProfitProof<
  T extends ResultTExtends,
>(params: { tokens: [number, Address][]; user: Address }): Promise<T> {
  try {
    const res: T = await axiosService.post(submitterBaseUrl, {
      jsonrpc: '2.0',
      method: 'submitter_getProfitProof',
      params,
      id: 1,
    })
    return handlerResReturn(res)
  } catch (error) {
    return Promise.reject(error)
  }
}
export async function submitter_getAllProfitInfo<
  T extends ResultTExtends,
>(params: { address: Address }): Promise<T> {
  try {
    const res: T = await axiosService.post(submitterBaseUrl, {
      jsonrpc: '2.0',
      method: 'submitter_getAllProfitInfo',
      params,
      id: 1,
    })
    return handlerResReturn<T>(res)
  } catch (error) {
    return Promise.reject(error)
  }
}
