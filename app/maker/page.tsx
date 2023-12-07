import { Metadata } from 'next'
import { MakerMain } from './components/main'

export const metadata: Metadata = {
  title: 'Maker',
  description: '',
}

export default async function Page() {
  return (
    <main className="container flex">
      <div className="h-full flex flex-col flex-1 space-y-8 pt-8">
        <MakerMain></MakerMain>
      </div>
    </main>
  )
}
