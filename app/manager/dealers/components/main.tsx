'use client'

import { DealerHistoryProfitWithdraw } from '@/app/dealer/components/dealer-history-profit-withdraw'
import { SkeletonTable } from '@/components/skeleton-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PERCENT_RATIO_MULTIPLE } from '@/config/constants'
import { thegraphBaseUrl } from '@/config/env'
import { cn, equalBN } from '@/lib/utils'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { BigNumber } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import React from 'react'
import { Address } from 'viem'

interface DealerInfo {
  dealer: Address
  feeRatio: number
  boundMakers: string[]
  subRows?: []
}

export async function fetchDealers() {
  const body = JSON.stringify({
    query: `{
      dealers {
        id
        feeRatio
      }
      
      mdcs {
        id
        owner
        mapping {
          dealerMapping {
            dealerAddr
          }
        }
      }
    }`,
  })

  const { data } = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  const dealers: DealerInfo[] = []
  for (const item of data.dealers) {
    const boundMakers: string[] = []
    for (const item1 of data.mdcs) {
      if (
        boundMakers.findIndex((m) => equalBN(item1.owner, m)) === -1 &&
        item1.mapping.dealerMapping.findIndex((d: any) =>
          equalBN(d.dealerAddr, item.id),
        ) > -1
      ) {
        boundMakers.push(getAddress(item1.owner))
      }
    }

    dealers.push({
      dealer: getAddress(item.id) as Address,
      feeRatio: BigNumber.from(item.feeRatio).toNumber(),
      boundMakers,
    })
  }

  return dealers
}

export function ManagerDealersMain() {
  const [dealers, setDealers] = React.useState<DealerInfo[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (loading) return

    setLoading(true)
    fetchDealers().then((v) => {
      setLoading(false)
      setDealers(v)
    })
  }, [])

  const columns: ColumnDef<DealerInfo>[] = [
    {
      size: 50,
      header: '#',
      cell: ({ row }) => {
        return <span className="text-slate-500">{row.index + 1}</span>
      },
    },
    {
      accessorKey: 'dealer',
      header: 'Dealer',
    },
    {
      accessorKey: 'feeRatio',
      header: 'Fee Ratio',
      cell: ({ row }) => {
        return (
          <span>{row.original.feeRatio / PERCENT_RATIO_MULTIPLE}&nbsp;%</span>
        )
      },
    },
    {
      accessorKey: 'boundMakers',
      header: 'Bound makers',
      cell: ({ row }) => {
        const { boundMakers } = row.original
        return (
          <div>
            {boundMakers.length === 0
              ? '-'
              : boundMakers.map((m, index) => <p key={index}>{m}</p>)}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: dealers,
    columns,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className="flex justify-between space-x-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex">
            <div className="flex-1">Dealers</div>
          </CardTitle>
          <CardDescription>
            List of all dealers registered in the FeeManager contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable size={6}></SkeletonTable>
          ) : (
            <Table>
              <TableHeader className="top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const size = header.getSize()
                      return (
                        <TableHead
                          key={header.id}
                          style={{ width: size ? `${size}px` : '' }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <>
                      <TableRow
                        className={cn(
                          'font-medium',
                          row.original.boundMakers.length > 0 && 'border-b-0',
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.original.boundMakers.length > 0 && (
                        <TableRow key={'sub_' + row.id}>
                          <TableCell></TableCell>
                          <TableCell colSpan={row.getVisibleCells().length - 1}>
                            <DealerHistoryProfitWithdraw
                              accountAddress={row.original.dealer}
                              withdrawUser="Dealer"
                              hideCard={true}
                              hideInput={true}
                            ></DealerHistoryProfitWithdraw>
                            {/* {renderSubComponent({ subRows: row.original.subRows })} */}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
