"use client";
import { useState } from "react";
import { useGame } from "@/game/store";
import type { Difficulty } from "@/game/engine/types";
import { DIFFICULTIES } from "@/game/data/systems";

export default function StartScreen({ hasSave, onContinue, onBack }: { hasSave: boolean; onContinue: () => void; onBack?: () => void }) {
  const game = useGame();
  const [diff, setDiff] = useState<Difficulty>("standard");

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <div
        className="absolute inset-0 opacity-[0.18] bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/sites/coloas.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09131B]/60 via-[#09131B]/85 to-[#09131B]" />
      {onBack && (
        <button className="absolute top-4 left-4 btn btn-ghost !text-xs z-10" onClick={onBack}>
          ← Back to title
        </button>
      )}
      <div className="relative panel-elevated max-w-xl w-full p-8 rise-in">
        <p className="tag border-[#C28B49] text-[#C28B49] mb-4">A strategy game of Vietnamese archaeology, research and finance</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3 leading-tight">Relic Capital</h1>
        <p className="text-[#A2B0B2] text-sm mb-6">
          Direct an independent research institute. Choose sites, plan expeditions, verify AI-generated
          hypotheses, and keep the books alive. <em>Every excavation is an investment, every discovery is a
          hypothesis.</em> All money, markets and instruments are fictional in-game models — this game is
          neither an antiquities market nor investment advice.
        </p>

        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-2">Difficulty</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(DIFFICULTIES).map((d) => (
              <button
                key={d.id}
                onClick={() => setDiff(d.id)}
                className={`text-left p-3 rounded border transition-colors ${
                  diff === d.id ? "border-[#C28B49] bg-[#172A33]" : "hairline hover:border-[#6D9A83]"
                }`}
              >
                <div className="font-display text-base">{d.name}</div>
                <div className="text-[0.7rem] text-[#A2B0B2] mt-1">{d.desc}</div>
                <div className="num text-[0.7rem] text-[#6D9A83] mt-1">Start: {new Intl.NumberFormat("en-US").format(d.startingCash)} đ</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn btn-primary flex-1 justify-center" onClick={() => game.startNew(diff)}>
            Begin your first expedition
          </button>
          {hasSave && (
            <button className="btn btn-jade flex-1 justify-center" onClick={onContinue}>
              Continue saved game
            </button>
          )}
        </div>
        <p className="text-[0.65rem] text-[#A2B0B2] mt-4">
          Progress saves automatically in your browser. The guided tutorial can be skipped and replayed from the Codex.
        </p>
      </div>
    </div>
  );
}
