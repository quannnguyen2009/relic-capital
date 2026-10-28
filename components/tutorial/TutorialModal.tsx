"use client";
import { useGame, STEP_NAV } from "@/game/store";
import { TUTORIAL, TOTAL_TUTORIAL_STEPS } from "@/game/data/systems";
import { SITES } from "@/game/data/world";
import PixelAvatar from "../PixelAvatar";

export default function TutorialModal() {
  const g = useGame();
  const s = g.s;
  if (!s || !s.tutorialActive || s.tutorialStep > TOTAL_TUTORIAL_STEPS) return null;

  const step = Math.min(s.tutorialStep, TOTAL_TUTORIAL_STEPS);
  const def = TUTORIAL.find((t) => t.step === step) ?? TUTORIAL[0];
  const satisfied = stepSatisfied(s, step);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end p-3 sm:p-6">
      <div className="panel-elevated w-full sm:max-w-md max-w-lg p-5 sm:p-6 rise-in pointer-events-auto shadow-2xl border border-[#C28B49]/40 backdrop-blur-md bg-[#0d1c26]/95">
        {/* Header with speaker & Skip tutorial button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <PixelAvatar doctorId="dr_linh" size={48} frame="pixel-box" animated speaking />
            <div>
              <div className="font-display text-base sm:text-lg text-[#F0E9D9]">Dr. Linh</div>
              <div className="text-[0.68rem] text-[#A2B0B2] uppercase tracking-wider">
                Senior Archaeologist · Step {def.step}/{TOTAL_TUTORIAL_STEPS} — {def.title}
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost !py-1 !px-2.5 !text-[0.72rem] text-[#A2B0B2] hover:text-[#D66D67] hover:border-[#D66D67]/40 transition-colors shrink-0"
            onClick={() => g.skipTutorial()}
            title="Skip tutorial and unlock all institute facilities immediately"
          >
            Skip tutorial ✕
          </button>
        </div>

        {/* Narrative / Instructional text */}
        <p className="text-xs sm:text-sm text-[#F0E9D9]/90 leading-relaxed mb-3">
          {def.body}
        </p>

        {/* Action specific hint cards */}
        {step === 2 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 On the Exploration Map: click <span className="text-[#F0E9D9] font-semibold">“Plan expedition”</span> on the <span className="text-[#C28B49] font-medium">{SITES[0].name}</span> card.
          </div>
        )}
        {step === 3 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Keep the default 4-worker / 4-day plan, then press the green <span className="text-[#6D9A83] font-semibold">“Launch expedition”</span> button.
          </div>
        )}
        {step === 4 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Press <span className="text-[#F0E9D9] font-semibold">“Dig on — advance one day”</span> until the excavation completes. Pick any response to field events.
          </div>
        )}
        {step === 5 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 In the Research Lab: select your artifact from the left list, then click <span className="text-[#C28B49] font-semibold">“Artifact classification”</span>.
          </div>
        )}
        {step === 6 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Click <span className="text-[#F0E9D9] font-semibold">“Reference matching”</span>, then press <span className="text-[#6D9A83] font-semibold">“Verify evidence”</span> (or Publish if confidence ≥ 55%).
          </div>
        )}
        {step === 7 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Inspect your cataloged artifact card, conservation requirements, and historical period details.
          </div>
        )}
        {step === 8 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Note your operational <span className="text-[#F0E9D9] font-semibold">Runway</span> and explore available research grants.
          </div>
        )}
        {step === 9 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Review regional equipment indices and supply commodities.
          </div>
        )}
        {step === 10 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Inspect hireable specialists (epigraphers, field staff) and institute laboratory hardware.
          </div>
        )}
        {step === 11 && (
          <div className="panel p-2.5 text-xs text-[#A2B0B2] mb-3 bg-[#08131a]/80 border-[#C28B49]/30">
            👉 Review historical cultural periods of Vietnam and past expedition entries in your Journal.
          </div>
        )}
        {step === 12 && (
          <div className="panel p-2.5 text-xs text-[#6D9A83] mb-3 bg-[#08131a]/80 border-[#6D9A83]/30">
            ✨ Tour complete! All facilities are ready for your strategic direction.
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <span className="text-[0.68rem] text-[#A2B0B2]">
            {satisfied ? "Action ready" : "Complete the step to continue"}
          </span>

          <div className="flex gap-2">
            {step > 1 && (
              <button
                className="btn btn-ghost !text-xs !py-1.5"
                onClick={() => {
                  const prev = step - 1;
                  g.setTutorialStep(prev);
                  const scr = STEP_NAV[prev];
                  if (scr) g.setScreen(scr);
                }}
              >
                ← Back
              </button>
            )}

            {step < TOTAL_TUTORIAL_STEPS ? (
              <button
                className="btn btn-primary !text-xs !py-1.5"
                disabled={!satisfied}
                onClick={() => {
                  const next = step + 1;
                  g.setTutorialStep(next);
                  const scr = STEP_NAV[next];
                  if (scr) g.setScreen(scr);
                }}
                title={satisfied ? "Proceed to the next guided step" : "Perform the action highlighted above to continue"}
              >
                {satisfied ? "Continue →" : "Action required"}
              </button>
            ) : (
              <button
                className="btn btn-primary !text-xs !py-1.5 !bg-[#6D9A83] !border-[#6D9A83] hover:!bg-[#5c8570]"
                onClick={() => g.completeTutorial()}
              >
                Finish — Take Full Command ✨
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mt-3">
          {TUTORIAL.map((t) => (
            <div
              key={t.step}
              className={`h-1 flex-1 rounded transition-colors ${
                t.step <= step ? "bg-[#C28B49]" : "bg-[#22384a]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Determines whether the player has performed the required action for the current step. */
function stepSatisfied(s: import("@/game/engine/types").GameState, step: number): boolean {
  switch (step) {
    case 1:
      return true; // Intro
    case 2:
      return !!s.plannedExpedition || s.expedition !== null; // Site chosen on map
    case 3:
      return s.expedition !== null || s.artifacts.length > 0; // Expedition launched
    case 4:
      return (
        (s.expedition !== null && s.expedition.phase === "complete") ||
        s.artifacts.length > 0 ||
        (typeof s.flags.expeditionsCompleted === "number" && s.flags.expeditionsCompleted > 0)
      ); // Excavation completed or finds recovered
    case 5:
      return s.artifacts.some((a) => a.status !== "unanalyzed" || a.researchLog.length > 1); // Ran analysis
    case 6:
      return s.artifacts.some((a) => a.evidences.length >= 2 || a.status === "verified" || a.status === "published"); // Verified or second evidence built
    case 7:
      return true; // Archive discovery
    case 8:
      return true; // Finance discovery
    case 9:
      return true; // Market discovery
    case 10:
      return true; // Dev discovery
    case 11:
      return true; // Codex discovery
    case 12:
      return true; // Commission summary
    default:
      return true;
  }
}
