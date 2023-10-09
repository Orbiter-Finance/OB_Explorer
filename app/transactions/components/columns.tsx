'use client'

import { ColumnDef } from '@tanstack/react-table'
import { statuses } from '../data/data'
import {
  formatAddress,
  dateFormatStandard,
  getFromNowDate,
  clearFloatZero,
  getChainInfoURL,
} from '@/lib/utils'
import { ListItem } from '../fetchData'
import { getChainName } from '@/config/chain-list'
import { TransactionDetail } from './transaction-detail'
import { renderTooltipProvider } from '@/lib/renderComponents'

type CellTable = {
  options: {
    state: {
      pagination: {
        pageIndex: number
        pageSize: number
      }
    }
  }
}

const convertToDetail = (item: ListItem) => {
  return {
    SourceChainHash: item.fromHash,
    TargetChainHash: item.toHash,
    SourceChain: getChainName(item.fromChainId) || '-',
    TargetChain: getChainName(item.toChainId) || '-',
    Source: item.sourceAddress,
    Dest: item.targetAddress,
    Date: dateFormatStandard(item.fromTimestamp, 'DD-MM-YYYY ss:mm:HH'),
    CoinType: item.fromSymbol,
    SendTheNumber: clearFloatZero(item.fromAmount) || '-',
    NumberOfReceiving: clearFloatZero(item.toAmount) || '-',
    Status: statuses[(item.status as keyof typeof statuses) || 'default'],
    JumpLinkSource: getChainInfoURL(item.fromChainId),
    JumpLinkDest: getChainInfoURL(item.toChainId),
  }
}

export const columns: ColumnDef<ListItem>[] = [
  {
    accessorKey: 'index',
    header: () => <div className="pl-5">#</div>,
    cell: ({ row, table }) => {
      const curTable: CellTable = JSON.parse(JSON.stringify(table))
      const { pageIndex, pageSize } = curTable?.options?.state?.pagination
      const currentIndex =
        pageIndex === 1
          ? row.index + 1
          : (pageIndex - 1) * pageSize + row.index + 1
      return (
        <div className="flex pl-5 space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {currentIndex}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'CoinType',
    header: 'Coin',
    cell: ({ row }) => {
      return (
        <div className="flex w-24 space-x-2">
          <div className="max-w-[500px] flex items-center truncate text-sm font-normal">
            {row.original.fromSymbol || '-'}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'fromAmount',
    header: () => <div>Value</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col w-auto">
          <div className="max-w-[300px]">
            Sent:&nbsp;
            {row.original.fromAmount
              ? clearFloatZero(row.original.fromAmount)
              : '-'}
          </div>
          <span className="max-w-[300px] text-slate-400">
            Received:&nbsp;
            {row.original.toAmount && row.original.toAmount !== 'NaN'
              ? clearFloatZero(row.original.toAmount)
              : '-'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fromChainId',
    header: () => <div>Source</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col w-[150px]">
          <div>{getChainName(row.original.fromChainId) || '-'}</div>
          <div className="max-w-[100px] cursor-pointer text-blue-500">
            <TransactionDetail
              triggerText={formatAddress(row.original.fromHash) || '-'}
              addressDetail={convertToDetail(row.original)}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'toChainId',
    header: () => <div>Dest</div>,
    cell: ({ row }) => {
      return (
        <div className="flex w-[150px] flex-col">
          <div>{getChainName(row.original.toChainId) || '-'}</div>
          <span className="max-w-[100px] cursor-pointer text-blue-500">
            <TransactionDetail
              triggerText={formatAddress(row.original.toHash) || '-'}
              addressDetail={convertToDetail(row.original)}
            />
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'Date',
    cell: ({ row }) => {
      const currentDate: number = Number(
        new Date(row.original.fromTimestamp).getTime(),
      )
      return (
        <div className="flex w-[150px] items-center">
          {renderTooltipProvider(
            <span>{getFromNowDate(currentDate)}</span>,
            <p>{dateFormatStandard(currentDate)}</p>,
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status =
        statuses[(row.getValue('status') as keyof typeof statuses) || 'default']
      if (!status) {
        return null
      }
      return (
        <div className="flex w-[150px] items-center">
          <span>{status}</span>
        </div>
      )
    },
  },
]
