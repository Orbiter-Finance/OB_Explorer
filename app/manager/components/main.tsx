'use client'

import { useAccount } from 'wagmi'
import { UpdateEbcs } from './update-ebcs'

export function ManagerMain() {
  const account = useAccount()
  return (
    <div>
      <div className="flex justify-between space-x-4">
        <UpdateEbcs />
      </div>
      <div className="mt-4 flex justify-between space-x-4"></div>
    </div>
  )
}
