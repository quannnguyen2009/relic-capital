import type { GameState, ResearchOp, ResearchReport, PlayerArtifact, RefRecord } from "./types";
import { REF_RECORDS } from "../data/systems";
import { makeRng, hashSeed } from "./rng";
import { clamp, spend } from "./core";

let reportSeq = 0;

export const RESEARCH_COSTS: Record<ResearchOp, { research: number; days?: number }> = {
  typology: { research: 12 },
  material: { research: 14 },
  inscription: { research: 16, days: 1 },
  classification: { research: 6 },
  period: { research: 12 },
  refMatch: { research: 14 },
  contextual: { research: 15 },
  anomaly: { research: 10 },
  confidence: { research: 8 },
};

export const RESEARCH_LABELS: Record<ResearchOp, string> = {
  typology: "Typological & Stylistic Analysis",
  material: "Scientific & Material Testing",
  inscription: "Epigraphical Decipherment",
  classification: "Artifact classification",
  period: "Period estimation",
  refMatch: "Reference matching",
  contextual: "Contextual research",
  anomaly: "Anomaly detection",
  confidence: "Confidence assessment",
};

function techDiscount(s: GameState): number {
  let d = 1;
  if (s.techResearched.includes("analytical-lab")) d -= 0.2;
  const dataSci = s.staff.filter((m) => m.roleId === "dataSci").length;
  d -= dataSci * 0.06;
  return Math.max(0.5, d);
}

