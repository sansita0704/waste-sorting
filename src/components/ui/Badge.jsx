const TONES = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  zinc: "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function Badge({ children, tone = "green", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
