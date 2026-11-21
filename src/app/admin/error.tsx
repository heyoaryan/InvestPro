"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 5V8M8 11H8.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="8" r="6.5" stroke="#f87171" strokeWidth="1.5"/>
        </svg>
      </div>
      <div>
        <p className="text-white font-medium text-sm">Something went wrong</p>
        <p className="text-neutral-500 text-xs mt-1">An error occurred while loading this page</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
