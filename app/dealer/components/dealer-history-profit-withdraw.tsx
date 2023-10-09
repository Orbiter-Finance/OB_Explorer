import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SendDialog } from '@/components/send-dialog'
import { Input } from '@/components/ui/input'
import ERC20_ABI from '@/config/abis/ERC20.abi.json'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Address,
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
} from 'wagmi'
import { BigNumber, BigNumberish, utils } from 'ethers'
import { contracts } from '@/config/contracts'
import { useTheme } from 'next-themes'
import { cloneDeep } from 'lodash'
import {
  submitter_getAllProfitInfo,
  ListItem,
  submitter_getProfitProof,
  ProfitProofResult,
  ProfitInfoResult,
  IProofItem,
} from './utils/getHistoryProfitData'
import { getChainName } from '@/config/chain-list'
import {
  getTokenInfoDecimal,
  getTokenInfoMainnetToken,
  getTokenInfoSymbol,
} from '@/lib/thegraphs/manager'
import { Hash } from 'viem'
import { Loading } from '@/components/loding'
import { ChangeEvent } from 'react'
import { renderTooltipProvider } from '@/lib/renderComponents'
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils'
interface IDealerHistoryProfitWithdrawInterface {
  withdrawUser: 'Maker' | 'Dealer'
}

enum MergeValueType {
  VALUE = 0,
  MERGE_WITH_ZERO,
  SHORT_CUT,
}

enum durationStatusEnum {
  lock = 0,
  challenge = 1,
  withdraw = 2,
}

enum withdrawStatusColorEnum {
  lock = 'bg-gray-500',
  challenge = 'bg-orange-500',
  withdraw = 'bg-green-500',
}

interface ISmtLeaves {
  token: Address
  chainId: number
  user: Address
  amount: string
  debt: string
}
interface ISiblings {
  mergeType: number
  mergeValue: {
    value1: BigNumberish
    value2: BigNumberish
    value3: BigNumberish
  }
}
type Bitmaps = string[]

type WithdrawAmount = BigNumber[]

type StartIndex = number[]

type FirstZeroBits = string[]

