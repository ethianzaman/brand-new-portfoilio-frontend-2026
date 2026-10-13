function Bar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

/**
 * Public-route skeleton. Mirrors the hero + stats shape of the home page so
 * the transition into real content is not a layout jump.
 */
export default function PublicLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-14 md:pb-20">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-8">
          <div className="flex flex-col items-start gap-6 flex-1 max-w-2xl">
            <Bar className="h-7 w-36 rounded-full" />
            <div className="flex flex-col gap-3 w-full">
              <Bar className="h-10 sm:h-14 w-full max-w-lg" />
              <Bar className="h-6 sm:h-8 w-2/3" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Bar className="h-4 w-full" />
              <Bar className="h-4 w-11/12" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Bar className="h-11 w-36" />
              <Bar className="h-11 w-32" />
              <Bar className="h-11 w-28" />
            </div>
            <div className="flex items-center gap-3">
              <Bar className="h-9 w-20" />
              <Bar className="h-9 w-9 rounded-lg" />
              <Bar className="h-9 w-9 rounded-lg" />
              <Bar className="h-9 w-9 rounded-lg" />
            </div>
          </div>

          <div className="shrink-0 w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
            <Bar className="w-full h-full rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-2"
              >
                <Bar className="h-10 w-16" />
                <Bar className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="mb-12 space-y-3">
          <Bar className="h-8 w-64" />
          <Bar className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Bar key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