/** Run a research op. Returns a report; mutates artifact confidence/evidence. */
export function runAnalysis(
  s: GameState,
  uid: string,
  op: ResearchOp,
): { ok: boolean; reason?: string; report?: ResearchReport } {
  const a = s.artifacts.find((x) => x.uid === uid);
  if (!a) return { ok: false, reason: "Artifact not found." };
  const base = RESEARCH_COSTS[op];
  const cost = Math.max(3, Math.round(base.research * techDiscount(s)));
  if (s.resources.research < cost) return { ok: false, reason: `Needs ${cost} research points (have ${Math.floor(s.resources.research)}).` };

  spend(s, "research", `${RESEARCH_LABELS[op]}: ${a.name}`, { research: -cost });
  a.researchLog.push({ day: s.day, entry: `${RESEARCH_LABELS[op]} run (−${cost} RP).` });

  // Diminishing returns: each repeat of the same op adds less confidence
  if (!a.opsRun) a.opsRun = {};
  const prevCount = a.opsRun[op] ?? 0;
  const diminishFactor = Math.max(0.25, 1 - prevCount * 0.3);
  a.opsRun[op] = prevCount + 1;

  const rng = makeRng((s.seed ^ hashSeed(`${uid}-${op}-${s.techResearched.length}`)) >>> 0);
  const best = leadingHypothesis(a);
  const support = a.evidences.reduce((acc, e) => acc + e.support, 0);
  const bonus = techEvidenceBonus(s);
  let confAfter = clamp(best.probability + support * 0.25 + bonus, 0.05, 0.96);

  const supporting: string[] = [];
  const missing: string[] = [];
  let interpretation = "";
  let nextStep = "";
  const sources: string[] = [];

  switch (op) {
    case "typology": {
      const era = qualityAssessment(a, s, rng);
      const matches = findRefs(a.category).slice(0, 3);
      const isMatch = era === periodName(a);
      interpretation = `Typological and stylistic comparative series aligns this find with the ${era} cultural horizon. Fabric (${a.material}) and ornamentation match regional index types.`;
      supporting.push(`Stylistic match: ${a.category} profile matches regional type-series.`);
      if (matches.length) supporting.push(`Reference comparison: ${matches[0].name} (${matches[0].ref}).`);
      missing.push(s.techResearched.includes("radiocarbon-access") ? "Absolute radiocarbon dating recommended to corroborate typology." : "Comparative stylistic typology — test material integrity next.");
      nextStep = "Proceed to Scientific & Material Testing or Verify Evidence if confidence is robust.";
      if (matches.length) sources.push(...matches.map((m) => m.ref));
      sources.push("National Museum Type-Series Corpus");

      const confGain = (isMatch ? 0.22 : 0.08) * diminishFactor;
      a.confidence = clamp(a.confidence + confGain, 0, 0.96);
      a.period = era;
      a.eraHint = eraNameToId(era);
      a.evidences.push({
        id: `e-typ-${a.evidences.length}`,
        kind: "typological",
        label: "Typological & Period Concordance",
        detail: `Typology matches ${era} series (similarity: ${matches[0]?.name ?? "Index Record"}).`,
        support: 0.5 * diminishFactor,
      });
      a.status = a.status === "unanalyzed" ? "classified" : a.status;
      break;
    }
    case "material": {
      const issues: string[] = [];
      if (a.condition === "poor" || a.condition === "fragile") issues.push("Material degradation requires stabilization.");
      if (a.provenance < 0.4) issues.push("Stratigraphic provenance documentation has minor gaps.");
      interpretation = `Material composition analysis (${a.material}): microstructure and trace elements confirm authenticity. ${issues.join(" ") || "No structural anomalies detected."}`;
      supporting.push(`Material signature: authentic ${a.material} matrix with characteristic patina/wear.`);
      supporting.push(`Context layer: ${a.context}.`);
      if (s.techResearched.includes("radiocarbon-access")) {
        supporting.push("Radiocarbon access: stratigraphic layer calibrated successfully.");
      }
      missing.push("Non-destructive surface testing only — internal core remains intact.");
      nextStep = a.confidence >= 0.7 ? "Evidence is robust — ready to Verify and Publish." : "Run Inscription decipherment or additional reference matching.";
      sources.push("Archaeological Material & Archaeometry Standard Index");

      const confGain = 0.18 * diminishFactor;
      a.confidence = clamp(a.confidence + confGain, 0, 0.96);
      a.evidences.push({
        id: `e-mat-${a.evidences.length}`,
        kind: "contextual",
        label: "Material Integrity & Calibration",
        detail: `Composition (${a.material}) and preservation verified against context layer.`,
        support: 0.45 * diminishFactor,
      });
      a.status = a.status === "unanalyzed" ? "classified" : a.status;
      break;
    }
    case "classification": {
      const confGain = 0.04 * diminishFactor;
      interpretation = `Type-based reading suggests: ${a.category} artifact; fabric/material (${a.material}) consistent with ${periodName(a)}.`;
      supporting.push("Material and surface treatment consistent with the proposed category.");
      missing.push("No direct analytical sample has been compared with the reference series.");
      nextStep = prevCount > 0 ? "Classification has been run before — try a different op for more insight." : "Run Period estimation or Reference matching to test the typological reading.";
      sources.push(findRefs(a.category).slice(0, 2).map((r) => r.ref).join("; ") || "Local reference collection (no close match)");
      a.confidence = clamp(a.confidence + confGain, 0, 0.96);
      a.status = a.status === "unanalyzed" ? "classified" : a.status;
      break;
    }
    case "period": {
      const era = qualityAssessment(a, s, rng);
      interpretation = `Stylistic plus contextual comparison dates this plausibly to ${era}.`;
      supporting.push(`Context: ${a.context}`);
      missing.push(s.techResearched.includes("radiocarbon-access") ? "Radiocarbon access available but a sample has not yet been processed." : "Absolute dating unavailable — estimate rests on typology and stratigraphy.");
      nextStep = s.techResearched.includes("radiocarbon-access") ? "Submit a sample for radiocarbon processing in the next campaign." : "Reference matching may sharpen the assignation.";
      if (era === periodName(a)) {
        a.confidence = clamp(a.confidence + 0.15, 0, 0.96);
        a.evidences.push({ id: `e-p-${a.evidences.length}`, kind: "typological", label: "Typological period match", detail: "Typology matches the proposed period within known type-series.", support: 0.45 });
      } else {
        a.confidence = clamp(a.confidence - 0.08, 0, 0.9);
        a.hypotheses[1].probability = clamp(a.hypotheses[1].probability + 0.1, 0, 0.9);
      }
      a.period = era;
      a.eraHint = eraNameToId(era);
      sources.push("Local period reference series (rule-based engine)");
      break;
    }
    case "inscription": {
      if (a.category !== "inscription") {
        return { ok: false, reason: "This op applies to inscription artifacts." };
      }
      const epigrapher = s.staff.some((m) => m.roleId === "epigrapher");
      interpretation = epigrapher
        ? "Draft transcription hypothesis: two sign-groups recur; tentative reading aligns with known dedicatory formulae. FICTIONAL SIM — verify against real corpora."
        : "Draft transcription hypothesis is weak without an epigrapher on staff. Sign-groups are ambiguous.";
      supporting.push(epigrapher ? "Epigrapher staff improves sign-group differentiation." : "Base script comparison only.");
      missing.push("This simulatory reading is generated by the local rule-based engine — treat as a hypothesis, not a verified text.");
      nextStep = "Cross-check with the Hán–Nôm Text Corpus (research it first) or run anomaly detection.";
      if (epigrapher) {
        a.confidence = clamp(a.confidence + 0.12, 0, 0.9);
        a.evidences.push({ id: `e-i-${a.evidences.length}`, kind: "inscription", label: "Transcription hypothesis", detail: "Recurring sign groups identified (hypothesis).", support: 0.4 });
      }
      sources.push("Local corpus index (no verified reading produced)");
      break;
    }
    case "refMatch": {
      const matches = REF_RECORDS.filter((r) => r.category === a.category).slice(0, 3);
      interpretation = matches.length
        ? `Closest reference records: ${matches.map((m) => m.name).join(", ")}. Similarity moderate — not conclusive.`
        : "No close reference match in the local collection.";
      supporting.push(...matches.map((m) => `${m.name}: ${m.note} (${m.ref})`));
      missing.push("Direct side-by-side comparison with a physical type collection has not occurred.");
      nextStep = prevCount > 1 ? "Reference matching yields diminishing returns. Pursue contextual or anomaly analysis." : "Accept a museum study-visit event when it appears, to raise provenance evidence.";
      if (matches.length) {
        const refGain = 0.1 * diminishFactor;
        a.confidence = clamp(a.confidence + refGain, 0, 0.95);
        a.evidences.push({ id: `e-r-${a.evidences.length}`, kind: "refMatch", label: `Reference match (${prevCount > 0 ? "repeat" : "initial"})`, detail: `Closest: ${matches[0].name} (${matches[0].ref}).`, support: Math.max(0.1, 0.35 * diminishFactor) });
      }
      sources.push(...matches.map((m) => m.ref));
      break;
    }
    case "contextual": {
      const hist = s.staff.some((m) => m.roleId === "historian");
      interpretation = hist
        ? "Contextual links proposed: site's exchange role in the wider network is consistent with the find's material signature. Interpretation, not established fact."
        : "Provisional contextual links. A historian on staff would strengthen site-network interpretation.";
      supporting.push("Site context and material signature align loosely with regional records.");
      missing.push("No external corroboration (settlement pattern studies not yet run).");
      nextStep = "Publish once verification is stronger to lift institutional reputation.";
      a.confidence = clamp(a.confidence + 0.05, 0, 0.95);
      a.evidences.push({ id: `e-c-${a.evidences.length}`, kind: "contextual", label: "Contextual link", detail: "Site-network association (interpretation).", support: 0.3 });
      sources.push("Regional survey summaries (rule-based engine)");
      break;
    }
    case "anomaly": {
      const issues: string[] = [];
      if (a.condition === "poor" || a.condition === "fragile") issues.push("Condition limits direct observation; some readings may be unreliable.");
      if (a.provenance < 0.35) issues.push("Provenance completeness is low — documentation gaps.");
      if (a.hypotheses[1].probability > 0.35) issues.push("Alternative hypothesis (intrusive object) still carries meaningful probability.");
      if (!issues.length) issues.push("No specific anomalies found. Standard uncertainties remain.");
      interpretation = issues.join(" ");
      supporting.push("Automated consistency check over archive fields.");
      missing.push("Anomaly detection cannot create evidence — only flag inconsistencies.");
      nextStep = "Address flagged issues with targeted analysis before publication.";
      if (issues.length && issues[0].startsWith("No")) a.hypotheses[0].probability = clamp(a.hypotheses[0].probability + 0.03, 0, 0.9);
      sources.push("Internal consistency audit");
      break;
    }
    case "confidence": {
      interpretation = `Leading hypothesis holds ${Math.round(confAfter * 100)}% simulated weight. Supporting: ${a.evidences.length} evidence item(s). Gaps: ${missing.length ? "see below" : "minimal"}.`;
      supporting.push(...a.evidences.map((e) => `${e.label} — ${e.detail}`));
      missing.push("Some uncertainty is irreducible without destructive sampling — outside this program's scope.");
      nextStep = "If confidence ≥ 0.75, consider verification or publication.";
      a.confidence = clamp((a.confidence + confAfter) / 2, 0, 0.96);
      sources.push("Confidence aggregation model (local)");
      break;
    }
  }

  // label confidence
  a.confidenceLabel = a.confidence >= 0.85 ? "verified" : a.confidence >= 0.7 ? "robust" : a.confidence >= 0.5 ? "probable" : "hypothesis";
  a.status = a.status === "unanalyzed" ? "classified" : a.status;

  const report: ResearchReport = {
    op,
    artifactUid: uid,
    day: s.day,
    interpretation,
    confidence: a.confidence,
    supporting,
    missing,
    nextStep,
    sources: sources.filter(Boolean),
    cost: { research: cost },
    engine: "rule-based",
  };
  s.researchReports.push({ ...report, id: `rep-${reportSeq++}` } as ResearchReport & { id: string });
  return { ok: true, report };
}

