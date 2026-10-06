'use client'

import { cn } from '@/lib/utils'
import { ArrowUpRight, Plus } from 'lucide-react'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
} from '@/components/ui/morphing-dialog'

export type ReviewProduct =
  import('@/convex/_generated/dataModel').Doc<'reviews'>

function CurrentUseBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute z-10 inline-flex items-center rounded-lg bg-[#F5F4F3] py-1 font-medium tracking-wide text-zinc-900 dark:bg-[#121212] dark:text-zinc-100',
        compact
          ? 'top-2 left-2 px-1.5 text-[8px] sm:top-3 sm:left-3 sm:px-2.5 sm:text-[10px]'
          : 'top-3 left-3 px-2.5 text-[10px]',
      )}
    >
      Currently using
    </span>
  )
}

export function ReviewCard({
  product,
  priority = false,
}: {
  product: ReviewProduct
  priority?: boolean
}) {
  const isAlbum = product.collection === 'albums'
  const subtitle = isAlbum ? product.brand : product.category
  const imageClass = cn(
    'w-full rounded-lg bg-white dark:bg-[#202020]',
    isAlbum ? 'aspect-square object-cover' : 'aspect-[16/9] object-contain',
    !isAlbum && 'p-5',
  )
  const renderImage = (compact = false) => (
    <div className="relative">
      {product.collection === 'software' ? (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg bg-white dark:bg-[#202020]">
          <MorphingDialogImage
            src={product.image}
            alt={product.alt}
            width={96}
            height={96}
            sizes="96px"
            priority={priority}
            className={cn(
              'shrink-0 rounded-[22%] object-contain',
              compact ? 'size-14 sm:size-24' : 'size-24',
            )}
          />
        </div>
      ) : (
        <MorphingDialogImage
          src={product.image}
          alt={product.alt}
          width={800}
          height={isAlbum ? 800 : 450}
          priority={priority}
          className={cn(imageClass, compact && !isAlbum && 'p-3 sm:p-5')}
        />
      )}
      {product.currentlyUsing && <CurrentUseBadge compact={compact} />}
    </div>
  )

  return (
    <MorphingDialog
      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
    >
      <MorphingDialogTrigger
        style={{ borderRadius: 16 }}
        className="bg-[#F5F4F3] p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-4 sm:p-2 dark:bg-[#121212]"
      >
        {renderImage(true)}
        <div className="flex items-center justify-between gap-2 px-1 py-2 sm:gap-3 sm:px-3 sm:py-3">
          <div className="min-w-0">
            <MorphingDialogTitle className="text-xs font-medium tracking-tight break-words sm:text-sm">
              {product.name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </MorphingDialogSubtitle>
          </div>
          <Plus
            aria-hidden="true"
            className="size-3 shrink-0 text-zinc-500 sm:size-4"
          />
        </div>
        <span className="sr-only">Read review</span>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: 16 }}
          className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain bg-[#F5F4F3] p-2 text-zinc-900 dark:bg-[#121212] dark:text-zinc-100"
        >
          {renderImage()}
          <div className="px-4 pt-5 pb-4 sm:px-5">
            <MorphingDialogTitle
              dialogTitle
              className="text-xl font-medium tracking-tight"
            >
              {product.name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </MorphingDialogSubtitle>
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0 },
                animate: {
                  opacity: 1,
                  transition: { delay: 0.1, duration: 0.2 },
                },
                exit: { opacity: 0, transition: { duration: 0.1 } },
              }}
            >
              <div className="mt-5 rounded-lg bg-zinc-50 p-4 dark:bg-[#202020]">
                <h3 className="text-sm font-medium">My review</h3>
                <p className="mt-2 text-sm leading-6 whitespace-pre-line text-zinc-600 dark:text-zinc-400">
                  {product.review?.trim() ||
                    (isAlbum
                      ? `Review coming soon. I’ll share my thoughts on ${product.name}, favorite tracks, and what stayed with me.`
                      : `Review coming soon. I’ll share my experience with the ${product.name}, what stood out, and what I’d change.`)}
                </p>
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-link-underline=""
                className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-sm text-xs text-zinc-600 underline-offset-4 focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-zinc-400"
              >
                <span data-cursor-link-label="">
                  {isAlbum ? 'Listen' : 'Product details'}
                </span>{' '}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
                <span className="sr-only">
                  for {product.name} (opens in a new tab)
                </span>
              </a>
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-[#202020] dark:text-zinc-100 [&>svg]:size-4" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}
