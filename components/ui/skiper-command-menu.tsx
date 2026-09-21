'use client'

import { useRef, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import { motion, useReducedMotion } from 'motion/react'
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

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] motion-reduce:animate-none" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            triggerRef.current = document.activeElement as HTMLElement
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
          className="fixed top-1/2 left-1/2 z-60 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 outline-none"
        >
          <Dialog.Title className="sr-only">
            Portfolio command menu
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Search pages and interface commands.
          </Dialog.Description>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] text-zinc-100 shadow-2xl"
          >
            <Command loop label="Portfolio commands" className="w-full">
              <div className="m-2 flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.025] px-4">
                <Search
                  aria-hidden="true"
                  className="size-4 shrink-0 text-zinc-500"
                />
                <Command.Input
                  autoFocus
                  aria-label="Search portfolio commands"
                  placeholder="Search Anything"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                />
              </div>
              <Command.List className="scrollbar-hidden h-[min(27rem,60dvh)] overflow-y-auto px-3 py-3">
                <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500">
                  No matching commands.
                </Command.Empty>
                {groups.map((group) => (
                  <Command.Group
                    key={group}
                    heading={group}
                    className="px-1 pb-2 text-xs text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
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
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-35 data-[selected=true]:bg-white/[0.055] data-[selected=true]:text-white"
                        >
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-zinc-500"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {command.label}
                          </span>
                          <span className="flex size-6 shrink-0 items-center justify-center text-zinc-500 [&_svg]:size-4">
                            {command.icon}
                          </span>
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>
              <div className="flex h-14 items-center justify-between border-t border-white/10 px-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded border border-white/10">
                    <CornerDownLeft aria-hidden="true" className="size-3" />
                  </span>
                  Run command
                </span>
                <span>esc to close</span>
              </div>
            </Command>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
