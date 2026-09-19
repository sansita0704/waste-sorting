import { Flame } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getLedgerSummary } from "../../services/ledgerService";
import AsyncView from "../ui/AsyncView";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import StatTile from "../ui/StatTile";
import WeeklyActivityChart from "./WeeklyActivityChart";

export default function EcoLedger() {
  const query = useAsyncData(getLedgerSummary);

  return (
    <Card className="flex flex-col gap-5 p-5">
      <AsyncView query={query} skeletonClassName="h-80">
        {(ledger) => (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500">Lifetime balance</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {ledger.points} <span className="text-lg font-medium text-emerald-400">EcoPoints</span>
                </p>
              </div>
              <Badge>
                <Flame size={12} aria-hidden="true" /> {ledger.streakDays}D Streak
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Items scanned" value={ledger.itemsScanned} />
              <StatTile label="Success accuracy" value={`${ledger.accuracyPct}%`} />
              <StatTile label="CO2 offset" value={`${ledger.co2OffsetKg}kg`} />
            </div>

            <WeeklyActivityChart data={ledger.weekly} />
          </>
        )}
      </AsyncView>
    </Card>
  );
}
