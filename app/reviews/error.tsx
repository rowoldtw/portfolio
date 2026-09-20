'use client'

export default function ReviewsError({ reset }: { reset: () => void }) {
  return (
    <main data-reviews-page="" className="min-h-dvh px-5 pt-28 text-center">
      <h1 className="text-3xl font-medium">Reviews</h1>
      <p role="alert" className="mt-6 text-sm text-zinc-500">
        Reviews couldn’t load. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-zinc-300 px-5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 dark:border-zinc-700"
      >
        Try again
      </button>
    </main>
  )
}
