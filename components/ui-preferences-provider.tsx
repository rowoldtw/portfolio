'use client'

import * as React from 'react'
import { MotionConfig } from 'motion/react'

export function UiPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
