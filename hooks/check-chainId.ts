import { useToast } from '@/components/ui/use-toast'
import { appMainnet } from '@/config/env'
import { useCallback, useMemo } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export function useCheckChainId() {
  const { toast } = useToast()
  const { chain, chains } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork()

  const currentChainId = useMemo(() => {
    return appMainnet ? 1 : 5
  }, [])

  const isNeedChangeNetwork = useMemo(() => {
    return chain?.id !== currentChainId
  }, [chain?.id, currentChainId])

  const changeNetworkAsync = async (id: number) => {
    switchNetworkAsync && (await switchNetworkAsync(id))
  }

  const checkChainIdToMainnet = useCallback(
    async (targetChainId?: number) => {
      const toChainId = targetChainId ? targetChainId : currentChainId
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
    },
    [currentChainId, chain, chains],
  )

  return {
    currentChainId,
    isNeedChangeNetwork,
    checkChainIdToMainnet,
  }
}
