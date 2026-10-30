import SkeletonBlock from "./SkeletonBlock";

export default function ReserveSkeleton() {
  return (
    <div className="min-h-screen animate-pulse" aria-hidden="true">
      <header className="sticky top-0 z-40 h-18.5 bg-white shadow-[0_1px_1px_rgba(0,0,0,.05)]">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-7 w-40 rounded-lg" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <SkeletonBlock className="h-8 w-64 rounded-md" />

        <section className="mt-8">
          <SkeletonBlock className="h-4 w-20 rounded-md" />
          <div className="mt-3 flex gap-3 overflow-hidden pb-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-20 w-16 shrink-0 rounded-xl"
              />
            ))}
          </div>
        </section>

        <section className="mt-7">
          <SkeletonBlock className="h-4 w-20 rounded-md" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-10 w-24 shrink-0 rounded-lg"
              />
            ))}
          </div>
        </section>

        <div className="mt-8 flex gap-6 text-sm">
          {[0, 1].map((index) => (
            <span key={index} className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-3 rounded-full" />
              <SkeletonBlock className="h-4 w-16 rounded-md" />
            </span>
          ))}
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="min-h-31.5 rounded-xl border border-[#e5e8ee] bg-white p-4.5"
            >
              <div className="flex items-start justify-between">
                <SkeletonBlock className="h-7 w-24 rounded-md" />
                <SkeletonBlock className="h-6 w-20 rounded-md" />
              </div>
              <SkeletonBlock className="mt-3 h-4 w-20 rounded-md" />
              <SkeletonBlock className="mt-1 h-3 w-28 rounded-md" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}