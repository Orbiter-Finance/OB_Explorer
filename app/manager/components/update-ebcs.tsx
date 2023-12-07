'use client'

import { Loading } from '@/components/loding'
import { SendDialog } from '@/components/send-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contracts } from '@/config/contracts'
import { useCheckChainId } from '@/hooks/check-chainId'
import * as React from 'react'
import { Hash } from 'viem'
import { useContractWrite } from 'wagmi'

export function UpdateEbcs() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [list, setList] = React.useState<
    { ebc: string; status: 'enable' | 'disable' }[]
  >([])
  // const [enableAdd, setEnableAdd] = React.useState(true)
  const enableAdd = React.useMemo(
    () => list.findIndex((item) => !item.ebc.startsWith('0x')) === -1,
    [list],
  )
  const { checkChainIdToMainnet } = useCheckChainId()

  const { writeAsync: updateEbcs } = useContractWrite({
    ...contracts.orManager,
    functionName: 'updateEbcs',
  })

  const handleAdd = () => {
    list.push({ ebc: '', status: 'enable' })
    console.warn('list:', list)

    setList([...list])
  }
  const handleDelete = (index: number) => {
    list.splice(index, 1)
    setList([...list])
  }
  const handleChangeEbc = (index: number, ebc: string) => {
    list[index].ebc = ebc
    setList([...list])
  }
  const handleChangeStatus = (index: number, status: any) => {
    list[index].status = status
    setList([...list])
  }

  const handleUpdateEbcs = async (): Promise<{ hash: Hash }> => {
    const ebcs: string[] = []
    const statuses: number[] = []
    for (const item of list) {
      ebcs.push(item.ebc)
      statuses.push(item.status == 'disable' ? 0 : 1)
    }

    await checkChainIdToMainnet()
    return await updateEbcs({
      args: [ebcs, statuses],
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex">
          <div className="flex-1">Update ebcs</div>
          <SendDialog send={handleUpdateEbcs} requiredEnableTime={true}>
            <Button variant="outline">Submit</Button>
          </SendDialog>
        </CardTitle>
        <CardDescription>Update ebcs in manager</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loading show={isLoading} className="h-[200px]" />
        ) : (
          <div className="w-full flex">
            <div className="grid gap-2">
              {list.map((item, index) => {
                return (
                  <div
                    className="grid grid-cols-7 items-center gap-3"
                    key={index}
                  >
                    <Input
                      value={item.ebc}
                      title={item.ebc}
                      placeholder="Input ebc address"
                      className="col-span-4"
                      onChange={(e) =>
                        handleChangeEbc(index, e.target.value.trim())
                      }
                    />
                    <Select
                      value={item.status + ''}
                      onValueChange={(v) => handleChangeStatus(index, v)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enable">Enable</SelectItem>
                        <SelectItem value="disable">Disable</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="link"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </Button>
                  </div>
                )
              })}

              <Button
                variant="outline"
                size="default"
                className="w-20 mt-4"
                onClick={handleAdd}
                disabled={!enableAdd}
              >
                + Add
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
