'use client'

import type { FunctionReturnType } from 'convex/server'
import type { ReviewCollection } from '@/components/review-collection-provider'
import { usePaginatedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ReviewCard } from '@/components/review-card'
import { useReviewCollection } from '@/components/review-collection-provider'

export function ReviewsCatalog({
  initialPages,
}: {
  initialPages: Record<
    ReviewCollection,
    FunctionReturnType<typeof api.reviews.list>
  >
}) {
  const { collection } = useReviewCollection()
  const {
    results: liveResults,
    status: liveStatus,
    loadMore,
  } = usePaginatedQuery(
    api.reviews.list,
    { collection },
    { initialNumItems: 48 },
  )
  const initialPage = initialPages[collection]
  const results =
    liveStatus === 'LoadingFirstPage' ? initialPage.page : liveResults
  const status =
    liveStatus === 'LoadingFirstPage'
      ? initialPage.isDone
        ? 'Exhausted'
        : 'CanLoadMore'
      : liveStatus
  const sections =
    collection === 'hardware'
      ? [
          {
            title: 'Hardware',
            items: results.filter((product) => !product.accessory),
          },
          {
            title: 'Accessories',
            items: results.filter((product) => product.accessory),
          },
        ]
      : [
          {
            title: collection === 'software' ? 'Software' : 'Albums',
            items: results,
          },
        ]
  const countLabel = {
    hardware: 'products',
    software: 'apps',
    albums: 'albums',
  }[collection]

  return (
    <main
      data-reviews-page=""
      className="bg-background min-h-dvh px-5 pt-20 pb-44 sm:px-10 sm:pt-28 dark:bg-[#080808]"
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Reviews
          </h1>
        </header>
        <div key={collection} className="page-enter">
          {status === 'Exhausted' && results.length === 0 && (
            <p className="text-sm text-zinc-500">No reviews here yet.</p>
          )}
          {sections
            .filter((section) => section.items.length > 0)
            .map(({ title, items }, index) => (
              <section
                key={title}
                aria-label={title}
                className="mt-10 first:mt-0"
              >
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="text-sm font-medium">{title}</h2>
                  {index === 0 && (
                    <span
                      aria-live="polite"
                      className="text-xs text-zinc-500 dark:text-zinc-400"
                    >
                      {`${results.length}${status !== 'Exhausted' ? '+' : ''} ${countLabel}`}
                    </span>
                  )}
                </div>
                <div
                  data-cursor-exclude=""
                  className="relative z-40 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {items.map((product) => (
                    <ReviewCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          {(status === 'CanLoadMore' || status === 'LoadingMore') && (
            <button
              type="button"
              disabled={
                liveStatus === 'LoadingFirstPage' || status === 'LoadingMore'
              }
              onClick={() => loadMore(48)}
              className="mt-8 rounded-full border border-zinc-300 px-5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-zinc-700"
            >
              {status === 'LoadingMore' ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
