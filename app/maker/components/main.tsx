'use client'

import { Button } from '@/components/ui/button'
import { contracts } from '@/config/contracts'
import { useCheckChainId } from '@/hooks/check-chainId'
import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import { predictMDCAddress } from '@/lib/utils'
import { ConnectKitButton } from 'connectkit'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Address, Hex } from 'viem'
import { useAccount, useContractWrite, usePublicClient } from 'wagmi'
import { CheckList } from './check-list'
import { MakerFeeRatioAmount } from './maker-fee-ratio-amount'
import { RuleList } from './rule-list'
import { IBindSpvResult, getBindSpvs } from './utils/getBindSpvs'
import {
  IChainInfoUpdatedItem,
  IDealerItem,
  IEbcItem,
  IMdcsItem,
  getCheckList,
} from './utils/getChecklist'

function useMDCInfo() {
  const account = useAccount()
  const { currentChainId } = useCheckChainId()
  const client = usePublicClient({
    chainId: currentChainId,
  })
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
  const { checkChainIdToMainnet } = useCheckChainId()
  const contractWrite = useContractWrite({
    ...contracts.orMDCFactory,
    functionName: 'createMDC',
  })
  const { currentChainId } = useCheckChainId()
  const publicClient = usePublicClient({
    chainId: currentChainId,
  })

  const [loading, setLoading] = useState(false)
  const [hash, setHash] = useState('')

  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)
      setHash('')
      await checkChainIdToMainnet()
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

function useCheckListData(accountAddress?: Address) {
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

      const res = await getCheckList(accountAddress!)
      const {
        data: { dealers = [], ebcRels = [], chainRels = [], mdcs = [] },
      } = res
      setDealersList(dealers)
      setEbcsRels(ebcRels)
      setChainInfoUpdatedsList(chainRels)
      setMdcs(mdcs)
      setOwnerContractAddress(predictMDCAddress(accountAddress) as Address)
      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useMemo(() => {
    if (accountAddress) refetch()
  }, [accountAddress])

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

  const checkListData = useCheckListData(account.address)
  const mdcDeploy = useMDCDeploy(mdcInfo.refetch, checkListData.refetch)
  const { bindSpvData, isSpvLoading } = useSpvBind()

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
            className="w-auto"
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
        <RuleList accountAddress={account.address} />
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

      <MakerFeeRatioAmount
        accountAddress={account.address}
        ownerContractAddress={checkListData.ownerContractAddress}
      />
    </div>
  )
}
