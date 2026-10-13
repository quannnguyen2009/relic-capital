import type { GameState } from "../engine/types";
import { SAVE_VERSION, SAVE_KEY } from "../engine/types";
import { newGame } from "../engine/newGame";

/** Generic deep-merge fallback: load a save, filling any missing new fields. */
export function saveGame(s: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    localStorage.setItem(SAVE_KEY + "-meta", JSON.stringify({ savedAt: Date.now(), day: s.day }));
    return true;
  } catch {
    return false;
  }
}

export interface LoadResult {
  ok: boolean;
  state?: GameState;
  reason?: string;
}

export function loadGame(): LoadResult {
  try {
    const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem("digging-for-alpha-save-v3");
    if (!raw) return { ok: false, reason: "No save found." };
    const parsed = JSON.parse(raw);
    const res = validate(parsed);
    if (!res.ok) return res;
    // migrate: fill missing fields from a fresh game
    const fresh = newGame(parsed.difficulty ?? "standard", parsed.seed ?? Date.now() % 1e9);
    const merged: GameState = {
      ...fresh,
      ...parsed,
      resources: { ...fresh.resources, ...(parsed.resources ?? {}) },
      market: {
        ...fresh.market,
        ...(parsed.market ?? {}),
        prices: parsed.market?.prices ?? fresh.market.prices,
        positions: parsed.market?.positions ?? [],
        trades: parsed.market?.trades ?? [],
        events: parsed.market?.events ?? [],
        watchlist: parsed.market?.watchlist ?? [],
      },
      flags: { ...(parsed.flags ?? {}) },
    };
    // Migration: saves created before the hard-gated tutorial have no flags —
    // treat them as finished players (free navigation), never locked out.
    if (typeof parsed.tutorialActive !== "boolean") {
      merged.tutorialActive = false;
      merged.tutorialReplay = false;
    }
    if (merged.version !== SAVE_VERSION) merged.version = SAVE_VERSION;
    return { ok: true, state: merged };
  } catch (e) {
    return { ok: false, reason: "Save data corrupted. Starting fresh is safest — use New Game." };
  }
}

function validate(d: unknown): LoadResult {
  if (typeof d !== "object" || d === null) return { ok: false, reason: "Malformed save." };
  const d2 = d as Record<string, unknown>;
  if (typeof d2.day !== "number" || typeof d2.seed !== "number") return { ok: false, reason: "Missing core fields." };
  if (typeof d2.resources !== "object") return { ok: false, reason: "Missing resources." };
  return { ok: true };
}

export function hasSave(): boolean {
  try {
    return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem("digging-for-alpha-save-v3"));
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY + "-meta");
    localStorage.removeItem("digging-for-alpha-save-v3");
    localStorage.removeItem("digging-for-alpha-save-v3-meta");
  } catch {
    /* noop */
  }
}
