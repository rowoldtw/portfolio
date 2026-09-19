import type { Metadata } from 'next'
import { ReviewsCatalog } from '@/components/reviews-catalog'
import { hardwareProducts, softwareProducts, albums } from './data'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Personal reviews of hardware, software, and albums.',
}

export default function ReviewsPage() {
  return (
    <ReviewsCatalog
      hardware={hardwareProducts}
      software={softwareProducts}
      albums={albums}
    />
  )
}
