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
import { useAccount, useChainId } from 'wagmi'
import { Loading } from '@/components/loding'
import {
  getDealerBoundMaker,
  IBoundMakers,
} from './utils/getDealerBoundMakerList'
import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { renderJumpItem } from '@/lib/renderComponents'

interface IDealerBoundByMakerListInterface {}

function useBoundMakerData() {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [boundMakerList, setBoundMakerList] = useState<IBoundMakers[]>([])

  const { refetch } = usePromiseWithToast(
    async () => {
      setLoading(true)
      const boundMakerRes = await getDealerBoundMaker(account.address!)
      setBoundMakerList(boundMakerRes)
      setLoading(false)
    },
    { reject: () => setLoading(false) },
  )

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return {
    refetch,
    boundMakerList,
    loading,
  }
}
export function DealerBoundByMakerList(
  props: IDealerBoundByMakerListInterface,
) {
  const { loading, boundMakerList, refetch } = useBoundMakerData()
  const { resolvedTheme } = useTheme()
  const chainId = useChainId()

  const columns: ColumnDef<IBoundMakers>[] = useMemo(() => {
    return [
      {
        accessorKey: 'index',
        header: () => <div>#</div>,
        cell: ({ row }) => {
          return <div>{row.index + 1}</div>
        },
      },
      {
        accessorKey: 'id',
        header: () => <div>Maker Contract</div>,
        cell: ({ row }) => {
          return renderJumpItem(chainId, row.original.id, 'address')
        },
      },
      {
        accessorKey: 'owner',
        header: () => <div>Maker Address</div>,
        cell: ({ row }) => {
          return renderJumpItem(chainId, row.original.owner, 'address', {
            startCount: 8,
            endCount: 14,
          })
        },
      },
    ]
  }, [chainId])

  const table = useReactTable({
    data: boundMakerList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card className="flex-1 mr-4 mt-4 max-w-[455px]">
      <CardHeader>
        <CardTitle className="flex justify-between relative">
          Bound Maker
          <Button
            variant="outline"
            className="check-chainId"
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>See Maker you are bound with.</CardDescription>
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
