export default function ReviewsLoading() {
  return (
    <main
      data-reviews-page=""
      data-reviews-loading=""
      aria-busy="true"
      className="bg-background flex min-h-dvh items-center justify-center px-5"
    >
      <div
        role="status"
        className="flex items-center gap-3 rounded-full bg-zinc-100 px-5 py-3 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
      >
        <span aria-hidden="true" className="flex gap-1">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="reviews-loading-dot h-1 w-1 rounded-full bg-current"
              style={{ animationDelay: `${index * 150}ms` }}
            />
          ))}
        </span>
        Loading reviews…
      </div>
    </main>
  )
}
