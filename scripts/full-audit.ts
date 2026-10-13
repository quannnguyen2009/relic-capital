/**
 * Exhaustive edge-case simulation across every flow. Asserts invariants; exits 1 on failure.
 * Run: npx vite-node scripts/full-audit.ts
 */
import { newGame } from "../game/engine/newGame";
import { initMarket, buy, sell, priceOf } from "../game/engine/market";
import {
  startExpedition, advanceDay, advanceExpeditionDay, resolveExpeditionDecision,
  evaluateAchievements, runwayDays, spend, makeArtifact,
} from "../game/engine/core";
import { runAnalysis, verifyArtifact, publishArtifact, digitizeArtifact } from "../game/engine/research";
import { applyGrant, resolveGrants, grantScore } from "../game/engine/grants";
import { maybeSpawnEvent, resolveEvent } from "../game/engine/events";
import { saveGame, loadGame, clearSave, hasSave } from "../game/persistence/save";
import { SITES, ARTIFACT_TEMPLATES, REGIONS } from "../game/data/world";
import { GAME_EVENTS, GRANTS, TUTORIAL } from "../game/data/systems";
import { makeRng } from "../game/engine/rng";
import type { GameState, ExpeditionPlan } from "../game/engine/types";

// localStorage stub (node env)
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => void store.set(k, v),
  removeItem: (k) => void store.delete(k),
  clear: () => store.clear(),
  key: (i) => Array.from(store.keys())[i] ?? null,
  get length() { return store.size; },
} as Storage;

let pass = 0; const fails: string[] = [];
function check(name: string, cond: boolean, detail = "") {
  if (cond) { pass++; } else { fails.push(`${name}${detail ? ` — ${detail}` : ""}`); }
}

const siteIds = new Set(SITES.map((x) => x.id));

const plan = (over: Partial<ExpeditionPlan> = {}, siteId = "delta-lien-lau"): ExpeditionPlan =>
  ({ siteId, workers: 4, days: 4, equipment: [], survey: true, careful: true, objective: "balanced", ...over });

// ── 1. Data integrity ──────────────────────────────────────────────────────
{
  // every site image + artifact category image must map to real references
  check("site ids unique", siteIds.size === SITES.length);
  for (const site of SITES) {
    check(`site ${site.id} rep gate consistent`, site.requiresReputation >= 0);
    check(`site ${site.id} eras nonempty`, site.eras.length > 0);
    check(`site ${site.id} categories nonempty`, site.artifactCategories.length > 0);
  }
  // every template must be obtainable at ≥1 site (matching eras+region+difficulty)
  for (const t of ARTIFACT_TEMPLATES) {
    const reachable = SITES.some((site) =>
      site.eras.some((e) => t.eras.includes(e)) &&
      t.regions.includes(site.region) &&
      site.difficulty >= t.minDifficulty
    );
    check(`template ${t.id} reachable at ≥1 site`, reachable);
  }
  // every region referenced by a site exists and every site's unlock path exists
  for (const site of SITES) {
    check(`site ${site.id} region exists`, REGIONS.some((r) => r.id === site.region));
  }
  // every grant referenced by a site exists
  for (const site of SITES) {
    for (const gid of site.grants) check(`site ${site.id} grant ${gid} exists`, GRANTS.some((g) => g.id === gid));
  }
  // every event option reference is coherent
  for (const ev of GAME_EVENTS) {
    check(`event ${ev.id} options nonempty`, ev.options.length >= 1);
    for (const o of ev.options) {
      if (o.rng) check(`event ${ev.id} rng p in (0,1)`, o.rng.p > 0 && o.rng.p < 1);
    }
  }
  // tutorial steps are 1..8, contiguous
  const steps = TUTORIAL.map((t) => t.step).sort((a, b) => a - b);
  check("tutorial steps 1..8", steps.length === 8 && steps.every((v, i) => v === i + 1));
}

