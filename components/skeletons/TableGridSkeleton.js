import SkeletonBlock from "./SkeletonBlock";

export default function TableGridSkeleton({ guest = false }) {
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

      {guest && (
        <div className="border-b border-[#dfc0b5] bg-[#fff1ea]">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <SkeletonBlock className="h-4 w-64 rounded-md" />
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SkeletonBlock className="h-8 w-64 rounded-md" />
            <SkeletonBlock className="mt-2 h-4 w-full max-w-xl rounded-md" />
          </div>
          {!guest && <SkeletonBlock className="h-10 w-40 rounded-lg" />}
        </div>

        <div className="mt-8 flex gap-6 text-sm">
          {[0, 1].map((index) => (
            <span key={index} className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-3 rounded-full" />
              <SkeletonBlock className="h-4 w-16 rounded-md" />
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="min-h-54.25 rounded-xl border border-[#e5e8ee] bg-white p-4 sm:p-6"
            >
              <div className="flex justify-between">
                <SkeletonBlock className="h-7 w-24 rounded-md" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
              <SkeletonBlock className="mt-10 h-4 w-20 rounded-md" />
              <SkeletonBlock className="mt-2 h-4 w-28 rounded-md" />
              <div className="mt-8 border-t border-[#eee] pt-3">
                <SkeletonBlock className="h-4 w-32 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}