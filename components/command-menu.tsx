'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  FolderGit2,
  GalleryHorizontal,
  Home,
  Mail,
  Monitor,
  Moon,
  Play,
  Sun,
  UserRound,
} from 'lucide-react'
import { PRELOADER_REPLAY_EVENT } from '@/components/site-preloader'
import { useTheme } from '@/components/theme-provider'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

const LANDING_SECTION_EVENT = 'portfolio:current-page-landing'

const PAGE_COMMANDS = [
  {
    label: 'Professional',
    href: '/',
    icon: BriefcaseBusiness,
    disabled: false,
  },
  {
    label: 'Gallery',
    href: '/gallery',
    icon: GalleryHorizontal,
    disabled: true,
  },
  {
    label: 'Personal',
    href: '/personal',
    icon: UserRound,
    disabled: true,
  },
] as const

const SECTION_COMMANDS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'projects', label: 'Projects / GitHub', icon: FolderGit2 },
  { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'skills', label: 'Skills / Certifications', icon: BadgeCheck },
  { id: 'connect', label: 'Connect', icon: Mail },
] as const

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'k' ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return
      }

      event.preventDefault()
      onOpenChange(!open)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange, open])

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange],
  )

  const goToPage = (href: string) => {
    if (pathname !== href) {
      router.push(href)
      return
    }

    if (href === '/') {
      window.dispatchEvent(new CustomEvent(LANDING_SECTION_EVENT))
      return
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const goToSection = (id: string) => {
    if (pathname !== '/') {
      router.push(`/#${id}`)
      return
    }

    const navButton = document.querySelector<HTMLButtonElement>(
      `[data-section-nav-id="${id}"]`,
    )
    navButton?.click()
  }

  const replayPreloader = () => {
    window.dispatchEvent(new Event(PRELOADER_REPLAY_EVENT))
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio command menu"
      description="Search pages, sections, and interface commands"
      showCloseButton={false}
      className="top-1/2 h-[25rem] max-w-xl gap-0 overflow-hidden rounded-3xl border-white/70 bg-[#f4f4f4] p-0 shadow-2xl dark:border-white/10 dark:bg-[#151515] [&_[cmdk-item]_svg]:!text-zinc-400 dark:[&_[cmdk-item]_svg]:!text-zinc-600 [&_[data-slot=command-input-wrapper]_svg]:text-zinc-400 dark:[&_[data-slot=command-input-wrapper]_svg]:text-zinc-600 [&_[data-slot=command]]:bg-transparent"
    >
      <CommandInput
        autoFocus
        placeholder="Search Anything"
        className="h-11 placeholder:text-zinc-400/70 dark:placeholder:text-zinc-600"
      />

      <CommandList className="max-h-none min-h-0 flex-1 p-1">
        <CommandEmpty>No matching commands.</CommandEmpty>

        <CommandGroup heading="Pages">
          {PAGE_COMMANDS.map((item) => {
            const Icon = item.icon

            return (
              <CommandItem
                key={item.href}
                value={`${item.label} page`}
                disabled={item.disabled}
                onSelect={
                  item.disabled
                    ? undefined
                    : () => runCommand(() => goToPage(item.href))
                }
                className="rounded-lg px-2 py-2 data-[disabled=true]:line-through"
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                <CommandShortcut className="tracking-normal">
                  Page
                </CommandShortcut>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Professional sections">
          {SECTION_COMMANDS.map((item) => {
            const Icon = item.icon

            return (
              <CommandItem
                key={item.id}
                value={`${item.label} professional section`}
                onSelect={() => runCommand(() => goToSection(item.id))}
                className="rounded-lg px-2 py-2"
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                <ArrowRight aria-hidden="true" className="ml-auto size-3.5" />
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Appearance">
          <CommandItem
            value="Use light theme"
            onSelect={() => runCommand(() => setTheme('light'))}
            className="rounded-lg px-2 py-2"
          >
            <Sun aria-hidden="true" />
            <span>Use light theme</span>
          </CommandItem>
          <CommandItem
            value="Use dark theme"
            onSelect={() => runCommand(() => setTheme('dark'))}
            className="rounded-lg px-2 py-2"
          >
            <Moon aria-hidden="true" />
            <span>Use dark theme</span>
          </CommandItem>
          <CommandItem
            value="Use system theme"
            onSelect={() => runCommand(() => setTheme('system'))}
            className="rounded-lg px-2 py-2"
          >
            <Monitor aria-hidden="true" />
            <span>Use system theme</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="my-1" />

        <CommandGroup heading="Interface">
          <CommandItem
            value="Replay intro preloader animation"
            onSelect={() => runCommand(replayPreloader)}
            className="rounded-lg px-2 py-2"
          >
            <Play aria-hidden="true" />
            <span>Replay preloader</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="flex items-center gap-4 border-t border-zinc-200/70 px-3 py-2 text-[0.625rem] text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
        <span>↵ Open</span>
        <span>↑↓ Navigate</span>
        <span className="ml-auto">Esc Close</span>
      </div>
    </CommandDialog>
  )
}