export function DealerHistoryProfitWithdraw(
  props: IDealerHistoryProfitWithdrawInterface,
) {
  const { withdrawUser } = props
  const account = useAccount()
  const { resolvedTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const withdrawData = useRef<ListItem[]>([])
  const [tokenDecimals, setTokenDecimals] = useState<{
    [key: Address]: number
  }>({})
  const [profitData, setProfitData] = useState<ListItem[]>([])
  const [decimalsContracts, setDecimalsContracts] = useState<
    { address: Address; abi: any; functionName: string }[]
  >([])
  const { data } = useContractReads({
    contracts: decimalsContracts,
    onSuccess(data) {
      if (data.length <= 0) return
      data.forEach((item, index) => {
        setTokenDecimals((prev) => {
          return {
            ...prev,
            [decimalsContracts[index].address]: item.result || 18,
          }
        })
      })
    },
  })

  const { data: durationCheck }: any = useContractRead({
    ...contracts.orFeeManager,
    functionName: 'durationCheck',
    watch: true,
  })
  useEffect(() => {
    if (durationCheck !== durationStatusEnum.challenge) return
    else initWithDrawData(false)
  }, [durationCheck])

  const { refetch: withdrawLockCheck }: any = useContractRead({
    ...contracts.orFeeManager,
    args: [account.address],
    functionName: 'withdrawLockCheck',
    enabled: false,
  })
  const { writeAsync: withdrawVerification } = useContractWrite({
    ...contracts.orFeeManager,
    functionName: 'withdrawVerification',
  })

  const initWithDrawData = async (needLoading = true) => {
    try {
      needLoading && setLoading(true)
      const profitIntoParams = {
        address: account.address!,
      }
      const res =
        await submitter_getAllProfitInfo<ProfitInfoResult>(profitIntoParams)
      const {
        data: { result = [] },
      } = res
      setProfitData(result)
      needLoading && setLoading(false)
      handlerSetDecimals(result)
      withdrawData.current = cloneDeep(result)
    } catch (err: any) {
      needLoading && setLoading(false)
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: err?.message || '',
      })
    }
  }

  const handlerSetDecimals = (data: ListItem[]) => {
    const decimalsContracts: {
      address: Address
      abi: any
      functionName: string
    }[] = []
    const tokenDecimalList: { [key: Address]: number } = {}
    data.forEach((v) => {
      const currentTokenDecimal = getTokenInfoDecimal(v.token_chain_id, v.token)
      if (currentTokenDecimal) {
        tokenDecimalList[v.token] = currentTokenDecimal
      } else {
        decimalsContracts.push({
          address: v.token,
          abi: ERC20_ABI,
          functionName: 'decimals',
        })
      }
    })
    setTokenDecimals(tokenDecimalList)
    setDecimalsContracts(decimalsContracts)
  }

  useEffect(() => {
    initWithDrawData()
  }, [])

  const handlerInputChange = (e: ChangeEvent<HTMLInputElement>, row: any) => {
    const rowAmount = row?.original?.balance || 0
    const rowId = row?.original?.token
    const rowChainId = row?.original?.token_chain_id
    const inputValue = e.target.value || ''
    const decimalRowAmount = utils.formatUnits(
      rowAmount || 0,
      getTokenDecimal(rowId),
    )
    if (inputValue) {
      if (utils.parseUnits(inputValue).gt(utils.parseUnits(decimalRowAmount))) {
        e.target.value = decimalRowAmount
      }
      if (utils.parseUnits(inputValue).lt(0)) {
        e.target.value = ''
      }
    }

    const currentWithdrawData = withdrawData.current.map((v) => {
      if (v.token === rowId && v.token_chain_id === rowChainId) {
        v.inputAmount = e.target.value
      }
      return v
    })
    withdrawData.current = currentWithdrawData
  }

  /*
   * Generates an array of encoded siblings.
   * @param {MergeValue[][]} siblings - The array of siblings to encode.
   * @return {string[][]} The array of encoded siblings.
   */
  function getEncodeSbilings(siblings: ISiblings[][]): string[][] {
    return siblings.map((sibling) => {
      return sibling.map((v) => {
        if (v.mergeType === MergeValueType.MERGE_WITH_ZERO) {
          return keccak256(
            defaultAbiCoder.encode(
              ['uint8', 'bytes32', 'bytes32', 'uint8'],
              [
                2,
                v.mergeValue.value2,
                v.mergeValue.value3,
                v.mergeValue.value1,
              ],
            ),
          )
        } else {
          return v.mergeValue.value2 as unknown as string
        }
      })
    })
  }

  const getWithDrawParams = (result: IProofItem[]) => {
    const smtLeaves: ISmtLeaves[] = []
    const siblings: ISiblings[][] = []
    const bitmaps: Bitmaps = []
    const withdrawAmount: WithdrawAmount = []
    const startIndex: StartIndex = []
    const firstZeroBits: FirstZeroBits = []
    result.forEach((v) => {
      const cTokenBalance = withdrawData.current.find((item) => {
        return (
          item.token_chain_id === v.token.token_chain_id &&
          item.token === v.token.token &&
          !!item.inputAmount
        )
      })?.inputAmount
      const cSiblings = v.siblings
      const cToken = v.token
      const cBitmap = v.leave_bitmap
      if (!cTokenBalance) return
      smtLeaves.push({
        chainId: cToken.token_chain_id,
        token: cToken.token,
        user: account.address!,
        amount: cToken.balance,
        debt: cToken.debt,
      })
      const vSiblings: ISiblings[] = []
      cSiblings.forEach((s) => {
        const mergeType = !!s.MergeWithZero
          ? MergeValueType.MERGE_WITH_ZERO
          : !!s.Value
          ? MergeValueType.VALUE
          : MergeValueType.SHORT_CUT
        const mergeValue = !!s.MergeWithZero
          ? {
              value1: s.MergeWithZero.zero_count,
              value2: '0x' + s.MergeWithZero.base_node,
              value3: '0x' + s.MergeWithZero.zero_bits,
            }
          : !!s.Value
          ? {
              value1:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              value2: '0x' + s.Value,
              value3:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            }
          : {
              value1: s.height,
              value2: s.key,
              value3: s.value,
            }
        vSiblings.push({
          mergeType: mergeType,
          mergeValue: mergeValue,
        })
      })
      siblings.push(vSiblings)
      startIndex.push(v.no1_merge_value[0])
      firstZeroBits.push('0x' + v.no1_merge_value[1])
      bitmaps.push('0x' + cBitmap)
      withdrawAmount.push(
        utils.parseUnits(cTokenBalance, getTokenDecimal(cToken.token)),
      )
    })
    return {
      smtLeaves,
      siblings,
      startIndex,
      firstZeroBits,
      bitmaps,
      withdrawAmount,
    }
  }

  const getTokenDecimal = useCallback(
    (token: Address) => {
      let currentTokenDecimals: number = 18
      for (const key in tokenDecimals) {
        if (key.toLocaleLowerCase() === token.toLocaleLowerCase()) {
          currentTokenDecimals = tokenDecimals[key as Address]
        }
      }
      return currentTokenDecimals
    },
    [tokenDecimals],
  )

  const getProofTokens = () => {
    return withdrawData.current
      .map((item) => {
        if (item.inputAmount) {
          return [item.token_chain_id, item.token]
        }
      })
      .filter((v) => v !== undefined) as [number, Address][]
  }

  const onWithDraw = async (): Promise<{ hash: Hash } | any> => {
    const proofTokens = getProofTokens()
    const getProfitProofParams = {
      tokens: proofTokens,
      user: account.address!,
    }
    const proofRes =
      await submitter_getProfitProof<ProfitProofResult>(getProfitProofParams)
    const {
      data: { result = [] },
    } = proofRes
    const {
      smtLeaves,
      siblings,
      startIndex,
      firstZeroBits,
      bitmaps,
      withdrawAmount,
    } = getWithDrawParams(result)
    const withdrawLockData = (await withdrawLockCheck()).data
    if (withdrawLockData) {
      toast({
        variant: 'destructive',
        title:
          'Multiple withdrawals are not allowed within the same withdrawal timeframe.',
      })
    } else {
      return await withdrawVerification({
        args: [
          smtLeaves,
          getEncodeSbilings(siblings),
          startIndex,
          firstZeroBits,
          bitmaps,
          withdrawAmount,
        ],
      })
    }
  }

  const beforeWithdraw = (e: any) => {
    if (durationCheck !== durationStatusEnum.withdraw) {
      e.preventDefault()
      return toast({
        variant: 'destructive',
        title: 'Please try again later and operate within the withdrawal time.',
      })
    }
    const curInputNum =
      withdrawData.current.filter((v) => !!v.inputAmount) || []
    if (!curInputNum.length) {
      e.preventDefault()
      return toast({
        variant: 'destructive',
        title: 'The amount to be withdrawn has not been entered.',
      })
    }
  }

  const beforeWithdrawAll = (e: any) => {
    profitData.length > 0 &&
      profitData.forEach((item) => {
        withdrawData.current = withdrawData.current.map((v) => {
          if (
            v.token === item.token &&
            v.token_chain_id === item.token_chain_id
          ) {
            v.inputAmount = utils.formatUnits(
              item.balance || 0,
              getTokenDecimal(item.token),
            )
          }
          return v
        })
      })
    beforeWithdraw(e)
  }

  const columns: ColumnDef<ListItem>[] = useMemo(() => {
    return [
      {
        accessorKey: 'token_chain_id',
        header: () => <div>Chain</div>,
        cell: ({ row }) => {
          return renderTooltipProvider(
            <div>
              {getChainName(row.getValue('token_chain_id')) ||
                row.getValue('token_chain_id')}
            </div>,
            <span>{row.getValue('token_chain_id')}</span>,
          )
        },
      },
      {
        accessorKey: 'token',
        header: () => <div>Token</div>,
        cell: ({ row }) => {
          return renderTooltipProvider(
            <div>
              {getTokenInfoSymbol(
                Number(row.getValue('token_chain_id')),
                row.getValue('token'),
              ) || row.getValue('token')}
            </div>,
            <p>
              {getTokenInfoMainnetToken(
                Number(row.getValue('token_chain_id')),
                row.getValue('token'),
              )}
            </p>,
          )
        },
      },
      {
        accessorKey: 'balance',
        header: () => <div>Available</div>,
        cell: ({ row }) => {
          return (
            <div>
              {utils.formatUnits(
                row.getValue('balance') || 0,
                getTokenDecimal(row.original.token),
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'total_profit',
        header: () => <div>Total Dividend</div>,
        cell: ({ row }) => {
          return (
            <div>
              {utils.formatUnits(
                row.getValue('total_profit') || 0,
                getTokenDecimal(row.original.token),
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'total_withdrawn',
        header: () => <div>Total Withdrawal</div>,
        cell: ({ row }) => {
          return (
            <div>
              {utils.formatUnits(
                row.getValue('total_withdrawn') || 0,
                getTokenDecimal(row.original.token),
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'debt',
        header: () => <div>Debt</div>,
        cell: ({ row }) => {
          return (
            <div>
              {utils.formatUnits(
                row.getValue('debt') || 0,
                getTokenDecimal(row.original.token),
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'input',
        header: () => <div>Withdrawal Amount</div>,
        cell: ({ row }) => {
          return (
            <Input
              type="number"
              className="withdraw-amount-input"
              placeholder="0"
              onChange={(e) => handlerInputChange(e, row)}
            />
          )
        },
      },
    ]
  }, [getTokenDecimal])

  const table = useReactTable({
    data: profitData,
    columns,
    state: {
      columnVisibility:
        withdrawUser === 'Dealer'
          ? {
              debt: false,
            }
          : {},
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const withdrawStatusColor = useMemo(() => {
    return durationCheck === durationStatusEnum.withdraw
      ? withdrawStatusColorEnum.withdraw
      : durationCheck === durationStatusEnum.lock
      ? withdrawStatusColorEnum.lock
      : withdrawStatusColorEnum.challenge
  }, [durationCheck])

  const onFinally = (open?: boolean) => {
    if (!open) {
      const amountInputs = document.getElementsByClassName(
        'withdraw-amount-input',
      ) as HTMLCollectionOf<HTMLInputElement>
      const amountInputsList = Array.from(amountInputs)
      amountInputsList.forEach((item) => {
        item.value = ''
      })
      withdrawData.current = withdrawData.current.map((item) => {
        return {
          ...item,
          inputAmount: '',
        }
      })
    }
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex justify-between relative">
          Claim Dividends
          {profitData.length > 0 && (
            <>
              <div
                className={`animate-pulse w-2 h-2 ${withdrawStatusColor} absolute top-1 right-1 rounded-full`}
              />
              <SendDialog
                onFinally={({ open }) => onFinally(open)}
                send={() => onWithDraw()}
              >
                <div>
                  <Button
                    className="mr-2 check-chainId"
                    onClick={beforeWithdrawAll}
                  >
                    Claim (All)
                  </Button>
                  <Button
                    variant="outline"
                    className="check-chainId"
                    onClick={beforeWithdraw}
                  >
                    Claim Withdrawn Amount
                  </Button>
                </div>
              </SendDialog>
            </>
          )}
        </CardTitle>
        <CardDescription>
          View your dividends history and withdraw within the withdrawal time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <Loading show={loading} className={'h-80'} />
        ) : (
          <div className="flex justify-between flex-wrap">
            <div className="w-full">
              <div className="overflow-auto overflow-x-hidden relative">
                <Table divclassname="max-h-80">
                  <TableHeader
                    className="sticky top-0 z-10"
                    style={{
                      backgroundColor:
                        resolvedTheme === 'dark' ? '#020817' : 'white',
                    }}
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell as any,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
