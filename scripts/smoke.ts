import { newGame } from "../game/engine/newGame";
import { initMarket, buy, priceOf } from "../game/engine/market";
import { startExpedition, advanceDay, advanceExpeditionDay, resolveExpeditionDecision } from "../game/engine/core";
import { runAnalysis, verifyArtifact, publishArtifact } from "../game/engine/research";
import { applyGrant, resolveGrants } from "../game/engine/grants";
import { maybeSpawnEvent, resolveEvent } from "../game/engine/events";
import { GAME_EVENTS } from "../game/data/systems";
import type { GameState } from "../game/engine/types";

const s: GameState = newGame("standard", Number(process.env.SEED ?? 4242));
initMarket(s);
console.log("START  day", s.day, "cash", s.resources.cash);

// Step 2–4: plan & launch at the starting site
const plan = { siteId: "delta-lien-lau", workers: 4, days: 4, equipment: [], survey: true, careful: true, objective: "balanced" as const };
const launch = startExpedition(s, plan);
console.log("LAUNCH ok=", launch.ok, "cash after", Math.round(s.resources.cash));

// 14 game days: dig, decide, resolve events, advance
let eventCount = 0;
for (let i = 0; i < 14; i++) {
  if (s.expedition?.phase === "active") {
    advanceExpeditionDay(s);
    if (s.expedition?.pendingDecision) resolveExpeditionDecision(s, s.expedition.pendingDecision.options[0].id); // follow the sounding
  }
  maybeSpawnEvent(s);
  const ev = s.activeEvents.find((x) => !x.resolved);
  if (ev) {
    eventCount++;
    const def = GAME_EVENTS.find((x) => x.id === ev.eventId)!;
    const cheap = [...def.options].sort((a, b) => (a.cost?.cash ?? 0) - (b.cost?.cash ?? 0))[0];
    const rr = resolveEvent(s, cheap.id);
    if (!rr.ok) console.log("  event resolve failed:", rr.reason);
  }
  advanceDay(s);
  resolveGrants(s);
}
console.log("DAY14  day", s.day, "cash", Math.round(s.resources.cash), "artifacts", s.artifacts.length, "rep", s.resources.reputation, "events handled", eventCount);

// Step 5–6: analyze + verify (grant RP so the verify path is exercised deterministically)
s.resources.research = Math.max(s.resources.research, 120);
for (const a of s.artifacts) {
  if (a.status === "unanalyzed") runAnalysis(s, a.uid, "classification");
  if (a.status === "classified") runAnalysis(s, a.uid, "period");
  if (a.status === "classified") runAnalysis(s, a.uid, "refMatch");
}
const target = s.artifacts.find((a) => a.evidences.length >= 2);
if (target) {
  const v = verifyArtifact(s, target.uid) as { ok: boolean; reason?: string; result?: string };
  console.log("VERIFY ok=", v.ok, v.ok ? `result=${v.result}` : `reason=${v.reason}`, "conf now", Math.round(target.confidence * 100), "evidences", target.evidences.length);
} else {
  console.log("VERIFY skipped — no artifact with ≥2 evidence (evidence counts:", s.artifacts.map((a) => a.evidences.length).join(",") + ")");
}
s.resources.research = Math.max(s.resources.research, 60);
const pub = s.artifacts.find((a) => a.confidence >= 0.55);
if (pub) {
  const p = publishArtifact(s, pub.uid);
  console.log("PUBLISH ok=", p.ok, "cash now", Math.round(s.resources.cash));
}

// Market sanity: buy & sell a small position on the stable fund
const c0 = s.resources.cash;
const b = buy(s, "stablecore", 5);
const p1 = priceOf(s, "stablecore");
c0 === c0; // silence lints
console.log("BUY ok=", b.ok, "price", p1.toFixed(2), "cash", Math.round(s.resources.cash));

// grant pipeline (documentation likely ineligible this early — engine must say so cleanly)
const g = applyGrant(s, "documentation");
console.log("GRANT apply ok=", g.ok, g.reason ?? "");

console.log("RUNWAY check — ledger entries:", s.ledger.length, "net last 10:", Math.round(s.ledger.slice(-10).reduce((a, e) => a + e.amount, 0)));
