'use client'
import { contracts } from '@/config/contracts'
import { useCheckChainId } from '@/hooks/check-chainId'
import { ConnectKitButton } from 'connectkit'
import { BigNumberish } from 'ethers'
import { useMemo } from 'react'
import { Abi, Hash } from 'viem'
import { useAccount, useContractRead } from 'wagmi'
import { DealerBoundByMakerList } from './dealer-bound-by-maker-list'
import { DealerHistoryProfitWithdraw } from './dealer-history-profit-withdraw'
import { DealerWithDrawRecord } from './dealer-withdraw-record'
import { UpdateDealer } from './update-dealer'

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
