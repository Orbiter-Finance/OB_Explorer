import * as React from 'react'

import { FixedNumber } from 'ethers'
import { Input, InputProps } from './ui/input'

export interface InputNumberLimitProps extends InputProps {
  ratioMultiple?: number
}

const InputNumberLimit = React.forwardRef<
  HTMLInputElement,
  InputNumberLimitProps
>(({ value, onChange, ratioMultiple, ...props }, ref) => {
  const _onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const v = event.target.value
    if (v && !Number.isNaN(Number(v))) {
      if (ratioMultiple !== undefined) {
        const fRM = FixedNumber.from(ratioMultiple)
        const fNum = FixedNumber.from(v).mulUnsafe(fRM)
        if (fNum.round().divUnsafe(fRM).toUnsafeFloat() != Number(v)) return
      }
    }

    onChange && onChange(event)
  }

  return <Input value={value} onChange={_onChange} ref={ref} {...props} />
})
InputNumberLimit.displayName = 'InputNumberLimit'

export { InputNumberLimit }
