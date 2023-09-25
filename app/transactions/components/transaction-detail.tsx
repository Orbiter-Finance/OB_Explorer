'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface IDetailProps {
  addressDetail: Detail
  triggerText: string
}

type Detail = {
  SourceChainHash: string
  TargetChainHash: string
  SourceChain: string
  TargetChain: string
  Source: string
  Dest: string
  Date: string
  CoinType: string
  SendTheNumber: string | number
  NumberOfReceiving: string | number
  Status: string
  JumpLinkSource: string
  JumpLinkDest: string
}

const DETAIL_KEY_LIST: (keyof Detail)[] = [
  'SourceChainHash',
  'TargetChainHash',
  'SourceChain',
  'TargetChain',
  'Source',
  'Dest',
  'CoinType',
  'Date',
  'SendTheNumber',
  'NumberOfReceiving',
  'Status',
]

const DETAIL_LABEL_MENU = {
  SourceChainHash: 'Source Chain Hash',
  TargetChainHash: 'Destination Chain Hash',
  SourceChain: 'Source Chain',
  TargetChain: 'Destination Chain',
  Source: 'From',
  Dest: 'Interacted With (To)',
  CoinType: 'Token Transferred',
  Date: 'Date',
  SendTheNumber: 'Amount Sent',
  NumberOfReceiving: 'Amount Received',
  Status: 'Status',
  JumpLinkSource: '',
  JumpLinkDest: '',
}

const jumpPrefixes = {
  SourceChainHash: '/tx/',
  TargetChainHash: '/tx/',
  Source: '/address/',
  Dest: '/address/',
} as Record<keyof Detail, string>

export function TransactionDetail(props: IDetailProps) {
  const { addressDetail, triggerText } = props
  const [dialogOpen, setDialogOpen] = useState(false)

  const renderItem = (k: keyof Detail) => {
    const baseLink =
      k == 'SourceChainHash' || k == 'Source'
        ? addressDetail.JumpLinkSource
        : addressDetail.JumpLinkDest

    if (
      !addressDetail[k] ||
      addressDetail[k] == '-' ||
      !jumpPrefixes[k] ||
      !baseLink ||
      baseLink == '-'
    )
      return <span>{addressDetail[k] || '-'}</span>

    return (
      <a
        className="text-blue-500 cursor-pointer"
        target="_blank"
        href={baseLink + jumpPrefixes[k] + addressDetail[k]}
      >
        {addressDetail[k] || '-'}
      </a>
    )
  }

  return (
    <main className="flex">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>{triggerText}</DialogTrigger>
        <DialogContent className="min-w-[50%] flex flex-col mr-8 mf-8">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
            <DialogDescription>Transaction Details</DialogDescription>
          </DialogHeader>
          <div className="h-full flex-1 flex-col space-y-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
              <div className="w-full">
                <div className="rounded-xl flex flex-col">
                  {DETAIL_KEY_LIST.map((item, index) => {
                    return (
                      <div key={index} className="w-full flex flex-col text-sm">
                        <div className="w-full flex justify-between h-12 items-center">
                          <div className="label w-[30%] min-w-[30%]">
                            {DETAIL_LABEL_MENU[item]}:
                          </div>

                          <div className="value flex-1 break-all w-[70%] max-w-[70%]">
                            {renderItem(item)}
                          </div>
                        </div>
                        {index !== DETAIL_KEY_LIST.length - 1 && (
                          <div className="border-b w-full" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