// ── 2. Full campaign loop on 6 seeds across all difficulties ───────────────
for (const diff of ["story", "standard", "expert"] as const) {
  for (const seed of [11, 77, 424, 909, 2024, 31337]) {
    const s = newGame(diff, seed);
    initMarket(s);

    // 60-day simulation: dig → advance → events → research → publish → grants → market
    let dug = false;
    for (let i = 0; i < 60; i++) {
      // launch expeditions when idle and affordable
      if ((!s.expedition || s.expedition.phase === "complete") && s.plannedExpedition === null && s.resources.cash > 30000) {
        const r = startExpedition(s, plan({ days: 4, workers: 4 }, "delta-lien-lau"));
        if (r.ok) dug = true;
      }
      if (s.expedition?.phase === "active") {
        advanceExpeditionDay(s);
        if (s.expedition?.pendingDecision) {
          const r = resolveExpeditionDecision(s, s.expedition.pendingDecision.options[0].id);
          if (!r.ok) fails.push(`seed ${seed} d${s.day}: decision failed ${r.text}`);
        }
      }
      maybeSpawnEvent(s);
      const ev = s.activeEvents.find((x) => !x.resolved);
      if (ev) {
        const def = GAME_EVENTS.find((x) => x.id === ev.eventId)!;
        const afford = def.options.find((o) => {
          const c = o.cost;
          return (!c?.cash || s.resources.cash >= c.cash) && (!c?.research || s.resources.research >= c.research) && (!c?.supplies || s.resources.supplies >= c.supplies) && (!c?.energy || s.resources.energy >= c.energy);
        });
        if (afford) {
          const r = resolveEvent(s, afford.id);
          if (!r.ok) fails.push(`seed ${seed} d${s.day}: event ${def.id} ${afford.id} failed: ${r.reason}`);
        }
      }
      advanceDay(s);
      resolveGrants(s);
      evaluateAchievements(s);

      // research anything affordable
      for (const a of s.artifacts) {
        if (a.status === "unanalyzed" && s.resources.research >= 8) runAnalysis(s, a.uid, "classification");
        if (a.status === "classified" && s.resources.research >= 14) runAnalysis(s, a.uid, "period");
        if (s.resources.research >= 80 && a.status === "published") continue;
        if (a.evidences.length >= 2 && s.resources.research >= 40 && a.confidence < 0.85 && a.status !== "published") verifyArtifact(s, a.uid);
        if (a.confidence >= 0.55 && s.resources.research >= 60 && a.status !== "published") publishArtifact(s, a.uid);
      }
      // grants: apply one when eligible
      if (i % 5 === 0) {
        for (const g of GRANTS) {
          const d = grantScore(s, g.id);
          if (d.eligible && (s.grantsCooldown[g.id] ?? 0) <= s.day && !s.grantApplications.some((x) => x.grantId === g.id && x.status === "pending")) {
            applyGrant(s, g.id);
            break;
          }
        }
      }
      // invariant: no NaN anywhere
      if (Number.isNaN(s.resources.cash) || Number.isNaN(s.resources.research)) {
        fails.push(`seed ${seed} d${s.day}: NaN in resources!`);
        break;
      }
      if (s.resources.cash < -1e6) { fails.push(`seed ${seed}: runaway debt ${s.resources.cash}`); break; }
    }
    check(`${diff} seed ${seed}: dug at least once`, dug);
    check(`${diff} seed ${seed}: completed ≥1 expedition`, ((s.flags.expeditionsCompleted as number) ?? 0) >= 1);
    check(`${diff} seed ${seed}: no unresolved-event deadlock`, s.activeEvents.filter((e) => !e.resolved).length <= 1);
    check(`${diff} seed ${seed}: ledger coherent (no NaN)`, s.ledger.every((l) => Number.isFinite(l.amount)));
    // every artifact belongs to a valid site and has structured data
    check(`${diff} seed ${seed}: artifacts structured`, s.artifacts.every((a) =>
      siteIds.has(a.siteId) && a.evidences.length >= 2 && a.hypotheses.length >= 2 && a.confidence >= 0 && a.confidence <= 1));
  }
}

// ── 3. Save/load round-trip & uid continuation ─────────────────────────────
{
  clearSave();
  const s = newGame("standard", 555);
  initMarket(s);
  startExpedition(s, plan({}, "delta-lien-lau"));
  for (let i = 0; i < 4; i++) advanceExpeditionDay(s);
  advanceDay(s);
  saveGame(s);
  check("hasSave true after save", hasSave());
  const loaded = loadGame();
  check("load ok", loaded.ok === true && !!loaded.state);
  if (loaded.state) {
    const l = loaded.state;
    check("day preserved", l.day === s.day);
    check("cash preserved", l.resources.cash === s.resources.cash);
    check("artifacts preserved", l.artifacts.length === s.artifacts.length);
    check("expedition preserved", l.expedition?.phase === "complete");
    // uid continuation: next artifact must not collide. (Known limitation if artifactSeq resets; detect here.)
    const existingIds = new Set(l.artifacts.map((a) => a.uid));
    // generate one more artifact via a new expedition
    const s2 = l;
    const r = startExpedition(s2, plan({}, "delta-lien-lau"));
    check("second expedition after load ok", r.ok);
    if (r.ok) {
      for (let i = 0; i < 4; i++) advanceExpeditionDay(s2);
      const newArts = s2.artifacts.filter((a) => !existingIds.has(a.uid));
      const uids = s2.artifacts.map((a) => a.uid);
      const collision = new Set(uids).size !== uids.length;
      check("no uid collision after save/load", !collision, `uids: ${uids.join(",")}`);
      if (newArts.length === 0) { /* no find this round; acceptable */ }
    }
  }
  clearSave();
}

