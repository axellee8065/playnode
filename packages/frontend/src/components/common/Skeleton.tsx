'use client';

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6">
      {/* Game tag + badge */}
      <div className="flex gap-2">
        <div className="h-5 w-28 rounded bg-pn-surface-2" />
        <div className="h-5 w-16 rounded bg-pn-surface-2" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 w-3/4 rounded bg-pn-surface-2" />
        <div className="h-8 w-1/2 rounded bg-pn-surface-2" />
      </div>
      {/* Meta row */}
      <div className="flex gap-4">
        <div className="h-4 w-20 rounded bg-pn-surface-2" />
        <div className="h-4 w-24 rounded bg-pn-surface-2" />
        <div className="h-4 w-20 rounded bg-pn-surface" />
      </div>
      {/* Curator bar */}
      <div className="flex items-center gap-3 py-3 border-y border-pn-border">
        <div className="w-10 h-10 rounded-full bg-pn-surface-2" />
        <div className="h-4 w-32 rounded bg-pn-surface-2" />
        <div className="ml-auto h-8 w-24 rounded-lg bg-pn-surface-2" />
      </div>
      {/* Content blocks */}
      <div className="space-y-3 mt-6">
        <div className="h-4 w-full rounded bg-pn-surface-2" />
        <div className="h-4 w-5/6 rounded bg-pn-surface-2" />
        <div className="h-4 w-4/6 rounded bg-pn-surface-2" />
        <div className="h-40 w-full rounded-lg bg-pn-surface-2 mt-4" />
        <div className="h-4 w-full rounded bg-pn-surface-2 mt-4" />
        <div className="h-4 w-3/4 rounded bg-pn-surface-2" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video rounded-xl bg-pn-surface-2" />
          <div className="p-3 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-pn-surface-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-pn-surface-2" />
              <div className="h-3 w-1/2 rounded bg-pn-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
