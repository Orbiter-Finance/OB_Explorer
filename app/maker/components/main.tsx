'use client'

import { Button } from '@/components/ui/button'
import { contracts } from '@/config/contracts'
import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import { predictMDCAddress } from '@/lib/utils'
import { ConnectKitButton } from 'connectkit'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Address, Hex } from 'viem'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
} from 'wagmi'
import { RuleList } from './rule-list'
import { CheckList } from './check-list'
import { UserAmount } from './user-amount'
import { MakerFeeRatioAmount } from './maker-fee-ratio-amount'
import { Spv } from './spv'
import {
  getCheckList,
  IChainInfoUpdatedItem,
  IDealerItem,
  IEbcItem,
  IMdcsItem,
} from './utils/getChecklist'
import { getBindSpvs, IBindSpvResult } from './utils/getBindSpvs'
import { useCheckChainId } from '@/hooks/check-chainId'

function useMDCInfo() {
  const account = useAccount()
  const client = usePublicClient()
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState(undefined as Hex | undefined)

  const { refetch } = usePromiseWithToast(
    async () => {
      setCode(undefined)
      setLoading(true)

      const mdc = predictMDCAddress(account.address)
      if (mdc) {
        const code = await client.getBytecode({ address: mdc })
        setCode(code)
      }

      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return { loading, code, refetch }
}

function useMDCDeploy(
  mdcInfoRefetch?: () => Promise<any>,
  checkListRefetch?: () => Promise<any>,
) {
  const contractWrite = useContractWrite({
    ...contracts.orMDCFactory,
    functionName: 'createMDC',
  })
  const publicClient = usePublicClient()

  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState('')

  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)
      setHash('')

      const { hash } = await contractWrite.writeAsync()
      setHash(hash)

      await publicClient.waitForTransactionReceipt({ hash })

      setLoading(false)

      mdcInfoRefetch && mdcInfoRefetch()
      checkListRefetch && checkListRefetch()
    },
    { reject: () => setLoading(false) },
  )

  return { loading, hash, refetch }
}

function useCheckListData() {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [dealerList, setDealersList] = useState([] as IDealerItem[])
  const [chainInfoUpdatedsList, setChainInfoUpdatedsList] = useState(
    [] as IChainInfoUpdatedItem[],
  )
  const [ebcRels, setEbcsRels] = useState([] as IEbcItem[])
  const [mdcs, setMdcs] = useState([] as IMdcsItem[])
  const [ownerContractAddress, setOwnerContractAddress] = useState(
    '' as Address,
  )
  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)

      const res = await getCheckList(account.address!)
      const {
        data: { dealers = [], ebcRels = [], chainRels = [], mdcs = [] },
      } = res
      setDealersList(dealers)
      setEbcsRels(ebcRels)
      setChainInfoUpdatedsList(chainRels)
      setMdcs(mdcs)
      setOwnerContractAddress(mdcs?.[0]?.id || '')
      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return {
    refetch,
    isLoading: loading,
    dealerList,
    chainInfoUpdatedsList,
    ebcRels,
    mdcs,
    ownerContractAddress,
  }
}

function useSpvBind() {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [bindSpvData, setBindSpvData] = useState<IBindSpvResult>()
  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)

      const bindSpvData: IBindSpvResult = await getBindSpvs(
        account.address as Address,
      )
      setBindSpvData(bindSpvData)
      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return { isSpvLoading: loading, refetch, bindSpvData }
}

export function MakerMain() {
  const account = useAccount()
  const mdcInfo = useMDCInfo()
  const checkListData = useCheckListData()
  const { chain } = useNetwork()
  const currentChainId = useRef(chain?.id)
  const mdcDeploy = useMDCDeploy(mdcInfo.refetch, checkListData.refetch)
  const { bindSpvData, isSpvLoading } = useSpvBind()
  const { checkChainIdToMainnet } = useCheckChainId()
  const { data: dealerInfo } = useContractRead({
    ...contracts.orFeeManager,
    functionName: 'getDealerInfo',
    args: [account?.address],
  })

  const checkChainId = async (e: any) => {
    if (e?.target?.className?.includes('check-chainId')) {
      await checkChainIdToMainnet()
    }
  }

  useEffect(() => {
    window.addEventListener('click', checkChainId, false)
    return () => window.removeEventListener('click', checkChainId, false)
  }, [])

  useEffect(() => {
    if (chain?.id && chain?.id !== currentChainId.current) {
      location.reload()
    }
  }, [chain?.id])

  if (!account.address) return <ConnectKitButton />

  if (!mdcInfo.code) {
    if (mdcInfo.loading) {
      return (
        <div className="flex text-muted-foreground items-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Check MakerDepositContract info
        </div>
      )
    } else {
      return (
        <div>
          <Button
            onClick={mdcDeploy.refetch}
            size="lg"
            disabled={mdcDeploy.loading}
            className="w-auto check-chainId"
          >
            {mdcDeploy.loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mdcDeploy.hash
              ? `Pending: ${mdcDeploy.hash}`
              : 'Deploy Maker Deposit Contract '}
          </Button>
        </div>
      )
    }
  }
  return (
    <div>
      <CheckList checkListData={checkListData} />
      <div className="mt-4">
        <RuleList />
      </div>
      {/*<div className="flex">*/}
      {/*  <UserAmount*/}
      {/*    ownerContractAddress={checkListData.ownerContractAddress}*/}
      {/*  ></UserAmount>*/}
      {/*  <Spv*/}
      {/*    ownerContractAddress={checkListData.ownerContractAddress}*/}
      {/*    bindSpvData={bindSpvData?.data}*/}
      {/*    isSpvLoading={isSpvLoading}*/}
      {/*  ></Spv>*/}
      {/*</div>*/}
      {dealerInfo && Object.keys(dealerInfo).length > 0 && (
        <MakerFeeRatioAmount
          ownerContractAddress={checkListData.ownerContractAddress}
        />
      )}
    </div>
  )
}
