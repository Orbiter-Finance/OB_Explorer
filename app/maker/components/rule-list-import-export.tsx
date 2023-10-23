import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { json } from '@codemirror/lang-json'
import { githubDarkInit } from '@uiw/codemirror-theme-github'
import ReactCodeMirror from '@uiw/react-codemirror'
import { useEffect, useState } from 'react'
import { Hash } from 'viem'

export function RuleListImportExport(props: {
  children: React.ReactNode
  send?: (data: { enableTime?: number }) => Promise<{ hash: Hash }>
  requiredEnableTime?: boolean
  onFinally?: (data: {
    hash?: Hash
    status?: 'loading' | 'success' | 'error'
    open?: boolean
  }) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const onFinally: typeof props.onFinally = (data) => {
    props.onFinally && props.onFinally(data)
  }

  useEffect(() => {}, [dialogOpen])

  const [code, setCode] = useState(
    JSON.stringify(
      JSON.parse(
        '[{"sourceChainId":10,"destChainId":324,"sourceToken":"0x0000000000000000000000000000000000000000000000000000000000000000","destToken":"0x0000000000000000000000000000000000000000000000000000000000000000","status":1,"subRows":[],"minPrice":0.05,"maxPrice":2,"withholdingFee":0.0016,"tradeFee":0,"responseTime":86400,"compensationRatio":80},{"sourceChainId":1,"destChainId":10,"sourceToken":"0x0000000000000000000000000000000000000000000000000000000000000000","destToken":"0x0000000000000000000000000000000000000000000000000000000000000000","status":1,"subRows":[],"minPrice":0.05,"maxPrice":2,"withholdingFee":0.0016,"tradeFee":0,"responseTime":86400,"compensationRatio":80}]',
      ),
      undefined,
      2,
    ),
  )

  console.warn('code:', JSON.parse(code))

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Import and Export</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <ReactCodeMirror
          value={code}
          onChange={(c) => setCode(c)}
          height="420px"
          theme={githubDarkInit({
            settings: {
              fontFamily:
                'Consolas, ui-monospace, SFMono-Regular, Menlo, Monaco, "Liberation Mono", "Courier New", monospace',
            },
          })}
          extensions={[json()]}
        ></ReactCodeMirror>

        <DialogFooter>
          <Button variant="outline" onClick={() => 0}>
            Copy to clipboard
          </Button>

          <Button onClick={() => 0}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
