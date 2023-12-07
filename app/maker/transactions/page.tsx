'use client'
import TransactionsPage from '@/app/transactions'
import { otherColumns } from './columns'

export default async function Page() {
  return <TransactionsPage pageType="maker" otherColumns={otherColumns} />
}
