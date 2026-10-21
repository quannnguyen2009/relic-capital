"use client";
import { useGame } from "@/game/store";
import { Panel } from "./ui";
import { ERAS } from "@/game/data/world";

const CODEX: { id: string; title: string; category: string; body: string; label: "mechanic" | "history" | "mixed" }[] = [
  { id: "exc", title: "Excavation & context", category: "Fieldwork", label: "mixed", body: "An artifact means little without its layer. Every find in this game carries an excavation context note — in real archaeology, context is most of the evidence. Destroying context by digging carelessly is how information, not just objects, is lost." },
  { id: "prov", title: "Provenance & attribution", category: "Fieldwork", label: "mechanic", body: "Provenance completeness measures how well an object's recovery history is documented (0–100%). High provenance raises grant scores and evidentiary weight; low provenance is a red flag the anomaly detector will call out." },
  { id: "strat", title: "Stratigraphy & dating", category: "Fieldwork", label: "history", body: "Artifacts are dated by their layer (relative dating) and, when possible, absolute methods like radiocarbon. In-game, 'Period estimation' mimics typological comparison: it can be wrong — treat its output as a hypothesis until verified." },
  { id: "cons", title: "Conservation", category: "Fieldwork", label: "mixed", body: "Fragile objects demand climate control and cautious handling. Poor conditions degrade artifacts, lowering evidence quality. The Conservation Grant rewards safe recovery." },
  { id: "ocr", title: "OCR, imaging & computer vision", category: "Research", label: "history", body: "High-resolution imaging (RTI, structured-light scanning) lets researchers read worn inscriptions and record finds in 3D. This game simulates such tools as 'evidence quality' boosts — no external AI service is used; the analysis engine is rule-based and labeled." },
  { id: "conf", title: "Classification confidence", category: "Research", label: "mechanic", body: "Confidence (0–100%) reflects evidence quality, not certainty. Labels: Hypothesis < 50%, Probable ≥ 50%, Robust ≥ 70%, Verified ≥ 85%. Verification can lower confidence — that is the system working honestly." },
  { id: "unc", title: "Research uncertainty", category: "Research", label: "mechanic", body: "Some questions stay unresolved no matter how much you spend. Publishing with modest confidence is legitimate — the journal records it, and later contradictory evidence may force revision." },
  { id: "oppcost", title: "Opportunity cost", category: "Finance", label: "mechanic", body: "Money spent on equipment cannot fund a dig this season. Workers on one site cannot survey another. The estimate panel warns when an expedition eats most of your cash." },
  { id: "runway", title: "Cash flow & runway", category: "Finance", label: "mechanic", body: "Runway = how many days the institute survives at the current burn rate. Operating expenses run daily even when you do nothing. Grants and publications are the intended income; the market layer is a risk lever, not a salary." },
  { id: "risk", title: "Risk, volatility & diversification", category: "Finance", label: "mechanic", body: "Each instrument has volatility (swing magnitude), liquidity and risk level. High-volatility instruments can surge or crash on events. Spreading positions across low- and high-risk instruments dampens single-event damage. All instruments are fictional." },
  { id: "dson", title: "Đông Sơn culture", category: "Historical", label: "history", body: "The Vietnamese Bronze Age (c. 700 BCE–100 CE), famed for bronze drums with star motifs and frog finials, sophisticated ceramics and large settlements in the Red River Delta. In-game Đông Sơn artifacts are fictional objects inspired by this tradition; the type is family-real." },
  { id: "champa", title: "Champa", category: "Historical", label: "history", body: "A Hindu-Buddhist maritime polity in central Vietnam (c. 200–1400 CE), leaving brick temple towers and Sanskrit-stele inscriptions (e.g., Trà Kiệu, Mỹ Sơn). In-game Champa finds are fictionalized echoes, not real objects." },
  { id: "oceo", title: "Óc Eo & maritime trade", category: "Historical", label: "history", body: "The Óc Eo site in An Giang yielded Roman coins, Indian jewellery and Chinese lacquer — evidence of long-distance exchange. The in-game 'Roman antoninianus' references this documented phenomenon; your specific finds are fictional." },
  { id: "hannom", title: "Hán–Nôm manuscripts", category: "Historical", label: "history", body: "Vietnamese archival texts written in Classical Chinese (chữ Hán) and the vernacular demotic script (chữ Nôm). In-game manuscript fragments are fictional; their analysis mechanics evoke real philology." },
];

export default function CodexScreen() {
  const g = useGame();
  const s = g.s!;
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Codex" sub="Mechanics, finance, and historical background. Historical entries distinguish real context from fictional gameplay material.">
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {CODEX.map((c) => (
              <details key={c.id} className="panel-elevated p-3">
                <summary className="cursor-pointer font-display text-base flex items-center gap-2">
                  {c.title}
                  <span className={`tag ${c.label === "history" ? "border-[#6D9A83] text-[#6D9A83]" : c.label === "mixed" ? "border-[#C28B49] text-[#C28B49]" : ""}`}>
                    {c.label === "history" ? "historical" : c.label === "mixed" ? "history + mechanic" : "mechanic"}
                  </span>
                </summary>
                <p className="text-sm text-[#A2B0B2] mt-2">{c.body}</p>
              </details>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Eras of reference">
            <div className="space-y-2">
              {ERAS.map((e) => (
                <div key={e.id} className="panel-elevated p-2.5">
                  <div className="flex justify-between text-sm"><span className="font-display">{e.name}</span><span className="num text-xs text-[#A2B0B2]">{e.range}</span></div>
                  <p className="text-xs text-[#A2B0B2]">{e.desc}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Journal" sub="Discoveries, decisions, events and finance — the institute's collective memory.">
            <ul className="text-xs space-y-1 max-h-72 overflow-y-auto">
              {[...s.journal].reverse().map((j, i) => (
                <li key={i} className="flex gap-2">
                  <span className="num text-[#A2B0B2] shrink-0">D{j.day}</span>
                  <span className={j.kind === "discovery" ? "text-[#C28B49]" : j.kind === "event" ? "text-[#B9654B]" : j.kind === "finance" ? "text-[#6D9A83]" : "text-[#A2B0B2]"}>{j.entry}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Tutorial">
            <p className="text-sm text-[#A2B0B2]">Replay the guided first expedition with Dr. Linh at any time.</p>
            <button className="btn btn-primary mt-2" onClick={() => g.replayTutorial()}>
              Replay tutorial
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
