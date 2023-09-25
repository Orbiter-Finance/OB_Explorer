'use client'

import {
  ArrowRightIcon,
  DotFilledIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { SendDialog } from '@/components/send-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getChainName } from '@/config/chain-list'
import { contracts } from '@/config/contracts'
import {
  RuleInterface,
  RuleOnewayInterface,
  calculateRulesTree,
  convertToOneways,
  mergeRuleOneways,
} from '@/lib/rule'
import {
  getTokenInfoMainnetToken,
  getTokenInfoSymbol,
} from '@/lib/thegraphs/manager'
import { cn, dateFormatStandard, equalBN, predictMDCAddress } from '@/lib/utils'
import { BigNumberish, utils } from 'ethers'
import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { RuleModify } from './rule-modify'
import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import { getLatestRules } from '@/lib/thegraphs/maker-deposit'
import { Badge } from '@/components/ui/badge'
import { Abi, Address } from 'viem'
import { Loading } from '@/components/loding'
import { renderTooltipProvider } from '@/lib/renderComponents'
import { useTheme } from 'next-themes'

function rulesFindIndex(
  rules: RuleOnewayInterface[],
  rule: RuleOnewayInterface,
) {
  const index = rules.findIndex(
    (r) =>
      equalBN(r.sourceChainId, rule.sourceChainId) &&
      equalBN(r.destChainId, rule.destChainId) &&
      equalBN(r.sourceToken, rule.sourceToken) &&
      equalBN(r.destToken, rule.destToken),
  )

  return index
}

function useLatestRules() {
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [latestRules, setLatestRules] = useState<RuleInterface[]>([])

  const { refetch } = usePromiseWithToast(async () => {
    if (loading) return

    setLatestRules([])
    setLoading(true)

    try {
      const mdc = predictMDCAddress(account.address)
      if (mdc) {
        const lrs = await getLatestRules(mdc, contracts.orEventBinding.address)
        setLatestRules(lrs)
      }
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  })

  useEffect(() => {
    if (account.address) refetch()
  }, [account.address])

  return { loading, latestRules, refetch }
}

export function RuleList() {
  const [unSubmittedRules, setUNSubmittedRules] = useState<
    RuleOnewayInterface[]
  >([])
  const [newRule, setNewRule] = useState<RuleOnewayInterface>()
  const [rules, setRules] = useState<RuleOnewayInterface[]>([
    ...unSubmittedRules,
  ])
  const [changedRules, setChangedRules] = useState<RuleOnewayInterface[]>([])

  const { latestRules, loading, refetch } = useLatestRules()
  const [expanded, setExpanded] = useState<ExpandedState>({})
  useMemo(() => {
    const _rules = convertToOneways(latestRules)
    setUNSubmittedRules(_rules)
    setRules([..._rules])
  }, [latestRules])

  const updateChangedRules = (rule: RuleOnewayInterface, isRemove = false) => {
    let _changedRules = changedRules
    const index = rulesFindIndex(_changedRules, rule)

    if (!isRemove) {
      if (index > -1) _changedRules[index] = rule
      else _changedRules.push(rule)
    } else if (index > -1) {
      _changedRules = _changedRules.filter((_, i) => i !== index)
    }

    setChangedRules(_changedRules)
  }

  const cellStyle = (row: any) => {
    return {
      paddingLeft: `${row.depth * 2}rem`,
    }
  }

  const columns: ColumnDef<RuleOnewayInterface>[] = [
    {
      accessorKey: 'isRunning',
      header: 'Run Status',
      size: 150,
      cell: ({ row }) => {
        const currentDate = new Date().getTime()
        const enableTimestamp = Number(row.original.enableTimestamp) * 1000
        const isStatusReady =
          row.getValue('status') == true && currentDate > enableTimestamp
        return (
          <div
            className="capitalize flex justify-center items-center"
            style={cellStyle(row)}
          >
            {row.getCanExpand() ? (
              !isStatusReady ? (
                <button
                  {...{
                    onClick: row.getToggleExpandedHandler(),
                    style: { cursor: 'pointer' },
                  }}
                >
                  {row.getIsExpanded() ? 'Close' : 'View Running'}
                </button>
              ) : (
                'Running'
              )
            ) : (
              ''
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const currentDate = new Date().getTime()
        const enableTimestamp = Number(row.original.enableTimestamp) * 1000
        const isStatusReady =
          row.getValue('status') == true && currentDate > enableTimestamp
        return (
          <div className="capitalize" style={cellStyle(row)}>
            <DotFilledIcon
              className={cn(
                isStatusReady ? 'text-green-500' : 'text-red-500',
                'w-4 h-4',
              )}
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'enableTimestamp',
      header: 'Time',
      size: 200,
      cell: ({ row }) => {
        const currentDate: number = Number(row.getValue('enableTimestamp'))
        return (
          <div style={cellStyle(row)}>
            {dateFormatStandard(currentDate * 1000)}
          </div>
        )
      },
    },
    {
      accessorKey: 'sourceChainId',
      header: 'Source Chain',
      cell: ({ row }) => {
        const sourceChainId: number = row.getValue('sourceChainId')
        return renderTooltipProvider(
          <span>{getChainName(sourceChainId) || '-'}</span>,
          <p>{sourceChainId}</p>,
        )
      },
    },
    {
      header: 'To',
      size: 30,
      cell: () => <ArrowRightIcon className="mr-1 w-[30px] h-[20px]" />,
    },
    {
      accessorKey: 'destChainId',
      header: 'Destination Chain',
      cell: ({ row }) => {
        const destChainId: number = row.getValue('destChainId')
        return renderTooltipProvider(
          <span>{getChainName(destChainId) || '-'}</span>,
          <p>{destChainId}</p>,
        )
      },
    },
    {
      accessorKey: 'sourceToken',
      header: 'Token (From)',
      cell: ({ row }) => {
        const sourceChainId: number = row.getValue('sourceChainId')
        const sourceToken: Address = row.getValue('sourceToken')
        return renderTooltipProvider(
          <span>{getTokenInfoSymbol(sourceChainId, sourceToken) || '-'}</span>,
          <p>{sourceToken}</p>,
        )
      },
    },
    {
      accessorKey: 'destToken',
      header: 'Token (To)',
      cell: ({ row }) => {
        const destChainId: number = row.getValue('destChainId')
        const destToken: Address = row.getValue('destToken')
        return renderTooltipProvider(
          <span>{getTokenInfoSymbol(destChainId, destToken) || '-'}</span>,
          <p>{destToken}</p>,
        )
      },
    },
    {
      id: 'configs',
      header: 'Config',
      size: 220,
      cell: ({ row }) => {
        const _rule = row.original

        return (
          <div className="grid grid-cols-2 gap-1" style={cellStyle(row)}>
            {[
              _rule.minPrice,
              _rule.maxPrice,
              _rule.withholdingFee,
              _rule.tradeFee,
              _rule.responseTime,
              _rule.compensationRatio,
            ].map((item, index) => {
              const showPercentIndex = [3, 5]
              const percentItem =
                showPercentIndex.includes(index) && !!item ? `${item}%` : item
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="inline-block overflow-hidden text-ellipsis text-center font-medium justify-center"
                >
                  {renderTooltipProvider(
                    <span>{percentItem}</span>,
                    <p>{percentItem}</p>,
                  )}
                </Badge>
              )
            })}
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        if (row.depth !== 0) return null
        const onChangeRule = (rule: RuleOnewayInterface) => {
          const _index = rulesFindIndex(unSubmittedRules, rule)
          if (_index === -1) {
            updateChangedRules(rule)
          } else {
            updateChangedRules(
              rule,
              lodash.isEqual(unSubmittedRules[_index], rule),
            )
          }

          rules[Number(row.id)] = rule
          setRules([...rules])
        }

        const onClickRemove = () => {
          setRules(rules.filter((_, i) => Number(row.id) !== i))
          updateChangedRules(row.original, true)
        }

        const onClickReset = () => {
          const index = Number(row.id)
          const _usrIndex = rulesFindIndex(unSubmittedRules, rules[index])
          if (_usrIndex === -1) return

          rules[index] = unSubmittedRules[_usrIndex]
          setRules([...rules])

          updateChangedRules(row.original, true)
        }

        return (
          <div className="flex">
            <RuleModify
              key={row.id}
              rule={row.original}
              onChange={onChangeRule}
            >
              <Button variant="outline" size="icon">
                <MixerHorizontalIcon className="h-4 w-4" />
              </Button>
            </RuleModify>

            {rulesFindIndex(unSubmittedRules, row.original) === -1 ? (
              <Button
                variant="link"
                className="text-red-600"
                onClick={onClickRemove}
              >
                Remove
              </Button>
            ) : (
              rulesFindIndex(changedRules, row.original) > -1 && (
                <Button
                  variant="link"
                  className="text-slate-500"
                  onClick={onClickReset}
                >
                  Reset
                </Button>
              )
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: rules,
    columns,
    state: {
      expanded,
    },
    getSubRows: (row) => row.subRows,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const account = useAccount()
  const mdc = predictMDCAddress(account.address)
  const { resolvedTheme } = useTheme()

  const { refetch: rulesRoot } = useContractRead<
    Abi,
    'rulesRoot',
    { root: BigNumberish; version: number }
  >({
    address: mdc,
    abi: contracts.orMakerDepositImpl.abi,
    functionName: 'rulesRoot',
    args: [contracts.orEventBinding.address],
    enabled: false,
  })

  const { writeAsync: updateRulesRoot } = useContractWrite({
    address: mdc,
    abi: contracts.orMakerDepositImpl.abi,
    functionName: 'updateRulesRoot',
    account: account.address,
  })

  const submitModifies = async ({ enableTime }: { enableTime?: number }) => {
    const rootWithVersion = (await rulesRoot()).data

    const { rules: ruleTwoways, updateRules } = mergeRuleOneways(
      [],
      rules,
      changedRules,
    )
    const root = utils.hexlify((await calculateRulesTree(ruleTwoways)).root)
    const { hash } = await updateRulesRoot({
      args: [
        enableTime,
        contracts.orEventBinding.address,
        mergeRuleOneways([], updateRules, updateRules).rules,
        [root, (rootWithVersion?.version || 0) + 1],
        [],
        [],
      ],
    })
    return { hash }
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex">
            <div className="flex-1">Rules</div>
            <div>
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              <RuleModify
                rule={newRule}
                onChange={(rule) => {
                  const ruleIndex = rulesFindIndex(rules, rule)
                  if (ruleIndex > -1) {
                    throw new Error('The same rules exist.')
                  }

                  setRules([rule, ...rules])
                  updateChangedRules(rule)
                  setNewRule(undefined)
                }}
              >
                <Button variant="outline" className="mr-2">
                  Add Rules
                </Button>
              </RuleModify>
              {changedRules.length > 0 && (
                <SendDialog
                  send={submitModifies}
                  requiredEnableTime={true}
                  onFinally={(data) => {
                    if (data.status !== 'success' || data.open === true) return
                    refetch()
                    setUNSubmittedRules([...rules])
                    setChangedRules([])
                  }}
                >
                  <Button>Submit modifies</Button>
                </SendDialog>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            Rules for cross-rollup market makers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading show={loading} className={'h-40'}></Loading>
          ) : (
            <div className="flex justify-between flex-wrap">
              <div className="w-full">
                <div className="overflow-auto overflow-x-hidden relative">
                  <Table divclassname="max-h-[60vh]">
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
                            const size = header.getSize()
                            return (
                              <TableHead
                                key={header.id}
                                style={{ width: size ? `${size}px` : '' }}
                              >
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
                                  cell.column.columnDef.cell,
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
    </div>
  )
}
