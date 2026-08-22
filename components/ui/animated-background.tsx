'use client'
import { cn } from '@/lib/utils'
import { AnimatePresence, Transition, motion } from 'motion/react'
import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  type MouseEvent,
  useState,
  useId,
} from 'react'

type AnimatedBackgroundChildProps = {
  'data-id': string
  'data-checked'?: string
  className?: string
  children?: React.ReactNode
  onClick?: (event: MouseEvent<HTMLElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void
}

export type AnimatedBackgroundProps = {
  children:
    | ReactElement<AnimatedBackgroundChildProps>[]
    | ReactElement<AnimatedBackgroundChildProps>
  defaultValue?: string
  value?: string | null
  onValueChange?: (newActiveId: string | null) => void
  className?: string
  transition?: Transition
  enableHover?: boolean
}

export function AnimatedBackground({
  children,
  defaultValue,
  value,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue ?? null)
  const uniqueId = useId()
  const currentActiveId = value === undefined ? activeId : value

  const handleSetActiveId = (id: string | null) => {
    if (value === undefined) {
      setActiveId(id)
    }

    if (onValueChange) {
      onValueChange(id)
    }
  }

  return Children.map(children, (child, index) => {
    if (!isValidElement<AnimatedBackgroundChildProps>(child)) return child

    const id = child.props['data-id']

    const interactionProps = enableHover
      ? {
          onMouseEnter: (event: MouseEvent<HTMLElement>) => {
            child.props.onMouseEnter?.(event)
            handleSetActiveId(id)
          },
          onMouseLeave: (event: MouseEvent<HTMLElement>) => {
            child.props.onMouseLeave?.(event)
            handleSetActiveId(null)
          },
        }
      : {
          onClick: (event: MouseEvent<HTMLElement>) => {
            child.props.onClick?.(event)
            handleSetActiveId(id)
          },
        }

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': currentActiveId === id ? 'true' : 'false',
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {currentActiveId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{child.props.children}</div>
      </>,
    )
  })
}
