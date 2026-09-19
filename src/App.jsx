import { useState } from "react";
import Header from "./components/layout/Header";
import { useCamera } from "./hooks/useCamera";
import AnalyticsPage from "./pages/AnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MapPage from "./pages/MapPage";
import ScannerPage from "./pages/ScannerPage";

/**
 * App shell. The camera and mute state live here so they survive page switches
 * (the camera keeps running; the detection loop pauses when Scanner unmounts).
 * If you later need URLs, swap the `view` state for react-router routes.
 */
export default function App() {
  const [view, setView] = useState("scanner");
  const [muted, setMuted] = useState(false);
  const camera = useCamera();

  return (
    <div className="min-h-screen bg-base text-zinc-100">
      <Header view={view} onNavigate={setView} camera={camera} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {view === "scanner" && (
          <ScannerPage camera={camera} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
        )}
        {view === "map" && <MapPage />}
        {view === "analytics" && <AnalyticsPage />}
        {view === "leaderboard" && <LeaderboardPage />}
      </main>
    </div>
  );
}
