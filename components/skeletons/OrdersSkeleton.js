import SkeletonBlock from "./SkeletonBlock";

export default function OrdersSkeleton() {
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

      <main className="mx-auto max-w-180 px-4 py-8">
        <SkeletonBlock className="h-8 w-48 rounded-md" />

        <div className="mt-8 space-y-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,.05)]"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1">
                  <SkeletonBlock className="h-5 w-32 rounded-md" />
                  <SkeletonBlock className="mt-1 h-3 w-40 rounded-md" />
                </div>
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>

              <div className="mt-6 grid grid-cols-4 gap-1">
                {Array.from({ length: 4 }).map((_, stageIndex) => (
                  <div key={stageIndex} className="text-center">
                    <SkeletonBlock className="mx-auto h-6 w-6 rounded-full" />
                    <SkeletonBlock className="mx-auto mt-2 h-3 w-10 rounded-md" />
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 border-t border-[#eee] pt-4">
                {Array.from({ length: 3 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between">
                    <SkeletonBlock className="h-4 w-40 rounded-md" />
                    <SkeletonBlock className="h-4 w-12 rounded-md" />
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <SkeletonBlock className="h-5 w-16 rounded-md" />
                  <SkeletonBlock className="h-5 w-16 rounded-md" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SkeletonBlock className="h-4 w-36 rounded-md" />
                <div className="flex flex-wrap gap-2">
                  <SkeletonBlock className="h-10 w-28 rounded-lg" />
                  <SkeletonBlock className="h-10 w-20 rounded-lg" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}