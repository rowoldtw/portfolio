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

export type ReviewProduct = {
  id: string
  kind?: 'software' | 'album'
  name: string
  category: string
  brand: string
  image: string
  alt: string
  description: string
  details: readonly (readonly [string, string])[]
  url: string
}

export function ReviewCard({ product }: { product: ReviewProduct }) {
  const isAlbum = product.kind === 'album'
  const subtitle = isAlbum ? product.brand : product.category
  const imageClass = cn(
    'w-full rounded-lg bg-zinc-200 dark:bg-[#1a1a1a]',
    isAlbum ? 'aspect-square object-cover' : 'aspect-[16/9] object-contain',
    !isAlbum && (product.kind === 'software' ? 'p-9' : 'p-5'),
  )

  return (
    <MorphingDialog
      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
    >
      <MorphingDialogTrigger
        label={`Read about ${product.name}`}
        style={{ borderRadius: 16 }}
        className="border border-zinc-200 bg-white p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-4 dark:border-zinc-800 dark:bg-black"
      >
        <MorphingDialogImage
          src={product.image}
          alt={product.alt}
          className={imageClass}
        />
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <MorphingDialogTitle className="text-sm font-medium tracking-tight">
              {product.name}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </MorphingDialogSubtitle>
          </div>
          <Plus aria-hidden="true" className="size-4 shrink-0 text-zinc-500" />
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{ borderRadius: 16 }}
          className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain border border-zinc-200 bg-white p-2 text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
        >
          <MorphingDialogImage
            src={product.image}
            alt={product.alt}
            className={imageClass}
          />
          <div className="px-4 pt-5 pb-4 sm:px-5">
            <MorphingDialogTitle
              dialogTitle
              className="text-xl font-medium tracking-tight"
            >
              {product.name}
            </MorphingDialogTitle>
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
              <div className="mt-5 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                <h3 className="text-sm font-medium">My review</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {isAlbum
                    ? `Review coming soon. I’ll share my thoughts on ${product.name}, favorite tracks, and what stayed with me.`
                    : `Review coming soon. I’ll share my experience with the ${product.name}, what stood out, and what I’d change.`}
                </p>
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-sm text-xs text-zinc-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-zinc-400"
              >
                {isAlbum ? 'Listen on Apple Music' : 'Product details'}{' '}
                <ArrowUpRight aria-hidden="true" className="size-3.5" />
                <span className="sr-only">
                  for {product.name} (opens in a new tab)
                </span>
              </a>
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white text-zinc-900 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 [&>svg]:size-4" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}
