export default function ContaminationMeter({ level, label, score }) {
  const text = `${level} - ${label}`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-zinc-400">Contamination risk</span>
        <span className="font-medium text-emerald-400">{text}</span>
      </div>
      <div
        role="meter"
        aria-label="Contamination risk"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(score * 100)}
        aria-valuetext={text}
        className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
      >
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${score * 100}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-zinc-600">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