/** Verification action: consume RP to validate an interpretation.
 * Requires ≥2 evidence items; success raises confidence toward "verified",
 * failure flags the finding — never grants blind certainty. */
export function verifyArtifact(s: GameState, uid: string): { ok: boolean; reason?: string; result?: string } {
  const a = s.artifacts.find((x) => x.uid === uid);
  if (!a) return { ok: false, reason: "Artifact not found." };
  const cost = 12;
  if (s.resources.research < cost) return { ok: false, reason: `Verification needs ${cost} research points.` };
  if (a.evidences.length < 2) return { ok: false, reason: "Need at least 2 evidence items before verification. Run more analyses." };
  spend(s, "research", `Verification: ${a.name}`, { research: -cost });
  const rng = makeRng((s.seed ^ hashSeed(`verify-${uid}-${s.day}`)) >>> 0);
  // Higher confidence → much more reliable; only truly low-confidence finds risk a setback
  const successChance = clamp(0.65 + a.confidence * 0.32, 0.5, 0.97);
  const good = a.confidence >= 0.50 && rng.chance(successChance);
  a.researchLog.push({ day: s.day, entry: `Verification attempt (−${cost} RP).` });
  if (good) {
    a.confidence = clamp(a.confidence + 0.18, 0, 0.96);
    a.evidences.push({ id: `e-v-${a.evidences.length}`, kind: "refMatch", label: "Verification review", detail: "Independent review of evidence chain raised confidence.", support: 0.5 });
    a.researchLog.push({ day: s.day, entry: "Verification passed — attribution now robust." });
  } else {
    // Softer fail: only small confidence drop, encourage retry
    a.confidence = clamp(a.confidence - 0.06, 0, 0.9);
    a.researchLog.push({ day: s.day, entry: "Verification inconclusive — minor revision; consider adding more evidence first." });
  }
  a.confidenceLabel = a.confidence >= 0.85 ? "verified" : a.confidence >= 0.7 ? "robust" : a.confidence >= 0.5 ? "probable" : "hypothesis";
  if (a.confidenceLabel === "verified") a.status = "verified";
  return { ok: true, result: good ? "Verification passed." : "Verification inconclusive — add more evidence then retry." };
}

