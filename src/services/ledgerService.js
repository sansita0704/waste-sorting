import { USE_MOCK } from "../config/env";
import { request } from "./http";
import { MOCK_LEDGER, MOCK_LEADERBOARD, wait } from "./mockData";

/**
 * GET /api/v1/ledger/summary
 * -> { points, streak_days, items_scanned, accuracy_pct, co2_offset_kg, weekly: [{day, items}] }
 * @returns {Promise<import("../types/contracts").LedgerSummary>}
 */
export async function getLedgerSummary({ signal } = {}) {
  if (USE_MOCK) {
    await wait(300, signal);
    return MOCK_LEDGER;
  }
  const raw = await request("/api/v1/ledger/summary", { signal });
  return {
    points: raw.points,
    streakDays: raw.streak_days,
    itemsScanned: raw.items_scanned,
    accuracyPct: raw.accuracy_pct,
    co2OffsetKg: raw.co2_offset_kg,
    weekly: raw.weekly,
  };
}

/**
 * GET /api/v1/leaderboard -> [{ id, name, points, streak_days, is_you }]
 * @returns {Promise<import("../types/contracts").LeaderboardEntry[]>}
 */
export async function getLeaderboard({ signal } = {}) {
  if (USE_MOCK) {
    await wait(300, signal);
    return MOCK_LEADERBOARD;
  }
  const raw = await request("/api/v1/leaderboard", { signal });
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    points: r.points,
    streakDays: r.streak_days,
    isYou: r.is_you,
  }));
}
