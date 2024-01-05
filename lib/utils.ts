import relativeTime from 'dayjs/plugin/relativeTime'
import dayjs from 'dayjs'
import {
  orMDCFactoryAddress,
  orMakerDepositImplAddress,
} from '@/config/contracts'
import { clsx, type ClassValue } from 'clsx'
import { BigNumber, BigNumberish, utils } from 'ethers'
import { twMerge } from 'tailwind-merge'
import { Address } from 'viem'
import { toast } from '@/components/ui/use-toast'
import { defaultAbiCoder, formatUnits, parseUnits } from 'ethers/lib/utils'
import { chainList } from '@/config/chain-list'

dayjs.extend(relativeTime)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const beforeUpdate = async (e: any, ownerContractAddress?: string) => {
  if (!ownerContractAddress) {
    e.preventDefault()
    toast({
      variant: 'destructive',
      title: 'Need to register as Maker.',
    })
    return
  }
}

export const getDecimalPlaces = (number: string) => {
  const decimalPart = number.split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

export async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null)
    }, ms)
  })
}

export function predictDeterministicAddress(
  factory: string,
  implementation: string,
  salt: string,
) {
  const creationCode = [
    '0x3d602d80600a3d3981f3363d3d373d3d3d363d73',
    implementation.replace(/0x/, '').toLowerCase(),
    '5af43d82803e903d91602b57fd5bf3',
  ].join('')
  return utils.getCreate2Address(
    factory,
    salt,
    utils.keccak256(creationCode),
  ) as Address
}

export function predictMDCAddress(makerAddress: Address | undefined) {
  if (!makerAddress) return undefined

  const salt = utils.keccak256(
    defaultAbiCoder.encode(
      ['address', 'address'],
      [orMDCFactoryAddress, makerAddress],
    ),
  )

  return predictDeterministicAddress(
    orMDCFactoryAddress!,
    orMakerDepositImplAddress!,
    salt,
  )
}

export function dateFormatStandard(
  date?: string | number | Date | dayjs.Dayjs | null | undefined,
  formatType?: string | undefined,
) {
  if (!date) return '-'
  return dayjs(date).format(formatType || 'YYYY-MM-DD HH:mm:ss')
}

export function getFromNowDate(date: number | Date | null | undefined): string {
  if (!date) return 'invalid time!'
  return dayjs(date).fromNow() || '-'
}

export function formatAddress(
  address: string,
  startCount: number = 6,
  endCount: number = 4,
): string {
  if (!address) return '-'
  if (startCount + endCount >= address.length) return address
  const currentAddress = address + ''
  return (
    currentAddress.substring(0, startCount) +
    '...' +
    currentAddress.substring(
      currentAddress.length - endCount,
      currentAddress.length,
    )
  )
}

export function equalBN(bn0: BigNumberish, bn1: BigNumberish) {
  return BigNumber.from(bn0).eq(bn1)
}

export function clearFloatZero(f: number | string) {
  try {
    return formatUnits(parseUnits(f + '', 30), 30)
  } catch (err: any) {
    return undefined
  }
}

export const getChainInfoURL = (id: string | number) => {
  const curChain = chainList.find((item) => {
    if (item.chainId + '' == id) {
      return item
    }
  })
  return curChain?.infoURL || '-'
}
