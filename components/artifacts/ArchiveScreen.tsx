"use client";
import { useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, ConfidenceBadge, Empty } from "../ui";
import { CATEGORY_LABELS } from "@/game/data/world";
import { SITES } from "@/game/data/world";
import { ASSEMBLAGES, ARTIFACT_TEMPLATES, ERA_LABELS, REGION_LABELS } from "@/game/data/world";
import { fmt } from "@/game/engine/core";
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

  const catalogedTemplates = useMemo(
    () => new Set(s.artifacts.filter((a) => a.status !== "unanalyzed").map((a) => a.templateId)),
    [s.artifacts],
  );
  const completedAssemblages = s.completedAssemblages ?? [];
  const [showCollections, setShowCollections] = useState(true);
  const [showCurate, setShowCurate] = useState(false);
  const [curateTitle, setCurateTitle] = useState("Voices of Antiquity: Vietnam's Material Horizons");
  const [curateTheme, setCurateTheme] = useState("Đông Sơn Bronze & Metalurgy");
  const [curateSelected, setCurateSelected] = useState<string[]>([]);

  const toggleSelectForExhibition = (uid: string) => {
    setCurateSelected((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : prev.length < 5 ? [...prev, uid] : prev
    );
  };

  const handleLaunchExhibition = () => {
    if (curateSelected.length < 2) return;
    g.curateExhibition(curateTitle, curateTheme, curateSelected);
    setShowCurate(false);
    setCurateSelected([]);
  };

  return (
    <div className="space-y-4">
      {/* Active Museum Exhibition Showcase */}
      {s.activeExhibition && (
        <div className="panel-elevated p-4 border border-[#C28B49]/60 bg-[#C28B49]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="tag border-[#C28B49] text-[#C28B49]">🏛 Active Exhibition</span>
              <span className="text-xs text-[#A2B0B2]">
                Day {Math.min(s.activeExhibition.durationDays, Math.max(1, s.day - s.activeExhibition.dayStarted + 1))} of {s.activeExhibition.durationDays}
              </span>
            </div>
            <h3 className="font-display text-lg text-[#F0E9D9] mt-1">{s.activeExhibition.title}</h3>
            <p className="text-xs text-[#A2B0B2]">{s.activeExhibition.theme} · Featuring {s.activeExhibition.artifactUids.length} curatorial finds</p>
          </div>
          <div className="flex items-center gap-4 text-xs num">
            <div className="text-right">
              <div className="text-[#6D9A83] font-bold">+{s.activeExhibition.dailyRevenue.toLocaleString()} đ / day</div>
              <div className="text-[#A2B0B2]">Ticket gate receipts</div>
            </div>
            <div className="text-right">
              <div className="text-[#C28B49] font-bold">+{s.activeExhibition.reputationGain} Rep</div>
              <div className="text-[#A2B0B2]">Completion prestige</div>
            </div>
          </div>
        </div>
      )}

      {/* Exhibition Curation Drawer / Builder */}
      {showCurate && (
        <div className="panel-elevated p-4 border border-[#6D9A83]">
          <div className="flex justify-between items-baseline mb-3">
            <h3 className="font-display text-base text-[#6D9A83]">Curate New Museum Exhibition</h3>
            <button className="btn btn-ghost !py-0.5 !text-xs" onClick={() => setShowCurate(false)}>Close ✕</button>
          </div>
          <p className="text-xs text-[#A2B0B2] mb-3">
            Select 2 to 5 artifacts from your vault. Public exhibitions generate daily ticket sales over a 14-day residency and culminate in an institutional prestige grant.
          </p>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[0.65rem] uppercase text-[#A2B0B2] block mb-1">Exhibition Title</label>
              <input className="input !w-full" value={curateTitle} onChange={(e) => setCurateTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-[0.65rem] uppercase text-[#A2B0B2] block mb-1">Curatorial Theme</label>
              <select className="input !w-full" value={curateTheme} onChange={(e) => setCurateTheme(e.target.value)}>
                <option value="Đông Sơn Bronze & Metalurgy">Đông Sơn Bronze & Metallurgy</option>
                <option value="Maritime Spice & Ceramic Networks">Maritime Spice & Ceramic Networks</option>
                <option value="Đại Việt Imperial Stoneware">Đại Việt Imperial Stoneware</option>
                <option value="Sa Huỳnh Jar Burials & Ornaments">Sa Huỳnh Jar Burials & Ornaments</option>
                <option value="Óc Eo Cosmopolitan Trade">Óc Eo Cosmopolitan Trade</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[0.65rem] uppercase text-[#A2B0B2] mb-1">
              Select Artifacts ({curateSelected.length}/5 selected, minimum 2):
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {s.artifacts.map((a) => {
                const isSelected = curateSelected.includes(a.uid);
                return (
                  <button
                    key={a.uid}
                    onClick={() => toggleSelectForExhibition(a.uid)}
                    className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                      isSelected
                        ? "border-[#C28B49] bg-[#C28B49]/20 text-[#F0E9D9]"
                        : "hairline hover:border-[#6D9A83] text-[#A2B0B2]"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}{a.name} (sig {a.significance}/10)
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-primary !text-xs"
              disabled={curateSelected.length < 2 || !!s.activeExhibition}
              onClick={handleLaunchExhibition}
            >
              {s.activeExhibition ? "Exhibition in progress" : `Stage Exhibition (${curateSelected.length} items)`}
            </button>
          </div>
        </div>
      )}

      <Panel
        title="Museum assemblages"
        sub={`${completedAssemblages.length}/${ASSEMBLAGES.length} complete — run any analysis on a find to catalog it into its set.`}
        action={
          <button className="btn btn-ghost !py-0.5 !px-2 !text-[0.7rem]" onClick={() => setShowCollections((v) => !v)}>
            {showCollections ? "Hide" : "Show"}
          </button>
        }
      >
        {showCollections && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {ASSEMBLAGES.map((def) => {
              const owned = def.templateIds.filter((t) => catalogedTemplates.has(t));
              const rewarded = completedAssemblages.includes(def.id);
              return (
                <div key={def.id} className={`panel-elevated p-3 ${rewarded ? "border-[#C28B49]" : ""}`}>
                  <div className="flex justify-between items-baseline gap-2">
                    <div className="font-display text-sm text-[#F0E9D9]">{def.name}</div>
                    <span className={`tag shrink-0 ${rewarded ? "border-[#C28B49] text-[#C28B49]" : "text-[#8a9ea8]"}`}>
                      {rewarded ? "COMPLETE" : `${owned.length}/${def.templateIds.length}`}
                    </span>
                  </div>
                  <div className="text-[0.6rem] uppercase tracking-wider text-[#8a9ea8] mt-0.5">
                    {ERA_LABELS[def.era]} · {REGION_LABELS[def.region]}
                  </div>
                  <p className="text-[0.7rem] text-[#A2B0B2] mt-1">{def.desc}</p>
                  <ul className="mt-2 space-y-0.5">
                    {def.templateIds.map((t) => {
                      const tpl = ARTIFACT_TEMPLATES.find((x) => x.id === t);
                      const has = catalogedTemplates.has(t);
                      return (
                        <li key={t} className={`text-[0.7rem] flex gap-1 ${has ? "text-[#6D9A83]" : "text-[#8a9ea8]"}`}>
                          <span>{has ? "[X]" : "[ ]"}</span>
                          <span className="truncate">{tpl?.name ?? t}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 text-[0.65rem] num mt-2">
                    <span className="text-[#6D9A83]">+{fmt(def.reward.cash)} đ</span>
                    <span className="text-[#8fb8d8]">+{def.reward.research} RP</span>
                    <span className="text-[#C28B49]">+{def.reward.reputation} rep</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel
        title="Artifact Archive"
        sub="Every artifact is a structured record with hypotheses, evidence and uncertainty — not a single answer."
      >
        <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
          <div className="flex flex-wrap gap-2">
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
          {!s.activeExhibition && s.artifacts.length >= 2 && !showCurate && (
            <button className="btn btn-jade !text-xs" onClick={() => setShowCurate(true)}>
              🏛 Curate Museum Exhibition
            </button>
          )}
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

          <div className="flex justify-end gap-2 flex-wrap items-center">
            {a.status !== "published" && (
              <button
                className="btn btn-jade !text-xs"
                disabled={a.confidence < 0.55 || (g.s?.resources.research ?? 0) < 10}
                onClick={() => {
                  const r = g.publish(a.uid);
                  if (r.ok) onClose();
                }}
                title={a.confidence < 0.55 ? "Requires ≥55% attribution confidence to publish." : "Publish peer-reviewed monograph for cash and reputation."}
              >
                Publish finding (10 RP)
              </button>
            )}
            <button className="btn btn-ghost !text-xs" onClick={() => { g.setScreen("lab"); onClose(); }}>Open in Research Lab →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return <div className="border hairline rounded p-2"><div className="text-[0.6rem] uppercase tracking-wider text-[#A2B0B2]">{k}</div><div className="capitalize">{v}</div></div>;
}