/** Publication: convert a verified/robust finding into public research output. */
export function publishArtifact(s: GameState, uid: string): { ok: boolean; reason?: string } {
  const a = s.artifacts.find((x) => x.uid === uid);
  if (!a) return { ok: false, reason: "Artifact not found." };
  if (a.confidence < 0.50) return { ok: false, reason: "Confidence too low to publish (≥ 50% needed). Run more analyses to build evidence." };
  const cost = 10;
  if (s.resources.research < cost) return { ok: false, reason: `Publication needs ${cost} research points.` };
  spend(s, "research", `Publishing: ${a.name}`, { research: -cost });
  const hist = s.staff.some((m) => m.roleId === "historian");
  const openData = s.techResearched.includes("open-data");
  const payout = Math.round((14000 + a.significance * 2200) * (hist ? 1.25 : 1) * (openData ? 1.1 : 1));
  s.resources.cash += payout;
  s.ledger.push({ id: `pub-${s.day}-${Date.now()}`, day: s.day, amount: payout, reason: `Publication/licensing income: ${a.name}`, kind: "publication" });
  s.resources.reputation += 2 + Math.round(a.significance / 4) + (openData ? 1 : 0);
  a.status = "published";
  a.accessibility = clamp(a.accessibility + 0.5, 0, 1);
  a.researchLog.push({ day: s.day, entry: `Published. Income +${payout}đ, reputation up. Accessibility improved.` });
  s.journal.push({ day: s.day, kind: "progress", entry: `Published ${a.name} — +${payout}đ, reputation up.` });

  // High-significance publications may attract rival attention (once per artifact)
  const rivalChance = a.significance >= 8 ? 0.4 : a.significance >= 6 ? 0.2 : 0.08;
  if (!a.rivalClaim && Math.random() < rivalChance) {
    // Import-free inline rival spawn (avoids circular imports)
    const RIVALS = [
      "Northern Archaeological Institute",
      "Hanoi University Research Centre",
      "Southeast Asian Heritage Consortium",
      "Mekong Archaeology Foundation",
      "Pacific Rim Antiquities Bureau",
    ];
    const rival = RIVALS[Math.floor(Math.random() * RIVALS.length)];
    a.rivalClaim = true;
    s.rivalClaims.push({
      artifactUid: uid,
      rivalName: rival,
      day: s.day,
      challengeText: `${rival} has published a counter-attribution for ${a.name}, disputing the period assignment. Your evidence must now withstand public scrutiny.`,
      resolved: null,
    });
    s.journal.push({ day: s.day, kind: "event", entry: `RIVAL CLAIM after publication: ${rival} disputes your attribution of ${a.name}. Respond in the Lab to defend your findings.` });
  }

  return { ok: true };
}

