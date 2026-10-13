"use client";
import { useState } from "react";
import { useGame } from "@/game/store";
import { Panel, ConfidenceBadge, Empty, Tooltip } from "../ui";
import { RESEARCH_LABELS, RESEARCH_COSTS } from "@/game/engine/research";
import type { ResearchOp } from "@/game/engine/types";

const OPS: ResearchOp[] = ["classification", "period", "inscription", "refMatch", "contextual", "anomaly", "confidence"];

export default function LabScreen() {
  const g = useGame();
  const s = g.s!;
  const [selUid, setSelUid] = useState<string | null>(s.artifacts[s.artifacts.length - 1]?.uid ?? null);
  const a = s.artifacts.find((x) => x.uid === selUid) ?? null;
  const recentReports = s.researchReports.slice(-3).reverse();

  return (
    <div className="space-y-4">
      <Panel title="Research Lab" sub="Analyze your finds to build evidence, then verify and publish. Each op spends research points and raises (or honestly lowers) confidence.">
        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* artifact picker */}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-2">Choose an artifact</div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {s.artifacts.length === 0 && <p className="text-sm text-[#A2B0B2]">Nothing to analyze yet.</p>}
              {s.artifacts.map((x) => (
                <button key={x.uid} onClick={() => setSelUid(x.uid)} className={`w-full text-left p-2 rounded border text-sm ${selUid === x.uid ? "border-[#C28B49]" : "hairline hover:border-[#6D9A83]"}`}>
                  <div className="flex justify-between items-center">
                    <span className="truncate">{x.uid} · {x.name}</span>
                    <ConfidenceBadge c={x.confidenceLabel} />
                  </div>
                  <div className="text-[0.65rem] text-[#A2B0B2]">{x.category} · {x.evidences.length} evidence · {Math.round(x.confidence * 100)}% conf</div>
                </button>
              ))}
            </div>
          </div>

          {/* analysis workspace */}
          <div>
            {!a ? (
              <Empty title="No artifact selected" body="Recover artifacts on expeditions, then analyze them here to build evidence and raise attribution confidence." />
            ) : (
              <div className="panel-elevated p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl">{a.name} <span className="text-sm text-[#A2B0B2]">({a.uid})</span></h3>
                  <ConfidenceBadge c={a.confidenceLabel} />
                </div>
                <p className="text-xs text-[#A2B0B2] mb-3">{a.description}</p>

                <div className="grid sm:grid-cols-2 gap-2 mb-4">
                  {OPS.map((op) => {
                    const cost = RESEARCH_COSTS[op];
                    const disabled = op === "inscription" && a.category !== "inscription";
                    return (
                      <Tooltip key={op} text={disabled ? "Only applies to inscription artifacts." : `Runs the ${RESEARCH_LABELS[op]} analysis. Evidence may be added; confidence can rise or fall.`}>
                        <button
                          className="btn btn-ghost w-full justify-between !text-xs"
                          disabled={disabled || s.resources.research < cost.research}
                          onClick={() => g.analyze(a.uid, op)}
                        >
                          <span>{RESEARCH_LABELS[op]}</span>
                          <span className="num text-[#C28B49]">{cost.research} RP</span>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 border-t hairline pt-3">
                  <Tooltip text="Needs ≥2 pieces of evidence. Can raise confidence — or honestly say the attribution isn't there yet.">
                    <button className="btn btn-jade !text-xs" disabled={s.resources.research < 18 || a.evidences.length < 2} onClick={() => g.verify(a.uid)}>
                      Verify evidence (18 RP)
                    </button>
                  </Tooltip>
                  <Tooltip text="Pays đ and reputation. Needs ≥55% confidence and 10 RP.">
                    <button className="btn btn-jade !text-xs" disabled={a.confidence < 0.55 || s.resources.research < 10} onClick={() => g.publish(a.uid)}>
                      Publish finding (10 RP)
                    </button>
                  </Tooltip>
                  <Tooltip text="Digitization raises the artifact's public accessibility — valued by the Digital Heritage Grant.">
                    <button className="btn btn-jade !text-xs" disabled={s.resources.cash < 4000} onClick={() => g.digitize(a.uid)}>
                      Digitize (4,000 đ)
                    </button>
                  </Tooltip>
                </div>

                {/* hypotheses + evidence */}
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Hypotheses</div>
                    <ul className="text-xs space-y-1">
                      {a.hypotheses.map((h) => (
                        <li key={h.id} className="flex gap-2"><span className="num text-[#C28B49]">{Math.round(h.probability * 100)}%</span><span className="text-[#A2B0B2]">{h.statement}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Evidence ({a.evidences.length})</div>
                    <ul className="text-xs space-y-1">
                      {a.evidences.map((e) => (
                        <li key={e.id} className="border-l-2 border-[#6D9A83] pl-2 text-[#A2B0B2]"><span className="text-[#F0E9D9]">{e.label}</span> — {e.detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {recentReports.length > 0 && (
        <Panel title="Recent analysis reports" sub="Every report labels its engine: 'rule-based' = local heuristic simulation, not an external AI service.">
          <div className="space-y-3">
            {recentReports.map((r, i) => (
              <div key={i} className="panel-elevated p-3 text-sm">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <span className="tag">{RESEARCH_LABELS[r.op]}</span>
                  <span className="tag">engine: {r.engine}</span>
                  <span className="tag num">conf {Math.round(r.confidence * 100)}%</span>
                </div>
                <p className="text-[#F0E9D9]">{r.interpretation}</p>
                <ul className="text-xs text-[#6D9A83] mt-1 list-disc list-inside">{r.supporting.map((x, j) => <li key={j}>{x}</li>)}</ul>
                <ul className="text-xs text-[#D66D67] mt-1 list-disc list-inside">{r.missing.map((x, j) => <li key={j}>{x}</li>)}</ul>
                <p className="text-xs text-[#A2B0B2] mt-1">Next step: {r.nextStep}</p>
                {r.sources.length > 0 && <p className="text-[0.65rem] text-[#A2B0B2]/70 mt-1">Sources (local reference index): {r.sources.join("; ")}</p>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
