'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Address, useContractWrite, useSendTransaction } from 'wagmi'
import ERC20_ABI from '@/config/abis/ERC20.abi.json'
import ORMakerDeposit from '@/config/abis/ORMakerDeposit.abi.json'
import { utils } from 'ethers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getMainnetToken,
  ChainInfoTokenInterface,
} from '@/lib/thegraphs/manager'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Hash } from 'viem'
import { SendDialog } from '@/components/send-dialog'
import { DealerHistoryProfitWithdraw } from '@/app/dealer/components/dealer-history-profit-withdraw'
import { orFeeManagerAddress } from '@/config/contracts'
import { equalBN } from '@/lib/utils'

interface IMakerFeeRatioAmountProps {
  ownerContractAddress: Address
}
interface IConfirmInterface {
  currentToken: ChainInfoTokenInterface
  address: Address
  amount: string
  currentTabs: 'deposit' | 'withdraw'
}
function RenderConfirmButton(props: IConfirmInterface) {
  const { currentToken, address, amount, currentTabs } = props
  const isEth = currentToken?.symbol === 'ETH'
  const { sendTransactionAsync } = useSendTransaction()
  const { writeAsync: transfer } = useContractWrite({
    address: currentToken.mainnetToken as Hash,
    abi: ERC20_ABI,
    functionName: 'transfer',
  })
  const { writeAsync: withdraw } = useContractWrite({
    address,
    abi: ORMakerDeposit,
    functionName: 'withdraw',
  })
  const ethDepositFunc = async () => {
    return await sendTransactionAsync({
      to: orFeeManagerAddress as Address,
      value: utils.parseEther(amount + '').toBigInt(),
    })
  }

  const otherDepositFunc = async (): Promise<{ hash: Hash }> => {
    return await transfer({
      args: [
        orFeeManagerAddress as Address,
        utils.parseUnits(amount, currentToken.decimals),
      ],
    })
  }

  const withdrawFunc = async (): Promise<{ hash: Hash }> => {
    return await withdraw({
      args: [
        currentToken.mainnetToken,
        utils.parseUnits(amount, currentToken.decimals),
      ],
    })
  }
  const confirmFunc = async (): Promise<{ hash: Hash }> => {
    const depositOrWithdrawFunc =
      currentTabs === 'deposit'
        ? isEth
          ? ethDepositFunc
          : otherDepositFunc
        : withdrawFunc
    return await depositOrWithdrawFunc()
  }

  const showToast = () => {
    toast({
      variant: 'destructive',
      title: 'Please select Token or input Amount.',
    })
  }
  if (!currentToken || !amount) {
    return (
      <Button variant="outline" onClick={() => showToast()}>
        Deposit
      </Button>
    )
  } else {
    return (
      <SendDialog send={() => confirmFunc()}>
        <Button variant="outline" className="mr-2">
          Deposit
        </Button>
      </SendDialog>
    )
  }
}

export function MakerFeeRatioAmount(props: IMakerFeeRatioAmountProps) {
  const { ownerContractAddress } = props
  const mainnetTokenList: ChainInfoTokenInterface[] = getMainnetToken()
  const [amount, setAmount] = React.useState('')
  const [currentToken, setCurrentToken] = React.useState(
    {} as ChainInfoTokenInterface,
  )
  const [currentTabs, setCurrentTabs] = React.useState(
    'deposit' as 'deposit' | 'withdraw',
  )

  const handlerTokenSelectChange = async (value: string) => {
    const currentTokenInfo = mainnetTokenList.find((item) =>
      equalBN(item.mainnetToken, value),
    )
    if (!currentTokenInfo) return
    setCurrentToken(currentTokenInfo)
  }

  const handlerInputChange = (event: any) => {
    let amount = event.target.value || ''
    amount = amount.replace(/[^0-9.]/g, '')
    event.target.value = amount
    if (!amount) return
    setAmount(amount)
  }

  return (
    <div className="mt-4 flex">
      <Card className="mr-4 max-w-[400px]">
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
          <CardDescription>
            {`Adjust your deposit here. Click ‘Deposit’ once confirmed.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="amount">Token</Label>
            <Select onValueChange={(value) => handlerTokenSelectChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mainnetTokenList.map((item, index) => {
                    return (
                      <SelectItem key={index} value={item.mainnetToken}>
                        {item.symbol}
                      </SelectItem>
                    )
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input
              placeholder="Input deposit amount"
              onChange={(e) => handlerInputChange(e)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <RenderConfirmButton
            currentToken={currentToken}
            address={ownerContractAddress}
            amount={amount}
            currentTabs={currentTabs}
          ></RenderConfirmButton>
        </CardFooter>
      </Card>
      <DealerHistoryProfitWithdraw withdrawUser="Maker"></DealerHistoryProfitWithdraw>
    </div>
  )
}
