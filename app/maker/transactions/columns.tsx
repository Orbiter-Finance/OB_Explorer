import { ListItem } from '@/app/transactions/fetchData'
import { SendDialog } from '@/components/send-dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ColumnDef } from '@tanstack/react-table'
import { utils } from 'ethers'
import ERC20_ABI from '@/config/abis/ERC20.abi.json'
import { Address } from 'viem'
import { useContractWrite, useSendTransaction } from 'wagmi'
import { Hash } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { getTokenInfoDecimal } from '@/lib/thegraphs/manager'
import { useCheckChainId } from '@/hooks/check-chainId'
import { equalBN } from '@/lib/utils'

interface ISendInterface {
  row: any
}

const showToast = (text: string) => {
  toast({
    variant: 'destructive',
    title: text,
  })
}

function RenderSendButton(props: ISendInterface) {
  const { row } = props
  const account = useAccount()
  const { checkChainIdToMainnet } = useCheckChainId()
  const isEth = row?.fromSymbol === 'ETH'
  const currentToChainId = Number(row?.toChainId)
  const showSendButton =
    !row?.toHash && (row?.status === 97 || row?.status === 0)
  const { sendTransactionAsync } = useSendTransaction()

  const { writeAsync: transfer } = useContractWrite({
    address: row?.targetToken as Hash,
    abi: ERC20_ABI,
    functionName: 'transfer',
  })

  const ethDepositFunc = async () => {
    return await sendTransactionAsync({
      to: row.targetAddress as Address,
      value: utils.parseEther(row.toValue + '').toBigInt(),
    })
  }

  const otherDepositFunc = async (): Promise<{ hash: Hash }> => {
    return await transfer({
      args: [
        row.targetAddress as Address,
        utils.parseUnits(
          row.toValue,
          getTokenInfoDecimal(Number(row?.toChainId), row?.targetToken),
        ),
      ],
    })
  }

  const confirmFunc = async (): Promise<{ hash: Hash }> => {
    const depositFunc = isEth ? ethDepositFunc : otherDepositFunc
    await checkChainIdToMainnet(currentToChainId)
    return await depositFunc()
  }

  const beforeSend = async (e: any) => {
    if (!equalBN(account.address || 0, row.sourceMaker)) {
      e.preventDefault()
      return showToast(
        `Please switch the address to ${row.sourceMaker} in the wallet!`,
      )
    }
  }

  return showSendButton ? (
    <SendDialog send={() => confirmFunc()}>
      <Button variant="outline" onClick={beforeSend}>
        Send
      </Button>
    </SendDialog>
  ) : (
    <span>-</span>
  )
}

export const otherColumns: ColumnDef<ListItem>[] = [
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return (
        <div className="flex">
          <RenderSendButton row={row.original} />
        </div>
      )
    },
  },
]
