import React from 'react';

/**
 * Full-screen loading skeleton shown while initial API data loads.
 * Mimics the layout of the search screen with pulsing placeholder cards.
 */
export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div>
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded mt-1.5" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Search bar */}
        <div className="h-12 bg-white/5 rounded-2xl border border-white/10" />

        {/* Filter pills */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-28 bg-white/5 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Drug profile card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="h-3 w-2/3 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-xl ml-4" />
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex gap-3">
            <div className="h-16 flex-1 bg-white/5 rounded-xl" />
            <div className="h-16 flex-1 bg-white/5 rounded-xl" />
            <div className="h-16 flex-1 bg-white/5 rounded-xl" />
          </div>
        </div>

        {/* Savings card */}
        <div className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="flex gap-4">
            <div className="h-20 flex-1 bg-white/5 rounded-xl" />
            <div className="h-20 flex-1 bg-white/5 rounded-xl" />
          </div>
        </div>

        {/* Pharmacy cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
              <div className="h-8 w-16 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 border-t border-white/5 py-2 px-6">
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/10 rounded" />
              <div className="h-2.5 w-10 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
