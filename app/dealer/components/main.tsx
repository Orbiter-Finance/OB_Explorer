'use client'
import * as React from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useNetwork } from 'wagmi'
import { UpdateDealer } from './update-dealer'
import { DealerHistoryProfitWithdraw } from './dealer-history-profit-withdraw'
import { DealerBoundByMakerList } from './dealer-bound-by-maker-list'
import { DealerWithDrawRecord } from './dealer-withdraw-record'
import { useContractRead } from 'wagmi'
import { contracts } from '@/config/contracts'
import { Abi, Hash } from 'viem'
import { BigNumberish } from 'ethers'
import { useMemo } from 'react'
import { useCheckChainId } from '@/hooks/check-chainId'

export interface DealerInfo {
  feeRatio: BigNumberish
  extraInfoHash: Hash
}

export function DealerMain() {
  const account = useAccount()
  const { checkChainIdToMainnet } = useCheckChainId()
  const { data: dealerInfo } = useContractRead<
    Abi,
    'getDealerInfo',
    DealerInfo
  >({
    ...contracts.orFeeManager,
    functionName: 'getDealerInfo',
    args: [account?.address],
    watch: true,
  })
  const isHadDealerInfo = useMemo(() => {
    return dealerInfo && Number(dealerInfo.feeRatio) > 0
  }, [dealerInfo])

  if (!account.address) return <ConnectKitButton />

  return (
    <div>
      <div className="w-full flex justify-between">
        <UpdateDealer dealerInfo={dealerInfo}></UpdateDealer>
        {isHadDealerInfo && (
          <DealerHistoryProfitWithdraw withdrawUser="Dealer"></DealerHistoryProfitWithdraw>
        )}
      </div>
      {isHadDealerInfo && (
        <div className="flex">
          <DealerBoundByMakerList></DealerBoundByMakerList>
          <DealerWithDrawRecord></DealerWithDrawRecord>
        </div>
      )}
    </div>
  )
}
