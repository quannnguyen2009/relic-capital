"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, Bar, Tooltip } from "../ui";
import { fmt, estimateExpedition } from "@/game/engine/core";
import { SITES } from "@/game/data/world";
import { EQUIPMENT_DEFS } from "@/game/data/systems";
import { playDigSound } from "@/game/sound";
import type { ExpeditionPlan } from "@/game/engine/types";

function defaultPlan(siteId: string): ExpeditionPlan {
  return { siteId, workers: 4, days: 4, equipment: [], survey: true, careful: true, objective: "balanced" };
}

export default function ExpeditionScreen() {
  const g = useGame();
  const s = g.s!;
  const exp = s.expedition;
  const [launchMsg, setLaunchMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Sync a default plan into the store so launchExpedition() always has a plan
  // (it reads s.plannedExpedition from the store, not from component state).
  const syncedRef = useRef(false);
  useEffect(() => {
    if (syncedRef.current) return;
    if (exp) return; // active/complete expedition — nothing to plan
    if (!s.plannedExpedition) {
      const availableSites = SITES.filter((x) => s.siteUnlocked.includes(x.id));
      const fallback = s.siteUnlocked.includes("delta-lien-lau") ? "delta-lien-lau" : availableSites[0]?.id;
      if (fallback) g.setPlan(defaultPlan(fallback));
    }
    syncedRef.current = true;
  }, [exp, s.plannedExpedition, s.siteUnlocked, g]);

  if (exp && exp.phase === "active") return <ActiveExpedition />;
  if (exp && exp.phase === "complete") return <CompletedReport />;

  // planning
  const availableSites = SITES.filter((x) => s.siteUnlocked.includes(x.id));
  const plan = s.plannedExpedition ?? (s.siteUnlocked.includes("delta-lien-lau") ? defaultPlan("delta-lien-lau") : defaultPlan(availableSites[0]?.id ?? "delta-lien-lau"));
  const site = SITES.find((x) => x.id === plan.siteId)!;
  const est = estimateExpedition(s, plan);
  const v = validate(g, plan);

  return (
    <div className="space-y-4">
      <Panel title="Plan an expedition" sub="Allocate workers, days, equipment and methodology. Every factor trades off cost, risk, and evidence quality.">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-[#A2B0B2]">Site</label>
              <select className="input mt-1" value={plan.siteId} onChange={(e) => g.setPlan(defaultPlan(e.target.value))}>
                {availableSites.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
              <p className="text-xs text-[#A2B0B2] mt-1">{site.desc}</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-[#A2B0B2] flex justify-between">
                <span>Workers <Tooltip text="More workers: more discovery chances and context quality, more cost and energy.">ⓘ</Tooltip></span>
                <span className="num">{plan.workers}</span>
              </label>
              <input type="range" min={2} max={8} value={plan.workers} onChange={(e) => g.setPlan({ ...plan, workers: +e.target.value })} className="w-full accent-[#C28B49]" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-[#A2B0B2] flex justify-between">
                <span>Days <Tooltip text="Longer digs find more, cost more, and risk events.">ⓘ</Tooltip></span>
                <span className="num">{plan.days}</span>
              </label>
              <input type="range" min={2} max={8} value={plan.days} onChange={(e) => g.setPlan({ ...plan, days: +e.target.value })} className="w-full accent-[#C28B49]" />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1 block">Objective</label>
              <div className="grid grid-cols-3 gap-2">
                {(["survey", "balanced", "intensive"] as const).map((o) => (
                  <Tooltip key={o} text={o === "survey" ? "Cheap, low discovery odds, low risk." : o === "intensive" ? "Expensive, high discovery odds and cost." : "Middle path."}>
                    <button onClick={() => g.setPlan({ ...plan, objective: o })} className={`text-xs p-2 rounded border w-full ${plan.objective === o ? "border-[#C28B49] text-[#C28B49]" : "hairline text-[#A2B0B2]"}`}>
                      {o[0].toUpperCase() + o.slice(1)}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Toggle on={plan.survey} onClick={() => g.setPlan({ ...plan, survey: !plan.survey })} label="Survey first" tip="+context quality, +20% cost" />
              <Toggle on={plan.careful} onClick={() => g.setPlan({ ...plan, careful: !plan.careful })} label="Careful recovery" tip="+condition and evidence, +25% cost" />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1 block">Equipment to deploy <Tooltip text="Owned equipment improves the dig automatically.">ⓘ</Tooltip></label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_DEFS.filter((e) => s.equipmentOwned.includes(e.id)).map((e) => (
                  <button
                    key={e.id}
                    onClick={() =>
                      g.setPlan({ ...plan, equipment: plan.equipment.includes(e.id) ? plan.equipment.filter((x) => x !== e.id) : [...plan.equipment, e.id] })
                    }
                    className={`tag ${plan.equipment.includes(e.id) ? "border-[#6D9A83] text-[#6D9A83]" : ""}`}
                  >
                    {e.name}
                  </button>
                ))}
                {!s.equipmentOwned.length && <span className="text-xs text-[#A2B0B2]">No equipment owned yet — buy some in Institute Development.</span>}
              </div>
            </div>
          </div>

          {/* estimate */}
          <div className="panel-elevated p-4 h-fit">
            <h3 className="font-display text-lg mb-3">Estimate <span className="text-xs text-[#A2B0B2]">(an estimate, not a guarantee)</span></h3>
            <dl className="num text-sm space-y-1.5">
              <Row k="Cash cost" v={`${fmt(est.cost)} đ`} />
              <Row k="Field supplies" v={`${est.supplies} (have ${Math.floor(s.resources.supplies)})`} />
              <Row k="Team energy" v={`${est.energy} (have ${Math.floor(s.resources.energy)})`} />
              <Row k="Duration" v={`${est.days} in-game days`} />
            </dl>
            {est.warnings.length > 0 && (
              <ul className="text-xs text-[#D66D67] mt-3 space-y-1">
                {est.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
              </ul>
            )}
            <div className="text-xs text-[#A2B0B2] mt-3">
              More workers and days find more — but cost more. Keep a healthy cash cushion after launching.
            </div>
            <button
              className="btn btn-primary w-full justify-center mt-4"
              disabled={!v.ok}
              onClick={() => {
                const r = g.launchExpedition();
                setLaunchMsg({ ok: r.ok, text: r.ok ? "Expedition launched." : r.reason ?? "Launch failed." });
              }}
              title={v.reason}
            >
              {v.ok ? "Launch expedition" : "Cannot launch — fix the estimate first"}
            </button>
            <LaunchFeedback msg={launchMsg} />
          </div>
        </div>
      </Panel>
    </div>
  );
}

function validate(g: ReturnType<typeof useGame.getState>, plan: ExpeditionPlan): { ok: boolean; reason?: string } {
  const s = g.s!;
  const site = SITES.find((x) => x.id === plan.siteId)!;
  const est = estimateExpedition(s, plan);
  if (s.resources.cash < est.cost) return { ok: false, reason: `need ${fmt(est.cost)} đ` };
  if (s.resources.supplies < est.supplies) return { ok: false, reason: "not enough supplies" };
  if (s.resources.energy < est.energy) return { ok: false, reason: "team needs rest — low energy" };
  void site;
  return { ok: true };
}

function Toggle({ on, onClick, label, tip }: { on: boolean; onClick: () => void; label: string; tip: string }) {
  return (
    <Tooltip text={tip}>
      <button onClick={onClick} className={`text-xs p-2 rounded border ${on ? "border-[#6D9A83] text-[#6D9A83]" : "hairline text-[#A2B0B2]"}`}>
        {on ? "✓ " : "○ "}{label}
      </button>
    </Tooltip>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b hairline pb-1">
      <dt className="text-[#A2B0B2]">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

/** Surfaces the engine's launch result — planning errors are never silent. */
function LaunchFeedback({ msg }: { msg: { ok: boolean; text: string } | null }) {
  const s = useGame((st) => st.s)!;
  const active = s.expedition && s.expedition.phase === "active";
  if (!msg) return null;
  if (active) {
    return <p className="text-xs mt-2 text-[#6D9A83]">✓ {msg.text} The dig log is now live — advance days from the panel above.</p>;
  }
  return <p className="text-xs mt-2 text-[#D66D67]">✕ {msg.text}</p>;
}

function ActiveExpedition() {
  const g = useGame();
  const s = g.s!;
  const e = s.expedition!;
  const site = SITES.find((x) => x.id === e.plan.siteId)!;
  const progressRatio = Math.min(1, e.elapsedDays / Math.max(1, e.totalDays));
  const currentDepth = (0.3 + progressRatio * 2.8).toFixed(2);

  // 3x3 Sieve grid state
  const [brushedCells, setBrushedCells] = useState<Record<number, string>>({});
  const gridFinds = [
    "Fine charcoal fleck (C14 candidate)",
    "Red-slipped terracotta rim sherd",
    "Oxidized bronze patination fleck",
    "River gravel alluvial deposit",
    "Animal bone fragment (sus scrofa)",
    "Glazed stoneware body sherd",
    "Burned clay daub with reed impressions",
    "Polished stone adze debitage",
    "Compact sterile silt horizon"
  ];

  const handleBrush = (idx: number) => {
    if (brushedCells[idx]) return;
    playDigSound();
    setBrushedCells((prev) => ({ ...prev, [idx]: gridFinds[idx % gridFinds.length] }));
  };

  return (
    <div className="space-y-4">
      <Panel title={site.name} sub={`Day ${e.startedDay + e.elapsedDays} · ${e.elapsedDays}/${e.totalDays} dig days elapsed · Stratum depth: ${currentDepth}m`}>
        <Bar value={e.elapsedDays} max={e.totalDays} color="#C28B49" />
        {e.pendingDecision ? (
          <div className="panel-elevated p-4 mt-4 gild-flash">
            <div className="tag border-[#C28B49] text-[#C28B49] mb-2">Field decision</div>
            <p className="text-sm mb-3">{e.pendingDecision.prompt}</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {e.pendingDecision.options.map((o) => (
                <button key={o.id} className="btn btn-jade justify-center text-left flex-col !items-start" onClick={() => g.xpChooseDecision(o.id)}>
                  <span>{o.label}</span>
                  <span className="text-[0.65rem] text-[#A2B0B2]">{o.effectText}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button className="btn btn-primary mt-4" onClick={() => { setBrushedCells({}); g.nextDay(); }}>Dig on — advance one day</button>
        )}
      </Panel>

      {/* Visual Stratigraphic Trench & Interactive Sieve Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Stratigraphic Profile */}
        <div className="panel-elevated p-4">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-display text-sm">Stratigraphic Trench Section</h4>
            <span className="text-xs text-[#C28B49] num">Excavated: {currentDepth}m / 3.10m</span>
          </div>
          <p className="text-[0.65rem] text-[#A2B0B2] mb-3">Single-context soil profiling: older cultural horizons lie deeper under alluvial layers.</p>
          <div className="relative border hairline rounded overflow-hidden h-44 flex flex-col font-mono text-[0.65rem]">
            {/* Layer I */}
            <div className="h-1/4 bg-[#3a3526]/80 border-b border-[#5a523a] p-1.5 flex justify-between items-center text-[#d1caa1]">
              <span>Stratum I · Topsoil & Humus (0.0 – 0.5m)</span>
              <span className="text-[0.6rem] text-[#A2B0B2]">Recent alluvium</span>
            </div>
            {/* Layer II */}
            <div className="h-1/4 bg-[#4a3a25]/80 border-b border-[#6e5839] p-1.5 flex justify-between items-center text-[#e2b77c]">
              <span>Stratum II · Medieval Ceramic Horizon (0.5 – 1.6m)</span>
              <span className="text-[0.6rem] text-[#A2B0B2]">Lý–Trần glazed sherds</span>
            </div>
            {/* Layer III */}
            <div className="h-1/4 bg-[#32261a]/90 border-b border-[#553c25] p-1.5 flex justify-between items-center text-[#e99a4c]">
              <span>Stratum III · Protohistoric Horizon (1.6 – 2.8m)</span>
              <span className="text-[0.6rem] text-[#A2B0B2]">Bronze casting & burials</span>
            </div>
            {/* Layer IV */}
            <div className="h-1/4 bg-[#1f1710] p-1.5 flex justify-between items-center text-[#7e7060]">
              <span>Stratum IV · Sterile Basal Gravel (&gt; 2.8m)</span>
              <span className="text-[0.6rem] text-[#A2B0B2]">Geological bedrock</span>
            </div>

            {/* Depth cutter line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-[#F0E9D9] flex items-center justify-end pr-2 transition-all duration-500 shadow-md pointer-events-none"
              style={{ top: `${Math.min(95, Math.max(8, progressRatio * 100))}%` }}
            >
              <span className="bg-[#C28B49] text-black text-[0.6rem] font-bold px-1.5 py-0.5 rounded shadow">
                Trowel Level: {currentDepth}m
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Trench Sieve Grid */}
        <div className="panel-elevated p-4">
          <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-display text-sm">Interactive Sieve &amp; Brush Grid</h4>
            <span className="text-xs text-[#6D9A83] num">{Object.keys(brushedCells).length}/9 quadrants examined</span>
          </div>
          <p className="text-[0.65rem] text-[#A2B0B2] mb-3">Click quadrants to brush sediment layers with your trowel and inspect micro-inclusions.</p>
          <div className="grid grid-cols-3 gap-2 h-44">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
              const brushed = brushedCells[idx];
              return (
                <button
                  key={idx}
                  onClick={() => handleBrush(idx)}
                  className={`rounded border text-center p-1.5 flex flex-col justify-center items-center transition-all ${
                    brushed
                      ? "border-[#6D9A83]/60 bg-[#6D9A83]/10 text-[#F0E9D9]"
                      : "hairline bg-[#162530] hover:border-[#C28B49] text-[#A2B0B2]"
                  }`}
                >
                  <span className="text-[0.65rem] font-mono text-[#C28B49]">{`Q${idx + 1}`}</span>
                  <span className="text-[0.6rem] line-clamp-2 leading-tight mt-0.5">
                    {brushed || "Sediment matrix (unbrushed)"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Event log">
          <ul className="text-xs space-y-1 max-h-64 overflow-y-auto">
            {[...e.eventLog].reverse().map((ev, i) => (
              <li key={i} className={ev.kind === "good" ? "text-[#6D9A83]" : ev.kind === "bad" ? "text-[#D66D67]" : ev.kind === "decision" ? "text-[#C28B49]" : "text-[#A2B0B2]"}>
                <span className="num mr-2">D{ev.day}</span>{ev.text}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Discoveries so far" sub={`${e.discoveries.length} artifact(s)`}>
          {e.discoveries.length ? (
            <ul className="divide-y hairline text-sm">
              {e.discoveries.map((uid) => {
                const a = s.artifacts.find((x) => x.uid === uid)!;
                return <li key={uid} className="py-2 flex justify-between"><span>{a.name}</span><span className="text-xs text-[#A2B0B2]">sig {a.significance}/10 · {a.condition}</span></li>;
              })}
            </ul>
          ) : <p className="text-sm text-[#A2B0B2]">Nothing yet. Sieve finer.</p>}
        </Panel>
      </div>
    </div>
  );
}

function CompletedReport() {
  const g = useGame();
  const s = g.s!;
  const e = s.expedition!;
  return (
    <Panel title="Expedition complete" sub="Full report available in the modal or the Journal.">
      <p className="text-sm text-[#A2B0B2] mb-4">{e.outcomeSummary}</p>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => g.setModal({ kind: "xp-report" })}>View report</button>
        <button className="btn btn-ghost" onClick={() => g.setScreen("map")}>Plan next expedition</button>
      </div>
    </Panel>
  );
}
