import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ILoadingProps {
  show?: boolean
  className?: string
  strokeWidth?: number
  color?: string
  loaderClassName?: string
}

export function Loading(props: ILoadingProps) {
  const {
    show = false,
    className = '',
    strokeWidth = 1.5,
    color = 'gray',
    loaderClassName = '',
  } = props
  return show ? (
    <div className={cn(className, 'w-full flex items-center justify-center')}>
      <Loader2
        color={color}
        strokeWidth={strokeWidth}
        className={cn(loaderClassName, 'h-8 w-8 animate-spin')}
      />
    </div>
  ) : null
}
