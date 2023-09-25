'use client'
import * as React from 'react'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { fetchData, ListItem, ITxListParams } from './fetchData'
import { DataTablePaginationCopy } from './components/data-table-pagination-copy'

const paginationPageSizeList = [10, 20, 30, 40, 50]
export default function TransactionsPage() {
  const [data, setData] = React.useState<ListItem[]>([])
  const [pageIndex, setPageIndex] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(30)
  const [pageCount, setPageCount] = React.useState<number>(0)
  const [isHadNextPage, setIsHadNextPage] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(false)
  const isHadData = React.useMemo(() => {
    return data.length > 0
  }, [data])

  const queryTableData = async (
    params: ITxListParams,
    needLoading = true,
  ): Promise<void> => {
    try {
      needLoading && setLoading(true)
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
    } catch (error) {
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
    let interval: any = null
    if (!isHadData) {
      queryTableData({
        pageIndex,
        pageSize,
      })
    } else if (isHadData) {
      if (pageIndex === 1) {
        queryTableData({
          pageIndex,
          pageSize,
        })
        interval = setInterval(() => {
          queryTableData(
            {
              pageIndex,
              pageSize,
            },
            false,
          )
        }, 1000)
      } else if (pageIndex > 1) {
        queryTableData({
          pageIndex,
          pageSize,
        })
      }
    }
    return () => interval && clearTimeout(interval)
  }, [pageIndex, pageSize, isHadData])

  return (
    <main className="container flex">
      <div className="h-full flex-1 flex-col space-y-8 pt-8 md:flex">
        <DataTablePaginationCopy
          paginationPageSizeList={paginationPageSizeList}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          isHadNextPage={isHadNextPage}
          setIsHadNextPage={setIsHadNextPage}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
        <DataTable
          pagination={pagination}
          loading={loading}
          data={data}
          columns={columns}
        />
      </div>
    </main>
  )
}
