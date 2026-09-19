export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        {Icon && <Icon size={12} aria-hidden="true" />}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
