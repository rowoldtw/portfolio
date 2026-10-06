export default function ReviewsLoading() {
  return (
    <main
      data-reviews-page=""
      data-reviews-loading=""
      aria-busy="true"
      className="bg-background min-h-dvh"
    >
      <span role="status" className="sr-only">
        Loading reviews
      </span>
    </main>
  )
}
