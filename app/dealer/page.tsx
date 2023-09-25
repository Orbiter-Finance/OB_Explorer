import { Metadata } from 'next'
import { DealerMain } from './components/main'

export const metadata: Metadata = {
  title: 'Dealer',
  description: '',
}

export default async function MakerPage() {
  return (
    <main className="container flex">
      <div className="h-full flex flex-col flex-1 space-y-8 pt-8">
        <DealerMain></DealerMain>
      </div>
    </main>
  )
}
