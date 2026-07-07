'use client'
import { motion } from 'motion/react'

type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-background dark:bg-[#111]">
      <div className="mx-auto flex w-full max-w-screen-sm flex-1 flex-col px-4">
        <section className="flex flex-1 flex-col justify-center py-20">
          <motion.h1
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-lg font-medium text-zinc-950 dark:text-zinc-50"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
            className="mt-3 max-w-md text-zinc-600 dark:text-zinc-400"
          >
            {description}
          </motion.p>
        </section>
      </div>
    </main>
  )
}
