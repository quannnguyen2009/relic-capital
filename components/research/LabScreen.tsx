"use client";
import { useState } from "react";
import { useGame } from "@/game/store";
import { Panel, ConfidenceBadge, Empty, Tooltip } from "../ui";
import { RESEARCH_LABELS, RESEARCH_COSTS } from "@/game/engine/research";
import { REF_RECORDS } from "@/game/data/systems";
import type { ResearchOp, PlayerArtifact } from "@/game/engine/types";

const OPS: ResearchOp[] = ["classification", "period", "inscription", "refMatch", "contextual", "anomaly", "confidence"];

export default function LabScreen() {
  const g = useGame();
  const s = g.s!;
  const [selUid, setSelUid] = useState<string | null>(s.artifacts[s.artifacts.length - 1]?.uid ?? null);
  const [compareRef, setCompareRef] = useState(false);
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
                  <button className="btn btn-primary !text-xs" onClick={() => setCompareRef(true)}>
                    🔬 Side-by-Side Typology Match
                  </button>
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

      {/* Side-by-side Reference Comparison Modal */}
      {compareRef && a && (
        <ReferenceComparator a={a} onClose={() => setCompareRef(false)} />
      )}

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

function ReferenceComparator({ a, onClose }: { a: PlayerArtifact; onClose: () => void }) {
  const [selectedRefId, setSelectedRefId] = useState<string>(() => {
    const matched = REF_RECORDS.find((r) => r.category === a.category);
    return matched ? matched.id : REF_RECORDS[0].id;
  });

  const ref = REF_RECORDS.find((r) => r.id === selectedRefId) || REF_RECORDS[0];
  const materialMatch = ref.material.toLowerCase().includes(a.material.toLowerCase()) || a.material.toLowerCase().includes(ref.material.toLowerCase());
  const categoryMatch = ref.category.toLowerCase() === a.category.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="panel-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 space-y-4 rise-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b hairline pb-3">
          <div>
            <h3 className="font-display text-xl text-[#F0E9D9]">Side-by-Side Typological Concordance</h3>
            <p className="text-xs text-[#A2B0B2]">Compare excavated archaeological material with documented museum reference typologies.</p>
          </div>
          <button className="btn btn-ghost !py-1" onClick={onClose}>Close ✕</button>
        </div>

        {/* Reference Selector */}
        <div>
          <label className="text-[0.65rem] uppercase text-[#A2B0B2] block mb-1">Select Reference Type Record</label>
          <select className="input !w-full" value={selectedRefId} onChange={(e) => setSelectedRefId(e.target.value)}>
            {REF_RECORDS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} [{r.category.toUpperCase()}] — {r.era} ({r.region})
              </option>
            ))}
          </select>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Excavated Find */}
          <div className="border hairline rounded p-4 bg-[#121f29] space-y-3">
            <div className="flex items-center gap-2">
              <span className="tag border-[#C28B49] text-[#C28B49]">Excavated Find</span>
              <ConfidenceBadge c={a.confidenceLabel} />
            </div>
            <div className="h-40 bg-cover bg-center rounded border hairline" style={{ backgroundImage: `url(${a.image})` }} />
            <div>
              <h4 className="font-display text-lg text-[#F0E9D9]">{a.name}</h4>
              <p className="text-xs text-[#A2B0B2]">{a.uid} · Context: {a.context}</p>
            </div>
            <div className="text-xs space-y-1 num border-t hairline pt-2">
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Material:</span><span>{a.material}</span></div>
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Category:</span><span>{a.category}</span></div>
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Period (est):</span><span>{a.period}</span></div>
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Significance:</span><span>{a.significance}/10</span></div>
            </div>
            <div className="border-t hairline pt-2">
              <div className="text-[0.65rem] uppercase text-[#A2B0B2] mb-1">Diagnostic Evidence Recorded ({a.evidences.length})</div>
              <ul className="text-xs space-y-1">
                {a.evidences.map((e) => (
                  <li key={e.id} className="text-[#6D9A83] text-[0.7rem]">• {e.label}: {e.detail}</li>
                ))}
                {!a.evidences.length && <li className="text-[#A2B0B2] text-[0.7rem]">No lab evidence verified yet.</li>}
              </ul>
            </div>
          </div>

          {/* Right: Reference Typology Record */}
          <div className="border hairline rounded p-4 bg-[#15232e] space-y-3">
            <div className="flex items-center gap-2">
              <span className="tag border-[#6D9A83] text-[#6D9A83]">Museum Reference Standard</span>
              <span className="tag">{ref.era}</span>
            </div>
            <div className="h-40 bg-gradient-to-br from-[#1a2d3a] to-[#0c161d] rounded border hairline p-4 flex flex-col justify-center items-center text-center">
              <div className="text-3xl mb-1">🏛</div>
              <div className="font-display text-sm text-[#F0E9D9]">{ref.name}</div>
              <div className="text-[0.65rem] text-[#A2B0B2] mt-1 italic">{ref.ref}</div>
            </div>
            <div>
              <h4 className="font-display text-lg text-[#F0E9D9]">{ref.name}</h4>
              <p className="text-xs text-[#A2B0B2]">Region: {ref.region} · Era: {ref.era}</p>
            </div>
            <div className="text-xs space-y-1 num border-t hairline pt-2">
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Material:</span><span>{ref.material}</span></div>
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Category:</span><span>{ref.category}</span></div>
              <div className="flex justify-between"><span className="text-[#A2B0B2]">Reference ID:</span><span>{ref.id}</span></div>
            </div>
            <div className="border-t hairline pt-2">
              <div className="text-[0.65rem] uppercase text-[#A2B0B2] mb-1">Typological Note</div>
              <p className="text-xs text-[#E0D7C5] leading-relaxed">{ref.note}</p>
            </div>
          </div>
        </div>

        {/* Concordance Assessment */}
        <div className="panel-elevated p-3 border hairline bg-[#0d161d] flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-display text-[#C28B49]">Concordance Factors:</span>
            <span className={categoryMatch ? "text-[#6D9A83]" : "text-[#D66D67]"}>
              {categoryMatch ? "✓ Category Match" : "✕ Category Divergence"}
            </span>
            <span className={materialMatch ? "text-[#6D9A83]" : "text-[#D66D67]"}>
              {materialMatch ? "✓ Material Composition Compatible" : "○ Material Differs"}
            </span>
          </div>
          <div className="text-[#A2B0B2] text-[0.7rem]">
            Peer-reviewed source: <span className="text-[#F0E9D9]">{ref.ref}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
