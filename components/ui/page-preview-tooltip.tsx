'use client'

import { AnimatePresence, motion } from 'motion/react'

export type PagePreview = {
  href: string
  id: string
  label: string
}

type PagePreviewTooltipProps = {
  preview: PagePreview | null
  x: number
}

export function PagePreviewTooltip({ preview, x }: PagePreviewTooltipProps) {
  return (
    <AnimatePresence initial={false}>
      {preview ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-0 z-50 mb-5 origin-bottom"
          initial={{ opacity: 0, scale: 0.96, y: 8, x }}
          animate={{ opacity: 1, scale: 1, y: 0, x }}
          exit={{ opacity: 0, scale: 0.96, y: 6, x }}
          transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
        >
          <div className="-translate-x-1/2">
            <div className="relative w-52 overflow-hidden rounded-xl border-2 border-white/80 bg-[#f4f4f4] p-0.5 shadow-xl dark:border-white/15 dark:bg-[#181818]">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[#fafafa] dark:bg-[#111]">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={preview.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <iframe
                      src={preview.href}
                      title={`${preview.label} page preview`}
                      tabIndex={-1}
                      loading="eager"
                      className="pointer-events-none h-[720px] w-[1280px] origin-top-left scale-[0.15625] border-0"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <span className="absolute -bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-white/80 bg-[#f4f4f4] dark:border-white/15 dark:bg-[#181818]" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
