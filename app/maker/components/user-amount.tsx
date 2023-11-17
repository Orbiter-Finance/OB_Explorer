'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Address,
  useAccount,
  useContractWrite,
  useContractRead,
  useSendTransaction,
  usePublicClient,
} from 'wagmi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ERC20_ABI from '@/config/abis/ERC20.abi.json'
import ORMakerDeposit from '@/config/abis/ORMakerDeposit.abi.json'
import { BigNumber, utils } from 'ethers'
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Hash } from 'viem'
import { SendDialog } from '@/components/send-dialog'
import { beforeUpdate } from '@/lib/utils'
import { useCheckChainId } from '@/hooks/check-chainId'

interface IUserAmountSpcProps {
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
  const account = useAccount()
  const client = usePublicClient()
  const isEth = currentToken?.symbol === 'ETH'
  const { sendTransactionAsync } = useSendTransaction()
  const { checkChainIdToMainnet } = useCheckChainId()
  const allowanceArgs =
    currentTabs === 'deposit'
      ? [account.address, address]
      : [address, account.address]
  const { data: allowanceData } = useContractRead({
    address: currentToken.mainnetToken as Hash,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: allowanceArgs,
  })
  // TODO balanceOf - freezeAssets = currentTokens
  // const { data: freezeAssets } = useContractRead({
  //   address,
  //   abi: ORMakerDeposit,
  //   functionName: 'freezeAssets',
  //   args: [currentToken.mainnetToken]
  // })
  const { writeAsync: approve } = useContractWrite({
    address: currentToken.mainnetToken as Hash,
    abi: ERC20_ABI,
    functionName: 'approve',
  })
  const { writeAsync: otherDeposit } = useContractWrite({
    address,
    abi: ORMakerDeposit,
    functionName: 'deposit',
  })
  const { writeAsync: withdraw } = useContractWrite({
    address,
    abi: ORMakerDeposit,
    functionName: 'withdraw',
  })
  const ethDepositFunc = async () => {
    return await sendTransactionAsync({
      to: address,
      value: utils.parseEther(amount + '').toBigInt(),
    })
  }

  const otherDepositFunc = async (): Promise<{ hash: Hash }> => {
    return await otherDeposit({
      args: [
        utils.getAddress(
          BigNumber.from(currentToken.mainnetToken).toHexString(),
        ),
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
    let depositRes: { hash: Hash } = { hash: '' as Hash }
    const depositOrWithdrawFunc =
      currentTabs === 'deposit'
        ? isEth
          ? ethDepositFunc
          : otherDepositFunc
        : withdrawFunc
    await checkChainIdToMainnet()
    if (!isEth && BigNumber.from(allowanceData).lt(amount)) {
      const approveAddressParam =
        currentTabs === 'deposit' ? address : account.address
      depositRes = await approve({
        args: [
          approveAddressParam,
          utils.parseUnits('5000', currentToken.decimals),
        ],
      })
      await client.waitForTransactionReceipt(depositRes)
      depositRes = await depositOrWithdrawFunc()
    } else {
      depositRes = await depositOrWithdrawFunc()
    }
    return depositRes
  }

  const showToast = (e: any) => {
    const toastTitle = address
      ? 'Please select Token or input Amount.'
      : 'Need to register as Maker.'
    toast({
      variant: 'destructive',
      title: toastTitle,
    })
  }

  if (!currentToken || !amount) {
    return (
      <Button variant="outline" onClick={(e) => showToast(e)}>
        Submit
      </Button>
    )
  } else {
    return (
      <SendDialog send={() => confirmFunc()}>
        <Button
          className="mr-2"
          variant="outline"
          onClick={(e) => beforeUpdate(e, address)}
        >
          Submit
        </Button>
      </SendDialog>
    )
  }
}

export function UserAmount(props: IUserAmountSpcProps) {
  const { ownerContractAddress } = props
  const mainnetTokenList: ChainInfoTokenInterface[] = getMainnetToken()
  const [amount, setAmount] = React.useState('')
  const [currentToken, setCurrentToken] = React.useState(
    {} as ChainInfoTokenInterface,
  )
  const [currentTabs, setCurrentTabs] = React.useState(
    'deposit' as 'deposit' | 'withdraw',
  )
  const handlerSelectChange = async (value: any) => {
    const currentTokenInfo = mainnetTokenList.find(
      (item) => item.symbol === value,
    )
    if (!currentTokenInfo) return
    setCurrentToken(currentTokenInfo)
  }

  const onTabsChange = (value: 'deposit' | 'withdraw') => {
    setCurrentTabs(value)
    setCurrentToken({} as ChainInfoTokenInterface)
    setAmount('')
  }

  const handlerInputChange = (event: any) => {
    let amount = event.target.value || ''
    amount = amount.replace(/[^0-9.]/g, '')
    event.target.value = amount
    if (!amount) return
    setAmount(amount)
  }

  return (
    <div className="mt-4 max-w-[400px]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex">
            <div className="flex-1">Pledge amount</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex">
            <Tabs
              onValueChange={(value: any) => onTabsChange(value)}
              defaultValue="deposit"
              className="w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>
              <TabsContent value="deposit">
                <Card>
                  <CardHeader>
                    <CardDescription>Deposit pledge amount</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Select
                        onValueChange={(value) => handlerSelectChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tokens</SelectLabel>
                            {mainnetTokenList.map((item, index) => {
                              return (
                                <SelectItem key={index} value={item.symbol!}>
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
              </TabsContent>
              <TabsContent value="withdraw">
                <Card>
                  <CardHeader>
                    <CardDescription>Withdraw pledge amount</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Select
                        onValueChange={(value) => handlerSelectChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Tokens</SelectLabel>
                            {mainnetTokenList.map((item, index) => {
                              return (
                                <SelectItem key={index} value={item.symbol!}>
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
                        placeholder="Input withdraw amount"
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
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
