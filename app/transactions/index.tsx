'use client'
import * as React from 'react'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import {
  fetchData,
  listTypes,
  ListTypes,
  ListItem,
  ITxListParams,
} from './fetchData'
import { DataTablePaginationCopy } from './components/data-table-pagination-copy'
import { ColumnDef } from '@tanstack/react-table'
import { useAccount } from 'wagmi'

const paginationPageSizeList = [10, 20, 30, 40, 50]

interface TransactionsPagePops {
  pageType?: string
  otherColumns?: ColumnDef<ListItem>[]
}

export default function TransactionsPage(props: TransactionsPagePops) {
  const { pageType = '', otherColumns = [] } = props
  const account = useAccount()
  const [data, setData] = React.useState<ListItem[]>([])
  const [pageIndex, setPageIndex] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(30)
  const [pageCount, setPageCount] = React.useState<number>(0)
  const [listType, setListType] = React.useState<number>(ListTypes.all)
  const [isHadNextPage, setIsHadNextPage] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(false)

  const queryTableData = async (
    params: ITxListParams,
    needLoading = true,
  ): Promise<void> => {
    try {
      needLoading && setLoading(true)
      params.makerAddress = pageType === 'maker' ? account.address : void 0
      const res = await fetchData(params)
      needLoading && setLoading(false)
      setData(res.data.result.list)
      const curDataListCount: number = Number(res.data.result.count)
      setPageCount(Math.ceil(curDataListCount / params.pageSize))

      const currentPageIndex = params.pageIndex - 1 || params.pageIndex
      const currentPageDataCount =
        params.pageIndex === 1
          ? res.data.result.list.length
          : currentPageIndex * params.pageSize + res.data.result.list.length
      setIsHadNextPage(curDataListCount > currentPageDataCount)
    } catch (error: any) {
      setData([])
      setPageCount(0)
      setIsHadNextPage(false)
      needLoading && setLoading(false)
    }
  }

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  React.useEffect(() => {
    let interval: NodeJS.Timer
    queryTableData({
      listType,
      pageIndex,
      pageSize,
    })
    if (pageIndex === 1) {
      interval = setInterval(() => {
        queryTableData(
          {
            listType,
            pageIndex,
            pageSize,
          },
          false,
        )
      }, 1000)
    }
    return () => interval && clearTimeout(interval)
  }, [pageIndex, pageSize, listType])

  return (
    <main className="container flex">
      <div className="h-full flex-1 flex-col space-y-8 pt-8 md:flex">
        <DataTablePaginationCopy
          paginationPageSizeList={paginationPageSizeList}
          listTypes={listTypes}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          pageType={pageType}
          listType={listType}
          isHadNextPage={isHadNextPage}
          setIsHadNextPage={setIsHadNextPage}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
          setListType={setListType}
        />
        <DataTable
          pagination={pagination}
          loading={loading}
          data={data}
          columns={[...columns, ...otherColumns]}
        />
      </div>
    </main>
  )
}
