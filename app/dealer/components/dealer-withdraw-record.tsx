import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAccount } from 'wagmi'
import { Loading } from '@/components/loding'
import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import {
  getDealerWithDrawRecord,
  IWithdrawItem,
} from './utils/getDealerWithdrawRecord'
import { getChainName } from '@/config/chain-list'
import {
  getTokenInfoDecimal,
  getTokenInfoSymbol,
} from '@/lib/thegraphs/manager'
import { utils } from 'ethers'
import { dateFormatStandard, formatAddress, getChainInfoURL } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

interface IDealerWithDrawRecordListInterface {}

function useWithdrawRecordData() {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [withdrawRecordList, setWithdrawRecordList] = useState<IWithdrawItem[]>(
    [],
  )

  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)
      const {
        data: { withdraws = [] },
      } = await getDealerWithDrawRecord(account.address!)
      setWithdrawRecordList(withdraws)
      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return {
    refetch,
    withdrawRecordList,
    loading,
  }
}
export function DealerWithDrawRecord(
  props: IDealerWithDrawRecordListInterface,
) {
  const { loading, withdrawRecordList, refetch } = useWithdrawRecordData()
  const { resolvedTheme } = useTheme()

  const columns: ColumnDef<IWithdrawItem>[] = useMemo(() => {
    return [
      {
        accessorKey: 'index',
        header: () => <div>#</div>,
        cell: ({ row }) => {
          return <div>{row.index + 1}</div>
        },
      },
      {
        accessorKey: 'chainId',
        header: () => <div>ChainID</div>,
        cell: ({ row }) => {
          return <div>{getChainName(row.getValue('chainId')) || '-'}</div>
        },
      },
      {
        accessorKey: 'token',
        header: () => <div>Token</div>,
        cell: ({ row }) => {
          return (
            <div>
              {getTokenInfoSymbol(
                row.getValue('chainId'),
                row.getValue('token'),
              ) || row.getValue('token')}
            </div>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div>Amount</div>,
        cell: ({ row }) => {
          return (
            <div>
              {utils.formatUnits(
                row.getValue('amount') || 0,
                getTokenInfoDecimal(
                  Number(row.original.chainId),
                  row.original.token,
                ),
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'blockTimestamp',
        header: () => <div>Withdraw Time</div>,
        cell: ({ row }) => {
          const currentTime = Number(row.getValue('blockTimestamp')) * 1000
          return <div>{dateFormatStandard(currentTime) || '-'}</div>
        },
      },
      {
        accessorKey: 'transactionHash',
        header: () => <div>Transaction Hash</div>,
        cell: ({ row }) => {
          const renderItem = (chainId: string) => {
            const txHash = row.original.transactionHash
            const baseLink = getChainInfoURL(chainId)
            const jumpPrefixes = '/tx/'
            if (!txHash) return <span>{'-'}</span>
            return (
              <a
                className="text-blue-500 cursor-pointer"
                target="_blank"
                href={baseLink + jumpPrefixes + txHash}
              >
                {formatAddress(txHash) || '-'}
              </a>
            )
          }
          return renderItem(row.original.chainId)
        },
      },
    ]
  }, [])

  const table = useReactTable({
    data: withdrawRecordList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card className="flex-1 mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between relative">
          Withdraw Record
          <Button
            variant="outline"
            className="check-chainId"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>View withdraw history.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Loading show={loading} className={'h-32'} />
        ) : (
          <div className="flex justify-between flex-wrap">
            <div className="w-full">
              <div className="overflow-auto overflow-x-hidden relative">
                <Table divclassname="max-h-80">
                  <TableHeader
                    className="sticky top-0 z-10"
                    style={{
                      backgroundColor:
                        resolvedTheme === 'dark' ? '#020817' : 'white',
                    }}
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
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
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell as any,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
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
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
