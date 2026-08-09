'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export type CarouselImage = {
  src: string
  alt: string
  title: string
}

type Carousel006Props = {
  images: CarouselImage[]
  className?: string
  autoplay?: boolean
  loop?: boolean
  showNavigation?: boolean
  showPagination?: boolean
}

export function Carousel_006({
  images,
  className,
  autoplay = false,
  loop = true,
  showNavigation = true,
  showPagination = true,
}: Carousel006Props) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => setCurrent(api.selectedScrollSnap())

    const frame = window.requestAnimationFrame(onSelect)
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      window.cancelAnimationFrame(frame)
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api])

  React.useEffect(() => {
    if (!api) return

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement
      const pageHasSelection =
        activeElement &&
        activeElement !== document.body &&
        activeElement !== document.documentElement

      if (pageHasSelection || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        api.scrollPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        api.scrollNext()
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [api])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full"
    >
      <Carousel
        setApi={setApi}
        className={cn('w-full', className)}
        opts={{ align: 'center', loop, slidesToScroll: 1 }}
        plugins={
          autoplay
            ? [
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                  stopOnMouseEnter: true,
                }),
              ]
            : []
        }
      >
        <CarouselContent className="h-[56vh] max-h-[32rem] min-h-80 w-full">
          {images.map((image, index) => {
            const isActive = current === index

            return (
              <CarouselItem
                key={image.src}
                className="flex h-full basis-[70%] flex-col items-center justify-start sm:basis-[48%] md:basis-[32%] lg:basis-[25%] xl:basis-[22%]"
              >
                <motion.button
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`View ${image.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  initial={false}
                  animate={{
                    clipPath: isActive
                      ? 'inset(0 0 0 0 round 1.5rem)'
                      : 'inset(14% 0 14% 0 round 1.5rem)',
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative h-[84%] w-full cursor-pointer overflow-hidden rounded-3xl border border-zinc-200/70 bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:border-zinc-800/70 dark:bg-zinc-900 dark:focus-visible:ring-zinc-500/60"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 25vw, (min-width: 768px) 32vw, 70vw"
                    priority={index < 3}
                    className="scale-105 object-cover"
                  />
                </motion.button>

                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.p
                      key={image.title}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="mt-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      {image.title}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {showNavigation ? (
          <div className="pointer-events-none absolute right-0 bottom-8 left-0 flex items-center justify-between px-[7%]">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => api?.scrollPrev()}
              className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full border border-zinc-200/70 bg-white text-zinc-600 shadow-sm transition-colors duration-200 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => api?.scrollNext()}
              className="pointer-events-auto inline-flex size-9 items-center justify-center rounded-full border border-zinc-200/70 bg-white text-zinc-600 shadow-sm transition-colors duration-200 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60"
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : null}

        {showPagination ? (
          <div className="mt-2 flex items-center justify-center gap-2">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'size-1.5 rounded-full transition-[background-color,transform] duration-200 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-zinc-500/60 dark:focus-visible:ring-offset-[#111]',
                  current === index
                    ? 'scale-125 bg-zinc-950 dark:bg-zinc-50'
                    : 'bg-zinc-300 hover:bg-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-500',
                )}
                aria-label={`Go to slide ${index + 1}: ${image.title}`}
                aria-current={current === index ? 'true' : undefined}
              />
            ))}
          </div>
        ) : null}
      </Carousel>
    </motion.div>
  )
}

/**
 * Adapted from Skiper UI's Carousel_006 (Skiper 54), built with shadcn/ui and Embla Carousel.
 * https://skiper-ui.com/v1/skiper54
 */
