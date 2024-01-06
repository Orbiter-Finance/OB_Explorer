import { BigNumber, BigNumberish, utils } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import lodash from 'lodash'
import { BaseTrie } from 'merkle-patricia-tree'
import { getTokenInfo } from './thegraphs/manager'
import { equalBN } from './utils'
import { PERCENT_RATIO_MULTIPLE } from '@/config/constants'

export interface RuleInterface {
  chainId0: number
  chainId1: number
  status0: number
  status1: number
  token0: string
  token1: string
  minPrice0: BigNumberish
  minPrice1: BigNumberish
  maxPrice0: BigNumberish
  maxPrice1: BigNumberish
  withholdingFee0: BigNumberish
  withholdingFee1: BigNumberish
  tradingFee0: number
  tradingFee1: number
  responseTime0: number
  responseTime1: number
  compensationRatio0: number
  compensationRatio1: number
  enableTimestamp?: string
  subRows: RuleInterface[]
}

export interface RuleOnewayInterface {
  sourceChainId: number
  destChainId: number
  sourceToken: string
  destToken: string
  status: number
  minPrice?: number
  maxPrice?: number
  withholdingFee?: number
  tradeFee?: number
  responseTime?: number
  compensationRatio?: number
  enableTimestamp?: string
  subRows: RuleOnewayInterface[]
}

export function convertToOneways(rules: RuleInterface[]) {
  const ros: RuleOnewayInterface[] = []
  for (const rule of rules) {
    const currentSubRows =
      rule.subRows.find((v) => {
        const currentDate = new Date().getTime()
        const enableTimestamp = Number(v.enableTimestamp) * 1000
        return currentDate > enableTimestamp
      }) || undefined

    // chain0 -> chain1
    if (rule.responseTime0 != 0) {
      const decimals0 = getTokenInfo(rule.chainId0, rule.token0)?.decimals || 0
      ros.push({
        sourceChainId: rule.chainId0,
        destChainId: rule.chainId1,
        sourceToken: rule.token0,
        destToken: rule.token1,
        status: rule.status0,
        minPrice: Number(formatUnits(rule.minPrice0, decimals0)),
        maxPrice: Number(formatUnits(rule.maxPrice0, decimals0)),
        withholdingFee: Number(formatUnits(rule.withholdingFee0, decimals0)),
        tradeFee: rule.tradingFee0 / PERCENT_RATIO_MULTIPLE,
        responseTime: rule.responseTime0,
        compensationRatio: rule.compensationRatio0 / PERCENT_RATIO_MULTIPLE,
        enableTimestamp: rule.enableTimestamp,
        subRows: convertToOneways(currentSubRows ? [currentSubRows] : []),
      })
    }

    // chain1 -> chain0
    if (rule.responseTime1 != 0) {
      const decimals1 = getTokenInfo(rule.chainId1, rule.token1)?.decimals || 0
      ros.push({
        sourceChainId: rule.chainId1,
        destChainId: rule.chainId0,
        sourceToken: rule.token1,
        destToken: rule.token0,
        status: rule.status1,
        minPrice: Number(formatUnits(rule.minPrice1, decimals1)),
        maxPrice: Number(formatUnits(rule.maxPrice1, decimals1)),
        withholdingFee: Number(formatUnits(rule.withholdingFee1, decimals1)),
        tradeFee: rule.tradingFee1 / PERCENT_RATIO_MULTIPLE,
        responseTime: rule.responseTime1,
        compensationRatio: rule.compensationRatio1 / PERCENT_RATIO_MULTIPLE,
        enableTimestamp: rule.enableTimestamp,
        subRows: convertToOneways(currentSubRows ? [currentSubRows] : []),
      })
    }
  }
  return ros
}

