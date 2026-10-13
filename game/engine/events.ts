import type { GameState, GameEventDef } from "./types";
import { GAME_EVENTS } from "../data/systems";
import { rngFor } from "./rng";
import { clamp } from "./core";

/** Called once per in-game day: spawn a random event with probabilistic gating. */
export function maybeSpawnEvent(s: GameState): GameEventDef | null {
  if (s.activeEvents.some((e) => !e.resolved)) return null; // one unresolved event at a time
  const rng = rngFor(s.seed, `evt-${s.day}`);
  if (!rng.chance(0.22)) return null;

  const pool = GAME_EVENTS.filter((e) => {
    if (e.minDay && s.day < e.minDay) return false;
    if (e.requiresActiveExpedition && !(s.expedition && s.expedition.phase === "active")) return false;
    return true;
  });
  if (!pool.length) return null;
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let r = rng.next() * total;
  let chosen = pool[0];
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) { chosen = e; break; }
  }
  s.activeEvents.push({ eventId: chosen.id, day: s.day });
  s.eventHistory.push({ day: s.day, eventId: chosen.id });
  s.journal.push({ day: s.day, kind: "event", entry: `Event: ${chosen.title}.` });
  return chosen;
}

export interface EventResolution {
  ok: boolean;
  reason?: string;
  text?: string;
  rngOutcome?: "success" | "failure";
}

/** Apply the player's chosen option for the active event. */
export function resolveEvent(s: GameState, optionId: string): EventResolution {
  const active = s.activeEvents.find((e) => !e.resolved);
  if (!active) return { ok: false, reason: "No active event." };
  const def = GAME_EVENTS.find((e) => e.id === active.eventId);
  if (!def) return { ok: false, reason: "Unknown event." };
  const opt = def.options.find((o) => o.id === optionId);
  if (!opt) return { ok: false, reason: "Unknown option." };

  // deterministic costs
  if (opt.cost) {
    const c = opt.cost;
    if (c.cash && s.resources.cash < c.cash) return { ok: false, reason: `Not enough cash (need ${c.cash}đ).` };
    if (c.research && s.resources.research < c.research) return { ok: false, reason: `Not enough research points (need ${c.research}).` };
    if (c.supplies && s.resources.supplies < c.supplies) return { ok: false, reason: `Not enough field supplies (need ${c.supplies}).` };
    if (c.energy && s.resources.energy < c.energy) return { ok: false, reason: `Not enough team energy (need ${c.energy}).` };
    if (c.cash) s.resources.cash -= c.cash;
    if (c.research) s.resources.research -= c.research;
    if (c.supplies) s.resources.supplies -= c.supplies;
    if (c.energy) s.resources.energy -= c.energy;
  }

  // deterministic effects
  let text = "";
  if (opt.effects) {
    const eff = opt.effects;
    if (eff.reputation) s.resources.reputation = Math.max(0, s.resources.reputation + eff.reputation);
    if (eff.morale) s.morale = clamp(s.morale + eff.morale, 10, 100);
    if (eff.suppliesDelta) s.resources.supplies = Math.max(0, s.resources.supplies + eff.suppliesDelta);
    if (eff.expeditionProgress && s.expedition && s.expedition.phase === "active") {
      // positive = speed up (reduce remaining), negative = delay
      s.expedition.elapsedDays = Math.max(0, s.expedition.elapsedDays - eff.expeditionProgress);
    }
    if (eff.damageRisk && s.expedition && s.expedition.phase === "active") {
      s.expedition.eventLog.push({ day: s.day, text: `Damage risk modified (${eff.damageRisk > 0 ? "increased" : "reduced"}).`, kind: "info" });
    }
    if (eff.unlockFlag) s.flags[eff.unlockFlag] = true;
  }

  // rng-gated outcomes
  if (opt.rng) {
    const rng = rngFor(s.seed, `evtres-${active.day}-${def.id}`);
    const success = rng.chance(clamp(opt.rng.p * (s.difficulty === "story" ? 1.15 : s.difficulty === "expert" ? 0.9 : 1), 0.05, 0.95));
    if (success) {
      text = opt.rng.successText;
      if (opt.rng.successEffects) {
        if (opt.rng.successEffects.reputation) s.resources.reputation = Math.max(0, s.resources.reputation + opt.rng.successEffects.reputation);
        if (opt.rng.successEffects.morale) s.morale = clamp(s.morale + opt.rng.successEffects.morale, 10, 100);
      }
    } else {
      text = opt.rng.failureText;
      if (opt.rng.failureEffects) {
        if (opt.rng.failureEffects.reputation) s.resources.reputation = Math.max(0, s.resources.reputation + opt.rng.failureEffects.reputation);
        if (opt.rng.failureEffects.morale) s.morale = clamp(s.morale + opt.rng.failureEffects.morale, 10, 100);
      }
      // failure may degrade most recent artifact
      if (def.id === "conservation-crisis" || def.id === "rain") {
        const fragile = s.artifacts.filter((a) => a.condition === "fragile" || a.condition === "poor");
        if (fragile.length) {
          const order = ["good", "fair", "poor", "fragile"] as const;
          const idx = order.indexOf(fragile[fragile.length - 1].condition as typeof order[number]);
          if (idx >= 0 && idx < 3) fragile[fragile.length - 1].condition = order[idx + 1];
        }
      }
    }
  } else {
    text = opt.effectText || "Decision recorded.";
  }

  active.resolved = optionId;
  s.journal.push({ day: s.day, kind: "event", entry: `${def.title}: chose "${opt.label}". ${text}` });
  return { ok: true, text };
}

export function activeEventDef(s: GameState): GameEventDef | null {
  const active = s.activeEvents.find((e) => !e.resolved);
  if (!active) return null;
  return GAME_EVENTS.find((e) => e.id === active.eventId) ?? null;
}
