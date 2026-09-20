'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type ReviewCollection = 'hardware' | 'software' | 'albums'
const ReviewCollectionContext = createContext<{
  collection: ReviewCollection
  setCollection: (collection: ReviewCollection) => void
} | null>(null)

export function ReviewCollectionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [collection, setCollection] = useState<ReviewCollection>('hardware')
  return (
    <ReviewCollectionContext.Provider value={{ collection, setCollection }}>
      {children}
    </ReviewCollectionContext.Provider>
  )
}

export function useReviewCollection() {
  const context = useContext(ReviewCollectionContext)
  if (!context) throw new Error('ReviewCollectionProvider is required')
  return context
}
