"use client";
import { useState } from "react";
import { useGame } from "@/game/store";
import type { Difficulty } from "@/game/engine/types";
import { DIFFICULTIES } from "@/game/data/systems";
import { IconCheck } from "./PixelIcons";
import RelicCapitalLogo from "./RelicCapitalLogo";

export default function StartScreen({ hasSave, onContinue, onBack }: { hasSave: boolean; onContinue: () => void; onBack?: () => void }) {
  const game = useGame();
  const [diff, setDiff] = useState<Difficulty>("standard");

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/sites/coloas.jpg)", opacity: 0.1, imageRendering: "pixelated" }}
      />
      {/* Pixel scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 6px)",
          zIndex: 1,
        }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(10,14,20,0.85)", zIndex: 0 }} />

      {onBack && (
        <button className="absolute top-4 left-4 btn btn-ghost z-10" style={{ fontSize: "0.5rem" }} onClick={onBack}>
          ◄ BACK
        </button>
      )}

      <div className="relative panel-elevated max-w-xl w-full p-8 rise-in" style={{ zIndex: 2 }}>
        {/* Pixel header decoration */}
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 12, height: 12, background: "var(--bronze)" }} />
          <div style={{ flex: 1, height: 2, background: "var(--bronze)" }} />
          <div style={{ width: 4, height: 4, background: "var(--bronze)" }} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <RelicCapitalLogo size={56} variant="emblem" animateGlow />
          <div>
            <p className="tag border-[#c89b3c] text-[#c89b3c] mb-1.5" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.4rem" }}>
              VIETNAMESE ARCHAEOLOGY · RESEARCH · FINANCE
            </p>
            <h1
              className="text-glow-bronze"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "1.1rem", lineHeight: 1.4, color: "#e8d8b0" }}
            >
              RELIC CAPITAL
            </h1>
          </div>
        </div>
        <p className="text-[#8a9ea8] text-sm mb-6" style={{ fontFamily: "var(--font-vt323)", fontSize: "1rem" }}>
          DIRECT AN INDEPENDENT RESEARCH INSTITUTE. CHOOSE SITES, PLAN EXPEDITIONS, VERIFY
          AI-GENERATED HYPOTHESES, AND KEEP THE BOOKS ALIVE.{" "}
          <em>EVERY EXCAVATION IS AN INVESTMENT, EVERY DISCOVERY IS A HYPOTHESIS.</em>{" "}
          ALL MONEY, MARKETS AND INSTRUMENTS ARE FICTIONAL IN-GAME MODELS.
        </p>

        {/* Pixel divider */}
        <div style={{ height: 2, background: "var(--line)", marginBottom: "1rem" }} />

        <div className="mb-5">
          <div className="text-[0.45rem] uppercase tracking-wider text-[#8a9ea8] mb-2" style={{ fontFamily: "var(--font-pixel)" }}>
            ► SELECT DIFFICULTY
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(DIFFICULTIES).map((d) => (
              <button
                key={d.id}
                onClick={() => setDiff(d.id)}
                className="text-left p-3 border-2 transition-colors"
                style={{
                  borderColor: diff === d.id ? "var(--bronze)" : "rgba(232,216,176,0.14)",
                  background: diff === d.id ? "var(--elevated)" : "var(--surface)",
                  boxShadow: diff === d.id ? "3px 3px 0px #6b4a10" : "2px 2px 0px rgba(0,0,0,0.7)",
                }}
              >
                <div className="flex items-center gap-1 mb-1">
                  {diff === d.id && <IconCheck size={10} />}
                  <div className="font-display text-sm font-semibold tracking-wider" style={{ color: diff === d.id ? "#c89b3c" : "#e8d8b0" }}>
                    {d.name.toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-[#8a9ea8] mt-1 font-vt" style={{ fontSize: "0.85rem" }}>{d.desc}</div>
                <div className="text-xs text-[#4da87a] mt-1 num font-semibold" style={{ fontSize: "0.85rem" }}>
                  START: {new Intl.NumberFormat("en-US").format(d.startingCash)} đ
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn btn-primary flex-1 justify-center" onClick={() => game.startNew(diff)}>
            ► BEGIN FIRST EXPEDITION
          </button>
          {hasSave && (
            <button className="btn btn-jade flex-1 justify-center" onClick={onContinue}>
              ► CONTINUE SAVED GAME
            </button>
          )}
        </div>

        {/* Bottom pixel decoration */}
        <div className="flex items-center gap-2 mt-4">
          <div style={{ flex: 1, height: 2, background: "var(--line)" }} />
          <p className="text-[0.4rem] text-[#8a9ea8]" style={{ fontFamily: "var(--font-pixel)" }}>
            PROGRESS SAVES IN BROWSER
          </p>
          <div style={{ flex: 1, height: 2, background: "var(--line)" }} />
        </div>
      </div>
    </div>
  );
}
