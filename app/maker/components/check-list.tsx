'use client'

import { SendDialog } from '@/components/send-dialog'
import { Button } from '@/components/ui/button'
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
import ORMakerDepositAbi from '@/config/abis/ORMakerDeposit.abi.json'
import { beforeUpdate } from '@/lib/utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { Address, useContractWrite } from 'wagmi'
import { chainsColumn, dealerColumn, ebcColumn } from './check-list-columns'
import {
  IChainInfoUpdatedItem,
  IDealerItem,
  IEbcItem,
  IMdcsItem,
} from './utils/getChecklist'
import { Loading } from '@/components/loding'

interface ICheckListData {
  checkListData: {
    dealerList: IDealerItem[]
    chainInfoUpdatedsList: IChainInfoUpdatedItem[]
    ebcRels: IEbcItem[]
    mdcs: IMdcsItem[]
    ownerContractAddress: Address
    isLoading: boolean
  }
}

type InitCheckedDataItemInterface =
  | IDealerItem
  | IEbcItem
  | IChainInfoUpdatedItem

type InitCheckedDataInterface =
  | IDealerItem[]
  | IEbcItem[]
  | IChainInfoUpdatedItem[]

export function CheckList(props: ICheckListData) {
  const {
    checkListData: {
      dealerList,
      ebcRels,
      chainInfoUpdatedsList,
      mdcs,
      ownerContractAddress,
      isLoading,
    },
  } = props
  const { writeAsync } = useContractWrite({
    address: ownerContractAddress,
    abi: ORMakerDepositAbi,
    functionName: 'updateColumnArray',
  })
  const [dealerRowSelection, setDealerRowSelection] = React.useState({})
  const [ebcRowSelection, setEbcRowSelection] = React.useState({})
  const [chainsRowSelection, setChainsRowSelection] = React.useState({})
  const [dealerChecked, setDealerChecked] = React.useState([])
  const [ebcChecked, setEbcChecked] = React.useState([])
  const [chainsChecked, setChainsChecked] = React.useState([])
  const [dealerInitChecked, setDealerInitChecked] = React.useState(0)
  const [ebcInitChecked, setEbcInitChecked] = React.useState(0)
  const [chainsInitChecked, setChainsInitChecked] = React.useState(0)
  const { resolvedTheme } = useTheme()
  const dealerMapping =
    (mdcs.length > 0 && mdcs[0]?.mapping && mdcs[0].mapping?.dealerMapping) ||
    []
  const ebcMapping =
    (mdcs.length > 0 && mdcs[0]?.mapping && mdcs[0].mapping?.ebcMapping) || []
  const chainIdMapping =
    (mdcs.length > 0 && mdcs[0]?.mapping && mdcs[0].mapping?.chainIdMapping) ||
    []

  const initCheckedData = (
    allList: InitCheckedDataInterface,
    checkedList: any,
    key: any,
    setFn: Function,
    saveChecked: Function,
    saveInitChecked: Function,
  ) => {
    const hadDealerChecked: {
      [key: number]: Boolean
    } = {}
    let initCheckedNum = 0
    checkedList.forEach((v: InitCheckedDataItemInterface) => {
      const curIndex = allList.findIndex(
        (item) => item.id === v[key as keyof typeof v],
      )
      if (curIndex !== -1) {
        initCheckedNum++
        hadDealerChecked[curIndex] = true
        saveChecked((prev: string[]) => [...prev, v[key as keyof typeof v]])
      }
    })
    saveInitChecked(initCheckedNum)
    setFn(hadDealerChecked)
  }

  React.useEffect(() => {
    initCheckedData(
      dealerList,
      dealerMapping,
      'dealerAddr',
      setDealerRowSelection,
      setDealerChecked,
      setDealerInitChecked,
    )
    initCheckedData(
      ebcRels,
      ebcMapping,
      'ebcAddr',
      setEbcRowSelection,
      setEbcChecked,
      setEbcInitChecked,
    )
    initCheckedData(
      chainInfoUpdatedsList,
      chainIdMapping,
      'chainId',
      setChainsRowSelection,
      setChainsChecked,
      setChainsInitChecked,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mdcs])

  const updateTypeCheckedList = (
    typeRowSelection: { [key: number]: string },
    typeAllData: InitCheckedDataInterface,
    setFn: Function,
  ) => {
    const currentCheckedIndexs = Object.keys(typeRowSelection)
    if (currentCheckedIndexs.length > 0) {
      const currentCheckedList: string[] = []
      currentCheckedIndexs.forEach((_, i) => {
        currentCheckedList.push((typeAllData as any)[_].id)
      })
      setFn(currentCheckedList)
    } else {
      setFn([])
    }
  }

  React.useEffect(() => {
    updateTypeCheckedList(dealerRowSelection, dealerList, setDealerChecked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealerRowSelection])

  React.useEffect(() => {
    updateTypeCheckedList(ebcRowSelection, ebcRels, setEbcChecked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebcRowSelection])

  React.useEffect(() => {
    updateTypeCheckedList(
      chainsRowSelection,
      chainInfoUpdatedsList,
      setChainsChecked,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainsRowSelection])

  const dealerTable = useReactTable({
    data: dealerList,
    columns: dealerColumn,
    state: {
      rowSelection: dealerRowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setDealerRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })
  const ebcTable = useReactTable({
    data: ebcRels,
    columns: ebcColumn,
    state: {
      rowSelection: ebcRowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setEbcRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })
  const chainsTable = useReactTable({
    data: chainInfoUpdatedsList,
    columns: chainsColumn,
    state: {
      rowSelection: chainsRowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setChainsRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const checkList = [
    {
      table: dealerTable,
      columns: dealerColumn,
      label: 'Dealers',
      checkedNumber: dealerInitChecked,
    },
    {
      table: ebcTable,
      columns: ebcColumn,
      label: 'EBCs',
      checkedNumber: ebcInitChecked,
    },
    {
      table: chainsTable,
      columns: chainsColumn,
      label: 'Chains',
      checkedNumber: chainsInitChecked,
    },
  ]

  const columnArrayUpdated = React.useCallback(
    async ({
      enableTime,
    }: {
      enableTime?: number
    }): Promise<{ hash: `0x${string}` }> => {
      return await writeAsync({
        args: [enableTime, dealerChecked, ebcChecked, chainsChecked],
      })
    },
    [writeAsync, dealerChecked, ebcChecked, chainsChecked],
  )

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex">
            <div className="flex-1">Settings</div>
            <SendDialog send={columnArrayUpdated} requiredEnableTime={true}>
              <Button
                onClick={(e) => beforeUpdate(e, ownerContractAddress)}
                className="mr-2"
                variant="outline"
              >
                Submit
              </Button>
            </SendDialog>
          </CardTitle>
          <CardDescription>
            Set the list of bound dealers, EBC and supported chains.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading show={isLoading} className={'h-80'} />
          ) : (
            <div className="flex justify-between flex-wrap">
              {checkList.map((item, index) => {
                return (
                  <div key={index} className="mr-4">
                    <div className="font-bold mt-5 text-xl">
                      {item.label}
                      <span className="text-gray-500 font-normal text-xs ml-2">
                        Binding quantity: {item.checkedNumber}
                      </span>
                    </div>
                    <div className="overflow-auto overflow-x-hidden relative">
                      <Table divclassname="max-h-80">
                        <TableHeader
                          className="sticky top-0 z-10"
                          style={{
                            backgroundColor:
                              resolvedTheme === 'dark' ? '#020817' : 'white',
                          }}
                        >
                          {item.table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header as any,
                                          header.getContext(),
                                        )}
                                  </TableHead>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {item.table.getRowModel().rows?.length ? (
                            item.table.getRowModel().rows.map((row) => (
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
                                colSpan={item.columns.length}
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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
