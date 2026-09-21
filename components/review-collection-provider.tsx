'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

export type ReviewCollection = 'hardware' | 'software' | 'albums'
const ReviewCollectionContext = createContext<{
  collection: ReviewCollection
  setCollection: (collection: ReviewCollection) => void
} | null>(null)

function subscribeToUrlCollection(callback: () => void) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

function getUrlCollection(): ReviewCollection | null {
  const collection = new URLSearchParams(window.location.search).get(
    'collection',
  )
  return collection === 'hardware' ||
    collection === 'software' ||
    collection === 'albums'
    ? collection
    : null
}

export function ReviewCollectionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [storedCollection, setStoredCollection] =
    useState<ReviewCollection>('hardware')
  const urlCollection = useSyncExternalStore(
    subscribeToUrlCollection,
    getUrlCollection,
    () => null,
  )
  const collection = urlCollection ?? storedCollection
  const setCollection = useCallback((nextCollection: ReviewCollection) => {
    setStoredCollection(nextCollection)

    if (
      window.self !== window.top ||
      !window.location.pathname.startsWith('/reviews')
    ) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('collection', nextCollection)
    window.history.replaceState(window.history.state, '', url)
  }, [])

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
