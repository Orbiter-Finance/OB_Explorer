'use client'

import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Select, SelectTrigger, SelectValue } from './ui/select'

function fillPrefixZero(num: number | string, maxLength = 2) {
  num = String(num)

  const diff = maxLength - num.length
  if (diff <= 0) return num

  return `${Array.from({ length: diff })
    .map(() => '0')
    .join('')}${num}`
}

const hourSelectItems = Array.from({ length: 24 }).map((_, i: number) =>
  fillPrefixZero(i),
)
const minuteSelectItems = Array.from({ length: 60 }).map((_, i: number) =>
  fillPrefixZero(i),
)
const secondSelectItems = Array.from({ length: 60 }).map((_, i: number) =>
  fillPrefixZero(i),
)

function SelectTimePopover(props: {
  children: React.ReactNode
  items: string[]
  value?: string
  onChange?: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const onClick = (item: string) => {
    setOpen(false)
    props.onChange && props.onChange(item)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <div className="grid grid-cols-6">
          {props.items.map((item, index) => (
            <div
              className={cn(
                'p-3 rounded-md text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground',
                props.value &&
                  item == fillPrefixZero(props.value) &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
              key={index}
              onClick={() => onClick(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimeColumnsValue {
  hour: string
  minute: string
  second: string
}

function TimeColumns(props: {
  value: TimeColumnsValue
  onChange?: (value: TimeColumnsValue) => void
}) {
  const onChange = (_value: TimeColumnsValue) => {
    props.onChange && props.onChange(_value)
  }

  return (
    <div className="m-4 mt-0 flex items-center">
      <div className="flex-1">
        <Select defaultValue="00">
          <SelectTimePopover
            items={hourSelectItems}
            value={props.value.hour}
            onChange={(v) => {
              onChange({ ...props.value, hour: v })
            }}
          >
            <SelectTrigger className="line-clamp-1 truncate">
              <SelectValue placeholder="Hour">{props.value.hour}</SelectValue>
            </SelectTrigger>
          </SelectTimePopover>
        </Select>
      </div>
      <div className="text-slate-500 m-1">:</div>
      <div className="flex-1">
        <Select defaultValue="00">
          <SelectTimePopover
            items={minuteSelectItems}
            value={props.value.minute}
            onChange={(v) => {
              onChange({ ...props.value, minute: v })
            }}
          >
            <SelectTrigger className="line-clamp-1 truncate">
              <SelectValue placeholder="Minute">
                {props.value.minute}
              </SelectValue>
            </SelectTrigger>
          </SelectTimePopover>
        </Select>
      </div>
      <div className="text-slate-500 m-1">:</div>
      <div className="flex-1">
        <Select defaultValue="00">
          <SelectTimePopover
            items={secondSelectItems}
            value={props.value.second}
            onChange={(v) => {
              onChange({ ...props.value, second: v })
            }}
          >
            <SelectTrigger className="line-clamp-1 truncate">
              <SelectValue placeholder="Second">
                {props.value.second}
              </SelectValue>
            </SelectTrigger>
          </SelectTimePopover>
        </Select>
      </div>
    </div>
  )
}

export function DatetimePicker(props: {
  children: React.ReactNode
  value?: Date
  onChange?: (value: Date) => void
}) {
  const [open, setOpen] = useState(false)

  const timeColumnsValue: TimeColumnsValue = {
    hour: '00',
    minute: '00',
    second: '00',
  }
  if (props.value) {
    const d = dayjs(props.value)
    timeColumnsValue.hour = fillPrefixZero(d.hour())
    timeColumnsValue.minute = fillPrefixZero(d.minute())
    timeColumnsValue.second = fillPrefixZero(d.second())
  }

  const onChange = (_date: Date | undefined, _time: TimeColumnsValue) => {
    if (!_date) {
      if (_time.hour == '00' && _time.minute == '00' && _time.second == '00') {
        return
      }

      _date = new Date()
    }

    const d = dayjs(_date)
      .startOf('date')
      .add(Number(_time.hour), 'hour')
      .add(Number(_time.minute), 'minute')
      .add(Number(_time.second), 'second')
    props.onChange && props.onChange(d.toDate())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{props.children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={props.value}
          onSelect={(v) => onChange(v!, timeColumnsValue)}
          initialFocus
        />
        <TimeColumns
          value={timeColumnsValue}
          onChange={(v) => onChange(props.value, v)}
        />
      </PopoverContent>
    </Popover>
  )
}
