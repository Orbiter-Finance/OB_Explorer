'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusEnum, Versions } from '../fetchData'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatetimePicker } from '@/components/datetime-picker'
import { useState } from 'react'
import { dateFormatStandard } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'

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
}

export function DataTableSearchBar(props: DataTableSearchBarProps) {
  const {
    status,
    setStatus,
    statusList,
    version,
    setVersion,
    versionList,
    setSourceChainId,
    setDestChainId,
    setSourceHash,
    setDestHash,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    resetSearchParams,
  } = props

  const [showSourceChainId, setShowSourceChainId] = useState('')
  const [showDestChainId, setShowDestChainId] = useState('')
  const [showSourceHash, setShowSourceHash] = useState('')
  const [showDestHash, setShowDestHash] = useState('')

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
              <SelectTrigger className="h-8 w-[140px]">
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
            <SelectTrigger className="h-8 w-[140px]">
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
              className="w-[200px]"
              readOnly
            ></Input>
          </DatetimePicker>
        </div>
        <div className="flex items-center mr-4">
          <div className="mr-4">End Time:</div>
          <DatetimePicker
            value={dayjs(endTime).toDate()}
            onChange={(e) => {
              setEndTime(dateFormatStandard(e))
            }}
          >
            <Input
              value={(endTime && endTime + '') || ''}
              className="w-[200px]"
              readOnly
            ></Input>
          </DatetimePicker>
        </div>
      </div>
      <div className="min-w-full flex items-center mb-4">
        <div className="flex flex-1 items-center mr-4">
          <Label htmlFor="source-hash">Source Hash:</Label>
          <Input
            id="source-hash"
            placeholder="Source hash"
            value={showSourceHash}
            onChange={(e) => {
              const val = e.target.value ?? ''
              setShowSourceHash(val)
            }}
            onBlur={() => {
              setSourceHash(showSourceHash)
            }}
          />
        </div>
        <div className="flex flex-1 items-center">
          <Label htmlFor="dest-hash">Dest Hash:</Label>
          <Input
            id="dest-hash"
            placeholder="Dest hash"
            value={showDestHash}
            onChange={(e) => {
              const val = e.target.value ?? ''
              setShowDestHash(val)
            }}
            onBlur={() => {
              setDestHash(showDestHash)
            }}
          />
        </div>
      </div>
      <div className="flex min-w-full">
        <div className="flex-1 flex">
          <div className="flex items-center mr-4">
            <Label htmlFor="source-chain-id">Source Chain:</Label>
            <Input
              id="source-chain-id"
              placeholder="Source chain id"
              value={showSourceChainId}
              onChange={(e) => {
                const val = e.target.value ?? ''
                setShowSourceChainId(val)
              }}
              onBlur={() => {
                setSourceChainId(showSourceChainId)
              }}
            />
          </div>
          <div className="flex items-center">
            <Label htmlFor="dest-chain-id">Dest Chain:</Label>
            <Input
              id="dest-chain-id"
              placeholder="Dest chain id"
              value={showDestChainId}
              onChange={(e) => {
                const val = e.target.value ?? ''
                setShowDestChainId(val)
              }}
              onBlur={() => {
                setDestChainId(showDestChainId)
              }}
            />
          </div>
        </div>
        <Button
          className="mr-2 "
          onClick={() => {
            resetSearchParams()
            setShowSourceChainId('')
            setShowDestChainId('')
            setShowSourceHash('')
            setShowDestHash('')
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
