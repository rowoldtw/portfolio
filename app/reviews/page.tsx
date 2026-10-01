import type { Metadata } from 'next'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { ReviewsCatalog } from '@/components/reviews-catalog'
import { ReviewsConvexProvider } from '@/components/convex-provider'
import type { ReviewCollection } from '@/components/review-collection-provider'

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Personal reviews of hardware, software, and albums.',
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string | string[] }>
}) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main data-reviews-page="" className="min-h-dvh px-5 pt-28 text-center">
        <h1 className="text-3xl font-medium">Reviews</h1>
        <p className="mt-6 text-sm text-zinc-500">
          Reviews are temporarily unavailable. Please check back soon.
        </p>
      </main>
    )
  }
  const { collection } = await searchParams
  const initialCollection: ReviewCollection =
    collection === 'software' || collection === 'albums' ? collection : 'hardware'
  const [hardware, software, albums] = await Promise.all(
    (['hardware', 'software', 'albums'] as const).map((collection) =>
      fetchQuery(api.reviews.list, {
        collection,
        paginationOpts: { numItems: 48, cursor: null },
      }),
    ),
  )
  return (
    <ReviewsConvexProvider>
      <ReviewsCatalog
        initialPages={{ hardware, software, albums }}
        initialCollection={initialCollection}
      />
    </ReviewsConvexProvider>
  )
}
