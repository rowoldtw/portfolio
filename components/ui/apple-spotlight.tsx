'use client'

import { useId, useRef, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronRight, Search } from 'lucide-react'

const MotionCommandInput = motion.create(Command.Input)
const MotionCommandList = motion.create(Command.List)
const MotionCommandItem = motion.create(Command.Item)

type SpotlightCommand = {
  id: string
  label: string
  description: string
  icon: ReactNode
  disabled?: boolean
  onSelect: () => void
}

type SpotlightShortcut = {
  label: string
  icon: ReactNode
  search?: string
  onSelect?: () => void
}

type AppleSpotlightProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: SpotlightCommand[]
  shortcuts: SpotlightShortcut[]
}

// Adapted from ObsidianUI's Apple Spotlight, with accessible portfolio commands.
export function AppleSpotlight({
  open,
  onOpenChange,
  ...props
}: AppleSpotlightProps) {
  const triggerRef = useRef<HTMLElement | null>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/20 backdrop-blur-sm motion-reduce:animate-none" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            triggerRef.current = document.activeElement as HTMLElement
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
          className="fixed top-[35%] left-1/2 z-60 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 outline-none max-sm:top-[20%]"
        >
          <Dialog.Title className="sr-only">
            Portfolio command menu
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Search pages and interface commands.
          </Dialog.Description>
          <SpotlightContent {...props} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SpotlightContent({
  commands,
  shortcuts,
}: Pick<AppleSpotlightProps, 'commands' | 'shortcuts'>) {
  const layoutId = useId()
  const [search, setSearch] = useState('')
  const [shortcutLabel, setShortcutLabel] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reducedMotion = useReducedMotion()
  const hasSearch = search.trim().length > 0
  const spring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 550, damping: 50 }

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : { opacity: 0, filter: 'blur(20px)', scale: 1.08, y: -10 }
      }
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
      transition={spring}
      className="flex flex-col items-center gap-3"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {shortcuts.map((shortcut, index) => (
          <motion.button
            key={shortcut.label}
            type="button"
            aria-label={shortcut.label}
            title={shortcut.label}
            initial={
              reducedMotion
                ? false
                : { opacity: 0, scale: 0.7, x: -16 * (index + 1) }
            }
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={spring}
            onMouseEnter={() => setShortcutLabel(shortcut.label)}
            onMouseLeave={() => setShortcutLabel(null)}
            onFocus={() => setShortcutLabel(shortcut.label)}
            onBlur={() => setShortcutLabel(null)}
            onClick={() => {
              if (shortcut.onSelect) shortcut.onSelect()
              else {
                setSearch(shortcut.search ?? '')
                inputRef.current?.focus()
              }
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-black/5 bg-neutral-100/95 text-neutral-400 shadow-sm backdrop-blur-xl transition-colors hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-500 dark:border-white/10 dark:bg-neutral-900/95 dark:hover:text-white [&_svg]:size-5 [&_svg]:stroke-[1.4]"
          >
            {shortcut.icon}
          </motion.button>
        ))}
      </div>
      <motion.div
        layoutId={reducedMotion ? undefined : `${layoutId}-search`}
        transition={{
          layout: {
            duration: reducedMotion ? 0 : 0.5,
            type: 'spring',
            bounce: 0.2,
          },
        }}
        style={{ borderRadius: 24 }}
        className="w-full min-w-0 overflow-hidden rounded-3xl border border-black/10 bg-neutral-100/95 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95"
      >
        <Command loop className="w-full" label="Portfolio commands">
          <motion.div
            layout={reducedMotion ? false : 'position'}
            className="flex h-12 items-center gap-2.5 px-4"
          >
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 stroke-[1.4] text-neutral-500"
            />
            <div className="relative min-w-0 flex-1">
              {!search && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={shortcutLabel ?? 'Search'}
                    aria-hidden="true"
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 6, filter: 'blur(5px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.15 }}
                    className="pointer-events-none absolute inset-0 flex items-center text-lg text-neutral-500"
                  >
                    {shortcutLabel ?? 'Search'}
                  </motion.span>
                </AnimatePresence>
              )}
              <MotionCommandInput
                layout={reducedMotion ? false : 'position'}
                ref={inputRef}
                autoFocus
                aria-label="Search portfolio commands"
                value={search}
                onValueChange={setSearch}
                className="h-12 w-full bg-transparent text-lg outline-none"
              />
            </div>
          </motion.div>
          <MotionCommandList
            layout={!reducedMotion}
            className={
              hasSearch
                ? 'max-h-[min(20rem,35dvh)] overflow-y-auto border-t border-black/5 p-2 dark:border-white/10'
                : 'sr-only'
            }
          >
            {hasSearch && (
              <>
                <Command.Empty className="px-4 py-6 text-center text-sm text-neutral-500">
                  No matching commands.
                </Command.Empty>
                {commands.map((command) => (
                  <MotionCommandItem
                    layout={reducedMotion ? false : 'position'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reducedMotion ? 0 : 0.2 }}
                    key={command.id}
                    value={command.id}
                    keywords={[command.label, command.description]}
                    disabled={command.disabled}
                    onSelect={command.onSelect}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-35 data-[selected=true]:bg-white data-[selected=true]:shadow-sm dark:data-[selected=true]:bg-neutral-800"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center [&_svg]:size-6 [&_svg]:stroke-[1.5]">
                      {command.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {command.label}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {command.description}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-5 opacity-0 group-data-[selected=true]:opacity-100"
                    />
                  </MotionCommandItem>
                ))}
              </>
            )}
          </MotionCommandList>
        </Command>
      </motion.div>
    </motion.div>
  )
}
