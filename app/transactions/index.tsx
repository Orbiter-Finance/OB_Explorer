'use client'
import * as React from 'react'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import {
  fetchData,
  statusList,
  StatusEnum,
  ListItem,
  ITxListParams,
  versionList,
  Versions,
} from './fetchData'
import { DataTableSearchBar } from './components/data-table-search-bar'
import { DataTablePaginationCopy } from './components/data-table-pagination-copy'
import { ColumnDef } from '@tanstack/react-table'
import { useAccount } from 'wagmi'
import { getChainList } from '@/config/chain-list'
import { ChainInterface } from '@/config/chain-list'
import { useToast } from '@/components/ui/use-toast'

const paginationPageSizeList = [10, 20, 30, 40, 50]

interface TransactionsPagePops {
  pageType?: string
  otherColumns?: ColumnDef<ListItem>[]
}

export default function TransactionsPage(props: TransactionsPagePops) {
  const { toast } = useToast()

  const { pageType = '', otherColumns = [] } = props
  const account = useAccount()
  const [data, setData] = React.useState<ListItem[]>([])
  const [pageIndex, setPageIndex] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(30)
  const [pageCount, setPageCount] = React.useState<number>(0)
  const [isHadNextPage, setIsHadNextPage] = React.useState<boolean>(false)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [status, setStatus] = React.useState<number>(StatusEnum.all)
  const [version, setVersion] = React.useState<string>(Versions.v3)
  const [sourceChainId, setSourceChainId] = React.useState<string>('')
  const [destChainId, setDestChainId] = React.useState<string>('')
  const [sourceHash, setSourceHash] = React.useState<string>('')
  const [destHash, setDestHash] = React.useState<string>('')
  const [startTime, setStartTime] = React.useState<Date | undefined>(undefined)
  const [endTime, setEndTime] = React.useState<Date | undefined>(undefined)
  const [chainList, setChainList] = React.useState<ChainInterface[]>([])

  const isMaker = React.useMemo(() => {
    return pageType === 'maker'
  }, [pageType])

  const resetSearchParams = () => {
    setStatus(StatusEnum.all)
    setVersion(Versions.v3)
    setSourceChainId('')
    setDestChainId('')
    setSourceHash('')
    setDestHash('')
    setStartTime(undefined)
    setEndTime(undefined)
  }

  const queryTableData = async (
    params: ITxListParams,
    needLoading = true,
  ): Promise<void> => {
    try {
      needLoading && setLoading(true)
      params.makerAddress = isMaker
        ? account.address?.toLocaleLowerCase()
        : void 0
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
      // setData([])
      // setPageCount(0)
      // setIsHadNextPage(false)

      if (needLoading) {
        toast({
          variant: 'destructive',
          title: 'Fetch transactions failed.',
          description: error.message,
        })
        setLoading(false)
      }
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
      status,
      pageIndex,
      pageSize,
      version,
      sourceChainId,
      destChainId,
      sourceHash,
      destHash,
      startTime,
      endTime,
    })
    if (pageIndex === 1) {
      interval = setInterval(() => {
        queryTableData(
          {
            status,
            pageIndex,
            pageSize,
            version,
            sourceChainId,
            destChainId,
            sourceHash,
            destHash,
            startTime,
            endTime,
          },
          false,
        )
      }, 2000)
    }
    return () => interval && clearTimeout(interval)
  }, [
    pageIndex,
    pageSize,
    status,
    version,
    sourceChainId,
    destChainId,
    sourceHash,
    destHash,
    startTime,
    endTime,
  ])

  const getChains = async () => {
    const chainList = await getChainList()
    setChainList(chainList || [])
  }

  React.useEffect(() => {
    getChains()
  }, [])

  return (
    <main className="container flex">
      <div className="h-full flex-1 flex-col space-y-8 pt-8 md:flex">
        <DataTableSearchBar
          status={status}
          statusList={statusList}
          setStatus={setStatus}
          version={version}
          versionList={versionList}
          setVersion={setVersion}
          sourceChainId={sourceChainId}
          setSourceChainId={setSourceChainId}
          destChainId={destChainId}
          setDestChainId={setDestChainId}
          sourceHash={sourceHash}
          setSourceHash={setSourceHash}
          destHash={destHash}
          setDestHash={setDestHash}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          resetSearchParams={resetSearchParams}
          chainList={chainList}
        />
        <DataTable
          pagination={pagination}
          loading={loading}
          data={data}
          columns={[...columns, ...otherColumns]}
        />
        <DataTablePaginationCopy
          paginationPageSizeList={paginationPageSizeList}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          pageType={pageType}
          isHadNextPage={isHadNextPage}
          setIsHadNextPage={setIsHadNextPage}
          setPageIndex={setPageIndex}
          setPageSize={setPageSize}
        />
      </div>
    </main>
  )
}
