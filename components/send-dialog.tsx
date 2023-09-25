import { usePromiseWithToast } from '@/hooks/promise-with-toast'
import { cn, dateFormatStandard } from '@/lib/utils'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { CheckCircle2Icon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Hash } from 'viem'
import { usePublicClient } from 'wagmi'
import { DatetimePicker } from './datetime-picker'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { renderTooltipProvider } from '@/lib/renderComponents'

const stepClassName =
  'grid grid-cols-9 gap-1 items-center text-slate-700 leading-8 text-sm'

export function SendDialog(props: {
  children: React.ReactNode
  send?: (data: { enableTime?: number }) => Promise<{ hash: Hash }>
  requiredEnableTime?: boolean
  onFinally?: (data: {
    hash?: Hash
    status?: 'loading' | 'success' | 'error'
    open?: boolean
  }) => void
}) {
  const client = usePublicClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [enableTime, setEnableTime] = useState(
    dayjs().startOf('minute').add(20, 'minute').unix(),
  ) // 20 minutes
  const [sendStatus, setSendStatus] = useState<
    'loading' | 'success' | 'error'
  >()
  const [transactionHash, setTransactionHash] = useState<Hash>()
  const [errorMsg, setErrorMsg] = useState<string>()

  const onFinally: typeof props.onFinally = (data) => {
    props.onFinally && props.onFinally(data)
  }

  const { refetch } = usePromiseWithToast(async () => {
    if (!props.send) return

    // TODO: should from OR_Manager contract
    if (props.requiredEnableTime) {
      const minEnableTime = Date.now() + 5 * 60 * 1000

      if ((enableTime || 0) * 1000 < minEnableTime)
        throw new Error(
          `Enable time must be after ${dateFormatStandard(minEnableTime)}`,
        )
    }

    let hash: Hash | undefined
    let status: typeof sendStatus
    try {
      status = 'loading'
      setSendStatus(status)
      setTransactionHash(undefined)
      setErrorMsg(undefined)

      hash = (await props.send({ enableTime }))?.hash
      if (!hash) {
        setSendStatus(undefined)
        setDialogOpen(false)
        return
      }
      setTransactionHash(hash!)

      await client.waitForTransactionReceipt({ hash })

      status = 'success'
      setSendStatus(status)
    } catch (err: any) {
      setErrorMsg(err.message + '')
      status = 'error'
      setSendStatus(status)

      throw err
    } finally {
      onFinally({ hash, status, open: dialogOpen })
    }
  })

  useEffect(() => {
    if (dialogOpen && sendStatus === undefined && !props.requiredEnableTime) {
      refetch()
    }

    if (sendStatus === 'error' || sendStatus === 'success') {
      onFinally({ hash: transactionHash, status: sendStatus, open: dialogOpen })
    }
    if (dialogOpen && sendStatus === 'error') {
      setSendStatus(undefined)
    }
  }, [dialogOpen])

  useEffect(() => {
    if (!dialogOpen && sendStatus === 'success') {
      setSendStatus(undefined)
    }
  }, [dialogOpen, sendStatus])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
          <DialogDescription>Sending transaction</DialogDescription>
        </DialogHeader>
        {props.requiredEnableTime && (
          <div className={stepClassName}>
            <div className="col-span-3 text-slate-500">EnableTime:</div>
            <div className="col-span-6">
              <DatetimePicker
                value={dayjs.unix(enableTime).toDate()}
                onChange={(v) => {
                  setEnableTime(dayjs(v).unix())
                }}
              >
                <Button
                  variant="link"
                  disabled={
                    sendStatus === 'loading' || sendStatus === 'success'
                  }
                  className={cn(
                    'text-slate-700 p-0 font-normal disabled:opacity-100',
                    !enableTime && 'text-muted-foreground',
                  )}
                >
                  {enableTime ? (
                    dateFormatStandard(enableTime * 1000)
                  ) : (
                    <span>Pick enable time</span>
                  )}
                </Button>
              </DatetimePicker>
            </div>
          </div>
        )}

        {sendStatus !== undefined && (
          <div className={stepClassName}>
            <div className="col-span-3 text-slate-500">Wallet:</div>
            {transactionHash ? (
              <>
                <div className="col-span-5 truncate">Confirmed</div>
                <div className="col-span-1">
                  <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                </div>
              </>
            ) : sendStatus === 'loading' ? (
              <>
                <div className="col-span-5 truncate">Confirming</div>
                <div className="col-span-1">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-5 truncate text-red-500">
                  {errorMsg}
                </div>
                <div className="col-span-1">
                  <CrossCircledIcon className="h-5 w-5 text-red-500" />
                </div>
              </>
            )}
          </div>
        )}

        {transactionHash && (
          <div className={stepClassName}>
            <div className="col-span-3 text-slate-500">Transaction:</div>
            <div className="col-span-5 truncate">
              {errorMsg === undefined ? (
                renderTooltipProvider(
                  <span>{transactionHash}</span>,
                  <p>{transactionHash}</p>,
                )
              ) : (
                <span className="text-red-500">{errorMsg}</span>
              )}
            </div>
            <div className="col-span-1">
              {sendStatus === 'loading' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : sendStatus === 'error' ? (
                <CrossCircledIcon className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="submit"
            onClick={() =>
              sendStatus === 'success' ? setDialogOpen(false) : refetch()
            }
            disabled={sendStatus === 'loading'}
          >
            {sendStatus === 'loading' && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {sendStatus === undefined
              ? 'Send'
              : sendStatus === 'loading'
              ? 'Sending'
              : sendStatus === 'error'
              ? 'Resend'
              : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
