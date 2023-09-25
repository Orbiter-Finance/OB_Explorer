'use client'

import { InputNumberLimit } from '@/components/input-number-limit'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { getChainName } from '@/config/chain-list'
import { PERCENT_RATIO_MULTIPLE } from '@/config/constants'
import { RuleOnewayInterface } from '@/lib/rule'
import {
  ChainInfoTokenInterface,
  getChainIds,
  getSourceAndDestTokens,
} from '@/lib/thegraphs/manager'
import { getDecimalPlaces } from '@/lib/utils'
import { useEffect, useState } from 'react'
const MAX_FEE_OR_RATIO = '100'

export function RuleModify(props: {
  children: React.ReactNode
  rule?: RuleOnewayInterface
  onChange?: (rule: RuleOnewayInterface) => void
}) {
  const chainIds = getChainIds()
  const metaUpdatable = props.rule ? false : true

  const [dialogOpen, setDialogOpen] = useState(false)

  const [rule, setRule] = useState<RuleOnewayInterface>({
    sourceChainId: chainIds[0],
    destChainId: chainIds[1],
    sourceToken: '',
    destToken: '',
    status: 1,
    subRows: [],
    ...props.rule,
  })
  const [sourceTokens, setSourceTokens] = useState<ChainInfoTokenInterface[]>(
    [],
  )
  const [destTokens, setDestTokens] = useState<ChainInfoTokenInterface[]>([])

  const { toast } = useToast()

  const refreshSelectedToken = (_changedField: keyof RuleOnewayInterface) => {
    if (_changedField == 'sourceToken') {
      const _sourceToken = sourceTokens.find(
        (s) => s.tokenAddress == rule.sourceToken,
      )
      if (!_sourceToken) return

      const _destToken = destTokens.find(
        (d) => d.mainnetToken == _sourceToken.mainnetToken,
      )
      setRule({
        ...rule,
        destToken: _destToken?.tokenAddress || '',
      })
    } else {
      const _destToken = destTokens.find(
        (d) => d.tokenAddress == rule.destToken,
      )
      if (!_destToken) return

      const _sourceToken = sourceTokens.find(
        (s) => s.mainnetToken == _destToken.mainnetToken,
      )
      setRule({
        ...rule,
        sourceToken: _sourceToken?.tokenAddress || '',
      })
    }
  }

  useEffect(() => {
    if (!rule.sourceChainId || !rule.destChainId) return

    const { sourceTokens: _sourceTokens, destTokens: _destTokens } =
      getSourceAndDestTokens(rule.sourceChainId, rule.destChainId)

    setSourceTokens(_sourceTokens)
    setDestTokens(_destTokens)
  }, [rule.sourceChainId, rule.destChainId])

  useEffect(() => {
    if (rule.sourceToken) {
      refreshSelectedToken('sourceToken')
    } else if (sourceTokens.length > 0) {
      setRule({ ...rule, sourceToken: sourceTokens[0].tokenAddress })
    }
  }, [sourceTokens, destTokens])

  useEffect(() => {
    refreshSelectedToken('sourceToken')
  }, [rule.sourceToken])
  useEffect(() => {
    refreshSelectedToken('destToken')
  }, [rule.destToken])

  const updateRuleField = (field: keyof RuleOnewayInterface, value: any) => {
    const numValue = Number(value)

    if (field == 'sourceChainId' && numValue === rule.destChainId) {
      setRule({
        ...rule,
        [field]: numValue,
        destChainId: rule.sourceChainId,
        destToken: rule.sourceToken,
      })
    } else if (field == 'destChainId' && numValue === rule.sourceChainId) {
      setRule({
        ...rule,
        [field]: numValue,
        sourceChainId: rule.destChainId,
        sourceToken: rule.destToken,
      })
    } else if (field == 'status') {
      setRule({ ...rule, [field]: value ? 1 : 0 })
    } else {
      setRule({ ...rule, [field]: value })
    }
  }
  const updateRuleFieldNotNegative = (
    field: keyof RuleOnewayInterface,
    value: string,
  ) => {
    const MAX_NUM_ONE_KEYS = ['tradeFee', 'compensationRatio']

    value = value.trim()
    if (value != '') {
      const num = Number(value)
      if (Number.isNaN(num)) {
        value = ''
      } else {
        if (MAX_NUM_ONE_KEYS.includes(field)) {
          value = getDecimalPlaces(value) > 4 ? '0.0001' : value
          value = num >= 100 ? MAX_FEE_OR_RATIO : value
        } else {
          value = num >= 0 ? value : ''
        }
      }
    }
    updateRuleField(field, value)
  }

  const onSave = () => {
    try {
      const _rule = { ...rule }

      _rule.minPrice = Number(_rule.minPrice)
      _rule.maxPrice = Number(_rule.maxPrice)
      _rule.withholdingFee = Number(_rule.withholdingFee) || 0
      _rule.tradeFee = Number(_rule.tradeFee) || 0
      _rule.responseTime = Number(_rule.responseTime)
      _rule.compensationRatio = Number(_rule.compensationRatio)

      const messages: [keyof RuleOnewayInterface, string][] = [
        ['sourceChainId', 'Please select source chain.'],
        ['destChainId', 'Please select dest chain.'],
        ['sourceToken', 'Please select source token.'],
        ['destToken', 'Please select dest token.'],
        ['minPrice', 'Please input min amount.'],
        ['maxPrice', 'Please input max amount.'],
        ['withholdingFee', 'Please input withholding fee.'],
        ['tradeFee', 'Please input trade fee.'],
        ['responseTime', 'Please input response time.'],
        ['compensationRatio', 'Please input compensation ratio.'],
      ]
      const canBeZeroKeys = ['withholdingFee', 'tradeFee']
      for (const m of messages) {
        if (!canBeZeroKeys.includes(m[0]) && !_rule[m[0]]) throw new Error(m[1])
      }

      if ((_rule.minPrice || 0) > (_rule.maxPrice || 0))
        throw new Error('Min amount must be less than max amount.')

      props.onChange && props.onChange(_rule)

      setDialogOpen(false)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Save rule wrong.',
        description: err.message,
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Rules Settings</DialogTitle>
          <DialogDescription>
            Set rules for cross-rollup market making.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="source-chain">Source Chain</Label>
            <Select
              value={String(rule.sourceChainId)}
              onValueChange={(v) => updateRuleField('sourceChainId', Number(v))}
              disabled={!metaUpdatable}
            >
              <SelectTrigger
                id="source-chain"
                className="line-clamp-1 truncate"
              >
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {chainIds.map((chainId) => (
                  <SelectItem key={chainId} value={String(chainId)}>
                    {getChainName(chainId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dest-chain">Destination Chain</Label>
            <Select
              value={String(rule.destChainId)}
              onValueChange={(v) => updateRuleField('destChainId', Number(v))}
              disabled={!metaUpdatable}
            >
              <SelectTrigger id="dest-chain" className="line-clamp-1 truncate">
                <SelectValue placeholder="Select dest chain" />
              </SelectTrigger>
              <SelectContent>
                {chainIds.map((chainId) => (
                  <SelectItem key={chainId} value={String(chainId)}>
                    {getChainName(chainId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="source-token">Token (From)</Label>
            <Select
              value={rule.sourceToken}
              onValueChange={(v) => setRule({ ...rule, sourceToken: v })}
              disabled={!metaUpdatable}
            >
              <SelectTrigger
                id="source-token"
                className="line-clamp-1 truncate"
              >
                <SelectValue placeholder="Select source token" />
              </SelectTrigger>
              <SelectContent>
                {sourceTokens
                  .filter((t) => !!t.symbol)
                  .map((t, i) => (
                    <SelectItem key={i} value={t.tokenAddress}>
                      {t.symbol}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dest-token">Token (To)</Label>
            <Select
              value={rule.destToken}
              onValueChange={(v) => setRule({ ...rule, destToken: v })}
              disabled={!metaUpdatable}
            >
              <SelectTrigger id="dest-token" className="line-clamp-1 truncate">
                <SelectValue placeholder="Select dest token" />
              </SelectTrigger>
              <SelectContent>
                {destTokens
                  .filter((t) => !!t.symbol)
                  .map((t, i) => (
                    <SelectItem key={i} value={t.tokenAddress}>
                      {t.symbol}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="performance" className="flex flex-col space-y-1">
            <span>Status</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Enable/Disable the rule
            </span>
          </Label>
          <Switch
            id="performance"
            checked={rule.status === 1}
            onCheckedChange={(v) => updateRuleField('status', v)}
          />
        </div>

        {/* Dividing line */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <div className="flex bg-background px-2 text-muted-foreground">
              {/* <ArrowDownIcon className="mr-1" /> */}
              <span>Set rule configs</span>
              {/* <ArrowDownIcon className="ml-1" /> */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="min-amount">Min Amount</Label>
            <Input
              id="min-amount"
              placeholder="Input min amount"
              value={rule.minPrice === undefined ? '' : rule.minPrice}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('minPrice', value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="max-amount">Max Amount</Label>
            <Input
              id="max-amount"
              placeholder="Input max amount"
              value={rule.maxPrice === undefined ? '' : rule.maxPrice}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('maxPrice', value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="withholding-fee">Withholding Fee (min: 0)</Label>
            <Input
              id="withholding-fee"
              placeholder="Input withholding fee"
              value={rule.withholdingFee === 0 ? 0 : rule.withholdingFee || ''}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('withholdingFee', value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trade-fee">Trading Fee (%)</Label>
            <InputNumberLimit
              id="trade-fee"
              placeholder="Input trading fee"
              ratioMultiple={PERCENT_RATIO_MULTIPLE}
              value={rule.tradeFee === 0 ? 0 : rule.tradeFee || ''}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('tradeFee', value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="response-time">Resp Time (Sec)</Label>
            <Input
              id="response-time"
              placeholder="Input response time"
              value={rule.responseTime || ''}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('responseTime', value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="compensation-ratio">Compensation Ratio (%)</Label>
            <InputNumberLimit
              id="compensation-ratio"
              placeholder="Input compensation ratio"
              ratioMultiple={PERCENT_RATIO_MULTIPLE}
              value={rule.compensationRatio || ''}
              onChange={({ target: { value } }) =>
                updateRuleFieldNotNegative('compensationRatio', value)
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" onClick={onSave} onSubmit={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
