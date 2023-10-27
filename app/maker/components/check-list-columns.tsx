'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IChainInfoUpdatedItem,
  IDealerItem,
  IEbcItem,
} from './utils/getChecklist'
import { toast } from '@/components/ui/use-toast'
import { PERCENT_RATIO_MULTIPLE } from '@/config/constants'
import { getChainName } from '@/config/chain-list'

const checkListMaxNumList = {
  Dealers: 99,
  Ebcs: 9,
  Chains: 99,
}

const setCheckedLessMax = (
  row: any,
  table: any,
  value: boolean,
  type: keyof typeof checkListMaxNumList,
) => {
  setTimeout(() => {
    const currentSelectNum =
      table.getFilteredSelectedRowModel().flatRows.length || 0
    if (!!value) {
      if (currentSelectNum <= checkListMaxNumList[type]) {
        row.toggleSelected(true)
      } else {
        row.toggleSelected(false)
        toast({
          variant: 'destructive',
          duration: 2000,
          title: `${type} can not be empty or less than ${checkListMaxNumList[type]}.`,
        })
      }
    } else {
      row.toggleSelected(false)
    }
  })
}

export const dealerColumn: ColumnDef<IDealerItem>[] = [
  {
    accessorKey: 'id',
    header: () => <div>Address</div>,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <span className="truncate font-medium">{row.getValue('id')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'feeRatio',
    header: () => <div>Fee Ratios</div>,
    cell: ({ row }) => {
      return (
        <div className="flex">
          <span className="truncate font-medium">
            {row.getValue('feeRatio')
              ? `${Number(row.getValue('feeRatio')) / PERCENT_RATIO_MULTIPLE}%`
              : '-'}
          </span>
        </div>
      )
    },
  },
  {
    id: 'select',
    header: () => <div>Status</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => {
            setCheckedLessMax(row, table, value, 'Dealers')
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
  },
]

export const ebcColumn: ColumnDef<IEbcItem>[] = [
  {
    accessorKey: 'id',
    header: () => <div className="">Address</div>,
    cell: ({ row }) => {
      return (
        <div className="flex  space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('id')}
          </span>
        </div>
      )
    },
  },
  {
    id: 'select',
    header: () => <div>Status</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => {
            setCheckedLessMax(row, table, value, 'Ebcs')
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
  },
]

export const chainsColumn: ColumnDef<IChainInfoUpdatedItem>[] = [
  {
    accessorKey: 'id',
    header: () => <div className="">ID</div>,
    cell: ({ row }) => {
      return (
        <div className="flex  space-x-2">
          <span className="truncate font-medium">{row.getValue('id')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'name',
    header: () => <div>Chains</div>,
    cell: ({ row }) => {
      const curId = row.original.id
      return (
        <div className="flex  space-x-2">
          <span className="truncate font-medium">
            {getChainName(curId) || '-'}
          </span>
        </div>
      )
    },
  },
  {
    id: 'select',
    header: () => <div>Status</div>,
    cell: ({ row, table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => {
            setCheckedLessMax(row, table, value, 'Chains')
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
  },
]