/** Digitize an artifact (raises accessibility for Digital Heritage Grant etc.) */
export function digitizeArtifact(s: GameState, uid: string): { ok: boolean; reason?: string } {
  const a = s.artifacts.find((x) => x.uid === uid);
  if (!a) return { ok: false, reason: "Artifact not found." };
  const cost = 4000;
  if (s.resources.cash < cost) return { ok: false, reason: `Digitization costs ${cost}đ.` };
  spend(s, "conservation", `Digitization: ${a.name}`, { cash: -cost });
  a.accessibility = clamp(a.accessibility + 0.45, 0, 1);
  a.researchLog.push({ day: s.day, entry: "Digitized record created — publicly accessible documentation improved." });
  return { ok: true };
}

/** Conserve / stabilize an artifact: resets the degradation timer and slightly improves condition. */
export function conserveArtifact(s: GameState, uid: string): { ok: boolean; reason?: string } {
  const a = s.artifacts.find((x) => x.uid === uid);
  if (!a) return { ok: false, reason: "Artifact not found." };
  const cost = 6000;
  if (s.resources.cash < cost) return { ok: false, reason: `Conservation treatment costs ${cost}đ.` };
  spend(s, "conservation", `Conservation treatment: ${a.name}`, { cash: -cost });
  a.lastConservationDay = s.day;
  // Improve condition by one step if degraded
  const conds: Array<"pristine" | "good" | "fair" | "poor" | "fragile"> = ["pristine", "good", "fair", "poor", "fragile"];
  const idx = conds.indexOf(a.condition);
  if (idx > 1) {
    a.condition = conds[idx - 1];
    a.researchLog.push({ day: s.day, entry: `Conservation treatment applied. Condition improved to ${a.condition}. Degradation timer reset.` });
  } else {
    a.researchLog.push({ day: s.day, entry: `Conservation treatment applied. Condition maintained at ${a.condition}. Degradation timer reset.` });
  }
  // Slight confidence restore
  a.confidence = clamp(a.confidence + 0.03, 0, 0.96);
  s.journal.push({ day: s.day, kind: "progress", entry: `Conserved ${a.name} — condition ${a.condition}, degradation reset.` });
  return { ok: true };
}

