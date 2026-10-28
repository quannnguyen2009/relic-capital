"use client";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt } from "@/game/engine/core";
import { STAFF_DEFS, EQUIPMENT_DEFS, TECHS, ACHIEVEMENTS, CAMPAIGN } from "@/game/data/systems";
import type { RoleId } from "@/game/engine/types";
import PixelAvatar from "../PixelAvatar";

export default function DevScreen() {
  const g = useGame();
  const s = g.s!;

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Team" sub="Specialists cost hiring bonuses and daily salaries; their abilities compound across systems.">
          <div className="space-y-2">
            {s.staff.map((m) => {
              const def = STAFF_DEFS.find((d) => d.id === m.roleId)!;
              return (
                <div key={m.instanceId} className="panel-elevated p-2 flex justify-between items-center text-sm gap-2">
                  <div className="flex items-center gap-2.5">
                    <PixelAvatar doctorId={m.roleId} size={36} frame="pixel-box" />
                    <div>
                      <span className="font-display">{m.name}</span> <span className="text-xs text-[#A2B0B2]">— {def.title} · skill {m.skill}/5</span>
                      <div className="text-[0.7rem] text-[#6D9A83]">{def.ability}</div>
                    </div>
                  </div>
                  <span className="num text-xs text-[#A2B0B2] shrink-0">{fmt(def.salary)} đ/d</span>
                </div>
              );
            })}
            {!s.staff.length && <p className="text-sm text-[#A2B0B2]">No specialists yet. A field archaeologist is a strong first hire.</p>}
          </div>
          <div className="mt-3 space-y-2 border-t hairline pt-3">
            {STAFF_DEFS.filter((d) => !s.staff.some((m) => m.roleId === d.id)).map((d) => {
              const repOk = !d.requiresReputation || s.resources.reputation >= d.requiresReputation;
              return (
                <Tooltip key={d.id} text={`${d.desc} Ability: ${d.ability}${repOk ? "" : ` — requires ${d.requiresReputation} reputation.`}`}>
                  <button className="btn btn-ghost w-full justify-between !text-xs" disabled={!repOk || s.resources.cash < d.hireCost} onClick={() => g.hireStaff(d.id as RoleId)}>
                    <span>Hire {d.title}</span>
                    <span className="num text-[#C28B49]">{fmt(d.hireCost)} đ · {fmt(d.salary)} đ/d</span>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </Panel>

        <Panel title="Equipment" sub="One-time purchase + daily maintenance during operation; effects multiply.">
          <div className="grid sm:grid-cols-2 gap-2">
            {EQUIPMENT_DEFS.map((e) => {
              const owned = s.equipmentOwned.includes(e.id);
              const repOk = !e.requiresReputation || s.resources.reputation >= e.requiresReputation;
              const techOk = !e.requiresTech || s.techResearched.includes(e.requiresTech);
              return (
                <div key={e.id} className={`panel-elevated p-2.5 text-xs ${owned ? "border-[#6D9A83]" : ""}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-sm">{e.name}</span>
                    {owned ? <span className="tag border-[#6D9A83] text-[#6D9A83]">Owned</span> : <span className="num text-[#C28B49]">{fmt(e.cost)} đ</span>}
                  </div>
                  <p className="text-[#A2B0B2] mt-0.5">{e.desc}</p>
                  <div className="text-[0.65rem] text-[#6D9A83] mt-1">
                    {Object.entries(e.effects).map(([k, v]) => `${k} +${Math.round((v ?? 0) * 100)}%`).join(" · ")}
                  </div>
                  {!owned && (
                    <button
                      className="btn btn-jade !py-1 !text-[0.7rem] mt-2 w-full justify-center"
                      disabled={!repOk || !techOk || s.resources.cash < e.cost}
                      onClick={() => g.buyEquipment(e.id)}
                    >
                      {!repOk ? `Rep ${e.requiresReputation} needed` : !techOk ? `Needs ${e.requiresTech}` : "Purchase"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Research & technology" sub="Spend research points (and sometimes cash) on institutional capabilities.">
          <div className="space-y-2">
            {TECHS.map((t) => {
              const done = s.techResearched.includes(t.id);
              const preOk = !t.cost.requiresTech || t.cost.requiresTech.every((r) => s.techResearched.includes(r));
              return (
                <div key={t.id} className={`panel-elevated p-2.5 text-xs ${done ? "border-[#C28B49]" : ""}`}>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-display text-sm">{t.name}</span>
                    {done ? <span className="tag border-[#C28B49] text-[#C28B49]">Researched</span> : (
                      <button
                        className="btn btn-ghost !py-0.5 !px-2 !text-[0.68rem] shrink-0"
                        disabled={!preOk || s.resources.research < t.cost.research || (t.cost.cash ?? 0) > s.resources.cash}
                        onClick={() => g.researchTech(t.id)}
                      >
                        {t.cost.research} RP{t.cost.cash ? ` + ${fmt(t.cost.cash)} đ` : ""}
                      </button>
                    )}
                  </div>
                  <p className="text-[#A2B0B2] mt-0.5">{t.desc}</p>
                  {!preOk && <p className="text-[0.65rem] text-[#D66D67]">Requires: {t.cost.requiresTech?.join(", ")}</p>}
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Achievements" sub={`${s.achievements.length}/${ACHIEVEMENTS.length} unlocked`}>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {ACHIEVEMENTS.map((a) => {
                const got = s.achievements.includes(a.id);
                return (
                  <div key={a.id} className={`p-2 border rounded ${got ? "border-[#C28B49] text-[#C28B49]" : "hairline text-[#A2B0B2]"}`}>
                    <div className="font-display text-sm">{got ? "🏆" : "○"} {a.name}</div>
                    <div>{a.desc}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Campaign" sub={`Chapter ${Math.min(s.campaignChapter + 1, CAMPAIGN.length)} of ${CAMPAIGN.length}`}>
            <div className="space-y-2 text-sm">
              {CAMPAIGN.map((c, i) => (
                <div key={c.id} className={`p-2 border rounded ${i === s.campaignChapter ? "border-[#C28B49]" : "hairline"}`}>
                  <div className="font-display">{c.title}</div>
                  <p className="text-xs text-[#A2B0B2]">{c.briefing}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
