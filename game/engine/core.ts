import type {
  GameState, ResourceKey, LedgerEntry, ExpeditionPlan, Expedition, PlayerArtifact,
  ArtifactHypothesis, Evidence, Condition, ArtifactTemplate, EquipmentDef, Site,
} from "./types";
import { rngFor, makeRng } from "./rng";
import { DIFFICULTIES, STAFF_DEFS, EQUIPMENT_DEFS, ACHIEVEMENTS, siteRegionOf, CAMPAIGN } from "../data/systems";
import { SITES, ARTIFACT_TEMPLATES } from "../data/world";
import { marketTick } from "./market";

const EQUIP_MAINT: Record<string, number> = Object.fromEntries(EQUIPMENT_DEFS.map((e) => [e.id, e.maintenancePerDay]));
const ACH_LIST = ACHIEVEMENTS;

// seedable, stable sequences so_load order does not matter
let ledgerSeq = 0;
function ledgerEntry(id: string, day: number, amount: number, reason: string, kind: LedgerEntry["kind"]): LedgerEntry {
  return { id: `${id}-${day}-${ledgerSeq++}`, day, amount, reason, kind };
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

// ── Ledger / resource mutation ───────────────────────────────────────────────
export function spend(s: GameState, kind: LedgerEntry["kind"], reason: string, deltas: Partial<Record<ResourceKey, number>>): boolean {
  for (const k of Object.keys(deltas) as ResourceKey[]) {
    const v = deltas[k]!;
    if (v >= 0) continue;
    if (s.resources[k] + v < 0) return false;
  }
  for (const k of Object.keys(deltas) as ResourceKey[]) {
    const v = deltas[k]!;
    s.resources[k] += v;
    s.ledger.push(ledgerEntry("tx", s.day, Math.round(v), reason, kind));
  }
  return true;
}

export function earn(s: GameState, kind: LedgerEntry["kind"], reason: string, cash: number, extras?: Partial<Record<ResourceKey, number>>) {
  if (cash !== 0) {
    s.resources.cash += cash;
    s.ledger.push(ledgerEntry("tx", s.day, Math.round(cash), reason, kind));
  }
  if (extras) {
    for (const k of Object.keys(extras) as ResourceKey[]) {
      s.resources[k] += extras[k]!;
    }
  }
}

/** Advance one in-game day: operating expenses, energy regen, market tick. */
export function advanceDay(s: GameState): { insolvency: boolean } {
  s.day += 1;
  const d = DIFFICULTIES[s.difficulty];
  const staffCost = s.staff.reduce((a, m) => a + (STAFF_DEFS.find((def) => def.id === m.roleId)?.salary ?? 0), 0);
  const equipMaint = s.equipmentOwned.reduce((a, id) => a + (EQUIP_MAINT[id] ?? 0), 0);
  const op = d.opExpensePerDay + staffCost + equipMaint;
  s.resources.cash -= op;
  s.ledger.push(ledgerEntry("op", s.day, -op, "Daily operations (staff, utilities, equipment maintenance)", "operations"));

  // Active museum exhibition ticket revenue
  if (s.activeExhibition) {
    const rev = s.activeExhibition.dailyRevenue;
    s.resources.cash += rev;
    s.ledger.push(ledgerEntry("exhibition", s.day, rev, `Exhibition ticket sales: ${s.activeExhibition.title}`, "other"));
    const elapsed = s.day - s.activeExhibition.dayStarted;
    if (elapsed >= s.activeExhibition.durationDays) {
      s.resources.reputation += s.activeExhibition.reputationGain;
      s.journal.push({ day: s.day, kind: "progress", entry: `Exhibition "${s.activeExhibition.title}" concluded with acclaim (+${s.activeExhibition.reputationGain} reputation).` });
      s.activeExhibition = null;
    }
  }

  s.resources.energy = Math.min(100, s.resources.energy + 8 + (s.morale > 70 ? 3 : 0) - (s.morale < 40 ? 4 : 0));

  if (s.expedition && s.expedition.phase === "active") {
    s.resources.supplies = Math.max(0, s.resources.supplies - 1);
  }

  marketTick(s);

  // morale drift toward baseline 70
  const diff = 70 - s.morale;
  if (Math.abs(diff) > 8) s.morale += Math.sign(diff);

  // research growth from knowledge
  if (s.resources.knowledge > 20 && s.resources.research < 60) {
    s.resources.research += 1;
    s.resources.knowledge -= 5;
  }

  const runway = runwayDays(s);
  return { insolvency: runway !== null && runway <= 0 };
}

export function runwayDays(s: GameState): number | null {
  const recent = s.ledger.slice(-10);
  const net = recent.reduce((a, e) => a + e.amount, 0);
  const days = recent.length ? Math.max(1, Math.min(10, recent.filter((e) => e.day >= s.day - 7).length || 1)) : 1;
  const perDay = net / days;
  if (perDay >= 0) return null;
  return Math.floor(s.resources.cash / Math.abs(perDay));
}

// ── Artifact generation ──────────────────────────────────────────────────────
// Sequence derived from the save's existing artifacts so uids never collide
// after a save/load cycle (module state resets on reload, saves do not).
function nextArtifactSeq(s: GameState): number {
  let max = 0;
  for (const a of s.artifacts) {
    const m = /^A(\d+)$/.exec(a.uid);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

// Discovery yield helper: guarantee meaningful finds even for short standard digs
function minDiscoveryFloor(e: Expedition): number {
  // at ~0.28 base chance/day, a 4–6 day balanced dig usually yields 1–2 finds;
  // the completion roll adds a quality-scaled chance of one more — keep that tension
  return e.discoveries.length;
}

export function makeArtifact(
  s: GameState,
  tpl: ArtifactTemplate,
  site: Site,
  quality: number,
  rng: ReturnType<typeof makeRng>,
  conditionBias: number,
): PlayerArtifact {
  const uid = `A${String(nextArtifactSeq(s)).padStart(3, "0")}`;
  const trueEra = tpl.eras[rng.int(tpl.eras.length)];
  const conditionPool: Condition[] = ["pristine", "good", "fair", "poor", "fragile"];
  const condIdxRaw = Math.round((1 - quality) * 2 + conditionBias * 1.5 + rng.range(-0.6, 0.6));
  const condition = conditionPool[clamp(condIdxRaw, tpl.baseSignificance >= 8 ? 1 : 2, 4)];
  const provenance = clamp(quality * 0.8 + rng.range(-0.1, 0.15), 0.05, 0.95);
  const measuredSig = clamp(Math.round(tpl.baseSignificance * (0.7 + quality * 0.4)), 1, 10);

  const hypotheses: ArtifactHypothesis[] = [
    { id: "h1", statement: `Likely a ${tpl.category} object of ${eraLabel(trueEra)} date, from a ${site.name} context.`, probability: 0.35 + quality * 0.3 },
    { id: "h2", statement: "Alternative: a later/earlier object intrusive into a mixed context.", probability: 0.2 + (1 - quality) * 0.25 },
  ];
  const evidences: Evidence[] = [
    { id: "e1", kind: "stratigraphic", label: "Stratigraphic context", detail: `Recovered from a ${quality > 0.6 ? "well-recorded" : "partly disturbed"} layer at ${site.name}.`, support: 0.3 + quality * 0.4 },
    { id: "e2", kind: "material", label: "Material analysis", detail: `Material: ${tpl.material}; surface observations ${quality > 0.55 ? "consistent" : "ambiguous"} with the proposed period.`, support: 0.25 + quality * 0.3 },
  ];

  const a: PlayerArtifact = {
    uid,
    templateId: tpl.id,
    name: tpl.name,
    category: tpl.category,
    material: tpl.material,
    period: "unconfirmed",
    eraHint: null,
    trueEra,
    siteId: site.id,
    context: `Excavated at ${site.name}${quality > 0.65 ? " under controlled conditions" : " under hurried conditions"}.`,
    description: tpl.desc,
    condition,
    significance: measuredSig,
    evidencedValue: Math.round(tpl.baseValue * (0.6 + provenance * 0.6)),
    confidence: 0.25 + quality * 0.2,
    confidenceLabel: "hypothesis",
    provenance,
    status: "unanalyzed",
    hypotheses,
    evidences,
    conservationReq: condition === "pristine" ? "Standard stable storage" : condition === "fragile" ? "Climate-controlled micro-environment; handle with support cradle" : "Controlled humidity; periodic condition checks",
    researchLog: [{ day: s.day, entry: `Recovered at ${site.name} (day ${s.day}).` }],
    acquiredDay: s.day,
    accessibility: 0,
    image: tplImage(tpl),
  };
  return a;
}

function eraLabel(e: string): string {
  const map: Record<string, string> = {
    "phung-nguyen": "Phùng Nguyên", "dong-dau": "Đồng Đậu", "go-mun": "Gò Mun",
    "dong-son": "Đông Sơn", "champa": "Champa period", "van-lang-folk": "Văn Lang– Âu Lạc",
    "trade-network": "historical trade era",
  };
  return map[e] ?? e;
}

function tplImage(t: ArtifactTemplate): string {
  const map: Record<string, string> = {
    pottery: "/assets/artifacts/pottery.jpg",
    bronze: "/assets/artifacts/bronze.jpg",
    tool: "/assets/artifacts/tool.jpg",
    inscription: "/assets/artifacts/inscription.jpg",
    coin: "/assets/artifacts/coin.jpg",
    architecture: "/assets/artifacts/architecture.jpg",
    manuscript: "/assets/artifacts/manuscript.jpg",
  };
  return map[t.category] ?? "/assets/artifacts/pottery.jpg";
}

export function degrade(c: Condition): Condition {
  const order: Condition[] = ["pristine", "good", "fair", "poor", "fragile"];
  return order[Math.min(4, order.indexOf(c) + 1)];
}

export function equipmentValue(s: GameState, key: keyof NonNullable<EquipmentDef["effects"]>): number {
  let v = 0;
  for (const id of s.equipmentOwned) {
    const def = EQUIPMENT_DEFS.find((e) => e.id === id);
    if (def && def.effects[key]) v += def.effects[key]!;
  }
  return v;
}

// ── Expedition planning ──────────────────────────────────────────────────────
export function expeditionQuality(s: GameState, e: Expedition): number {
  const site = SITES.find((x) => x.id === e.plan.siteId)!;
  let q = 0.3;
  q += site.dataQuality / 40;
  q += (e.plan.workers - 2) * 0.04;
  q += equipmentValue(s, "surveyQuality") * 0.4;
  q += equipmentValue(s, "documentationQuality") * 0.3;
  q += equipmentValue(s, "evidenceQuality") * 0.25;
  if (e.plan.survey) q += 0.1;
  if (e.plan.careful) q += 0.08;
  if (s.techResearched.includes("stratigraphic-control")) q += 0.08;
  const fieldStaff = s.staff.filter((m) => m.roleId === "field").length;
  q += fieldStaff * 0.06;
  return clamp(q, 0.05, 1);
}

export function estimateExpedition(s: GameState, plan: ExpeditionPlan): { cost: number; supplies: number; days: number; energy: number; warnings: string[] } {
  const site = SITES.find((x) => x.id === plan.siteId)!;
  let cost = site.baseCost * (0.55 + plan.workers * 0.075) * (plan.days * 0.4 + site.difficulty * 0.25);
  if (plan.objective === "survey") cost *= 0.65;
  if (plan.objective === "intensive") cost *= 1.5;
  if (plan.careful) cost *= 1.25;
  if (plan.survey) cost *= 1.2;
  if (s.staff.some((m) => m.roleId === "logistics")) cost *= 0.88;
  if (s.techResearched.includes("vehicle-fleet")) cost *= 0.85;

  const supplies = Math.round((plan.workers * plan.days) / 2.2 + (plan.objective === "intensive" ? 8 : 4));
  const energy = 10 + plan.workers * 6 + plan.days * 2;

  const warnings: string[] = [];
  if (cost > s.resources.cash * 0.6) warnings.push("This expedition consumes over 60% of available cash.");
  if (supplies > s.resources.supplies) warnings.push(`Needs ~${supplies} field supplies, you have ${Math.floor(s.resources.supplies)}.`);
  if (energy > s.resources.energy) warnings.push(`Requires ~${energy} team energy, you have ${Math.floor(s.resources.energy)}.`);

  return { cost: Math.round(cost), supplies: supplies, days: plan.days, energy, warnings };
}

export function validatePlan(s: GameState, plan: ExpeditionPlan): { ok: boolean; reason?: string } {
  const site = SITES.find((x) => x.id === plan.siteId);
  if (!site) return { ok: false, reason: "Unknown site." };
  if (!s.siteUnlocked.includes(site.id)) return { ok: false, reason: "Site not unlocked." };
  if (s.expedition && s.expedition.phase === "active") return { ok: false, reason: "An expedition is already underway." };
  if (site.requiresReputation > s.resources.reputation) return { ok: false, reason: `Requires ${site.requiresReputation} reputation.` };
  if (plan.workers < 2) return { ok: false, reason: "At least 2 workers required." };
  if (plan.days < 2) return { ok: false, reason: "Expeditions need at least 2 days." };
  return { ok: true };
}

export function startExpedition(s: GameState, plan: ExpeditionPlan): { ok: boolean; reason?: string; exped?: Expedition } {
  const v = validatePlan(s, plan);
  if (!v.ok) return v;
  const est = estimateExpedition(s, plan);
  if (est.cost > s.resources.cash) {
    return { ok: false, reason: `Insufficient cash: need ${fmt(est.cost)}đ, have ${fmt(s.resources.cash)}đ.` };
  }
  const okSpend = spend(s, "expedition", `Expedition budget — ${SITES.find((x) => x.id === plan.siteId)!.name}`, { cash: -est.cost, supplies: -est.supplies, energy: -est.energy });
  if (!okSpend) return { ok: false, reason: "Not enough supplies or team energy." };

  const exped: Expedition = {
    id: `exp-${s.day}-${Math.floor(Math.random() * 1e6)}`,
    plan,
    phase: "active",
    startedDay: s.day,
    elapsedDays: 0,
    totalDays: plan.days,
    spent: est.cost,
    budget: est.cost,
    eventLog: [{ day: s.day, text: `Expedition to ${SITES.find((x) => x.id === plan.siteId)!.name} begins. Budget ${fmt(est.cost)}đ committed.`, kind: "info" }],
    discoveries: [],
    siteStatus: "intact",
  };
  s.expedition = exped;
  s.plannedExpedition = plan;
  s.journal.push({ day: s.day, kind: "progress", entry: `Expedition started at ${SITES.find((x) => x.id === plan.siteId)!.name}.` });
  return { ok: true, exped };
}

function pickTemplate(s: GameState, site: Site, rng: ReturnType<typeof makeRng>): ArtifactTemplate | null {
  void s;
  const pool = ARTIFACT_TEMPLATES.filter((t) => {
    if (!site.eras.some((e) => t.eras.includes(e))) return false;
    if (!t.regions.includes(site.region)) return false;
    if (site.difficulty < t.minDifficulty) return false;
    return true;
  });
  if (!pool.length) return null;
  const weights = pool.map((t) => (t.rarity === "common" ? 6 : t.rarity === "uncommon" ? 3 : t.rarity === "rare" ? 1.2 : 0.35));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng.next() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ── Expedition daily resolution ──────────────────────────────────────────────
export function advanceExpeditionDay(s: GameState): { done: boolean; discovered: PlayerArtifact[] } {
  const e = s.expedition!;
  const site = SITES.find((x) => x.id === e.plan.siteId)!;
  const rng = rngFor(s.seed, `exp-${e.id}-${e.elapsedDays}`);
  e.elapsedDays += 1;
  const discovered: PlayerArtifact[] = [];

  const quality = expeditionQuality(s, e);
  const baseChance = 0.28 * (e.plan.objective === "intensive" ? 1.5 : e.plan.objective === "survey" ? 0.6 : 1) * (0.6 + quality + (e.discoveryBoost ?? 0));
  if (rng.chance(clamp(baseChance, 0.05, 0.9)) && s.resources.supplies > 0) {
    const tpl = pickTemplate(s, site, rng);
    if (tpl) {
      const condBias = (e.plan.careful ? 0.15 : -0.1) + (equipmentValue(s, "damageReduction") > 0 ? 0.15 : 0);
      const art = makeArtifact(s, tpl, site, quality, rng, condBias);
      s.artifacts.push(art);
      e.discoveries.push(art.uid);
      discovered.push(art);
      e.eventLog.push({ day: s.day, text: `Discovery: ${art.name} (${art.category}, condition ${art.condition}).`, kind: "good" });
      s.journal.push({ day: s.day, kind: "discovery", entry: `Recovered ${art.name} at ${site.name}. Significance ${art.significance}/10.` });
      s.resources.knowledge += 2;
    }
  }

  // mid-expedition field decision
  const decisionDay = Math.max(2, Math.floor(e.totalDays / 2));
  if (!e.pendingDecision && !e.tutorialDecisionDone && e.elapsedDays === decisionDay && !e.discoveryBoost) {
    e.pendingDecision = {
      id: "mid-stop",
      prompt: "A promising sounding suggests a richer layer deeper down. Follow it (better finds, more days and cost), stay on plan, or pause to analyze finds so far?",
      options: [
        { id: "follow", label: "Follow the sounding (−2 days, +discovery odds, 3,000đ)", costCash: 3000, effectText: "+discovery odds, −2 remaining days" },
        { id: "stay", label: "Stick to the plan", effectText: "steady progress" },
        { id: "stop-analyze", label: "Pause and analyze finds (−3 days, +evidence quality, 5,000đ)", costCash: 5000, effectText: "+evidence quality on finds so far" },
      ],
    };
    e.eventLog.push({ day: s.day, text: "Field decision required: mid-expedition choice.", kind: "decision" });
  }

  // field mishap
  const riskP = (site.risk / 5) * 0.12 * DIFFICULTIES[s.difficulty].eventRisk * (1 - equipmentValue(s, "damageReduction") * 0.5);
  if (rng.chance(riskP)) {
    e.eventLog.push({ day: s.day, text: "Field incident: a section slumps — some context integrity lost.", kind: "bad" });
    if (e.discoveries.length) {
      const art = s.artifacts.find((x) => x.uid === e.discoveries[e.discoveries.length - 1]);
      if (art) {
        art.condition = degrade(art.condition);
        art.evidences[0].support = clamp(art.evidences[0].support * 0.85, 0, 1);
      }
    }
  }

  s.resources.supplies = Math.max(0, s.resources.supplies - Math.ceil(e.plan.workers / 3));
  s.resources.energy = Math.max(0, s.resources.energy - 6);

  const done = e.elapsedDays >= e.totalDays;
  if (done) resolveExpedition(s);
  return { done, discovered };
}

export function resolveExpeditionDecision(s: GameState, optionId: string): { ok: boolean; text?: string } {
  const e = s.expedition;
  if (!e || !e.pendingDecision) return { ok: false };
  const opt = e.pendingDecision.options.find((o) => o.id === optionId);
  if (!opt) return { ok: false };
  if (opt.costCash) {
    if (s.resources.cash < opt.costCash) return { ok: false, text: "Not enough cash for this option." };
    spend(s, "expedition", "Expedition mid-decision: " + opt.label, { cash: -opt.costCash });
    e.budget += opt.costCash;
    e.spent += opt.costCash;
  }
  let text = opt.effectText;
  if (optionId === "follow") {
    e.totalDays += 2;
    e.discoveryBoost = 0.35;
  } else if (optionId === "stay") {
    text = "Plan stays on course.";
  } else if (optionId === "stop-analyze") {
    e.totalDays += 3;
    for (const uid of e.discoveries) {
      const a = s.artifacts.find((x) => x.uid === uid);
      if (a) for (const ev of a.evidences) ev.support = clamp(ev.support + 0.08, 0, 0.95);
    }
    text = "Careful lab tape analysis improves evidence quality of finds so far.";
  }
  if (s.expedition) (s.expedition as Expedition & { tutorialDecisionDone?: boolean }).tutorialDecisionDone = true;
  e.eventLog.push({ day: s.day, text: `Decision: ${opt.label} — ${text}`, kind: "info" });
  e.pendingDecision = undefined;
  return { ok: true, text };
}

export function resolveExpedition(s: GameState) {
  const e = s.expedition!;
  const site = SITES.find((x) => x.id === e.plan.siteId)!;
  const q = expeditionQuality(s, e);
  const rng = rngFor(s.seed, `expdone-${e.id}`);

  // Guarantee the guided tutorial teaches research: a disciplined, careful, surveyed dig
  // always recovers at least one find at completion. The most expensive option is not
  // automatically better — quality and objectives still dominate yields.
  if (e.discoveries.length === 0 && q >= 0.5 && e.plan.careful) {
    const tpl = pickTemplate(s, site, rng);
    if (tpl) {
      const art = makeArtifact(s, tpl, site, q, rng, e.plan.careful ? 0.1 : -0.05);
      s.artifacts.push(art);
      e.discoveries.push(art.uid);
      s.journal.push({ day: s.day, kind: "discovery", entry: `Completion screening recovered ${art.name} at ${site.name}.` });
      e.eventLog.push({ day: s.day, text: `Completion find: ${art.name}.`, kind: "good" });
    }
  }

  const rep = Math.round(1 + q * 4 + e.discoveries.length * 1.2);
  s.resources.reputation += rep;
  s.resources.knowledge += 4 + Math.round(q * 6);
  s.resources.research += 12 + Math.round(q * 8);

  const success = e.discoveries.length > 0 || q > 0.55;
  s.morale = clamp(s.morale + (success ? 6 : -8), 10, 100);

  if (rng.chance(q * 0.35)) {
    const tpl = pickTemplate(s, site, rng);
    if (tpl) {
      const art = makeArtifact(s, tpl, site, q, rng, e.plan.careful ? 0.1 : -0.05);
      s.artifacts.push(art);
      e.discoveries.push(art.uid);
      s.journal.push({ day: s.day, kind: "discovery", entry: `Final-day find at ${site.name}: ${art.name}.` });
    }
  }

  let perCat = "No significant finds this time — the trench is backfilled and the record stands.";
  if (e.discoveries.length) {
    const arts = e.discoveries.map((uid) => s.artifacts.find((a) => a.uid === uid)!).filter(Boolean).sort((a, b) => b.significance - a.significance);
    perCat = `Most significant: ${arts[0].name} (significance ${arts[0].significance}/10, condition ${arts[0].condition}).`;
  }
  e.outcomeSummary = `Completed. Scope quality ${Math.round(q * 100)}%. ${e.discoveries.length} artifact(s) recovered. Reputation +${rep}. ${perCat}`;
  e.phase = "complete";
  s.flags.expeditionsCompleted = ((s.flags.expeditionsCompleted as number) ?? 0) + 1;
  const regionsSet = new Set(Array.from(new Set(s.artifacts.map((a) => siteRegionOf(a.siteId)))));
  s.flags.regionsExplored = regionsSet.size;
  s.journal.push({ day: s.day, kind: "progress", entry: `Expedition at ${site.name} complete — reputation +${rep}.` });
}

// ── Achievements ─────────────────────────────────────────────────────────────
export function evaluateAchievements(s: GameState): string[] {
  const unlocked: string[] = [];
  for (const a of ACH_LIST) {
    if (s.achievements.includes(a.id)) continue;
    try {
      if (a.check(s)) {
        s.achievements.push(a.id);
        unlocked.push(a.id);
      }
    } catch {
      /* never block gameplay */
    }
  }
  return unlocked;
}

// ── Campaign objectives ─────────────────────────────────────────────────────
/** Evaluate the active chapter's objectives; mark them done and advance chapters. */
export function evaluateCampaign(s: GameState): { advanced: boolean; completed: boolean } {
  const ch = CAMPAIGN[s.campaignChapter] ?? CAMPAIGN[CAMPAIGN.length - 1];
  // objective checks (keep in one place so data and logic can't drift)
  const checks: Record<string, (g: GameState) => boolean> = {
    "o1-dig": (g) => Number(g.flags.expeditionsCompleted ?? 0) >= 1,
    "o1-verify": (g) => g.artifacts.some((a) => a.confidenceLabel === "verified" || a.status === "verified"),
    "o1-grant": (g) => g.grantApplications.some((a) => a.status === "approved"),
    "o2-verified3": (g) => g.artifacts.filter((a) => a.confidenceLabel === "verified" || a.status === "verified").length >= 3,
    "o2-bronze": (g) => g.artifacts.some((a) => a.category === "bronze" && a.significance >= 7),
    "o2-rep30": (g) => g.resources.reputation >= 30,
    "o3-two-regions": (g) => Number(g.flags.regionsExplored ?? 0) >= 3,
    "o3-publish": (g) => g.artifacts.filter((a) => a.status === "published").length >= 5,
    "o3-cash": (g) => g.resources.cash >= 250000,
  };

  let newlyDone = false;
  for (const o of ch.objectives) {
    if (!s.completedObjectives.includes(o.id) && checks[o.id]?.(s)) {
      s.completedObjectives.push(o.id);
      newlyDone = true;
    }
  }

  const allDone = ch.objectives.every((o) => s.completedObjectives.includes(o.id));
  const repOk = s.resources.reputation >= ch.requiredRep;
  if (allDone && repOk) {
    if (s.campaignChapter < CAMPAIGN.length - 1) {
      s.campaignChapter += 1;
      s.journal.push({ day: s.day, kind: "progress", entry: `Campaign advanced: ${CAMPAIGN[s.campaignChapter].title}.` });
      return { advanced: true, completed: false };
    }
    if (!s.campaignCompleted) {
      s.campaignCompleted = true;
      s.journal.push({ day: s.day, kind: "progress", entry: "Campaign complete — the institute's name is made." });
    }
    return { advanced: false, completed: true };
  }
  return { advanced: false, completed: false };
}
