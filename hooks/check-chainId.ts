import { useToast } from '@/components/ui/use-toast'
import { appMainnet } from '@/config/env'
import { useMemo } from 'react'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export function useCheckChainId() {
  const { toast } = useToast()
  const { chain, chains } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork()

  const isNeedChangeNetwork = useMemo(() => {
    return chain?.id !== (appMainnet ? 1 : 5)
  }, [chain?.id])

  const changeNetworkAsync = async (id: number) => {
    switchNetworkAsync && await switchNetworkAsync(id)
  }

  const checkChainIdToMainnet = async (targetChainId?: number) => {
    const shouldChooseChainId = targetChainId ? targetChainId : appMainnet ? 1 : 5
    if (chain && chain?.id !== shouldChooseChainId) {
      if (chains.findIndex(v => v.id === shouldChooseChainId) !== -1) {
        await changeNetworkAsync(shouldChooseChainId)
      } else {
        return toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'please add chain .',
        })
      }
    }
  }
  return {
    isNeedChangeNetwork,
    checkChainIdToMainnet
  }
}
