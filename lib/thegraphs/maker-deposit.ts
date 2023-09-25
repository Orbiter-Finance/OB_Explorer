import { thegraphBaseUrl } from '@/config/env'
import { RuleInterface } from '../rule'
import { BigNumber } from 'ethers'

function formatRulesKey(formatRules: any) {
  if (!formatRules.length) return []
  const rules: RuleInterface[] = []
  for (const item of formatRules) {
    rules.push({
      chainId0: Number(item.chain0),
      chainId1: Number(item.chain1),
      status0: Number(item.chain0Status),
      status1: Number(item.chain1Status),
      token0: item.chain0Token,
      token1: item.chain1Token,
      minPrice0: BigNumber.from(item.chain0minPrice),
      minPrice1: BigNumber.from(item.chain1minPrice),
      maxPrice0: BigNumber.from(item.chain0maxPrice),
      maxPrice1: BigNumber.from(item.chain1maxPrice),
      withholdingFee0: BigNumber.from(item.chain0WithholdingFee),
      withholdingFee1: BigNumber.from(item.chain1WithholdingFee),
      tradingFee0: Number(item.chain0TradeFee),
      tradingFee1: Number(item.chain1TradeFee),
      responseTime0: Number(item.chain0ResponseTime),
      responseTime1: Number(item.chain1ResponseTime),
      compensationRatio0: Number(item.chain0CompensationRatio),
      compensationRatio1: Number(item.chain1CompensationRatio),
      enableTimestamp: item.enableTimestamp,
      subRows: formatRulesKey(item?.ruleUpdateRel?.[0]?.ruleUpdateVersion || [])
    })
  }
  return rules
}
export async function getLatestRules(
  mdc: string | undefined,
  ebc: string | undefined,
) {
  if (!mdc || !ebc) return [] as RuleInterface[]

  const body = JSON.stringify({
    query: `
        {
          latestRules(
            orderBy: latestUpdateTimestamp
            orderDirection: desc
            where: {
              mdc_: {id: "${mdc.toLowerCase()}"}, 
              ebc_: {id: "${ebc.toLowerCase()}"},
            }
          ) {
            id
            chain0
            chain1
            chain0Token
            chain1Token
            chain0Status
            chain1Status
            chain0minPrice
            chain0maxPrice
            chain1minPrice
            chain1maxPrice
            chain0CompensationRatio
            chain1CompensationRatio
            chain0ResponseTime
            chain1ResponseTime
            chain0TradeFee
            chain1TradeFee
            chain0WithholdingFee
            chain1WithholdingFee
            enableTimestamp
            ruleValidation
            ruleValidationErrorstatus
            type
            latestUpdateHash
            latestUpdateVersion
            ebcAddr
            ruleUpdateRel {
              latestVersion
              ruleUpdateVersion(orderBy: updateVersion, orderDirection: desc) {
                id
                chain0
                chain1
                chain0Token
                chain1Token
                chain0Status
                chain1Status
                chain0minPrice
                chain0maxPrice
                chain1minPrice
                chain1maxPrice
                chain0CompensationRatio
                chain1CompensationRatio
                chain0ResponseTime
                chain1ResponseTime
                chain0TradeFee
                chain1TradeFee
                chain0WithholdingFee
                chain1WithholdingFee
                enableTimestamp
                ruleValidation
                ruleValidationErrorstatus
                type
                latestUpdateHash
                latestUpdateVersion
                ebcAddr
              }
            }
          }
        }
      `,
  })

  const {
    data: { latestRules },
  } = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  return formatRulesKey(latestRules)
}
