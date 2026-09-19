import { useState } from "react";
import { Check } from "lucide-react";

export default function PrepChecklist({ steps }) {
  const [checked, setChecked] = useState({});
  const done = steps.filter((_, i) => checked[i]).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Required preparation steps</h3>
        <span className="text-xs text-zinc-500">
          {done}/{steps.length} done
        </span>
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={step}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                checked[i]
                  ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-400"
                  : "border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                className="peer sr-only"
              />
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 ${
                  checked[i] ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-600"
                }`}
              >
                {checked[i] && <Check size={13} strokeWidth={3} aria-hidden="true" />}
              </span>
              <span className={checked[i] ? "line-through" : ""}>{step}</span>
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}