export function mergeRuleOneways(
  rules: RuleInterface[],
  ros: RuleOnewayInterface[],
  changedRules: RuleOnewayInterface[],
) {
  const updateRules = []
  for (const ro of ros) {
    const findRoTwowayChangeIndex = changedRules.findIndex(
      (r) =>
        r.sourceChainId === ro.destChainId &&
        r.destChainId === ro.sourceChainId &&
        equalBN(r.sourceToken, ro.destToken) &&
        equalBN(r.destToken, ro.sourceToken),
    )
    const findRoChangeIndex = changedRules.findIndex(
      (r) =>
        r.sourceChainId === ro.sourceChainId &&
        r.destChainId === ro.destChainId &&
        equalBN(r.sourceToken, ro.sourceToken) &&
        equalBN(r.destToken, ro.destToken),
    )
    if (findRoTwowayChangeIndex !== -1 || findRoChangeIndex !== -1) {
      updateRules.push(ro)
    }
    if (ro.sourceChainId === ro.destChainId) continue

    const chainId0 = lodash.min([ro.sourceChainId, ro.destChainId])!
    const chainId1 = lodash.max([ro.sourceChainId, ro.destChainId])!

    const [token0, token1] =
      chainId0 === ro.sourceChainId
        ? [ro.sourceToken, ro.destToken]
        : [ro.destToken, ro.sourceToken]

    let ruleIndex = rules.findIndex(
      (rule) =>
        rule.chainId0 === chainId0 &&
        rule.chainId1 === chainId1 &&
        equalBN(rule.token0, token0) &&
        equalBN(rule.token1, token1),
    )
    if (ruleIndex === -1) {
      // Default
      rules.push({
        chainId0,
        chainId1,
        token0,
        token1,
        status0: 0,
        status1: 0,
        minPrice0: 0,
        minPrice1: 0,
        maxPrice0: 0,
        maxPrice1: 0,
        withholdingFee0: 0,
        withholdingFee1: 0,
        tradingFee0: 0,
        tradingFee1: 0,
        responseTime0: 0,
        responseTime1: 0,
        compensationRatio0: 0,
        compensationRatio1: 0,
        subRows: [],
      })
      ruleIndex = rules.length - 1
    }

    if (chainId0 === ro.sourceChainId) {
      const decimals0 = getTokenInfo(chainId0, token0)?.decimals || 0
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        status0: ro.status,
        minPrice0: parseUnits(ro.minPrice + '', decimals0),
        maxPrice0: parseUnits(ro.maxPrice + '', decimals0),
        withholdingFee0: parseUnits(ro.withholdingFee + '', decimals0),
        tradingFee0: parseInt((ro.tradeFee || 0) * PERCENT_RATIO_MULTIPLE + ''),
        responseTime0: ro.responseTime || 0,
        compensationRatio0: parseInt(
          (ro.compensationRatio || 0) * PERCENT_RATIO_MULTIPLE + '',
        ),
      }
    } else {
      const decimals1 = getTokenInfo(chainId1, token1)?.decimals || 0
      rules[ruleIndex] = {
        ...rules[ruleIndex],
        status1: ro.status,
        minPrice1: parseUnits(ro.minPrice + '', decimals1),
        maxPrice1: parseUnits(ro.maxPrice + '', decimals1),
        withholdingFee1: parseUnits(ro.withholdingFee + '', decimals1),
        tradingFee1: parseInt((ro.tradeFee || 0) * PERCENT_RATIO_MULTIPLE + ''),
        responseTime1: ro.responseTime || 0,
        compensationRatio1: parseInt(
          (ro.compensationRatio || 0) * PERCENT_RATIO_MULTIPLE + '',
        ),
      }
    }
  }
  return { rules, updateRules }
}

export function calculateRuleKey(rule: RuleInterface) {
  return utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['uint', 'uint', 'uint', 'uint'],
      [rule.chainId0, rule.chainId1, rule.token0, rule.token1],
    ),
  )
}

export async function calculateRulesTree(rules: RuleInterface[]) {
  const trie = new BaseTrie()
  const ruleFields: (keyof RuleInterface)[] = [
    'chainId0',
    'chainId1',
    'status0',
    'status1',
    'token0',
    'token1',
    'minPrice0',
    'minPrice1',
    'maxPrice0',
    'maxPrice1',
    'withholdingFee0',
    'withholdingFee1',
    'tradingFee0',
    'tradingFee1',
    'responseTime0',
    'responseTime1',
    'compensationRatio0',
    'compensationRatio1',
  ]
  for (const rule of rules) {
    const key = calculateRuleKey(rule)
    const value = utils.RLP.encode(
      ruleFields.map((k) =>
        utils.stripZeros(BigNumber.from(rule[k]).toHexString()),
      ),
    )

    await trie.put(
      Buffer.from(utils.arrayify(key)),
      Buffer.from(utils.arrayify(value)),
    )
  }

  return trie
}
