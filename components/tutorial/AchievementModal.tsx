"use client";
import { useGame } from "@/game/store";
import { ACHIEVEMENTS } from "@/game/data/systems";

export default function AchievementModal({ ids }: { ids: string[] }) {
  const g = useGame();
  const got = ACHIEVEMENTS.filter((a) => ids.includes(a.id));
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => g.setModal(null)}>
      <div className="panel-elevated w-full max-w-sm p-6 rise-in text-center" onClick={(e) => e.stopPropagation()}>
        {got.map((a) => (
          <div key={a.id} className="mb-3">
            <div className="text-3xl mb-1">🏆</div>
            <div className="font-display text-xl text-[#C28B49]">{a.name}</div>
            <div className="text-xs text-[#A2B0B2]">{a.desc}</div>
          </div>
        ))}
        <button className="btn btn-primary mt-2" onClick={() => g.setModal(null)}>Excellent</button>
      </div>
    </div>
  );
}
