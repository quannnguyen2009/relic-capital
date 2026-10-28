"use client";
import { useGame } from "@/game/store";
import { ASSEMBLAGES, ERA_LABELS, REGION_LABELS } from "@/game/data/world";
import { fmt } from "@/game/engine/core";

export default function AssemblageModal({ ids }: { ids: string[] }) {
  const g = useGame();
  const got = ASSEMBLAGES.filter((a) => ids.includes(a.id));
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => g.setModal(null)}>
      <div className="panel-elevated w-full max-w-md p-6 rise-in text-center" onClick={(e) => e.stopPropagation()}>
        <div className="tag border-[#C28B49] text-[#C28B49] mb-2">Museum acquisition</div>
        <div className="text-3xl mb-1">🏛</div>
        <div className="font-display text-xl text-[#F0E9D9] mb-3">Assemblage complete</div>
        {got.map((a) => (
          <div key={a.id} className="mb-4">
            <div className="font-display text-lg text-[#C28B49]">{a.name}</div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#8a9ea8] mb-1">
              {ERA_LABELS[a.era]} · {REGION_LABELS[a.region]}
            </div>
            <p className="text-xs text-[#A2B0B2] mb-2">{a.desc}</p>
            <div className="flex justify-center gap-2 text-xs num">
              <span className="tag text-[#6D9A83] border-[#6D9A83]">+{fmt(a.reward.cash)} đ</span>
              <span className="tag text-[#8fb8d8] border-[#8fb8d8]">+{a.reward.research} RP</span>
              <span className="tag text-[#C28B49] border-[#C28B49]">+{a.reward.reputation} rep</span>
            </div>
          </div>
        ))}
        <div className="flex justify-center gap-2 mt-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              g.setModal(null);
              g.setScreen("archive");
            }}
          >
            View collection
          </button>
          <button className="btn btn-ghost" onClick={() => g.setModal(null)}>Later</button>
        </div>
      </div>
    </div>
  );
}
