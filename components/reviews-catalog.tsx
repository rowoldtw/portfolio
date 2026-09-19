'use client'

import { ReviewCard, type ReviewProduct } from '@/components/review-card'
import { useReviewCollection } from '@/components/review-collection-provider'

export function ReviewsCatalog({
  hardware,
  software,
  albums,
}: {
  hardware: readonly ReviewProduct[]
  software: readonly ReviewProduct[]
  albums: readonly ReviewProduct[]
}) {
  const { collection } = useReviewCollection()
  const isAccessory = (product: ReviewProduct) =>
    product.category === 'Mousepad' ||
    product.category === 'Phone case' ||
    product.category === 'Laptop skin'
  const sections =
    collection === 'hardware'
      ? [
          {
            title: 'Hardware & workspace',
            items: hardware.filter((product) => !isAccessory(product)),
          },
          { title: 'Accessories', items: hardware.filter(isAccessory) },
        ]
      : collection === 'software'
        ? [{ title: 'Software', items: software }]
        : [{ title: 'Albums', items: albums }]
  const count = {
    hardware: hardware.length,
    software: software.length,
    albums: albums.length,
  }[collection]
  const countLabel = {
    hardware: 'products',
    software: 'apps',
    albums: 'albums',
  }[collection]

  return (
    <main className="bg-background min-h-dvh px-5 pt-20 pb-44 sm:px-10 sm:pt-28 dark:bg-[#111]">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Reviews
          </h1>
          <span
            aria-live="polite"
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {count} {countLabel}
          </span>
        </header>
        <div key={collection} className="page-enter">
          {sections.map(({ title, items }) => (
            <section
              key={title}
              aria-label={title}
              className="mt-10 first:mt-0"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium">{title}</h2>
              </div>
              <div
                data-cursor-exclude=""
                className="relative z-40 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {items.map((product) => (
                  <ReviewCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