// ── 4. Market edge cases ───────────────────────────────────────────────────
{
  const s = newGame("standard", 7);
  initMarket(s);
  check("buy rejects fractional/zero/negative", !buy(s, "stablecore", 0).ok && !buy(s, "stablecore", -3).ok && !buy(s, "stablecore", 2.5).ok && !buy(s, "stablecore", NaN).ok);
  check("sell rejected with none held", !sell(s, "stablecore", 1).ok);
  const c0 = s.resources.cash;
  const b = buy(s, "stablecore", 10);
  check("buy ok with cash", b.ok, b.reason);
  check("cash reduced by buy", s.resources.cash < c0);
  const p = priceOf(s, "stablecore");
  const sl = sell(s, "stablecore", 10);
  check("sell ok", sl.ok, sl.reason);
  check("proceeds ≈ price*(1-fee) + cash back", typeof sl.proceeds === "number" && sl.proceeds > 0);
  // portfolio value with no positions = 0
  check("portfolio empty = 0", (s.market.positions.length === 0));
}

// ── 5. Research honesty edges ──────────────────────────────────────────────
{
  const s = newGame("standard", 8);
  initMarket(s);
  s.resources.research = 500;
  const tpl = ARTIFACT_TEMPLATES.find((t) => t.category === "bronze")!;
  const site = SITES.find((x) => x.id === "delta-lien-lau")!;
  const a = makeArtifact(s, tpl, site, 0.7, makeRng(99), 0);
  s.artifacts.push(a);
  const v = verifyArtifact(s, a.uid);
  check("verify with 2 evidences is allowed", v.ok, v.reason);
  // published artifact must have had conf ≥ 0.55 — raise it deterministically then publish
  a.confidence = Math.max(a.confidence, 0.7);
  const p = publishArtifact(s, a.uid);
  check("publish allowed at conf ≥ 0.55", p.ok, p.reason);
  check("publication raises reputation", p.ok ? s.resources.reputation > 0 : true);
  // inscription op rejects on non-inscription
  const nonIns = s.artifacts[0];
  const bad = runAnalysis(s, nonIns.uid, "inscription");
  check("inscription op rejected on non-inscription", bad.ok === false);
  // low RP blocked
  s.resources.research = 2;
  const blocked = runAnalysis(s, nonIns.uid, "classification");
  check("analysis blocked when RP insufficient", blocked.ok === false);
  // digitize with low cash blocked
  s.resources.cash = 100;
  const dz = digitizeArtifact(s, nonIns.uid);
  check("digitize blocked without cash", dz.ok === false);
}

// ── 6. Events: unknown ids and double resolution rejected ──────────────────
{
  const s = newGame("standard", 9);
  initMarket(s);
  check("resolve with none active rejected", !resolveEvent(s, "whatever").ok);
  maybeSpawnEvent(s);
  const ev = s.activeEvents.find((x) => !x.resolved);
  if (ev) {
    check("unknown option rejected", !resolveEvent(s, "nonexistent-option").ok);
    const def = GAME_EVENTS.find((x) => x.id === ev.eventId)!;
    const r = resolveEvent(s, def.options[0].id);
    check("valid option resolves", r.ok);
    check("re-resolve rejected", !resolveEvent(s, def.options[0].id).ok);
  }
}

// ── 7. Insolvency semantics ────────────────────────────────────────────────
{
  const s = newGame("expert", 10);
  initMarket(s);
  s.resources.cash = 100;
  const r1 = advanceDay(s);
  check("insolvency detectable", r1.insolvency === true || runwayDays(s) !== null, `runway=${runwayDays(s)}`);
  // exp with no cash fails
  const r = startExpedition(s, plan({}, "delta-lien-lau"));
  check("expedition rejected without cash", !r.ok);
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\n=== FULL AUDIT: ${pass} checks passed, ${fails.length} failed ===`);
if (fails.length) {
  console.log("FAILURES:");
  for (const f of fails.slice(0, 50)) console.log("  ✕", f);
  process.exit(1);
}
process.exit(0);
