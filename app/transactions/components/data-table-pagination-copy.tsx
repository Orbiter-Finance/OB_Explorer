'use client'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListTypes } from '../fetchData'

interface DataTablePaginationCopyProps {
  paginationPageSizeList: number[]
  listTypes: {
    label: string
    value: ListTypes
  }[]
  pageIndex: number
  pageSize: number
  pageCount: number
  pageType: string
  isHadNextPage: boolean
  listType: number
  setListType: Function
  setPageIndex: Function
  setPageSize: Function
  setIsHadNextPage: Function
}

export function DataTablePaginationCopy(props: DataTablePaginationCopyProps) {
  const {
    paginationPageSizeList,
    listTypes,
    listType,
    setListType,
    pageIndex,
    pageSize,
    pageCount,
    pageType,
    isHadNextPage,
    setPageIndex,
    setPageSize,
    setIsHadNextPage,
  } = props

  const canPreviousPage = useMemo(() => {
    return pageIndex !== 1
  }, [pageIndex])

  const canNextPage = useMemo(() => {
    return isHadNextPage
  }, [isHadNextPage])

  const handlerClickFirst = () => {
    setPageIndex(1)
  }
  const handlerClickLast = () => {
    setPageIndex(pageIndex - 1)
  }
  const handlerClickNext = () => {
    if (pageIndex + 1 === pageCount) {
      setIsHadNextPage(false)
      setPageIndex(pageIndex + 1)
      return
    }
    setPageIndex(pageIndex + 1)
  }
  const handlerClickLastNo = () => {
    setPageIndex(pageCount)
    setIsHadNextPage(false)
  }
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center justify-between space-x-6 w-full lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize + ''}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setPageIndex(1)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={'10'} />
            </SelectTrigger>
            <SelectContent side="top">
              {paginationPageSizeList.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {pageType === 'maker' && (
            <div className="flex items-center">
              <div className="mr-4">Search by:</div>
              <Select
                value={listType + ''}
                onValueChange={(value) => {
                  setListType(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder={'All'} />
                </SelectTrigger>
                <SelectContent side="top">
                  {listTypes.map((item) => (
                    <SelectItem key={item.value} value={`${item.value}`}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex w-[150px] items-center justify-center text-sm font-medium">
            Page {pageIndex} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlerClickFirst()}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlerClickLast()}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlerClickNext()}
              disabled={!canNextPage}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlerClickLastNo()}
              disabled={!canNextPage}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
