'use client';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-pn-surface-2" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-pn-green animate-spin" />
      </div>
      <p className="text-sm text-pn-muted">{message}</p>
    </div>
  );
}

export function DetailSkeleton() {
  return <LoadingSpinner message="Loading content..." />;
}

export function FeedSkeleton() {
  return <LoadingSpinner message="Loading feed..." />;
}
