import { Flame } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getLeaderboard } from "../../services/ledgerService";
import AsyncView from "../ui/AsyncView";
import Card from "../ui/Card";

export default function Leaderboard() {
  const query = useAsyncData(getLeaderboard);

  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">Jaipur leaderboard</h2>
      <AsyncView query={query} skeletonClassName="h-64">
        {(entries) => (
          <ol className="divide-y divide-zinc-800">
            {entries.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-center justify-between gap-4 py-3 ${
                  p.isYou ? "text-emerald-400" : "text-zinc-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 text-sm text-zinc-500">{i + 1}</span>
                  <span className="font-medium">{p.name}</span>
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Flame size={13} aria-hidden="true" />
                    {p.streakDays}d
                  </span>
                  <span className="font-semibold">{p.points} pts</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </AsyncView>
    </Card>
  );
}
