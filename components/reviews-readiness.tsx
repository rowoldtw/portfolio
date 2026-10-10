'use client'

import { createContext, useContext } from 'react'

export const ReviewsReadinessContext = createContext(true)

export function useReviewsReady() {
  return useContext(ReviewsReadinessContext)
}
