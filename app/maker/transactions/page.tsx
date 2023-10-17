'use client'
import TransactionsPage from '@/app/transactions'
import { otherColumns } from './columns'

export default function MakerTransactions() {
  return <TransactionsPage pageType="maker" otherColumns={otherColumns} />
}
