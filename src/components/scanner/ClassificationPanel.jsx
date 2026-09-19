import { Layers, Loader2, QrCode, Recycle, ScanLine, ShieldCheck, Weight } from "lucide-react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import StatTile from "../ui/StatTile";
import ContaminationMeter from "./ContaminationMeter";
import PrepChecklist from "./PrepChecklist";

export default function ClassificationPanel({ detection, tokenStatus, tokenError, onGenerateToken }) {
  if (!detection) {
    return (
      <Card className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
          <ScanLine size={22} className="text-zinc-500" aria-hidden="true" />
        </div>
        <p className="font-medium text-white">No item detected</p>
        <p className="max-w-xs text-sm text-zinc-500">
          Launch the camera and hold an item in view. Results appear here.
        </p>
      </Card>
    );
  }

  const issuing = tokenStatus === "loading";

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500">Identified object</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{detection.className}</h2>
        </div>
        <Badge>
          <Recycle size={12} aria-hidden="true" />
          {detection.category}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={ShieldCheck} label="Confidence" value={`${(detection.confidence * 100).toFixed(1)}%`} />
        <StatTile icon={Weight} label="Weight" value={`${detection.weightG}g`} />
        <StatTile icon={Layers} label="Material" value={detection.grade} />
      </div>

      <ContaminationMeter {...detection.contamination} />

      {/* key resets checked steps when the detected item changes */}
      <PrepChecklist key={detection.className} steps={detection.steps} />

      {tokenStatus === "error" && (
        <p role="alert" className="text-sm text-red-400">
          Couldn't generate a token. {tokenError?.message}
        </p>
      )}

      <button
        type="button"
        onClick={onGenerateToken}
        disabled={issuing}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-60"
      >
        {issuing ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <QrCode size={16} aria-hidden="true" />
        )}
        Generate QR Disposal Token
      </button>
    </Card>
  );
}
