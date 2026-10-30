import SkeletonBlock from "./SkeletonBlock";

export default function ReceiptSkeleton() {
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

      <main className="px-4 py-12">
        <div className="mx-auto max-w-105">
          <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,.06)] sm:p-8">
            <div className="text-center">
              <SkeletonBlock className="mx-auto h-8 w-48 rounded-lg" />
              <SkeletonBlock className="mx-auto mt-2 h-3 w-40 rounded-md" />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-5 text-center">
              {[0, 1].map((index) => (
                <div key={index}>
                  <SkeletonBlock className="mx-auto h-3 w-12 rounded-md" />
                  <SkeletonBlock className="mx-auto mt-2 h-4 w-20 rounded-md" />
                </div>
              ))}
              <div className="col-span-2">
                <SkeletonBlock className="mx-auto h-3 w-20 rounded-md" />
                <SkeletonBlock className="mx-auto mt-2 h-4 w-36 rounded-md" />
              </div>
            </div>

            <div className="my-8 border-t border-dashed border-[#cfc7c2]" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mb-5 flex justify-between">
                <SkeletonBlock className="h-4 w-44 rounded-md" />
                <SkeletonBlock className="h-4 w-12 rounded-md" />
              </div>
            ))}

            <div className="my-6 border-t border-dashed border-[#cfc7c2]" />
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex justify-between">
                  <SkeletonBlock
                    className={`h-4 rounded-md ${index === 2 ? "w-16" : "w-20"}`}
                  />
                  <SkeletonBlock
                    className={`h-4 rounded-md ${index === 2 ? "w-16" : "w-10"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-11 w-full rounded-xl" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}