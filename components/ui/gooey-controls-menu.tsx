'use client'

import { AnimatePresence, motion } from 'motion/react'

type GooeyControlsMenuProps = {
  children: React.ReactNode
  id: string
  open: boolean
}

export function GooeyControlsMenu({
  children,
  id,
  open,
}: GooeyControlsMenuProps) {
  return (
    <>
      <svg aria-hidden="true" className="absolute size-0">
        <defs>
          <filter
            id="footer-menu-gooey"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="group"
            aria-label="Interface controls"
            className="absolute right-0 bottom-full mb-2 w-56 origin-bottom-right"
            initial={{ opacity: 0, scale: 0.2, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.2, y: 28 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              style={{ filter: 'url(#footer-menu-gooey)' }}
            >
              <span className="absolute inset-0 rounded-3xl bg-[#f4f4f4] dark:bg-[#181818]" />
              <motion.span
                className="absolute right-2 bottom-0 size-9 rounded-full bg-[#f4f4f4] dark:bg-[#181818]"
                initial={{ scale: 0.75, y: 36 }}
                animate={{ scale: 1, y: 13 }}
                exit={{ scale: 0.75, y: 36 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
              />
            </div>

            <motion.div
              className="relative rounded-3xl border border-white/70 p-2 shadow-xl shadow-zinc-900/10 backdrop-blur-xl dark:border-white/10 dark:shadow-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.04 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