export function leadingHypothesis(a: PlayerArtifact) {
  return a.hypotheses.reduce((best, h) => (h.probability > best.probability ? h : best), a.hypotheses[0]);
}

function techEvidenceBonus(s: GameState): number {
  let b = 0;
  for (const t of s.techResearched) {
    if (t === "photogrammetry") b += 0.12;
    if (t === "stratigraphic-control") b += 0.1;
    if (t === "dn-chrono") b += 0.1;
    if (t === "open-data") b += 0.03;
  }
  const dataSci = s.staff.filter((m) => m.roleId === "dataSci").length;
  b += dataSci * 0.1;
  return b;
}

function periodName(a: PlayerArtifact): string {
  const map: Record<string, string> = {
    "phung-nguyen": "Phùng Nguyên",
    "dong-dau": "Đồng Đậu",
    "go-mun": "Gò Mun",
    "dong-son": "Đông Sơn",
    "champa": "Champa period",
    "van-lang-folk": "Văn Lang–Âu Lạc",
    "trade-network": "Historical trade era",
  };
  return map[(a as PlayerArtifact & { trueEra: string }).trueEra] ?? "uncertain period";
}

function qualityAssessment(a: PlayerArtifact, s: GameState, rng: ReturnType<typeof makeRng>): string {
  const truth = periodName(a);
  // With better evidence quality, more likely to land on the "true" period; occasionally wrong.
  const good = a.evidences.reduce((acc, e) => acc + e.support, 0) / 2;
  if (rng.chance(clamp(0.35 + good * 0.5 + (s.techResearched.includes("radiocarbon-access") ? 0.2 : 0), 0.2, 0.9))) return truth;
  const alts = ["Phùng Nguyên", "Đồng Đậu", "Gò Mun", "Đông Sơn", "Champa period", "Historical trade era"].filter((x) => x !== truth);
  return alts[rng.int(alts.length)];
}

function eraNameToId(name: string): PlayerArtifact["eraHint"] {
  const map: Record<string, string> = {
    "Phùng Nguyên": "phung-nguyen", "Đồng Đậu": "dong-dau", "Gò Mun": "go-mun",
    "Đông Sơn": "dong-son", "Champa period": "champa",
    "Văn Lang–Âu Lạc": "van-lang-folk", "Historical trade era": "trade-network",
  };
  return (map[name] as PlayerArtifact["eraHint"]) ?? null;
}

function findRefs(cat: string): RefRecord[] {
  return REF_RECORDS.filter((r) => r.category === cat);
}
