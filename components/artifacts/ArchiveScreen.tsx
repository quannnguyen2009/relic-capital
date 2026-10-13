"use client";
import { useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, ConfidenceBadge, Empty } from "../ui";
import { CATEGORY_LABELS } from "@/game/data/world";
import { SITES } from "@/game/data/world";
import type { PlayerArtifact } from "@/game/engine/types";

export default function ArchiveScreen() {
  const g = useGame();
  const s = g.s!;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"recent" | "sig" | "conf">("recent");
  const [sel, setSel] = useState<PlayerArtifact | null>(null);

  const list = useMemo(() => {
    let l = s.artifacts.filter((a) => {
      if (q && !(a.name + a.description + a.uid).toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && a.category !== cat) return false;
      if (status !== "all" && a.status !== status) return false;
      return true;
    });
    if (sort === "sig") l = [...l].sort((a, b) => b.significance - a.significance);
    if (sort === "conf") l = [...l].sort((a, b) => b.confidence - a.confidence);
    if (sort === "recent") l = [...l].reverse();
    return l;
  }, [s.artifacts, q, cat, status, sort]);

  return (
    <div className="space-y-4">
      <Panel title="Artifact Archive" sub="Every artifact is a structured record with hypotheses, evidence and uncertainty — not a single answer.">
        <div className="flex flex-wrap gap-2 mb-4">
          <input className="input !w-56" placeholder="Search name, id, description…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input !w-40" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {Object.keys(CATEGORY_LABELS).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]}</option>)}
          </select>
          <select className="input !w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Any status</option>
            <option value="unanalyzed">Unanalyzed</option>
            <option value="classified">Classified</option>
            <option value="verified">Verified</option>
            <option value="published">Published</option>
          </select>
          <select className="input !w-40" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recent">Newest first</option>
            <option value="sig">Significance ↓</option>
            <option value="conf">Confidence ↓</option>
          </select>
        </div>

        {list.length ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((a) => (
              <button key={a.uid} onClick={() => setSel(a)} className="text-left panel-elevated p-3 hover:border-[#C28B49] transition-colors flex gap-3">
                <div className="w-14 h-14 bg-cover bg-center rounded shrink-0 border hairline" style={{ backgroundImage: `url(${a.image})` }} />
                <div className="min-w-0">
                  <div className="font-display text-sm truncate">{a.uid} · {a.name}</div>
                  <div className="text-[0.7rem] text-[#A2B0B2]">{a.category} · {a.material} · sig {a.significance}/10</div>
                  <div className="mt-1 flex gap-1 items-center">
                    <ConfidenceBadge c={a.confidenceLabel} />
                    <span className="tag">{a.status}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Empty title="Archive empty" body="No artifacts match. Recover material on an expedition — discoveries will be recorded here automatically." action={<button className="btn btn-primary" onClick={() => g.setScreen("map")}>To the map</button>} />
        )}
      </Panel>

      {sel && <Detail a={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function Detail({ a, onClose }: { a: PlayerArtifact; onClose: () => void }) {
  const g = useGame();
  const site = SITES.find((x) => x.id === a.siteId);
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="panel-elevated w-full max-w-2xl max-h-[88vh] overflow-y-auto rise-in" onClick={(e) => e.stopPropagation()}>
        <div className="h-32 bg-cover bg-center border-b hairline relative" style={{ backgroundImage: `url(${a.image})` }}>
          <button className="btn btn-ghost absolute top-2 right-2 !py-0.5" onClick={onClose}>Close ✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-2xl">{a.name}</h3>
              <ConfidenceBadge c={a.confidenceLabel} />
              <span className="tag">{a.status}</span>
            </div>
            <p className="text-xs text-[#A2B0B2] mt-1">{a.uid} · {site?.name} · acquired day {a.acquiredDay} · {a.context}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 num text-sm">
            <KV k="Category" v={a.category} />
            <KV k="Material" v={a.material} />
            <KV k="Period (est.)" v={a.period} />
            <KV k="Condition" v={a.condition} />
            <KV k="Significance" v={`${a.significance}/10`} />
            <KV k="Attribution conf." v={`${Math.round(a.confidence * 100)}%`} />
            <KV k="Provenance" v={`${Math.round(a.provenance * 100)}%`} />
            <KV k="Accessibility" v={`${Math.round(a.accessibility * 100)}%`} />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Description</div>
            <p className="text-sm text-[#A2B0B2]">{a.description}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Competing hypotheses <span className="normal-case">(uncertainty is kept explicit on purpose)</span></div>
            <ul className="text-sm space-y-1">
              {a.hypotheses.map((h) => (
                <li key={h.id} className="flex gap-2 items-baseline">
                  <span className="num text-[#C28B49] w-10 shrink-0">{Math.round(h.probability * 100)}%</span>
                  <span className="text-[#A2B0B2]">{h.statement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Evidence</div>
            <ul className="text-sm space-y-1">
              {a.evidences.map((e) => (
                <li key={e.id} className="border-l-2 border-[#6D9A83] pl-2">
                  <span className="text-[#F0E9D9]">{e.label}</span> <span className="text-[#A2B0B2]">— {e.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Conservation</div>
            <p className="text-sm text-[#A2B0B2]">{a.conservationReq}</p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Research log</div>
            <ul className="text-xs text-[#A2B0B2] space-y-0.5 num">
              {a.researchLog.map((l, i) => <li key={i}>Day {l.day}: {l.entry}</li>)}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={() => { g.setScreen("lab"); onClose(); }}>Open in Research Lab →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return <div className="border hairline rounded p-2"><div className="text-[0.6rem] uppercase tracking-wider text-[#A2B0B2]">{k}</div><div className="capitalize">{v}</div></div>;
}
