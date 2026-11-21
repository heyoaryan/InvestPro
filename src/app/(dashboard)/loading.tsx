export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pt-1">
        <div className="h-5 w-36 bg-neutral-800 rounded-lg" />
        <div className="h-3.5 w-48 bg-neutral-800 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-36 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
        <div className="h-36 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
      </div>
      <div className="h-6 bg-neutral-800/60 rounded-full w-full" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
        <div className="h-48 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
      </div>
      <div className="h-56 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
    </div>
  );
}
