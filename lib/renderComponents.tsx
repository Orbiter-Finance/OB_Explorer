import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { ReactNode } from 'react'
import { formatAddress, getChainInfoURL } from './utils'

export const renderTooltipProvider = (
  trigger: ReactNode,
  content: ReactNode,
  asChild: boolean = true,
) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{trigger}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const renderJumpItem = (
  chainId: number,
  targetAddress: string,
  jumpType: 'tx' | 'address',
  formatter: {
    startCount?: number
    endCount?: number
  } = {},
): JSX.Element => {
  const baseLink = getChainInfoURL(chainId)
  const jumpPrefixes = `/${jumpType}/`
  if (!targetAddress) return <span>{'-'}</span>
  return (
    <a
      className="text-blue-500 cursor-pointer"
      target="_blank"
      href={baseLink + jumpPrefixes + targetAddress}
    >
      {formatAddress(targetAddress, formatter.startCount, formatter?.endCount)}
    </a>
  )
}
