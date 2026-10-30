import SkeletonBlock from "./SkeletonBlock";

export default function MenuSkeleton({ guest = false }) {
  return (
    <div className="min-h-screen animate-pulse" aria-hidden="true">
      <header className="sticky top-0 z-40 h-18.5 bg-white shadow-[0_1px_1px_rgba(0,0,0,.05)]">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SkeletonBlock className="h-7 w-40 rounded-lg" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      {guest && (
        <div className="border-b border-[#dfc0b5] bg-[#fff1ea]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <SkeletonBlock className="h-4 w-64 rounded-md" />
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
        </div>
      )}

      <div className="sticky top-18.5 z-30 overflow-x-auto border-b border-[#eee] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-w-max w-full max-w-7xl gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock
              key={index}
              className="h-9 shrink-0 rounded-full px-12"
            />
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SkeletonBlock className="h-8 w-56 rounded-md sm:w-72" />
            <SkeletonBlock className="mt-3 h-4 w-full max-w-md rounded-md" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-full sm:w-72" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,.03)]"
            >
              <SkeletonBlock className="h-56 w-full" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <SkeletonBlock className="h-6 w-2/3 rounded-md" />
                  <SkeletonBlock className="h-6 w-12 rounded-md" />
                </div>
                <div className="mt-3 space-y-2">
                  <SkeletonBlock className="h-4 w-full rounded-md" />
                  <SkeletonBlock className="h-4 w-4/5 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 pt-0">
                {guest ? (
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                ) : (
                  <>
                    <SkeletonBlock className="h-10 w-24 rounded-full" />
                    <SkeletonBlock className="h-12 w-12 rounded-full" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}