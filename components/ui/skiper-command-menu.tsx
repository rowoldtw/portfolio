'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'

type SkiperCommand = {
  id: string
  label: string
  group: string
  description: string
  icon: ReactNode
  disabled?: boolean
  onSelect: () => void
}

type SkiperCommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: SkiperCommand[]
}

export function SkiperCommandMenu({
  open,
  onOpenChange,
  commands,
}: SkiperCommandMenuProps) {
  const triggerRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotion()
  const groups = Array.from(new Set(commands.map((command) => command.group)))
  const firstCommandId = commands[0]?.id ?? ''
  const [selectedCommandId, setSelectedCommandId] = useState(firstCommandId)
  const [selectionSource, setSelectionSource] = useState<
    'keyboard' | 'pointer'
  >('keyboard')
  const selectedCommand = commands.find(
    (command) => command.id === selectedCommandId,
  )

  useEffect(() => {
    if (!open) return

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousOverscrollBehavior = root.style.overscrollBehavior
    const preventScrollChaining = (event: WheelEvent) => {
      const target = event.target
      const list =
        target instanceof Element
          ? target.closest<HTMLElement>('[cmdk-list]')
          : null

      if (!list) {
        event.preventDefault()
        return
      }

      const atTop = list.scrollTop <= 0 && event.deltaY < 0
      const atBottom =
        Math.ceil(list.scrollTop + list.clientHeight) >= list.scrollHeight &&
        event.deltaY > 0

      if (list.scrollHeight <= list.clientHeight || atTop || atBottom) {
        event.preventDefault()
      }
    }

    root.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    document.addEventListener('wheel', preventScrollChaining, {
      capture: true,
      passive: false,
    })

    return () => {
      document.removeEventListener('wheel', preventScrollChaining, true)
      root.style.overflow = previousOverflow
      root.style.overscrollBehavior = previousOverscrollBehavior
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 fixed inset-0 z-[85] bg-black/45 backdrop-blur-[2px] motion-reduce:animate-none" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            triggerRef.current = document.activeElement as HTMLElement
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
          className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fixed top-1/2 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overscroll-none outline-none motion-reduce:data-[state=closed]:animate-none"
        >
          <Dialog.Title className="sr-only">
            Portfolio command menu
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Search pages and interface commands.
          </Dialog.Description>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.18,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="overflow-hidden overscroll-none rounded-[24px] border border-black/10 bg-[#F5F4F3] text-zinc-900 shadow-2xl dark:border-[#1F1F1F] dark:bg-[#121212] dark:text-zinc-100"
          >
            <Command
              loop
              label="Portfolio commands"
              value={selectedCommandId}
              onValueChange={setSelectedCommandId}
              onKeyDownCapture={() => setSelectionSource('keyboard')}
              className="w-full"
            >
              <div className="m-2 flex h-10 items-center gap-2 rounded-2xl bg-[#FCFCFC] px-3 dark:border dark:border-[#1F1F1F] dark:bg-[#121212]">
                <Search
                  aria-hidden="true"
                  className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500"
                />
                <Command.Input
                  autoFocus
                  aria-label="Search portfolio commands"
                  placeholder="Search Anything"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
              <Command.List className="scrollbar-hidden h-[min(22rem,60dvh)] overflow-y-auto overscroll-none px-2 py-1">
                <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
                  No matching commands.
                </Command.Empty>
                <LayoutGroup id="command-menu-options">
                  {groups.map((group) => (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="px-1 pb-1 text-xs text-zinc-500 [&_[cmdk-group-heading]]:relative [&_[cmdk-group-heading]]:z-10 [&_[cmdk-group-heading]]:bg-[#F5F4F3] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 dark:[&_[cmdk-group-heading]]:bg-[#121212]"
                    >
                      {commands
                        .filter((command) => command.group === group)
                        .map((command) => (
                          <Command.Item
                            key={command.id}
                            value={command.id}
                            keywords={[command.label, command.description]}
                            disabled={command.disabled}
                            onSelect={command.onSelect}
                            onPointerEnter={(event) => {
                              if (event.pointerType === 'touch') return
                              setSelectionSource('pointer')
                              setSelectedCommandId(command.id)
                            }}
                            aria-description={command.description}
                            className="group relative flex cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 py-2 text-sm font-medium text-zinc-700 outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-35 data-[selected=true]:text-zinc-950 dark:text-zinc-300 dark:data-[selected=true]:text-white"
                          >
                            {selectedCommandId === command.id && (
                              <motion.div
                                layoutId="command-option-shade"
                                initial={false}
                                transition={{
                                  duration:
                                    selectionSource === 'pointer' &&
                                    !reducedMotion
                                      ? 0.12
                                      : 0,
                                  ease: [0.23, 1, 0.32, 1],
                                }}
                                className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-[#FCFCFC] dark:bg-[#161616]"
                              />
                            )}
                            <ArrowRight
                              aria-hidden="true"
                              className="relative z-10 size-4 shrink-0 text-zinc-500"
                            />
                            <span className="relative z-10 min-w-0 flex-1 truncate">
                              {command.label}
                            </span>
                            <span className="relative z-10 flex size-6 shrink-0 items-center justify-center text-zinc-500 [&_svg]:size-4">
                              {command.icon}
                            </span>
                          </Command.Item>
                        ))}
                    </Command.Group>
                  ))}
                </LayoutGroup>
              </Command.List>
              <div className="flex h-11 items-center justify-between gap-3 border-t border-black/10 bg-[#F9F8F7] px-3 text-[11px] text-zinc-500 dark:border-[#1F1F1F] dark:bg-[#141414]">
                <span className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded border border-black/10 dark:border-[#1F1F1F]">
                    <CornerDownLeft aria-hidden="true" className="size-3" />
                  </span>
                  Run command
                </span>
                <span className="truncate text-right" aria-live="polite">
                  {selectedCommand?.description ?? 'Choose a command'}
                </span>
              </div>
            </Command>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
