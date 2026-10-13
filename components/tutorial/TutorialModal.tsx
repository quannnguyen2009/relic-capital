"use client";
import { useGame } from "@/game/store";
import { TUTORIAL } from "@/game/data/systems";
import { SITES } from "@/game/data/world";
import type { Screen } from "@/game/store";

/** Where "Continue" navigates, per step. null = stay on this screen. */
const STEP_NAV: Record<number, Screen | null> = {
  1: null,
  2: "map",
  3: "expedition",
  4: null, // the player stays on the expedition screen during digging
  5: "lab",
  6: null, // already in the lab
  7: "archive",
  8: null,
};

export default function TutorialModal() {
  const g = useGame();
  const s = g.s!;
  const step = s.tutorialStep;
  const def = TUTORIAL.find((t) => t.step === Math.min(step, 8)) ?? TUTORIAL[0];

  const satisfied = stepSatisfied(s, step);

  // Non-blocking floating coach card: the player must be able to act on the game
  // while Dr. Linh guides (the steps only advance when the action is performed).
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6">
      <div className="panel-elevated w-full sm:max-w-md max-w-lg p-6 rise-in pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#172A33] border border-[#C28B49] flex items-center justify-center font-display text-lg text-[#C28B49]">L</div>
          <div>
            <div className="font-display text-lg">Dr. Linh</div>
            <div className="text-[0.7rem] text-[#A2B0B2] uppercase tracking-wider">Senior archaeologist · step {def.step}/8 — {def.title}</div>
          </div>
        </div>

        <p className="text-sm text-[#F0E9D9]/90 leading-relaxed mb-4">{def.body}</p>

        {step === 2 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            On the map: press <span className="text-[#F0E9D9]">Plan expedition</span> on the <span className="text-[#F0E9D9]">{SITES[0].name}</span> card.
          </div>
        )}
        {step === 3 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            On the expedition screen: keep the default plan, then press <span className="text-[#F0E9D9]">Launch expedition</span>.
          </div>
        )}
        {step === 4 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            Press <span className="text-[#F0E9D9]">Dig on — advance one day</span> until the dig completes. Resolve any field decision (any option is fine).
          </div>
        )}
        {step === 5 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            Select your discovery, then press <span className="text-[#F0E9D9]">Artifact classification</span>.
          </div>
        )}
        {step === 6 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            Run <span className="text-[#F0E9D9]">Reference matching</span>, then press <span className="text-[#F0E9D9]">Verify evidence</span>.
          </div>
        )}
        {step === 7 && (
          <div className="panel p-3 text-xs text-[#A2B0B2] mb-4">
            Open your find, press <span className="text-[#F0E9D9]">Publish</span> (needs 55%+ confidence — run more analyses if short).
          </div>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Skip is only offered while replaying the tutorial — first play IS the onboarding. */}
          {s.tutorialReplay ? (
            <button className="btn btn-ghost !text-xs" onClick={() => g.skipTutorial()}>Stop tutorial</button>
          ) : (
            <span className="text-[0.65rem] text-[#A2B0B2]">Step {def.step} of 8 — complete the action to continue</span>
          )}
          <div className="flex gap-2">
            {step > 1 && step < 8 && <button className="btn btn-ghost" onClick={() => g.setTutorialStep(step - 1)}>Back</button>}
            {step < 8 ? (
              <button
                className="btn btn-primary"
                disabled={!satisfied}
                onClick={() => {
                  g.setTutorialStep(step + 1);
                  const nav = STEP_NAV[step + 1] ?? null;
                  if (nav) g.setScreen(nav);
                }}
                title={satisfied ? "" : "Do the action above first — then this unlocks."}
              >
                {satisfied ? "Continue →" : "Complete the action first"}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => g.completeTutorial()}>Finish — you&rsquo;re in charge</button>
            )}
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {TUTORIAL.map((t) => (
            <div key={t.step} className={`h-1 flex-1 rounded ${t.step <= step ? "bg-[#C28B49]" : "bg-[#22384a]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The tutorial unlocks "Continue" only when the player actually did the step in-game. */
function stepSatisfied(s: import("@/game/engine/types").GameState, step: number): boolean {
  switch (step) {
    case 1: return true; // intro
    case 2: return !!s.plannedExpedition; // a site was chosen in planning
    case 3: return !!s.plannedExpedition; // plan adjusted
    case 4: return s.expedition !== null; // expedition launched
    case 5: return s.artifacts.some((a) => a.status !== "unanalyzed"); // first analysis run
    case 6: return s.artifacts.some((a) => a.evidences.length >= 2); // evidence inspected / matching run
    case 7: return s.artifacts.some((a) => a.status === "published") || s.grantApplications.length > 0 || s.artifacts.some((a) => a.accessibility > 0);
    case 8: return true; // summary
    default: return true;
  }
}
