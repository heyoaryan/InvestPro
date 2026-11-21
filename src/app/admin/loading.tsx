export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="pt-1">
        <div className="h-5 w-32 bg-neutral-800 rounded-lg" />
        <div className="h-3.5 w-24 bg-neutral-800 rounded mt-2" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
        ))}
      </div>
      <div className="h-64 bg-neutral-800/60 rounded-2xl border border-white/[0.04]" />
    </div>
  );
}
