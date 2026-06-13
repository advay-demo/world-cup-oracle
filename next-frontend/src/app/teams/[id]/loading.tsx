"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      {/* Hero Skeleton */}
      <div className="container mx-auto flex flex-col items-center mb-16">
        <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse mb-6" />
        <div className="w-96 h-16 rounded-md bg-white/5 animate-pulse mb-4" />
        <div className="w-48 h-6 rounded-md bg-white/5 animate-pulse mb-8" />
        <div className="flex gap-4">
          <div className="w-32 h-10 rounded-full bg-white/5 animate-pulse" />
          <div className="w-32 h-10 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto space-y-16">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>

        {/* Support Skeleton */}
        <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />

        {/* Squad Skeleton */}
        <div className="space-y-4">
          <div className="w-48 h-8 rounded-md bg-white/5 animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
