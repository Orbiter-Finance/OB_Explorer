import { useToast } from '@/components/ui/use-toast'
import { appMainnet } from '@/config/env'
import { useMemo } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export function useCheckChainId() {
  const { toast } = useToast()
  const { chain, chains } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork()

  const shouldChooseChainId = appMainnet ? 1 : 5

  const isNeedChangeNetwork = useMemo(() => {
    return chain?.id !== (appMainnet ? 1 : 5)
  }, [chain?.id])

  const changeNetworkAsync = async (id: number) => {
    switchNetworkAsync && (await switchNetworkAsync(id))
  }

  const checkCurrentChain = (targetChainId?: number) => {
    const checkChainId = targetChainId ? targetChainId : shouldChooseChainId
    return chain && chain?.id !== checkChainId
  }

  const checkChainIdToMainnet = async (targetChainId?: number) => {
    const toChainId = targetChainId ? targetChainId : shouldChooseChainId
    if (chain && chain?.id === toChainId) return
    if (chains.findIndex((v) => v.id === toChainId) !== -1) {
      return await changeNetworkAsync(toChainId)
    } else {
      return toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'please add chain .',
      })
    }
  }
  return {
    isNeedChangeNetwork,
    checkCurrentChain,
    checkChainIdToMainnet,
  }
}
