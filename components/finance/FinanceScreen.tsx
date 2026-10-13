"use client";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt, runwayDays } from "@/game/engine/core";
import { GRANTS } from "@/game/data/systems";

export default function FinanceScreen() {
  const g = useGame();
  const s = g.s!;
  const rl = runwayDays(s);
  const rows = [...s.ledger].reverse().slice(0, 30);

  const income7 = s.ledger.filter((e) => e.day >= s.day - 7 && e.amount > 0).reduce((a, e) => a + e.amount, 0);
  const spend7 = s.ledger.filter((e) => e.day >= s.day - 7 && e.amount < 0).reduce((a, e) => a + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-4 gap-4">
        <Panel title="Cash" sub="Fictional in-game currency only">
          <div className="num text-2xl">{fmt(s.resources.cash)} đ</div>
        </Panel>
        <Panel title="Runway" sub="Days of operation at current burn">
          <div className={`num text-2xl ${rl !== null && rl < 8 ? "text-[#D66D67]" : ""}`}>{rl === null ? "stable" : `${rl} d`}</div>
        </Panel>
        <Panel title="Inflow (7d)" sub="Grants, publications, sales">
          <div className="num text-2xl text-[#6D9A83]">+{fmt(income7)}</div>
        </Panel>
        <Panel title="Outflow (7d)" sub="Operations, expeditions, equipment">
          <div className="num text-2xl text-[#D66D67]">−{fmt(-spend7)}</div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Transaction ledger" sub="Every transaction carries a reason and in-game day.">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs num">
              <thead className="text-[#A2B0B2] uppercase tracking-wider text-[0.6rem]">
                <tr><th className="text-left py-1">Day</th><th className="text-left">Reason</th><th className="text-left">Kind</th><th className="text-right">Amount đ</th></tr>
              </thead>
              <tbody className="divide-y hairline">
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="py-1.5">{e.day}</td>
                    <td className="pr-2">{e.reason}</td>
                    <td className="text-[#A2B0B2]">{e.kind}</td>
                    <td className={`text-right ${e.amount < 0 ? "text-[#D66D67]" : "text-[#6D9A83]"}`}>{e.amount < 0 ? "−" : "+"}{fmt(Math.abs(e.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Grants" sub="Applications are scored on documentation quality, eligibility and reputation — deterministically, no lottery.">
          <div className="space-y-2">
            {GRANTS.map((gr) => {
              const detail = g.grantDetail(gr.id);
              const cd = s.grantsCooldown[gr.id] ?? 0;
              const onCd = s.day < cd;
              return (
                <div key={gr.id} className="panel-elevated p-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <div className="font-display">{gr.name} <span className="text-xs num text-[#C28B49]">· {fmt(gr.payout)} đ</span></div>
                      <p className="text-xs text-[#A2B0B2]">{gr.desc}</p>
                    </div>
                    <Tooltip text="Apply only if eligible — the engine rejects ineligible applications.">
                      <button className="btn btn-jade !text-xs shrink-0" disabled={!detail.eligible || onCd} onClick={() => g.applyForGrant(gr.id)}>
                        {onCd ? `Cooldown d${cd}` : "Apply"}
                      </button>
                    </Tooltip>
                  </div>
                  <div className="text-[0.68rem] mt-1">
                    {detail.eligible ? (
                      <>
                        <span className="text-[#6D9A83]">Eligible — est. quality {Math.round(detail.score * 100)}%</span>
                        {detail.reasons.length > 0 && <span className="text-[#A2B0B2]"> · {detail.reasons.slice(0, 2).join("; ")}</span>}
                      </>
                    ) : (
                      <span className="text-[#D66D67]">Not eligible: {detail.blockers[0]}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {s.grantApplications.length > 0 && (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Application history</div>
              <ul className="text-xs space-y-1">
                {s.grantApplications.slice(-5).reverse().map((a, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span>{GRANTS.find((x) => x.id === a.grantId)?.name}</span>
                    <span className={a.status === "approved" ? "text-[#6D9A83]" : a.status === "rejected" ? "text-[#D66D67]" : "text-[#A2B0B2]"}>{a.status} · score {Math.round(a.score * 100)}% · d{a.decisionDay}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
