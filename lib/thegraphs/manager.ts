import { getChainName } from '@/config/chain-list'
import { thegraphBaseUrl } from '@/config/env'
import { BigNumber, BigNumberish } from 'ethers'
import { hexZeroPad } from 'ethers/lib/utils'

export interface ChainInfoInterface {
  id: number
  spvs: string[]
  tokens: ChainInfoTokenInterface[]
  minVerifyChallengeDestTxSecond: number
  maxVerifyChallengeDestTxSecond: number
  minVerifyChallengeSourceTxSecond: number
  maxVerifyChallengeSourceTxSecond: number
}

export interface ChainInfoTokenInterface {
  tokenAddress: string
  mainnetToken: string
  decimals: number
  symbol: string
}

export const managerChainInfos: ChainInfoInterface[] = []

export async function getChainInfos() {
  const body = JSON.stringify({
    query: `
        {
          chainRels {
            id
            spvs
            tokens {
                tokenAddress
                mainnetToken
                decimals
                symbol
            }
            minVerifyChallengeDestTxSecond
            maxVerifyChallengeDestTxSecond
            minVerifyChallengeSourceTxSecond
            maxVerifyChallengeSourceTxSecond
        }
      }`,
  })

  const {
    data: { chainRels },
  } = await fetch(thegraphBaseUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  }).then((r) => r.json())

  managerChainInfos.length = 0
  for (const item of chainRels) {
    managerChainInfos.push({
      id: Number(item.id),
      spvs: item.spvs,
      tokens: item.tokens.map((t: any) => {
        const tokenAddress = hexZeroPad(
          BigNumber.from(t.tokenAddress).toHexString(),
          32,
        )
        return {
          ...t,
          tokenAddress,
        }
      }),
      minVerifyChallengeDestTxSecond: Number(
        item.minVerifyChallengeDestTxSecond,
      ),
      maxVerifyChallengeDestTxSecond: Number(
        item.maxVerifyChallengeDestTxSecond,
      ),
      minVerifyChallengeSourceTxSecond: Number(
        item.minVerifyChallengeSourceTxSecond,
      ),
      maxVerifyChallengeSourceTxSecond: Number(
        item.maxVerifyChallengeSourceTxSecond,
      ),
    })
  }
  return managerChainInfos
}

export function getMainnetToken() {
  const tokenList = managerChainInfos.reduce(
    (acc, obj: ChainInfoInterface) => acc.concat(obj.tokens),
    [] as ChainInfoTokenInterface[],
  )
  const mainnetTokenList: ChainInfoTokenInterface[] = []
  tokenList.forEach((item) => {
    if (
      mainnetTokenList.findIndex(
        (v: ChainInfoTokenInterface) => v?.mainnetToken === item.mainnetToken,
      ) === -1
    ) {
      mainnetTokenList.push(item)
    }
  })
  return mainnetTokenList
}

export function getSpvs() {
  return managerChainInfos.map((item) => {
    return {
      id: item.id,
      name: getChainName(item.id) || item.id,
      spvs: item.spvs,
    }
  })
}

export function getChainIds() {
  const chainIds: number[] = []
  for (const item of managerChainInfos) {
    if (chainIds.indexOf(item.id) === -1) {
      chainIds.push(item.id)
    }
  }
  return chainIds
}

export function filterTokens(chainId: number) {
  return managerChainInfos.find((c) => c.id === chainId)?.tokens || []
}

export function getSourceAndDestTokens(
  sourceChainId: number,
  destChainId: number,
) {
  const sts = filterTokens(sourceChainId)
  const dts = filterTokens(destChainId)

  const sourceTokens: ChainInfoTokenInterface[] = []
  const destTokens: ChainInfoTokenInterface[] = []
  for (const st of sts) {
    const dt = dts.find((_d) => _d.mainnetToken == st.mainnetToken)
    if (dt) {
      if (
        sourceTokens.findIndex((_s) => _s.mainnetToken === st.mainnetToken) ===
        -1
      )
        sourceTokens.push(st)
      if (
        destTokens.findIndex((_d) => _d.mainnetToken === dt.mainnetToken) === -1
      )
        destTokens.push(dt)
    }
  }
  return { sourceTokens, destTokens }
}

export function getTokenInfo(chainId: number, token: BigNumberish) {
  for (const chainInfo of managerChainInfos) {
    if (chainInfo.id != chainId) continue
    for (const tokenInfo of chainInfo.tokens) {
      if (
        BigNumber.from(token).eq(tokenInfo.tokenAddress) ||
        BigNumber.from(token).eq(tokenInfo.mainnetToken)
      )
        return tokenInfo
    }
  }

  return undefined
}

export function getTokenInfoSymbol(chainId: number, token: BigNumberish) {
  return getTokenInfo(chainId, token)?.symbol
}

export function getTokenInfoMainnetToken(chainId: number, token: BigNumberish) {
  return getTokenInfo(chainId, token)?.mainnetToken
}

export function getTokenInfoDecimal(chainId: number, token: BigNumberish) {
  return getTokenInfo(chainId, token)?.decimals
}
