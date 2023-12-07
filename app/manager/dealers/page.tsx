import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dealers',
  description: '',
}

export default async function MakerPage() {
  return (
    <main className="container flex">
      <div className="h-full flex flex-col flex-1 space-y-8 pt-8"></div>
    </main>
  )
}
