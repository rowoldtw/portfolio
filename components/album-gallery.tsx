'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useMemo, useRef, useState } from 'react'
import type { ReviewProduct } from '@/components/review-card'

const ArtGallery = dynamic(() =>
  import('@/components/block/art-gallery').then((module) => module.ArtGallery),
)

export function AlbumGallery({
  albums,
  active,
}: {
  albums: ReviewProduct[]
  active: boolean
}) {
  // Keep the atlas inputs stable when Convex replaces initial data with identical live data.
  const assetKey = JSON.stringify(
    albums.map((album) => [album.image, album.name, album.brand]),
  )
  const { images, items } = useMemo(() => {
    const assets = JSON.parse(assetKey) as [string, string, string][]
    return {
      images: assets.map(([image]) =>
        image.replace('/1200x1200bb.jpg', '/600x600bb.jpg'),
      ),
      items: assets.map(([, title, year]) => ({ title, year })),
    }
  }, [assetKey])
  const navigateRef = useRef<((delta: number) => void) | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeAlbum = albums[activeIndex] ?? albums[0]

  if (albums.length === 0) return null

  const fallback = (
    <div className="bg-background flex h-full items-center justify-center gap-3 overflow-hidden p-4">
      {[-1, 0, 1].map((offset) => {
        const index = (activeIndex + offset + albums.length) % albums.length
        return (
          <div
            key={offset}
            className="relative aspect-square h-1/2 shrink-0 overflow-hidden rounded-sm"
          >
            <Image
              src={images[index]}
              alt={`${albums[index].name} by ${albums[index].brand}`}
              fill
              unoptimized
              sizes="(max-width: 600px) 45vw, 260px"
              className="object-cover"
            />
          </div>
        )
      })}
    </div>
  )

  return (
    <div data-album-gallery="" className="relative h-full w-full">
      <div
        role="group"
        tabIndex={0}
        aria-label="Album art gallery. Drag or scroll with a trackpad to explore, or use the left and right arrow keys."
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            const delta = event.key === 'ArrowLeft' ? -1 : 1
            if (navigateRef.current) navigateRef.current(delta)
            else
              setActiveIndex(
                (index) => (index + delta + albums.length) % albums.length,
              )
          }
        }}
        className="h-full focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <ArtGallery
          active={active}
          images={images}
          items={items}
          onActiveChange={setActiveIndex}
          navigateRef={navigateRef}
          fallback={fallback}
          className="h-full w-full"
        />
      </div>
      <div aria-hidden="true" data-album-scroll-fade="" />
      <p
        className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-10 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-[2rem] bg-[#f4f4f4]/50 px-4 py-2 text-center text-xs font-medium text-zinc-950 backdrop-blur-xl dark:bg-[#181818]/75 dark:text-zinc-50"
        aria-live="polite"
      >
        {activeAlbum.name}{' '}
        <span className="text-zinc-500 dark:text-zinc-400">
          — {activeAlbum.brand}
        </span>
      </p>
      <ul className="sr-only" aria-label="Albums in the gallery">
        {albums.map((album) => (
          <li key={album._id}>
            {album.name} by {album.brand}
          </li>
        ))}
      </ul>
    </div>
  )
}
