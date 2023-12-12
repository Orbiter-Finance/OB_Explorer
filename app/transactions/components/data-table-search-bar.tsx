'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  StatusEnum,
  Versions,
  selectHashList,
  selectHashValues,
} from '../fetchData'
import { Input } from '@/components/ui/input'
import { DatetimePicker } from '@/components/datetime-picker'
import { useMemo, useState } from 'react'
import { dateFormatStandard } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { ChainInterface } from '@/config/chain-list'

interface DataTableSearchBarProps {
  status: StatusEnum
  setStatus: Function
  statusList: {
    label: string
    value: StatusEnum
  }[]
  version: string
  setVersion: Function
  versionList: {
    label: string
    value: Versions
  }[]
  sourceChainId: string
  setSourceChainId: Function
  destChainId: string
  setDestChainId: Function
  sourceHash: string
  setSourceHash: Function
  destHash: string
  setDestHash: Function
  startTime?: Date
  setStartTime: Function
  endTime?: Date
  setEndTime: Function
  resetSearchParams: Function
  chainList: ChainInterface[]
}

export function DataTableSearchBar(props: DataTableSearchBarProps) {
  const {
    status,
    setStatus,
    statusList,
    version,
    setVersion,
    versionList,
    sourceChainId,
    setSourceChainId,
    destChainId,
    setDestChainId,
    setSourceHash,
    setDestHash,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    resetSearchParams,
    chainList,
  } = props

  const [selectHashType, setSelectHashType] = useState(selectHashValues.source)
  const [showSourceHash, setShowSourceHash] = useState('')
  const [showDestHash, setShowDestHash] = useState('')

  const isSelectHashSource = useMemo(() => {
    return selectHashType === selectHashValues.source
  }, [selectHashType])

  const showHash = useMemo(() => {
    return isSelectHashSource ? showSourceHash : showDestHash
  }, [isSelectHashSource, showSourceHash, showDestHash])

  const setShowHashFunction = useMemo(() => {
    return isSelectHashSource ? setShowSourceHash : setShowDestHash
  }, [isSelectHashSource, setShowSourceHash, setShowDestHash])

  const setHashFunction = useMemo(() => {
    return isSelectHashSource ? setSourceHash : setDestHash
  }, [isSelectHashSource, setSourceHash, setDestHash])

  return (
    <div className="flex flex-wrap">
      <div className="flex min-w-full mb-4 justify-between">
        <div className="flex items-center mr-4">
          <div className="flex items-center">
            <div className="mr-4">Status:</div>
            <Select
              value={status + ''}
              onValueChange={(value) => {
                setStatus(Number(value))
              }}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder={'All'} />
              </SelectTrigger>
              <SelectContent side="top">
                {statusList.map((item) => (
                  <SelectItem key={item.value} value={`${item.value}`}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center mr-4">
          <div className="mr-4">Version:</div>
          <Select
            value={version}
            onValueChange={(value) => {
              setVersion(value)
            }}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder={'All'} />
            </SelectTrigger>
            <SelectContent side="top">
              {versionList.map((item) => (
                <SelectItem key={item.value} value={`${item.value}`}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center mr-4">
          <div className="mr-4">Start Time:</div>
          <DatetimePicker
            value={dayjs(startTime).toDate()}
            onChange={(e) => {
              setStartTime(dateFormatStandard(e))
            }}
          >
            <Input
              value={(startTime && startTime + '') || ''}
              className="w-[220px]"
              readOnly
              placeholder="Pick start time"
              type="input"
            ></Input>
          </DatetimePicker>
        </div>
        <div className="flex items-center">
          <div className="mr-4">End Time:</div>
          <DatetimePicker
            value={dayjs(endTime).toDate()}
            onChange={(e) => {
              setEndTime(dateFormatStandard(e))
            }}
          >
            <Input
              value={(endTime && endTime + '') || ''}
              className="w-[220px]"
              readOnly
              placeholder="Pick end time"
              type="input"
            ></Input>
          </DatetimePicker>
        </div>
      </div>
      <div className="flex min-w-full">
        <div className="flex-1 flex mr-4">
          <div className="flex items-center mr-4">
            <div className="mr-4 min-w-[110px]">Source Chain:</div>
            <Select
              value={sourceChainId}
              onValueChange={(value) => {
                setSourceChainId(value)
              }}
            >
              <SelectTrigger className="h-9 w-[160px] mr-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]" side="top">
                <SelectItem key="" value="">
                  All
                </SelectItem>
                {chainList.map((item) => (
                  <SelectItem key={item.chainId} value={`${item.chainId}`}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center">
            <div className="mr-4 min-w-[110px]">Dest Chain:</div>
            <Select
              value={destChainId}
              onValueChange={(value) => {
                setDestChainId(value)
              }}
            >
              <SelectTrigger className="h-9 w-[160px] mr-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]" side="top">
                <SelectItem key="" value="">
                  All
                </SelectItem>
                {chainList.map((item) => (
                  <SelectItem key={item.chainId} value={`${item.chainId}`}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-1 items-center">
          <Select
            value={selectHashType}
            onValueChange={(value) => {
              setSelectHashType(value)
              if (value === selectHashValues.source) {
                setDestHash('')
                setShowDestHash('')
              } else {
                setSourceHash('')
                setShowSourceHash('')
              }
            }}
          >
            <SelectTrigger className="h-9 w-[140px] mr-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {selectHashList.map((item) => (
                <SelectItem key={item.value} value={`${item.value}`}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="source-hash"
            className="flex-1"
            placeholder="Select and Input Chain Hash"
            value={showHash}
            onChange={(e) => {
              const val = e.target.value ?? ''
              setShowHashFunction(val)
            }}
            onBlur={() => {
              setHashFunction(showHash)
            }}
          />
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={() => {
          resetSearchParams()
          setShowSourceHash('')
          setShowDestHash('')
          setSelectHashType(selectHashValues.source)
        }}
      >
        Reset
      </Button>
    </div>
  )
}
