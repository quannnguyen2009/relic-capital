"use client";

import { useEffect, useState } from "react";
import { useGame, Screen } from "@/game/store";
import { hasSave } from "@/game/persistence/save";
import StatusBar from "@/components/StatusBar";
import CommandCenter from "@/components/CommandCenter";
import MapScreen from "@/components/map/MapScreen";
import ExpeditionScreen from "@/components/expedition/ExpeditionScreen";
import ArchiveScreen from "@/components/artifacts/ArchiveScreen";
import LabScreen from "@/components/research/LabScreen";
import FinanceScreen from "@/components/finance/FinanceScreen";
import MarketScreen from "@/components/market/MarketScreen";
import DevScreen from "@/components/dev/DevScreen";
import CodexScreen from "@/components/CodexScreen";
import TutorialModal from "@/components/tutorial/TutorialModal";
import EventModal from "@/components/tutorial/EventModal";
import XpReportModal from "@/components/expedition/XpReportModal";
import AchievementModal from "@/components/tutorial/AchievementModal";
import StartScreen from "@/components/StartScreen";
import CoverScreen from "@/components/CoverScreen";
import { Tooltip } from "@/components/ui";

const NAV: { id: Screen; label: string }[] = [
  { id: "command", label: "Command Center" },
  { id: "map", label: "Exploration Map" },
  { id: "expedition", label: "Expedition" },
  { id: "archive", label: "Artifact Archive" },
  { id: "lab", label: "Research Lab" },
  { id: "finance", label: "Finance & Grants" },
  { id: "market", label: "Market Observatory" },
  { id: "dev", label: "Institute Development" },
  { id: "codex", label: "Codex & Journal" },
];

/** Entry flow: cover (cinematic) → start/save → game. */
type Phase = "cover" | "start" | "game";

export default function Page() {
  const game = useGame();
  const [booted, setBooted] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [phaseRaw, setPhaseRaw] = useState<Phase>("cover");

  useEffect(() => {
    setSaveExists(hasSave());
    setBooted(true);
  }, []);

  if (!booted) return null;

  const s = game.s;
  const phase: Phase = s ? "game" : phaseRaw;

  if (phase === "cover") {
    return (
      <CoverScreen
        onEnter={() => {
          setSaveExists(hasSave());
          setPhaseRaw("start");
        }}
      />
    );
  }

  if (phase === "start" || !s) {
    return (
      <StartScreen
        hasSave={saveExists}
        onContinue={() => {
          if (game.continueGame()) setSaveExists(true);
        }}
        onBack={() => setPhaseRaw("cover")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StatusBar />
      <nav className="border-b hairline bg-[#0b1822] overflow-x-auto">
        <div className="flex">
          {NAV.map((n) => {
            // During the tutorial, only the guided screen (and the one you're on) is clickable.
            const guided = game.inTutorial() ? game.guidedScreen() : null;
            const locked = guided !== null && n.id !== guided;
            return locked ? (
              <Tooltip key={n.id} text="Follow Dr. Linh's step — this unlocks after the tutorial.">
                <span className="px-4 py-2 text-[0.8rem] whitespace-nowrap border-b-2 border-transparent text-[#3a5062] cursor-not-allowed select-none inline-block">
                  {n.label}
                </span>
              </Tooltip>
            ) : (
              <button
                key={n.id}
                onClick={() => game.setScreen(n.id)}
                className={`px-4 py-2 text-[0.8rem] whitespace-nowrap border-b-2 transition-colors ${
                  game.screen === n.id
                    ? "border-[#C28B49] text-[#F0E9D9]"
                    : "border-transparent text-[#A2B0B2] hover:text-[#F0E9D9]"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 py-6">
        {game.screen === "command" && <CommandCenter />}
        {game.screen === "map" && <MapScreen />}
        {game.screen === "expedition" && <ExpeditionScreen />}
        {game.screen === "archive" && <ArchiveScreen />}
        {game.screen === "lab" && <LabScreen />}
        {game.screen === "finance" && <FinanceScreen />}
        {game.screen === "market" && <MarketScreen />}
        {game.screen === "dev" && <DevScreen />}
        {game.screen === "codex" && <CodexScreen />}
      </main>

      <footer className="border-t hairline px-4 py-2 text-[0.7rem] text-[#A2B0B2] flex flex-wrap gap-3 justify-between">
        <span>
          Relic Capital — a fictional strategy game. All currency, instruments, sites labeled “fictional”, and artifact attributions are simulated for gameplay; real sites are referenced respectfully.
        </span>
        <span className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${saveIndicatorFresh(game.lastSaveAt) ? "bg-[#6D9A83]" : "bg-[#2a3d4a]"}`} />
          {saveIndicatorFresh(game.lastSaveAt) ? "Progress saved" : "Saving…"}
          <button
            className="btn btn-ghost !py-0.5 !px-2 !text-[0.7rem] ml-2"
            onClick={() => game.setModal({ kind: "confirm-reset" })}
          >
            New game / reset
          </button>
        </span>
      </footer>

      {/* Modals */}
      {game.modal?.kind === "tutorial" && <TutorialModal />}
      {game.modal?.kind === "event" && <EventModal eventId={game.modal.eventId} />}
      {game.modal?.kind === "xp-report" && <XpReportModal />}
      {game.modal?.kind === "achievement" && <AchievementModal ids={game.modal.ids} />}
      {game.modal?.kind === "confirm-reset" && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => game.setModal(null)}>
          <div className="panel-elevated p-6 max-w-md rise-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl mb-2">Reset the institute?</h3>
            <p className="text-sm text-[#A2B0B2] mb-4">
              This permanently wipes your current save: archive, finances, market positions and tutorial progress. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={() => game.setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { game.setModal(null); game.reset(); setPhaseRaw("start"); }}>
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* active event bubble (when modal not open) */}
      {s.activeEvents.some((e) => !e.resolved) && game.modal?.kind !== "event" && (
        <button
          onClick={() => {
            const act = s.activeEvents.find((e) => !e.resolved);
            if (act) game.setModal({ kind: "event", eventId: act.eventId });
          }}
          className="fixed bottom-14 right-6 z-40 panel-elevated px-4 py-3 text-left rise-in hover:border-[#C28B49]"
        >
          <span className="tag border-[#B9654B] text-[#B9654B] mb-1">Event</span>
          <div className="text-sm font-display">A decision awaits — click to respond</div>
        </button>
      )}

      {/* insolvency warning */}
      {s.resources.cash < 0 && (
        <div className="fixed bottom-14 left-6 z-40 panel px-4 py-3 border-[#D66D67]">
          <div className="text-sm text-[#D66D67] font-display">Insolvency risk — cash is negative</div>
          <div className="text-xs text-[#A2B0B2] mt-1">Sell market positions, or win a grant: apply now in Finance & Grants.</div>
        </div>
      )}
    </div>
  );
}

function saveIndicatorFresh(t: number) {
  return Date.now() - t < 10000 || t === 0;
}
