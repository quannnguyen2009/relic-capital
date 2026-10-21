"use client";
import { useGame } from "@/game/store";
import { fmt } from "@/game/engine/core";
import { SITES } from "@/game/data/world";

export default function XpReportModal() {
  const g = useGame();
  const s = g.s!;
  const e = s.expedition;
  if (!e) return null;
  const site = SITES.find((x) => x.id === e.plan.siteId);
  const finds = e.discoveries.map((uid) => s.artifacts.find((a) => a.uid === uid)!).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => g.setModal(null)}>
      <div className="panel-elevated w-full max-w-xl p-6 rise-in max-h-[85vh] overflow-y-auto" onClick={(ev) => ev.stopPropagation()}>
        <div className="tag border-[#C28B49] text-[#C28B49] mb-2">Expedition report</div>
        <h3 className="font-display text-2xl mb-1">{site?.name}</h3>
        <p className="text-sm text-[#A2B0B2] mb-4">{e.outcomeSummary}</p>

        <table className="w-full text-sm num mb-4">
          <tbody className="divide-y hairline">
            <tr><td className="py-1.5 text-[#A2B0B2]">Days in the field</td><td className="text-right">{e.elapsedDays} of {e.totalDays}</td></tr>
            <tr><td className="py-1.5 text-[#A2B0B2]">Total spent (incl. decisions)</td><td className="text-right">{fmt(e.spent)} đ</td></tr>
            <tr><td className="py-1.5 text-[#A2B0B2]">Artifacts recovered</td><td className="text-right">{finds.length}</td></tr>
            <tr><td className="py-1.5 text-[#A2B0B2]">Best find</td><td className="text-right">{finds.length ? finds.sort((a, b) => b.significance - a.significance)[0].name : "—"}</td></tr>
            <tr><td className="py-1.5 text-[#A2B0B2]">Current cash</td><td className="text-right">{fmt(s.resources.cash)} đ</td></tr>
            <tr><td className="py-1.5 text-[#A2B0B2]">Reputation</td><td className="text-right">{s.resources.reputation}</td></tr>
          </tbody>
        </table>

        {finds.length > 0 && (
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Recovered this expedition</div>
            <ul className="text-sm divide-y hairline">
              {finds.map((a) => (
                <li key={a.uid} className="py-1.5 flex justify-between">
                  <span>{a.uid} · {a.name}</span>
                  <span className="text-xs text-[#A2B0B2]">sig {a.significance}/10 · {a.condition}{a.confidenceLabel !== "hypothesis" ? ` · ${a.confidenceLabel}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-[#A2B0B2] mb-4">
          Next goals: analyze and verify new finds in the Research Lab, publish robust findings for income, and watch the runway in Finance.
        </div>

        <div className="flex justify-end gap-2">
          {g.inTutorial() ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                g.setModal(null);
                g.setTutorialStep(5);
                g.setScreen("lab");
              }}
            >
              Continue to Research Lab →
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => { g.setModal(null); g.setScreen("lab"); }}>Open Research Lab</button>
              <button className="btn btn-primary" onClick={() => { g.setModal(null); g.setScreen("map"); }}>Plan next expedition</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
