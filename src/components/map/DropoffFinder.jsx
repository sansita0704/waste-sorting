import { Navigation } from "lucide-react";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getNearestHub } from "../../services/disposalService";
import AsyncView from "../ui/AsyncView";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import MapCanvas from "./MapCanvas";

export default function DropoffFinder() {
  const query = useAsyncData(getNearestHub);

  return (
    <Card className="overflow-hidden">
      <MapCanvas />
      <div className="p-5">
        <AsyncView query={query} skeletonClassName="h-16">
          {(hub) => (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">Nearest e-waste & recycling hub</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{hub.name}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                  <Badge>{hub.distanceKm}km away</Badge>
                  {hub.hours}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <Navigation size={16} aria-hidden="true" />
                Directions
              </a>
            </div>
          )}
        </AsyncView>
      </div>
    </Card>
  );
}
