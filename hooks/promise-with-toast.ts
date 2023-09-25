import { useToast } from '@/components/ui/use-toast'

export function usePromiseWithToast<T>(
  promisor: () => Promise<T>,
  args?: { resolve?: (value: T) => void; reject?: (reason?: any) => void },
) {
  const { toast } = useToast()

  const refetch = async () => {
    try {
      const value = await promisor()
      if (args?.resolve) args.resolve(value)
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: err.message,
      })

      if (args?.reject) args.reject(err)
    }
  }

  return { refetch }
}
