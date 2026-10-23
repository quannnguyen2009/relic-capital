import type { GameState, GrantApplication } from "./types";
import { GRANTS } from "../data/systems";
import { clamp } from "./core";

/** Score grant application quality (0-1). Deterministic — no arbitrary luck. */
export function grantScore(s: GameState, grantId: string): { score: number; reasons: string[]; eligible: boolean; blockers: string[] } {
  const g = GRANTS.find((x) => x.id === grantId)!;
  const reasons: string[] = [];
  const blockers: string[] = [];

  const verified = s.artifacts.filter((a) => a.confidenceLabel === "verified").length;
  const published = s.artifacts.filter((a) => a.status === "published").length;
  const digitized = s.artifacts.filter((a) => a.accessibility >= 0.5).length;
  const condGood = s.artifacts.filter((a) => a.condition === "pristine" || a.condition === "good").length;
  const provAvg = s.artifacts.length ? s.artifacts.reduce((acc, a) => acc + a.provenance, 0) / s.artifacts.length : 0;
  const regionExplored = s.artifacts.some((a) => siteRegion(a.siteId) === g.requires.regionUnderExplored);

  let score = 0.45;  // raised from 0.35: a competent early application should pass
  if ((s.resources.reputation ?? 0) >= 20) { score += 0.1; reasons.push("Reputation strengthens the application."); }
  if ((s.resources.reputation ?? 0) >= 10) { score += 0.04; reasons.push("Growing reputation noted."); }
  if (s.techResearched.includes("open-data")) { score += 0.1; reasons.push("Open Data Initiative lifts documentation credibility."); }
  if (s.staff.some((m) => m.roleId === "historian")) { score += 0.08; reasons.push("A historian improves narrative quality."); }

  // eligibility check
  if (g.requires.minArtifacts && s.artifacts.length < g.requires.minArtifacts) blockers.push(`Requires ≥${g.requires.minArtifacts} documented artifacts (have ${s.artifacts.length}).`);
  if (g.requires.minVerified && verified < g.requires.minVerified) blockers.push(`Requires ≥${g.requires.minVerified} verified artifacts (have ${verified}).`);
  if (g.requires.minPublished && published < g.requires.minPublished) blockers.push(`Requires ≥${g.requires.minPublished} published findings (have ${published}).`);
  if (g.requires.minDigitized && digitized < g.requires.minDigitized) blockers.push(`Requires ≥${g.requires.minDigitized} digitized records (have ${digitized}).`);
  if (g.requires.minConditionGood && condGood < g.requires.minConditionGood) blockers.push(`Requires ≥${g.requires.minConditionGood} artifacts in good condition (have ${condGood}).`);
  if (g.requires.minProvenanceAvg && provAvg < g.requires.minProvenanceAvg) blockers.push(`Requires average provenance ≥ ${(g.requires.minProvenanceAvg * 100).toFixed(0)}% (have ${(provAvg * 100).toFixed(0)}%).`);
  if (g.requires.regionUnderExplored && !regionExplored) blockers.push(`Requires fieldwork record in the region.`);
  if (g.requires.minPublications && published < g.requires.minPublications) blockers.push(`Requires ≥${g.requires.minPublications} publications (have ${published}).`);

  // quality contribution
  if (g.id === "documentation" && provAvg >= 0.25) { score += 0.25; reasons.push("Well-provenanced records score well."); }
  else if (g.id === "documentation" && provAvg >= 0.15) { score += 0.12; reasons.push("Partial provenance on record."); }
  if (g.id === "conservation" && condGood >= 5) { score += 0.25; reasons.push("Strong condition record demonstrates safe recovery."); }
  if (g.id === "digital-heritage" && digitized >= 5) { score += 0.25; reasons.push("Digitization effort evident."); }
  if (g.id === "regional-survey" && regionExplored) { score += 0.25; reasons.push("Under-researched region explored."); }
  if (g.id === "public-access" && published >= 2) { score += 0.25; reasons.push("Published findings demonstrate public accessibility."); }

  if (s.flags.grantRush) { score -= 0.12; reasons.push("Rushed application reduced quality."); }
  score = clamp(score, 0, 1);
  return { score, reasons, eligible: blockers.length === 0, blockers };
}

function siteRegion(siteId: string): string {
  const map: Record<string, string> = {
    "delta-lien-lau": "delta", "delta-ma-the": "delta", "north-co-loa": "north",
    "north-hoa-binh": "north", "central-tra-kieu": "central", "highlands-dak-son": "highlands", "south-oc-eo": "south",
  };
  return map[siteId] ?? "delta";
}

export function applyGrant(s: GameState, grantId: string): { ok: boolean; reason?: string } {
  const g = GRANTS.find((x) => x.id === grantId);
  if (!g) return { ok: false, reason: "Unknown grant." };
  if ((s.resources.reputation ?? 0) < g.repRequired) return { ok: false, reason: `Requires ${g.repRequired} reputation.` };
  const cd = s.grantsCooldown[grantId] ?? 0;
  if (s.day < cd) return { ok: false, reason: `Grant on cooldown until day ${cd}.` };
  if (s.grantApplications.some((a) => a.grantId === grantId && a.status === "pending")) return { ok: false, reason: "Application already pending." };
  const { score, eligible } = grantScore(s, grantId);
  if (!eligible) return { ok: false, reason: "Eligibility not met. See requirements." };
  s.grantApplications.push({
    grantId,
    appliedDay: s.day,
    decisionDay: s.day + g.durationDays,
    status: "pending",
    score,
    note: "",
  });
  s.journal.push({ day: s.day, kind: "finance", entry: `Applied for ${g.name}.` });
  return { ok: true };
}

/** Resolve pending grants whose decision day has arrived. Returns approved list. */
export function resolveGrants(s: GameState): GrantApplication[] {
  const approved: GrantApplication[] = [];
  for (const app of s.grantApplications) {
    if (app.status !== "pending") continue;
    if (s.day < app.decisionDay) continue;
    const g = GRANTS.find((x) => x.id === app.grantId)!;
    // score vs threshold — deterministic + reputation influence
    const threshold = clamp(0.50 * (g.repRequired > 8 ? 1.06 : 1) * DIFFICULTY_GRANT_SEVERITY(s), 0.25, 0.85);
    if (app.score >= threshold) {
      app.status = "approved";
      s.resources.cash += g.payout;
      s.ledger.push({ id: `grant-${s.day}-${app.grantId}`, day: s.day, amount: g.payout, reason: `${g.name} approved`, kind: "grant" });
      s.resources.reputation += 2;
      app.note = `Approved — quality score ${Math.round(app.score * 100)}%.`;
      s.journal.push({ day: s.day, kind: "finance", entry: `${g.name} approved: +${g.payout}đ.` });
      approved.push(app);
    } else {
      app.status = "rejected";
      app.note = `Rejected — quality score ${Math.round(app.score * 100)}% below threshold ${Math.round(threshold * 100)}%. Strengthen documentation and eligibility evidence.`;
      s.journal.push({ day: s.day, kind: "finance", entry: `${g.name} rejected.` });
    }
    s.grantsCooldown[app.grantId] = s.day + g.cooldownDays;
  }
  return approved;
}

function DIFFICULTY_GRANT_SEVERITY(s: GameState): number {
  return s.difficulty === "story" ? 0.85 : s.difficulty === "expert" ? 1.12 : 1;
}
