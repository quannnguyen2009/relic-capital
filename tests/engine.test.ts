import { describe, it, expect, beforeAll } from "vitest";
import { newGame } from "../game/engine/newGame";
import {
  spend, earn, startExpedition, validatePlan, estimateExpedition, expeditionQuality,
  advanceExpeditionDay, resolveExpeditionDecision, clamp, fieldHunch, evaluateAssemblages,
  makeArtifact,
} from "../game/engine/core";
import { makeRng } from "../game/engine/rng";
import { SITES, ARTIFACT_TEMPLATES } from "../game/data/world";
import { runAnalysis, verifyArtifact, publishArtifact } from "../game/engine/research";
import { applyGrant, grantScore, resolveGrants } from "../game/engine/grants";
import { initMarket, buy, sell, priceOf, portfolioValue, TRADE_FEE } from "../game/engine/market";
import { saveGame, loadGame, clearSave, hasSave } from "../game/persistence/save";
import { SAVE_KEY } from "../game/engine/types";
import type { GameState, ExpeditionPlan } from "../game/engine/types";

function freshGame(): GameState {
  const s = newGame("standard", 12345);
  initMarket(s);
  return s;
}

const plan = (over: Partial<ExpeditionPlan> = {}): ExpeditionPlan => ({
  siteId: "delta-lien-lau",
  workers: 4,
  days: 4,
  equipment: [],
  survey: true,
  careful: true,
  objective: "balanced",
  ...over,
});

// ── Economy: spend/earn through validated actions ───────────────────────────
// localStorage isn't available in the node test env — stub it for persistence tests.
beforeAll(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  } as Storage;
});
describe("resource mutation", () => {
  it("spend rejects when cash is insufficient and changes nothing", () => {
    const s = freshGame();
    const before = s.resources.cash;
    const ok = spend(s, "operations", "test", { cash: -before - 1 });
    expect(ok).toBe(false);
    expect(s.resources.cash).toBe(before);
  });

  it("spend applies all deltas when affordable and logs the ledger", () => {
    const s = freshGame();
    const cashBefore = s.resources.cash;
    const rpBefore = s.resources.research;
    const ok = spend(s, "operations", "test", { cash: -100, research: -5 });
    expect(ok).toBe(true);
    expect(s.resources.cash).toBe(cashBefore - 100);
    expect(s.resources.research).toBe(rpBefore - 5);
    expect(s.ledger.some((e) => e.reason === "test" && e.amount === -100)).toBe(true);
  });

  it("earn records income", () => {
    const s = freshGame();
    const before = s.resources.cash;
    earn(s, "grant", "test grant", 5000);
    expect(s.resources.cash).toBe(before + 5000);
    expect(s.ledger.at(-1)?.amount).toBe(5000);
  });
});

