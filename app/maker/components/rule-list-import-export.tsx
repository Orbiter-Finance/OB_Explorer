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
import { useToast } from '@/components/ui/use-toast'
import { RuleOnewayInterface } from '@/lib/rule'
import { sleep } from '@/lib/utils'
import { json } from '@codemirror/lang-json'
import { CheckIcon } from '@radix-ui/react-icons'
import { githubDarkInit, githubLightInit } from '@uiw/codemirror-theme-github'
import ReactCodeMirror from '@uiw/react-codemirror'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const codeThemOptions = {
  settings: {
    fontFamily:
      'Consolas, ui-monospace, SFMono-Regular, Menlo, Monaco, "Liberation Mono", "Courier New", monospace',
  },
}

export function RuleListImportExport(props: {
  children: React.ReactNode
  rules?: RuleOnewayInterface[]
  onImport?: (rules: RuleOnewayInterface[]) => Promise<void> | void
}) {
  const { resolvedTheme } = useTheme()
  const { toast } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isCoped, setIsCoped] = useState(false)
  const [code, setCode] = useState('')

  useMemo(() => {
    if (!(props.rules instanceof Array) || props.rules.length === 0) setCode('')
    else setCode(JSON.stringify(props.rules, undefined, 2))
  }, [props.rules])

  const onCopy = async () => {
    setIsCoped(true)

    await sleep(2000)

    setIsCoped(false)
  }
  const onImport = async () => {
    try {
      const rules = JSON.parse(code)

      if (props.onImport) await props.onImport(rules)

      setDialogOpen(false)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Import failed.',
        description: err?.message || '',
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Import and Export</DialogTitle>
          <DialogDescription>
            Enter the json content copied to the clipboard into the input box
            below to import it
          </DialogDescription>
        </DialogHeader>

        <ReactCodeMirror
          value={code}
          onChange={(c) => setCode(c)}
          height="420px"
          maxWidth="850px"
          theme={
            resolvedTheme === 'dark'
              ? githubDarkInit(codeThemOptions)
              : githubLightInit(codeThemOptions)
          }
          autoFocus={true}
          extensions={[json()]}
        ></ReactCodeMirror>

        <DialogFooter>
          <CopyToClipboard text={code} onCopy={onCopy}>
            <Button variant="outline" disabled={isCoped}>
              {isCoped ? 'Copy succed' : 'Export (Copy to clipboard)'}
              {isCoped && <CheckIcon className="ml-2 w-5 h-5" />}
            </Button>
          </CopyToClipboard>
          <Button onClick={onImport}>Import</Button>
        </DialogFooter>

        <div className="text-orange-400 text-sm text-right mt-[-8px]">
          Warning: Import will overwrite existing rules
        </div>
      </DialogContent>
    </Dialog>
  )
}
