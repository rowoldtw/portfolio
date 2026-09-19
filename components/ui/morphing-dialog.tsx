'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  motion,
  AnimatePresence,
  MotionConfig,
  Transition,
  Variant,
} from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import useClickOutside from '@/hooks/useClickOutside'

export type MorphingDialogContextType = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  uniqueId: string
  triggerRef: React.RefObject<HTMLDivElement>
}

const MorphingDialogContext =
  React.createContext<MorphingDialogContextType | null>(null)

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext)
  if (!context) {
    throw new Error(
      'useMorphingDialog must be used within a MorphingDialogProvider',
    )
  }
  return context
}

export type MorphingDialogProviderProps = {
  children: React.ReactNode
  transition?: Transition
}

function MorphingDialogProvider({
  children,
  transition,
}: MorphingDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const uniqueId = useId()
  const triggerRef = useRef<HTMLDivElement>(null!)

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      uniqueId,
      triggerRef,
    }),
    [isOpen, uniqueId],
  )

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition} reducedMotion="user">
        {children}
      </MotionConfig>
    </MorphingDialogContext.Provider>
  )
}

export type MorphingDialogProps = {
  children: React.ReactNode
  transition?: Transition
}

function MorphingDialog({ children, transition }: MorphingDialogProps) {
  return (
    <MorphingDialogProvider>
      <MotionConfig transition={transition} reducedMotion="user">
        {children}
      </MotionConfig>
    </MorphingDialogProvider>
  )
}

export type MorphingDialogTriggerProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  triggerRef?: React.RefObject<HTMLDivElement>
  label?: string
}

function MorphingDialogTrigger({
  children,
  className,
  style,
  triggerRef,
  label,
}: MorphingDialogTriggerProps) {
  const {
    setIsOpen,
    isOpen,
    uniqueId,
    triggerRef: contextTriggerRef,
  } = useMorphingDialog()

  const handleClick = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen, setIsOpen])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsOpen(!isOpen)
      }
    },
    [isOpen, setIsOpen],
  )

  return (
    <motion.div
      ref={triggerRef ?? contextTriggerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn('relative cursor-pointer', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={style}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
      aria-label={label ?? 'Open details'}
    >
      {children}
    </motion.div>
  )
}

export type MorphingDialogContentProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function MorphingDialogContent({
  children,
  className,
  style,
}: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog()
  const containerRef = useRef<HTMLDivElement>(null!)
  const [firstFocusableElement, setFirstFocusableElement] =
    useState<HTMLElement | null>(null)
  const [lastFocusableElement, setLastFocusableElement] =
    useState<HTMLElement | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
      if (event.key === 'Tab') {
        if (!firstFocusableElement || !lastFocusableElement) return

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault()
            lastFocusableElement.focus()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault()
            firstFocusableElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [setIsOpen, firstFocusableElement, lastFocusableElement])

  useEffect(() => {
    if (!isOpen) return
    const trigger = triggerRef.current
    const hadScrollLock = document.body.classList.contains('overflow-hidden')
    document.body.classList.add('overflow-hidden')
    const focusableElements =
      containerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
    if (focusableElements?.length) {
      setFirstFocusableElement(focusableElements[0])
      setLastFocusableElement(focusableElements[focusableElements.length - 1])
      focusableElements[0].focus({ preventScroll: true })
    }
    return () => {
      if (!hadScrollLock) document.body.classList.remove('overflow-hidden')
      trigger?.focus({ preventScroll: true })
    }
  }, [isOpen, triggerRef])

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false)
    }
  })

  return (
    <motion.div
      ref={containerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn('overflow-hidden', className)}
      style={style}
      id={`motion-ui-morphing-dialog-content-${uniqueId}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`dialog-title-${uniqueId}`}
      aria-describedby={`dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  )
}

export type MorphingDialogContainerProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  const { isOpen, uniqueId } = useMorphingDialog()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 z-[70] h-full w-full bg-white/40 backdrop-blur-sm dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            {children}
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export type MorphingDialogTitleProps = {
  dialogTitle?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function MorphingDialogTitle({
  dialogTitle,
  children,
  className,
  style,
}: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog()

  return (
    <motion.div
      id={dialogTitle ? `dialog-title-${uniqueId}` : undefined}
      layoutId={`dialog-title-container-${uniqueId}`}
      className={className}
      style={style}
      layout
    >
      {children}
    </motion.div>
  )
}

export type MorphingDialogSubtitleProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

function MorphingDialogSubtitle({
  children,
  className,
  style,
}: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog()

  return (
    <motion.div
      layoutId={`dialog-subtitle-container-${uniqueId}`}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export type MorphingDialogDescriptionProps = {
  children: React.ReactNode
  className?: string
  disableLayoutAnimation?: boolean
  variants?: {
    initial: Variant
    animate: Variant
    exit: Variant
  }
}

function MorphingDialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog()

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `dialog-description-content-${uniqueId}`
      }
      variants={variants}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      id={`dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  )
}

export type MorphingDialogImageProps = {
  src: string
  darkSrc?: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

function MorphingDialogImage({
  src,
  darkSrc,
  alt,
  className,
  style,
}: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog()

  if (darkSrc) {
    return (
      <motion.div
        role="img"
        aria-label={alt}
        className={cn('relative overflow-hidden', className)}
        layoutId={`dialog-img-${uniqueId}`}
        style={style}
      >
        <motion.img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover dark:hidden"
        />
        <motion.img
          src={darkSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 hidden size-full object-cover dark:block"
        />
      </motion.div>
    )
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn(className)}
      layoutId={`dialog-img-${uniqueId}`}
      style={style}
    />
  )
}

export type MorphingDialogCloseProps = {
  children?: React.ReactNode
  className?: string
  variants?: {
    initial: Variant
    animate: Variant
    exit: Variant
  }
}

function MorphingDialogClose({
  children,
  className,
  variants,
}: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog()

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      key={`dialog-close-${uniqueId}`}
      className={cn('absolute top-6 right-6', className)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children || <XIcon size={24} />}
    </motion.button>
  )
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
}
