'use client'

import { Skeleton } from './ui/skeleton'

export function SkeletonTable(props: { size?: number }) {
  const skeletons: JSX.Element[] = []
  for (let i = 0; i < (props.size || 0); i++) {
    skeletons.push(<Skeleton className="w-full h-[30px] mb-4" key={i} />)
  }

  return <div>{skeletons}</div>
}
