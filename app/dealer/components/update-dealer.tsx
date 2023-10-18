import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useContractWrite } from 'wagmi'
import { SendDialog } from '@/components/send-dialog'
import { BigNumber } from 'ethers'
import { contracts } from '@/config/contracts'
import { toast } from '@/components/ui/use-toast'
import { getDecimalPlaces } from '@/lib/utils'
import { PERCENT_RATIO_MULTIPLE } from '@/config/constants'
import { DealerInfo } from '@/app/dealer/components/main'
import { useCheckChainId } from '@/hooks/check-chainId'

const MAX_FEE_RATIO = 100

interface IUpdateDealerInterface {
  dealerInfo?: DealerInfo
}

export function UpdateDealer({ dealerInfo }: IUpdateDealerInterface) {
  const [inputFeeRatio, setInputFeeRatio] = useState(0)

  const percentFeeRatio = useMemo(() => {
    return (inputFeeRatio && inputFeeRatio * PERCENT_RATIO_MULTIPLE) || ''
  }, [inputFeeRatio])

  const { writeAsync: updateDealer } = useContractWrite({
    ...contracts.orFeeManager,
    functionName: 'updateDealer',
  })

  const { checkCurrentChain } = useCheckChainId()

  const handlerInputFeeRatio = (v: any): void => {
    let value = v.target.value
    value = value.replace(/[^0-9.]/g, '')
    value = getDecimalPlaces(value) > 4 ? '0.0001' : value
    value = value > MAX_FEE_RATIO ? MAX_FEE_RATIO : value
    v.target.value = value
    let number = parseFloat(value)
    setInputFeeRatio(number)
  }

  const beforeUpdate = useCallback(
    (e: any) => {
      if (checkCurrentChain()) return e.preventDefault()
      let toastTitle = ''
      if (!percentFeeRatio) {
        toastTitle = 'FeeRatio cannot be empty.'
      } else if (Number(percentFeeRatio) < 0) {
        toastTitle = 'FeeRatio cannot be less than 0.'
      }
      if (toastTitle) {
        e.preventDefault()
        toast({
          variant: 'destructive',
          title: toastTitle,
        })
      }
    },
    [percentFeeRatio],
  )

  const updateDealerFeeRatio = async () => {
    return await updateDealer({
      args: [
        BigNumber.from(percentFeeRatio),
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
    })
  }

  return (
    <Card className="mr-4">
      <CardHeader>
        <CardTitle>Configure</CardTitle>
        <CardDescription className="w-[405px]">
          {`
          Make changes to your feeRatio. Click save when you're done.
            Modify your fee ratio, then click "Register" to confirm.
          `}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="feeRatio">Fee Ratio (%)</Label>
          <Input
            id="feeRatio"
            placeholder="Input fee ratio"
            type="number"
            defaultValue={
              dealerInfo?.feeRatio
                ? Number(dealerInfo.feeRatio) / PERCENT_RATIO_MULTIPLE
                : ''
            }
            disabled={Number(dealerInfo?.feeRatio) > 0}
            onChange={(v) => handlerInputFeeRatio(v)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="extraInfo">Extra info</Label>
          <Input
            id="extraInfo"
            placeholder="Input extra info."
            disabled={Number(dealerInfo?.feeRatio) > 0}
          />
        </div>
      </CardContent>
      <CardFooter>
        <SendDialog send={() => updateDealerFeeRatio()}>
          <Button
            disabled={Number(dealerInfo?.feeRatio) > 0}
            onClick={beforeUpdate}
            className="mr-2 check-chainId"
            variant="outline"
          >
            Register
          </Button>
        </SendDialog>
      </CardFooter>
    </Card>
  )
}
