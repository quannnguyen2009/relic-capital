"use client";
import { useGame } from "@/game/store";
import { Panel, Bar, Empty } from "./ui";
import { fmt, runwayDays } from "@/game/engine/core";
import { GRANTS, CAMPAIGN } from "@/game/data/systems";
import { SITES } from "@/game/data/world";



export default function CommandCenter() {
  const g = useGame();
  const s = g.s;
  if (!s) return null;

  const rl = runwayDays(s);
  const exp = s.expedition;
  const activeChapter = CAMPAIGN[Math.min(s.campaignChapter, CAMPAIGN.length - 1)];
  const unanalyzed = s.artifacts.filter((a) => a.status === "unanalyzed");
  const recent = s.artifacts.slice(-4).reverse();
  const pendingGrants = s.grantApplications.filter((a) => a.status === "pending");
  const unresolvedEvents = s.activeEvents.filter((e) => !e.resolved);

  const recs: { text: string; cta: string; screen: Parameters<typeof g.setScreen>[0] }[] = [];
  if (unresolvedEvents.length) recs.push({ text: "A field event awaits your decision.", cta: "Respond", screen: "command" });
  if (exp && exp.phase === "active" && exp.pendingDecision) recs.push({ text: "The expedition requires a field decision.", cta: "Open Expedition", screen: "expedition" });
  if (unanalyzed.length) recs.push({ text: `${unanalyzed.length} artifact(s) await first analysis — unclassified finds earn nothing.`, cta: "Research Lab", screen: "lab" });
  if (!exp || exp.phase === "complete") recs.push({ text: "No active expedition. Pick a site and plan the next dig.", cta: "Exploration Map", screen: "map" });
  if (rl !== null && rl < 8) recs.push({ text: `Runway is only ${rl} days. Consider grants, publications or selling market positions.`, cta: "Finance", screen: "finance" });
  if (!recs.length) recs.push({ text: "All steady. Advance the day, deepen analysis, or expand to a new region.", cta: "Institute Development", screen: "dev" });

  return (
    <div className="space-y-4">
      {/* Mission */}
      <Panel title={activeChapter.title} sub={`Chapter ${s.campaignChapter + 1} of ${CAMPAIGN.length} — ${activeChapter.objectives.filter((o) => s.completedObjectives.includes(o.id)).length}/${activeChapter.objectives.length} objectives`}>
        <p className="text-sm text-[#A2B0B2] mb-3">{activeChapter.briefing}</p>
        <div className="grid sm:grid-cols-3 gap-2">
          {activeChapter.objectives.map((o) => {
            const done = s.completedObjectives.includes(o.id);
            return (
              <div key={o.id} className={`p-2.5 border-2 text-xs flex items-center gap-1 ${done ? "border-[#4da87a] text-[#4da87a]" : "border-[rgba(232,216,176,0.14)] text-[#8a9ea8]"}`} style={{ boxShadow: done ? "2px 2px 0px #1a4a2c" : "2px 2px 0px rgba(0,0,0,0.6)", fontFamily: "var(--font-vt323)" }}>
                <span style={{ color: done ? "#4da87a" : "#8a9ea8", fontSize: "1rem" }}>{done ? "[X]" : "[ ]"}</span> {o.text}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Finances */}
        <Panel title="Institute finances" sub="Runway: estimated days of operation at current spend">
          <div className="num text-3xl font-semibold">{fmt(s.resources.cash)} <span className="text-base text-[#A2B0B2]">đ</span></div>
          <div className="text-xs text-[#A2B0B2] mt-1 mb-3">
            Runway {rl === null ? "stable" : `~${rl} days`}{rl !== null && rl < 8 && <span className="text-[#D66D67]"> — at risk</span>}
          </div>
          <MiniLedger />
        </Panel>

        {/* Expedition progress */}
        <Panel title="Active expedition" sub={exp ? `${SITES.find((x) => x.id === exp.plan.siteId)?.name ?? ""}` : "None underway"}>
          {exp && exp.phase !== "complete" ? (
            <>
              <div className="num text-2xl mb-1">{exp.elapsedDays}/{exp.totalDays} days</div>
              <Bar value={exp.elapsedDays} max={exp.totalDays} color="#C28B49" />
              <ul className="text-xs text-[#A2B0B2] mt-3 space-y-1 max-h-28 overflow-y-auto">
                {exp.eventLog.slice(-4).reverse().map((e, i) => (
                  <li key={i} className={e.kind === "good" ? "text-[#6D9A83]" : e.kind === "bad" ? "text-[#D66D67]" : ""}>D{e.day}: {e.text}</li>
                ))}
              </ul>
              <button className="btn btn-jade mt-3" onClick={() => g.setScreen("expedition")}>Open expedition →</button>
            </>
          ) : exp && exp.phase === "complete" ? (
            <>
              <p className="text-sm text-[#A2B0B2]">{exp.outcomeSummary}</p>
              <button className="btn btn-primary mt-3" onClick={() => g.setScreen("map")}>Plan the next dig →</button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#A2B0B2] mb-3">No active expedition. The archive does not grow by itself.</p>
              <button className="btn btn-primary" onClick={() => g.setScreen("map")}>Select a site →</button>
            </>
          )}
        </Panel>

        {/* Priorities */}
        <Panel title="Recommended actions" sub="Derived from the current game state">
          <ul className="space-y-2">
            {recs.slice(0, 4).map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-2 text-sm">
                <span className="text-[#A2B0B2]">{r.text}</span>
                <button className="btn btn-ghost !py-0.5 !px-2 !text-[0.7rem] shrink-0" onClick={() => g.setScreen(r.screen)}>{r.cta}</button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent discoveries */}
        <Panel title="Recent discoveries" sub={`${s.artifacts.length} artifacts documented`}>
          {recent.length ? (
            <ul className="divide-y hairline">
              {recent.map((a) => (
                <li key={a.uid} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <button className="text-sm hover:text-[#c89b3c]" style={{ fontFamily: 'var(--font-vt323)' }} onClick={() => g.setScreen("archive")}>{a.uid} · {a.name}</button>

                    <div className="text-[0.7rem] text-[#A2B0B2]">{a.category} · sig {a.significance}/10 · {a.condition}</div>
                  </div>
                  <button className="btn btn-ghost !py-0.5 !px-2 !text-[0.7rem]" onClick={() => g.setScreen("lab")}>Analyze</button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Nothing recovered yet" body="Run an expedition and discoveries will appear here and in the Artifact Archive." action={<button className="btn btn-primary" onClick={() => g.setScreen("map")}>To the map</button>} />
          )}
        </Panel>

        {/* Grant deadlines + events */}
        <Panel title="Grant pipeline & alerts" sub="Upcoming evaluations and active events">
          {pendingGrants.length === 0 && unresolvedEvents.length === 0 && s.grantApplications.length === 0 && (
            <p className="text-sm text-[#A2B0B2]">
              No applications yet. Grants are the institute&apos;s bread and butter — see{" "}
              <button className="text-[#C28B49] hover:underline" onClick={() => g.setScreen("finance")}>Finance & Grants</button>.
              Available: {GRANTS.length} programs with different eligibility requirements.
            </p>
          )}
          <ul className="space-y-2">
            {pendingGrants.map((app, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span>{GRANTS.find((x) => x.id === app.grantId)?.name}</span>
                <span className="text-[#A2B0B2] text-xs num">decision day {app.decisionDay}</span>
              </li>
            ))}
            {unresolvedEvents.map((ev, i) => (
              <li key={i} className="text-sm text-[#B9654B] flex justify-between">
                <span>Event awaiting response</span>
                <button className="btn btn-ghost !py-0.5 !px-2 !text-[0.7rem]" onClick={() => g.setModal({ kind: "event", eventId: ev.eventId })}>Open</button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function MiniLedger() {
  const s = useGame((st) => st.s)!;
  const rows = s.ledger.slice(-5).reverse();
  return (
    <table className="w-full text-xs num">
      <tbody className="divide-y hairline">
        {rows.map((e) => (
          <tr key={e.id}>
            <td className="py-1 pr-2 text-[#A2B0B2] truncate max-w-[160px]">{e.reason}</td>
            <td className={`py-1 text-right ${e.amount < 0 ? "text-[#D66D67]" : "text-[#6D9A83]"}`}>{e.amount < 0 ? "−" : "+"}{fmt(Math.abs(e.amount))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