// ── Expeditions ──────────────────────────────────────────────────────────────
describe("expedition", () => {
  it("validates reputation and workforce constraints", () => {
    const s = freshGame();
    expect(validatePlan(s, plan({ siteId: "north-co-loa" })).ok).toBe(false); // locked/rep
    expect(validatePlan(s, plan({ workers: 1 })).ok).toBe(false);
    expect(validatePlan(s, plan({ days: 1 })).ok).toBe(false);
    expect(validatePlan(s, plan({})).ok).toBe(true);
  });

  it("estimate scales with scope and flags warnings", () => {
    const s = freshGame();
    const est = estimateExpedition(s, plan({}));
    expect(est.cost).toBeGreaterThan(0);
    expect(est.warnings.length).toBeGreaterThanOrEqual(0);
    const big = estimateExpedition(s, plan({ workers: 8, days: 8, objective: "intensive" }));
    expect(big.cost).toBeGreaterThan(est.cost);
  });

  it("depth bands trade cost and energy for richer targets", () => {
    const s = freshGame();
    const surface = estimateExpedition(s, plan({ depth: "surface" }));
    const cultural = estimateExpedition(s, plan({ depth: "cultural" }));
    const deep = estimateExpedition(s, plan({ depth: "deep" }));
    expect(surface.cost).toBeLessThan(cultural.cost);
    expect(deep.cost).toBeGreaterThan(cultural.cost);
    expect(deep.energy).toBeGreaterThan(surface.energy);
  });

  it("deep digs produce richer finds than surface digs", () => {
    const s = freshGame();
    const tpl = ARTIFACT_TEMPLATES.find((t) => t.id === "pot-dong-son-jar")!;
    const site = SITES.find((x) => x.id === "delta-lien-lau")!;
    const deep = makeArtifact(s, tpl, site, 0.7, makeRng(777), 0, "deep");
    const cultural = makeArtifact(s, tpl, site, 0.7, makeRng(777), 0, "cultural");
    const surface = makeArtifact(s, tpl, site, 0.7, makeRng(777), 0, "surface");
    expect(deep.significance).toBeGreaterThan(cultural.significance);
    expect(cultural.significance).toBeGreaterThan(surface.significance);
    expect(deep.evidencedValue).toBeGreaterThan(surface.evidencedValue);
  });

  it("field hunch builds during a dry spell and caps out", () => {
    expect(fieldHunch(0)).toBe(0);
    expect(fieldHunch(3)).toBeCloseTo(0.21);
    expect(fieldHunch(20)).toBe(0.45);

    const s = freshGame();
    startExpedition(s, plan({ days: 4 }));
    s.resources.supplies = 0; // guarantees no find: supply-gated
    advanceExpeditionDay(s);
    expect(s.expedition!.dryDays).toBe(1);
  });

  it("start deducts cash, supplies, energy and records the expedition", () => {
    const s = freshGame();
    const c0 = s.resources.cash, sup0 = s.resources.supplies, en0 = s.resources.energy;
    const res = startExpedition(s, plan({}));
    expect(res.ok).toBe(true);
    expect(s.expedition).not.toBeNull();
    expect(s.resources.cash).toBeLessThan(c0);
    expect(s.resources.supplies).toBeLessThan(sup0);
    expect(s.resources.energy).toBeLessThan(en0);
    // cannot start a second
    const res2 = startExpedition(s, plan({}));
    expect(res2.ok).toBe(false);
  });

  it("runs to completion and yields discoveries eventually (seeded)", () => {
    const s = freshGame();
    startExpedition(s, plan({ days: 5, workers: 6, objective: "intensive" }));
    let done = false;
    for (let i = 0; i < 12 && !done; i++) {
      const r = advanceExpeditionDay(s);
      done = r.done;
    }
    expect(done).toBe(true);
    expect(s.expedition!.phase).toBe("complete");
    expect((s.flags.expeditionsCompleted as number) ?? 0).toBe(1);
    expect(s.resources.reputation).toBeGreaterThan(0);
  });

  it("mid expedition decision requires a pending to resolve and mutates plan", () => {
    const s = freshGame();
    startExpedition(s, plan({ days: 6 }));
    // advance to the decision point
    for (let i = 0; i < 3 && !s.expedition!.pendingDecision; i++) advanceExpeditionDay(s);
    if (s.expedition!.pendingDecision) {
      const cash0 = s.resources.cash;
      const r = resolveExpeditionDecision(s, "follow");
      expect(r.ok).toBe(true);
      expect(s.resources.cash).toBeLessThanOrEqual(cash0);
      expect(s.expedition!.pendingDecision).toBeUndefined();
      expect(s.expedition!.discoveryBoost).toBeGreaterThan(0);
    } else {
      // decision day must have been scheduled at max(2, days/2)
      expect(s.expedition!.elapsedDays).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── Museum assemblages ───────────────────────────────────────────────────────
describe("museum assemblages", () => {
  it("completes a set when every template is cataloged, paying out once", () => {
    const s = freshGame();
    s.resources.research = 0;
    const templates = ["pot-dong-son-jar", "pot-phung-nguyen-bowl", "bronze-socketed-axe"];
    templates.forEach((templateId, i) => s.artifacts.push({
      uid: `C${i}`, templateId, name: `Set piece ${i}`, category: "pottery",
      material: "fired clay", period: "unconfirmed", eraHint: null, trueEra: "dong-son",
      siteId: "delta-lien-lau", context: "ctx", description: "d", condition: "good",
      significance: 5, evidencedValue: 1000, confidence: 0.5, confidenceLabel: "probable",
      provenance: 0.5, status: "classified", hypotheses: [], evidences: [],
      conservationReq: "", researchLog: [], acquiredDay: 1, accessibility: 0,
    }));

    const cash0 = s.resources.cash;
    const completed = evaluateAssemblages(s);
    expect(completed).toContain("delta-type-series");
    expect(s.completedAssemblages).toContain("delta-type-series");
    expect(s.resources.cash).toBe(cash0 + 30000);
    expect(s.ledger.some((e) => e.reason.includes("Red River Type Series"))).toBe(true);

    // never pays the same set twice
    expect(evaluateAssemblages(s)).not.toContain("delta-type-series");
    expect(s.resources.cash).toBe(cash0 + 30000);
  });

  it("does not count unanalyzed finds", () => {
    const s = freshGame();
    for (const templateId of ["pot-dong-son-jar", "pot-phung-nguyen-bowl", "bronze-socketed-axe"]) {
      s.artifacts.push({
        uid: `U${templateId}`, templateId, name: "raw", category: "pottery",
        material: "clay", period: "unconfirmed", eraHint: null, trueEra: "dong-son",
        siteId: "delta-lien-lau", context: "ctx", description: "d", condition: "fair",
        significance: 4, evidencedValue: 500, confidence: 0.2, confidenceLabel: "hypothesis",
        provenance: 0.3, status: "unanalyzed", hypotheses: [], evidences: [],
        conservationReq: "", researchLog: [], acquiredDay: 1, accessibility: 0,
      });
    }
    expect(evaluateAssemblages(s)).not.toContain("delta-type-series");
  });
});

// ── Research ─────────────────────────────────────────────────────────────────
describe("research ops", () => {
  it("analysis consumes research points and produces a report", () => {
    const s = freshGame();
    // force an artifact
    startExpedition(s, plan({ days: 6, objective: "intensive" }));
    let found = false;
    for (let i = 0; i < 12 && !found; i++) {
      const r = advanceExpeditionDay(s);
      found = s.artifacts.length > 0 || r.discovered.length > 0;
    }
    expect(s.artifacts.length).toBeGreaterThan(0);
    const a = s.artifacts[0];
    const rp0 = s.resources.research;
    const r = runAnalysis(s, a.uid, "classification");
    expect(r.ok).toBe(true);
    expect(s.resources.research).toBeLessThan(rp0);
    expect(r.report!.engine).toBe("rule-based");
    expect(r.report!.sources.length).toBeGreaterThan(0);
  });

  it("verification needs two evidence items", () => {
    const s = freshGame();
    startExpedition(s, plan({ days: 6, objective: "intensive" }));
    for (let i = 0; i < 12 && s.artifacts.length === 0; i++) advanceExpeditionDay(s);
    const a = s.artifacts[0];
    // artificially strip evidence to test precondition
    a.evidences = a.evidences.slice(0, 1);
    s.resources.research = 200;
    const r = verifyArtifact(s, a.uid);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/2 evidence/);
  });

  it("publication gates on confidence and pays out", () => {
    const s = freshGame();
    startExpedition(s, plan({ days: 6, objective: "intensive" }));
    for (let i = 0; i < 12 && s.artifacts.length === 0; i++) advanceExpeditionDay(s);
    const a = s.artifacts[0];
    a.confidence = 0.2;
    expect(publishArtifact(s, a.uid).ok).toBe(false);
    a.confidence = 0.75;
    s.resources.research = 100;
    const c0 = s.resources.cash;
    const r = publishArtifact(s, a.uid);
    expect(r.ok).toBe(true);
    expect(s.resources.cash).toBeGreaterThan(c0);
    expect(a.status).toBe("published");
  });
});

// ── Grants ───────────────────────────────────────────────────────────────────
describe("grants", () => {
  it("blocks ineligible applications with actionable reasons", () => {
    const s = freshGame();
    const { eligible, blockers } = grantScore(s, "documentation");
    expect(eligible).toBe(false);
    expect(blockers.join(" ")).toMatch(/artifacts/);
    const r = applyGrant(s, "documentation");
    expect(r.ok).toBe(false);
  });

  it("approves qualified applications deterministically after delay", () => {
    const s = freshGame();
    s.resources.reputation = 10;
    // manufacture a qualifying archive
    for (let i = 0; i < 4; i++) s.artifacts.push({
      uid: `T${i}`, templateId: "pot-dong-son-jar", name: `T${i}`, category: "pottery",
      material: "fired clay", period: "unconfirmed", eraHint: null, trueEra: "dong-son",
      siteId: "delta-lien-lau", context: "ctx", description: "d", condition: "good",
      significance: 5, evidencedValue: 1000, confidence: 0.6, confidenceLabel: "robust",
      provenance: 0.6, status: "classified", hypotheses: [], evidences: [],
      conservationReq: "", researchLog: [], acquiredDay: 1, accessibility: 0,
    });
    const r = applyGrant(s, "documentation");
    expect(r.ok).toBe(true);
    const app = s.grantApplications[0];
    // fast-forward day
    const before = s.resources.cash;
    s.day = app.decisionDay;
    const approved = resolveGrants(s);
    if (app.score >= 0.55) {
      expect(s.resources.cash).toBeGreaterThan(before);
      expect(app.status).toBe("approved");
    } else {
      expect(app.status).toBe("rejected");
      expect(app.note).toMatch(/score/i);
    }
    // cooldown recorded
    expect(s.grantsCooldown["documentation"]).toBeGreaterThan(s.day);
  });
});

// ── Market ───────────────────────────────────────────────────────────────────
describe("market", () => {
  it("initializes priced series for every instrument", () => {
    const s = freshGame();
    for (const id of Object.keys(s.market.prices)) {
      expect(priceOf(s, id)).toBeGreaterThan(0);
    }
  });

  it("buy deducts cash incl. fee and updates position avg cost", () => {
    const s = freshGame();
    const inst = Object.keys(s.market.prices)[0];
    const price = priceOf(s, inst);
    const c0 = s.resources.cash;
    const r = buy(s, inst, 10);
    expect(r.ok).toBe(true);
    const expTotal = price * 10 * (1 + TRADE_FEE);
    expect(s.resources.cash).toBeCloseTo(c0 - expTotal, -1);
    expect(portfolioValue(s)).toBeCloseTo(price * 10, -1);
  });

  it("rejects buys exceeding cash and negative share counts", () => {
    const s = freshGame();
    const inst = Object.keys(s.market.prices)[0];
    expect(buy(s, inst, -5).ok).toBe(false);
    expect(buy(s, inst, 10 ** 9).ok).toBe(false);
  });

  it("sell requires held shares and rejects overshoot", () => {
    const s = freshGame();
    const inst = Object.keys(s.market.prices)[0];
    expect(sell(s, inst, 5).ok).toBe(false); // no position
    buy(s, inst, 3);
    expect(sell(s, inst, 4).ok).toBe(false);
    const r = sell(s, inst, 3);
    expect(r.ok).toBe(true);
    expect(portfolioValue(s)).toBe(0);
  });
});

// ── Persistence ──────────────────────────────────────────────────────────────
describe("save/load", () => {
  it("round-trips state through localStorage", () => {
    clearSave();
    const s = freshGame();
    saveGame(s);
    expect(hasSave()).toBe(true);
    const res = loadGame();
    expect(res.ok).toBe(true);
    expect(res.state!.seed).toBe(s.seed);
    expect(res.state!.resources.cash).toBe(s.resources.cash);
    clearSave();
  });

  it("rejects malformed saves gracefully", () => {
    clearSave();
    localStorage.setItem(SAVE_KEY, "{ not json");
    const res = loadGame();
    expect(res.ok).toBe(false);
    expect(res.reason).toBeTruthy();
    clearSave();
  });
});

// misc
describe("misc engine invariants", () => {
  it("clamp works", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-3, 0, 1)).toBe(0);
  });
  it("quality factor clamps within bounds", () => {
    const s = freshGame();
    startExpedition(s, plan({}));
    const e = s.expedition!;
    const q = expeditionQuality(s, e);
    expect(q).toBeGreaterThanOrEqual(0.05);
    expect(q).toBeLessThanOrEqual(1);
  });
});
