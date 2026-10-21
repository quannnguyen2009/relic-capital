"use client";
import { useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt } from "@/game/engine/core";
import { REGIONS, SITES, ERA_LABELS, CATEGORY_LABELS } from "@/game/data/world";
import type { Site, ExpeditionPlan } from "@/game/engine/types";

function defaultPlan(siteId: string): ExpeditionPlan {
  return { siteId, workers: 4, days: 4, equipment: [], survey: true, careful: true, objective: "balanced" };
}

const REGION_POS: Record<string, { x: number; y: number }> = {
  north: { x: 50, y: 22 },
  delta: { x: 52, y: 34 },
  central: { x: 44, y: 56 },
  highlands: { x: 47, y: 74 },
  south: { x: 38, y: 88 },
};

export default function MapScreen() {
  const g = useGame();
  const s = g.s!;
  const [selected, setSelected] = useState<Site | null>(null);

  const sitePlots = useMemo(
    () =>
      SITES.map((site) => {
        const pos = REGION_POS[site.region];
        const idx = SITES.findIndex((y) => y.id === site.id);
        const offset = SITES.slice(0, idx).filter((x) => x.region === site.region).length;
        return { site, x: pos.x + offset * 7, y: pos.y - offset * 3 };
      }),
    []
  );

  return (
    <div className="space-y-4">
      <Panel title="Exploration Map" sub="Fictionalized map inspired by Vietnam's archaeology. Real contexts are labeled; expedition scenarios at fictional sites are invented for play. Click a marker to inspect a site.">
        <div className="relative rounded border hairline overflow-hidden bg-[#0a151e] map-frame shadow-2xl">
          <div className="map-inner relative" style={{ paddingBottom: "82%" }}>
            {/* Geographic SVG of Vietnam with terrain contours & oceanic markings */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="vietnamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#192b38" />
                  <stop offset="50%" stopColor="#142430" />
                  <stop offset="100%" stopColor="#0e1a24" />
                </linearGradient>
                <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#1d303f" strokeWidth="0.15" />
                </pattern>
              </defs>

              <rect width="100" height="100" fill="url(#grid)" opacity="0.4" />

              {/* Vietnam S-Curve Landmass */}
              <path
                d="M 38,4 
                   C 46,2 58,4 62,8 
                   C 66,12 60,18 54,22 
                   C 57,25 61,30 55,36 
                   C 51,41 47,48 44,56 
                   C 42,62 48,68 46,74 
                   C 44,80 39,86 35,92 
                   C 31,97 25,96 22,90 
                   C 20,84 25,80 28,76 
                   C 32,71 36,65 37,58 
                   C 38,50 33,42 30,34 
                   C 26,26 22,18 28,10 
                   Z"
                fill="url(#vietnamGrad)"
                stroke="#33566b"
                strokeWidth="0.6"
              />

              {/* Red River Delta & Mekong Delta Estuary Accents */}
              <path d="M 48,16 Q 54,20 53,24" stroke="#487894" strokeWidth="0.6" fill="none" opacity="0.7" />
              <path d="M 28,84 Q 34,88 32,94" stroke="#487894" strokeWidth="0.6" fill="none" opacity="0.7" />

              {/* Maritime labels */}
              <text x="74" y="32" fill="#3a6078" fontSize="3.6" fontFamily="serif" textAnchor="middle" letterSpacing="0.1em">BIỂN ĐÔNG</text>
              <text x="74" y="37" fill="#2d4c5f" fontSize="2.2" textAnchor="middle">(South China Sea)</text>

              <text x="76" y="58" fill="#284455" fontSize="2.2" textAnchor="middle">Quần đảo Hoàng Sa</text>
              <circle cx="76" cy="54" r="0.8" fill="#3a6078" />
              <circle cx="78" cy="55" r="0.6" fill="#3a6078" />

              <text x="72" y="86" fill="#284455" fontSize="2.2" textAnchor="middle">Quần đảo Trường Sa</text>
              <circle cx="72" cy="82" r="0.8" fill="#3a6078" />
              <circle cx="74" cy="83" r="0.6" fill="#3a6078" />

              {/* Active Expedition Vector from Hanoi HQ to target site */}
              {s.expedition && s.expedition.phase === "active" && (() => {
                const target = sitePlots.find((p) => p.site.id === s.expedition?.plan.siteId);
                if (!target) return null;
                return (
                  <g>
                    <line
                      x1="50"
                      y1="16"
                      x2={target.x}
                      y2={target.y}
                      stroke="#C28B49"
                      strokeWidth="0.7"
                      strokeDasharray="2,1.5"
                    />
                    <circle cx="50" cy="16" r="1.4" fill="#C28B49" />
                    <text x="50" y="13.5" fill="#C28B49" fontSize="2.4" textAnchor="middle" fontWeight="bold">Hà Nội HQ</text>
                  </g>
                );
              })()}
            </svg>

            {/* Season Badge Overlay */}
            <div className="absolute top-2.5 right-3 bg-[#0b1822]/90 border hairline px-2.5 py-1 rounded text-xs text-[#A2B0B2] pointer-events-none z-10 flex items-center gap-2">
              <span className="text-[#C28B49]">🌦</span>
              <span>{(s.day % 60) < 30 ? "Mùa Khô (Northeast Monsoon)" : "Mùa Mưa (Southwest Monsoon)"}</span>
            </div>      {sitePlots.map(({ site, x, y }) => {
        const unlocked = s.siteUnlocked.includes(site.id);
        const regionOk = s.regionUnlocked.includes(site.region);
        const status: "available" | "locked" | "region-locked" = !regionOk ? "region-locked" : unlocked ? "available" : "locked";
              return (
                <button
                  key={site.id}
                  onClick={() => setSelected(site)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%`, zIndex: 2 }}
                  aria-label={site.name}
                >
                  <span
                    className={`block w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-150 ${
                      status === "available"
                        ? "bg-[#C28B49] border-[#F0E9D9]"
                        : status === "locked"
                        ? "bg-[#2e4354] border-[#4a657a]"
                        : "bg-[#22303c] border-[#39505e] border-dashed"
                    }`}
                  />
                  <span className="absolute left-6 top-0 whitespace-nowrap text-[0.7rem] bg-[#0b1822]/85 px-1.5 py-0.5 rounded border hairline opacity-70 group-hover:opacity-100 pointer-events-none">
                    {site.name}
                  </span>
                </button>
              );
            })}
            {REGIONS.map((r) => {
              const p = REGION_POS[r.id];
              return (
                <div key={r.id} className="absolute -translate-x-1/2 text-[0.65rem] uppercase tracking-wider text-[#5f7d8c] pointer-events-none" style={{ left: `${p.x + 8}%`, top: `${p.y + 3}%` }}>
                  {r.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* region unlock bar */}
        <div className="mt-3 flex flex-wrap gap-2">
          {REGIONS.filter((r) => !s.regionUnlocked.includes(r.id)).map((r) => (
            <Tooltip key={r.id} text={`Commission regional access: ${r.theme}. Requires ${r.requiresReputation} reputation and ${fmt(r.unlockCost)} đ.`}>
              <button className="btn btn-ghost" onClick={() => g.unlockRegion(r.id)}>
                Unlock {r.name} — {fmt(r.unlockCost)} đ · rep {r.requiresReputation}
              </button>
            </Tooltip>
          ))}
        </div>
      </Panel>

      {selected && <SiteDetail site={selected} onClose={() => setSelected(null)} />}
      {!selected && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SITES.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}

function SiteCard({ site }: { site: Site }) {
  const g = useGame();
  const s = g.s!;
  const unlocked = s.siteUnlocked.includes(site.id);
  const regionOk = s.regionUnlocked.includes(site.region);
  return (
    <div className={`panel p-0 overflow-hidden ${!regionOk ? "opacity-50" : ""}`}>
      <div className="h-28 bg-cover bg-center border-b hairline relative" style={{ backgroundImage: `url(${site.image ?? "/assets/sites/DEFAULT.jpg"})` }}>
        {!regionOk && <div className="absolute inset-0 bg-[#09131B]/60 flex items-center justify-center text-xs text-[#A2B0B2]">Region locked</div>}
        <div className="absolute top-2 left-2 tag bg-[#0b1822]/85">{site.status === "fictional" ? "Fictional scenario" : "Real site (fictionalized data)"}</div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-baseline">
          <h3 className="font-display text-lg">{site.name}</h3>
          <span className="text-xs text-[#A2B0B2]">{REGIONS.find((r) => r.id === site.region)?.name}</span>
        </div>
        <p className="text-xs text-[#A2B0B2] mt-1 line-clamp-2">{site.desc}</p>
        <div className="flex gap-3 mt-2 num text-[0.7rem] text-[#A2B0B2]">
          <Tooltip text="Historical significance (1–10)."><span>Sig {site.significance}</span></Tooltip>
          <Tooltip text="Difficulty: cost and risk multiplier (1–5)."><span>D{site.difficulty}</span></Tooltip>
          <Tooltip text="Environmental risk (1–5): mishaps during excavation."><span>R{site.risk}</span></Tooltip>
          <Tooltip text="Base expedition cost anchor."><span>~{fmt(site.baseCost)} đ</span></Tooltip>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {site.artifactCategories.map((c) => <span key={c} className="tag">{CATEGORY_LABELS[c]}</span>)}
        </div>
        <div className="mt-3 flex gap-2">
          {unlocked ? (
            <>
              <button className="btn btn-primary" onClick={() => { g.setPlan(defaultPlan(site.id)); g.setScreen("expedition"); }}>Plan expedition</button>
            </>
          ) : regionOk ? (
            <Tooltip text={s.resources.reputation >= site.requiresReputation ? `Pays for access agreements and preliminary survey. ${fmt(site.unlockCost)} đ.` : `Requires ${site.requiresReputation} reputation to negotiate access.`}>
              <button className="btn btn-jade" disabled={s.resources.reputation < site.requiresReputation || s.resources.cash < site.unlockCost} onClick={() => { g.setPlan(defaultPlan(site.id)); g.unlockSite(site.id); g.setScreen("expedition"); }}>
                Unlock — {fmt(site.unlockCost)} đ
              </button>
            </Tooltip>
          ) : (
            <button className="btn btn-ghost" disabled>Region locked</button>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteDetail({ site, onClose }: { site: Site; onClose: () => void }) {
  const g = useGame();
  const s = g.s!;
  const unlocked = s.siteUnlocked.includes(site.id);
  const regionOk = s.regionUnlocked.includes(site.region);
  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="panel-elevated w-full max-w-2xl max-h-[85vh] overflow-y-auto rise-in" onClick={(e) => e.stopPropagation()}>
        <div className="h-36 bg-cover bg-center border-b hairline relative" style={{ backgroundImage: `url(${site.image ?? "/assets/sites/DEFAULT.jpg"})` }}>
          <button className="btn btn-ghost absolute top-2 right-2 !py-0.5" onClick={onClose}>Close ✕</button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09131B] to-transparent p-4">
            <h3 className="font-display text-2xl">{site.name}</h3>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="tag">{site.status === "fictional" ? "Fictional scenario" : "Real site — fictionalized expedition model"}</span>
            <span className="tag">{REGIONS.find((r) => r.id === site.region)?.name}</span>
            {site.eras.map((e) => <span key={e} className="tag">{ERA_LABELS[e]}</span>)}
          </div>
          <p className="text-sm text-[#A2B0B2] mb-4">{site.desc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 num text-sm">
            <KV k="Historical significance" v={`${site.significance}/10`} tip="How important finds here might be." />
            <KV k="Data quality" v={`${site.dataQuality}/10`} tip="How well the area is already documented — affects context quality." />
            <KV k="Difficulty" v={`${site.difficulty}/5`} tip="Drives expedition cost per day." />
            <KV k="Environmental risk" v={`${site.risk}/5`} tip="Chance of mishaps that damage finds." />
            <KV k="Base cost" v={`≈ ${fmt(site.baseCost)} đ`} tip="Cost anchor; your plan multiplies this." />
            <KV k="Rep needed" v={site.requiresReputation.toString()} tip="Institute reputation required to operate here." />
          </div>
          <div className="mt-4 text-xs text-[#A2B0B2]">
            <div className="uppercase tracking-wider mb-1">Potential grants</div>
            {site.grants.join(" · ")}
          </div>
          <div className="mt-4 flex justify-end">
            {unlocked ? (
              <button className="btn btn-primary" onClick={() => { g.setPlan(defaultPlan(site.id)); g.setScreen("expedition"); onClose(); }}>Plan expedition here →</button>
            ) : regionOk ? (
              <button className="btn btn-jade" disabled={s.resources.reputation < site.requiresReputation || s.resources.cash < site.unlockCost} onClick={() => { g.setPlan(defaultPlan(site.id)); g.unlockSite(site.id); g.setScreen("expedition"); onClose(); }}>
                Unlock site — {fmt(site.unlockCost)} đ
              </button>
            ) : (
              <button className="btn btn-ghost" disabled>Region locked</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, tip }: { k: string; v: string; tip: string }) {
  return (
    <Tooltip text={tip}>
      <div className="border hairline rounded p-2 cursor-help">
        <div className="text-[0.62rem] uppercase tracking-wider text-[#A2B0B2]">{k}</div>
        <div className="num">{v}</div>
      </div>
    </Tooltip>
  );
}
