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

import { t, type DictKey } from "@/game/i18n";
import { toggleMute } from "@/game/sound";

const NAV: { id: Screen; labelKey: DictKey }[] = [
  { id: "command", labelKey: "nav_command" },
  { id: "map", labelKey: "nav_map" },
  { id: "expedition", labelKey: "nav_expedition" },
  { id: "archive", labelKey: "nav_archive" },
  { id: "lab", labelKey: "nav_lab" },
  { id: "finance", labelKey: "nav_finance" },
  { id: "market", labelKey: "nav_market" },
  { id: "dev", labelKey: "nav_dev" },
  { id: "codex", labelKey: "nav_codex" },
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

  // Keyboard navigation & spacebar day advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (!game.inTutorial() || (game.s && game.s.tutorialStep === 4)) {
          game.nextDay();
        }
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (NAV[idx]) {
          game.setScreen(NAV[idx].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game]);

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

  const lang = game.lang ?? "en";

  return (
    <div className="min-h-screen flex flex-col">
      <StatusBar />
      <nav className="border-b hairline bg-[#0b1822] overflow-x-auto">
        <div className="flex">
          {NAV.map((n, idx) => {
            const label = t(n.labelKey, lang);
            // During the tutorial, only the guided screen is clickable.
            const guided = game.inTutorial() ? game.guidedScreen() : null;
            const locked = guided !== null && n.id !== guided;
            return locked ? (
              <Tooltip key={n.id} text={`🔒 Step ${s.tutorialStep}/12: Follow Dr. Linh's step to unlock ${label}, or press "Skip tutorial".`}>
                <span className="px-3.5 py-2 text-[0.8rem] whitespace-nowrap border-b-2 border-transparent text-[#3a5062] cursor-not-allowed select-none inline-block">
                  {label}
                  <span className="text-[0.62rem] opacity-30 ml-1">[{idx + 1}]</span>
                </span>
              </Tooltip>
            ) : (
              <button
                key={n.id}
                onClick={() => game.setScreen(n.id)}
                className={`px-3.5 py-2 text-[0.8rem] whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${
                  game.screen === n.id
                    ? "border-[#C28B49] text-[#F0E9D9]"
                    : "border-transparent text-[#A2B0B2] hover:text-[#F0E9D9]"
                }`}
              >
                <span>{label}</span>
                <span className="text-[0.62rem] opacity-40">[{idx + 1}]</span>
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

      {/* Tutorial coach card: persists throughout onboarding until completed or skipped */}
      {game.inTutorial() && <TutorialModal />}

      {/* Ephemeral Modals */}
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
