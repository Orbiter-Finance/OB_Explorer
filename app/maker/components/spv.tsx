'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Address, useContractWrite } from 'wagmi'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SendDialog } from '@/components/send-dialog'
import { Separator } from '@/components/ui/separator'
import ORMakerDeposit from '@/config/abis/ORMakerDeposit.abi.json'
import { useTheme } from 'next-themes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Hash } from 'viem'
import { getSpvs } from '@/lib/thegraphs/manager'
import { Checkbox } from '@/components/ui/checkbox'
import { BindSpv, BindSPVs } from './utils/getBindSpvs'
import { beforeUpdate } from '@/lib/utils'
import { Loading } from '@/components/loding'

interface IUserAmountSpcProps {
  bindSpvData?: {
    mdcs: BindSPVs[]
  }
  ownerContractAddress: Address
  isSpvLoading: boolean
}

export function Spv(props: IUserAmountSpcProps) {
  const { ownerContractAddress, bindSpvData, isSpvLoading } = props
  const spvsInfoList = getSpvs()
  const { resolvedTheme } = useTheme()
  const [currentChooseId, setCurrentChooseId] = React.useState(
    spvsInfoList?.[0]?.id,
  )
  const [chooseIdSpv, setChooseIdSpv] = React.useState(
    {} as {
      [key: string]: Address[]
    },
  )

  React.useEffect(() => {
    if (bindSpvData?.mdcs) {
      const mdcs = bindSpvData?.mdcs
      const hadBindSpv: { [key: string]: Address[] } = {}
      mdcs.forEach((mdcsItem) => {
        const bindSpvs = mdcsItem?.bindSPVs
        bindSpvs.forEach((spvItem: BindSpv) => {
          if (hadBindSpv[spvItem.chainId]) {
            if (!hadBindSpv[spvItem.chainId].includes(spvItem.spv)) {
              hadBindSpv[spvItem.chainId].push(spvItem.spv)
            }
          } else {
            hadBindSpv[spvItem.chainId] = [spvItem.spv]
          }
        })
      })
      setChooseIdSpv(hadBindSpv)
    }
  }, [bindSpvData])

  const { writeAsync: updateSpvs } = useContractWrite({
    address: ownerContractAddress,
    abi: ORMakerDeposit,
    functionName: 'updateSpvs',
  })

  const showSpvList = React.useMemo(() => {
    return spvsInfoList.filter((v) => v.id === currentChooseId)?.[0] || []
  }, [spvsInfoList, currentChooseId])

  const handlerClickChainId = (chainId: number) => {
    setCurrentChooseId(chainId)
  }

  const handlerClickSpv = (value: Address) => {
    let curIdSpvsValue =
      chooseIdSpv?.[currentChooseId as keyof typeof chooseIdSpv] || []
    if (curIdSpvsValue.length > 0) {
      if (curIdSpvsValue.includes(value)) {
        const valueIndex = curIdSpvsValue.findIndex(
          (spv: Address) => spv === value,
        )
        curIdSpvsValue.splice(valueIndex, 1)
      } else {
        curIdSpvsValue = [value]
      }
    } else {
      curIdSpvsValue = [value]
    }
    setChooseIdSpv((prev) => {
      return { ...prev, [currentChooseId]: curIdSpvsValue }
    })
  }

  const updateSpvsFunc = async ({
    enableTime,
  }: {
    enableTime?: number
  }): Promise<{ hash: Hash }> => {
    const chainIdList: number[] = []
    const spvList: Address[] = []
    for (const chainId in chooseIdSpv) {
      if (Object.prototype.hasOwnProperty.call(chooseIdSpv, chainId)) {
        const spvs = chooseIdSpv[chainId]
        spvs.forEach((itemSpv) => {
          chainIdList.push(Number(chainId))
          spvList.push(itemSpv)
        })
      }
    }
    return await updateSpvs({
      args: [enableTime, spvList, chainIdList],
    })
  }

  return (
    <div className="mt-4 ml-4 flex-1">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex">
            <div className="flex-1">SPV</div>
            <SendDialog send={updateSpvsFunc} requiredEnableTime={true}>
              <Button onClick={(e) => beforeUpdate(e, ownerContractAddress)}>
                Submit
              </Button>
            </SendDialog>
          </CardTitle>
          <CardDescription>Set the spv of chains</CardDescription>
        </CardHeader>
        <CardContent>
          {isSpvLoading ? (
            <Loading show={isSpvLoading} className={'h-[302px]'} />
          ) : (
            <div className="w-full flex">
              <div className="tags mr-2">
                <ScrollArea className="rounded-md border h-[302px]">
                  <div className="p-4 pt-0 relative">
                    <div
                      className="text-sm sticky flex items-center top-0 z-10 h-10 w-full font-medium leading-none"
                      style={{
                        backgroundColor:
                          resolvedTheme === 'dark' ? '#020817' : 'white',
                      }}
                    >
                      ChainID
                    </div>
                    {spvsInfoList.map((spv, index) => (
                      <React.Fragment key={spv.id + index}>
                        <div
                          className="text-sm hover:bg-muted/50 pt-2 pb-2 cursor-pointer"
                          style={{
                            fontWeight:
                              spv.id === currentChooseId ? 'bold' : 'unset',
                          }}
                          onClick={() => handlerClickChainId(spv.id)}
                        >
                          {spv.name}
                        </div>
                        <Separator />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="spv-list flex-1">
                <ScrollArea className="w-full rounded-md border h-[302px]">
                  <div className="p-4 pt-0 relative">
                    <div
                      className="text-sm flex items-center sticky top-0 z-10 h-10 w-full font-medium leading-none"
                      style={{
                        backgroundColor:
                          resolvedTheme === 'dark' ? '#020817' : 'white',
                      }}
                    >
                      Spv
                    </div>
                    {showSpvList?.spvs?.map((item, index) => (
                      <React.Fragment key={item + index}>
                        <div
                          onClick={() => handlerClickSpv(item as Address)}
                          className={`${
                            chooseIdSpv?.[currentChooseId]?.includes(
                              item as Address,
                            )
                              ? 'bg-muted'
                              : ''
                          } text-sm flex justify-between pt-2 pb-2 items-center hover:bg-muted/50 cursor-pointer`}
                        >
                          {item}
                          <Checkbox
                            checked={chooseIdSpv?.[currentChooseId]?.includes(
                              item as Address,
                            )}
                          ></Checkbox>
                        </div>
                        <Separator />
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
