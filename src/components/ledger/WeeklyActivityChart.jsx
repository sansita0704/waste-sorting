/** Bar chart for the last 7 days. `data`: [{ day, items }] oldest first. */
export default function WeeklyActivityChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.items));
  const summary = data.map((d) => `${d.day} ${d.items}`).join(", ");

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-white">Weekly activity · past 7 days</h3>
      <div className="flex h-36 items-end gap-2" role="img" aria-label={`Items scanned per day: ${summary}`}>
        {data.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-xs text-zinc-500">{d.items}</span>
            <div
              className={`w-full rounded-md ${i === data.length - 1 ? "bg-emerald-500" : "bg-emerald-500/30"}`}
              style={{ height: `${(d.items / max) * 100}%` }}
            />
            <span className="text-xs text-zinc-500">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
