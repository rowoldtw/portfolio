import type { Metadata } from 'next'
import {
  Carousel_006,
  type CarouselImage,
} from '@/components/ui/skiper-ui/skiper54'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A visual gallery curated by Woodrow Rowoldt.',
}

const GALLERY_IMAGES: CarouselImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    alt: 'Mountain landscape beneath a pale sky',
    title: 'Open Country',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=85',
    alt: 'Sunlight passing through a dense forest',
    title: 'Forest Light',
  },
  {
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85',
    alt: 'Quiet lake surrounded by mountains',
    title: 'Still Water',
  },
  {
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
    alt: 'Rocky valley under warm evening light',
    title: 'Last Light',
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85',
    alt: 'Hiker crossing a broad mountain landscape',
    title: 'The Crossing',
  },
  {
    src: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=85',
    alt: 'Layered green tropical leaves',
    title: 'Green Study',
  },
]

export default function GalleryPage() {
  return (
    <main className="bg-background flex min-h-dvh w-full items-center overflow-hidden dark:bg-[#111]">
      <section className="w-full py-16" aria-labelledby="gallery-heading">
        <div className="mx-auto mb-5 w-full max-w-screen-xl px-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Selected</p>
          <h1
            id="gallery-heading"
            className="mt-1 text-lg font-medium text-balance text-zinc-950 dark:text-zinc-50"
          >
            Gallery
          </h1>
        </div>
        <Carousel_006 images={GALLERY_IMAGES} />
      </section>
    </main>
  )
}
