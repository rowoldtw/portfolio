'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { FunctionReturnType } from 'convex/server'
import type { ReviewCollection } from '@/components/review-collection-provider'
import { usePaginatedQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ReviewCard } from '@/components/review-card'
import { useReviewCollection } from '@/components/review-collection-provider'
import { TextEffect } from '@/components/ui/text-effect'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  ProximitySidebar,
  type ProximitySection,
} from '@/components/ui/proximity-sidebar'

const AlbumGallery = dynamic(() =>
  import('@/components/album-gallery').then((module) => module.AlbumGallery),
)

function AlbumsCatalog({
  active,
  albums,
  moreAvailable,
  loadingMore,
  disableLoadMore,
  onLoadMore,
}: {
  active: boolean
  albums: FunctionReturnType<typeof api.reviews.list>['page']
  moreAvailable: boolean
  loadingMore: boolean
  disableLoadMore: boolean
  onLoadMore: () => void
}) {
  return (
    <main
      data-reviews-page={active ? '' : undefined}
      data-album-page={active ? '' : undefined}
      aria-hidden={!active}
      inert={!active}
      className={
        active
          ? 'page-enter bg-background relative h-dvh overflow-hidden'
          : 'bg-background pointer-events-none invisible fixed inset-0 h-dvh overflow-hidden'
      }
    >
      <section
        id={active ? 'review-section-0' : undefined}
        aria-label="Albums"
        className="relative h-full"
      >
        {albums.length > 0 ? (
          <AlbumGallery albums={albums} active={active} />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
            No reviews here yet.
          </p>
        )}
        <h1 id={active ? 'reviews-top' : undefined} className="sr-only">
          Albums
        </h1>
        {moreAvailable && (
          <button
            type="button"
            disabled={disableLoadMore}
            onClick={onLoadMore}
            className="bg-background absolute top-[max(2rem,env(safe-area-inset-top))] right-5 z-10 rounded-full px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 sm:right-10"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </section>
    </main>
  )
}

export function ReviewsCatalog({
  initialPages,
  initialCollection,
}: {
  initialPages: Record<
    ReviewCollection,
    FunctionReturnType<typeof api.reviews.list>
  >
  initialCollection: ReviewCollection
}) {
  const { collection } = useReviewCollection()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [hasHydrated, setHasHydrated] = useState(false)
  const selectedCollection = hasHydrated ? collection : initialCollection
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasHydrated(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  const [hasVisitedAlbums, setHasVisitedAlbums] = useState(false)
  useEffect(() => {
    if (selectedCollection !== 'albums' || hasVisitedAlbums) return
    const frame = requestAnimationFrame(() => setHasVisitedAlbums(true))
    return () => cancelAnimationFrame(frame)
  }, [selectedCollection, hasVisitedAlbums])
  const {
    results: liveResults,
    status: liveStatus,
    loadMore,
  } = usePaginatedQuery(
    api.reviews.list,
    { collection: selectedCollection },
    { initialNumItems: 48 },
  )
  const initialPage = initialPages[selectedCollection]
  const results =
    liveStatus === 'LoadingFirstPage' ? initialPage.page : liveResults
  const status =
    liveStatus === 'LoadingFirstPage'
      ? initialPage.isDone
        ? 'Exhausted'
        : 'CanLoadMore'
      : liveStatus
  const sections = useMemo(
    () =>
      selectedCollection === 'hardware'
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
              title: selectedCollection === 'software' ? 'Software' : 'Albums',
              items: results,
            },
          ],
    [selectedCollection, results],
  )
  const proximitySections = useMemo<ProximitySection[]>(
    () => [
      { id: 'reviews-top', label: 'Reviews', kind: 'title' },
      ...sections.flatMap(({ title, items }, index) => [
        {
          id: `review-section-${index}`,
          label: title,
          kind: 'subtitle' as const,
        },
        ...items.map((product) => ({
          id: `review-${product._id}`,
          label: product.name,
          kind: 'body' as const,
        })),
      ]),
    ],
    [sections],
  )
  const countLabel = {
    hardware: 'products',
    software: 'apps',
    albums: 'albums',
  }[selectedCollection]

  return (
    <>
      {(selectedCollection === 'albums' || hasVisitedAlbums) && (
        <AlbumsCatalog
          active={selectedCollection === 'albums'}
          albums={
            selectedCollection === 'albums' ? results : initialPages.albums.page
          }
          moreAvailable={status !== 'Exhausted'}
          loadingMore={status === 'LoadingMore'}
          disableLoadMore={
            liveStatus === 'LoadingFirstPage' || status === 'LoadingMore'
          }
          onLoadMore={() => loadMore(48)}
        />
      )}
      {selectedCollection !== 'albums' && (
        <main
          data-reviews-page=""
          className="bg-background min-h-dvh px-5 pt-20 pb-44 sm:px-10 sm:pt-28 dark:bg-[#080808]"
        >
          <div aria-hidden="true" data-review-scroll-fade="" />
          <ProximitySidebar
            sections={proximitySections}
            side="right"
            className="fixed top-1/2 right-0 z-30 hidden h-[min(70dvh,36rem)] -translate-y-1/2 xl:flex"
          />
          <div className="mx-auto w-full max-w-5xl">
            <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div id="reviews-top" className="scroll-mt-28">
                {prefersReducedMotion ? (
                  <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                    Reviews
                  </h1>
                ) : (
                  <TextEffect
                    key={selectedCollection}
                    as="h1"
                    per="line"
                    preset="fade-in-blur"
                    speedReveal={1.25}
                    speedSegment={0.8}
                    className="text-3xl font-medium tracking-tight sm:text-4xl"
                  >
                    Reviews
                  </TextEffect>
                )}
              </div>
            </header>
            <div key={selectedCollection}>
              {status === 'Exhausted' && results.length === 0 && (
                <p className="text-sm text-zinc-500">No reviews here yet.</p>
              )}
              {sections
                .filter((section) => section.items.length > 0)
                .map(({ title, items }, index) => (
                  <section
                    key={title}
                    id={`review-section-${index}`}
                    aria-label={title}
                    className="mt-10 scroll-mt-28 first:mt-0"
                  >
                    <div className="review-section-enter mb-4 flex items-baseline gap-3">
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
                      {items.map((product, itemIndex) => (
                        <div
                          key={product._id}
                          id={`review-${product._id}`}
                          className="review-item-enter scroll-mt-28"
                          style={{
                            animationDelay: `${Math.min(itemIndex, 10) * 45}ms`,
                          }}
                        >
                          <ReviewCard product={product} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              {(status === 'CanLoadMore' || status === 'LoadingMore') && (
                <button
                  type="button"
                  disabled={
                    liveStatus === 'LoadingFirstPage' ||
                    status === 'LoadingMore'
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
      )}
    </>
  )
}
