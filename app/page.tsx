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
import AssemblageModal from "@/components/tutorial/AssemblageModal";
import StartScreen from "@/components/StartScreen";
import CoverScreen from "@/components/CoverScreen";
import { Tooltip } from "@/components/ui";
import {
  IconCommand, IconMap, IconExpedition, IconArchive, IconResearch,
  IconFinance, IconMarket, IconDev, IconCodex, IconLock, IconEvent, IconSaveDot
} from "@/components/PixelIcons";

import { t, type DictKey } from "@/game/i18n";
import { toggleMute } from "@/game/sound";


const NAV_ICONS: Record<string, React.ReactNode> = {
  command:    <IconCommand size={12} />,
  map:        <IconMap size={12} />,
  expedition: <IconExpedition size={12} />,
  archive:    <IconArchive size={12} />,
  lab:        <IconResearch size={12} />,
  finance:    <IconFinance size={12} />,
  market:     <IconMarket size={12} />,
  dev:        <IconDev size={12} />,
  codex:      <IconCodex size={12} />,
};

const NAV: { id: Screen; labelKey: DictKey }[] = [
  { id: "command", labelKey: "nav_command" },
  { id: "map", labelKey: "nav_map" },
  { id: "expedition", labelKey: "nav_expedition" },
  { id: "archive", labelKey: "nav_archive" },
  { id: "lab", labelKey: "nav_lab" },
  { id: "finance", labelKey: "nav_finance" },
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
      <nav className="border-b-2 border-[rgba(232,216,176,0.14)] bg-[#0a0e14] overflow-x-auto">
        <div className="flex">
          {NAV.map((n, idx) => {
            const label = t(n.labelKey, lang);
            const guided = game.inTutorial() ? game.guidedScreen() : null;
            const locked = guided !== null && n.id !== guided;
            return locked ? (
              <Tooltip key={n.id} text={`[LOCKED] Step ${s.tutorialStep}/12: Follow Dr. Linh or press Skip tutorial.`}>
                <span className="px-3 py-2 whitespace-nowrap border-b-2 border-transparent text-[#3a5062] cursor-not-allowed select-none inline-flex items-center gap-1.5 font-vt" style={{ fontSize: "0.85rem" }}>
                  <IconLock size={10} color="#3a5062" />
                  {label}
                </span>
              </Tooltip>

            ) : (
              <button
                key={n.id}
                onClick={() => game.setScreen(n.id)}
                className={`px-3 py-2 whitespace-nowrap border-b-2 flex items-center gap-1.5 font-vt transition-colors ${
                  game.screen === n.id
                    ? "border-[#c89b3c] text-[#c89b3c] text-glow-bronze"
                    : "border-transparent text-[#8a9ea8] hover:text-[#e8d8b0]"
                }`}
                style={{ fontSize: "0.85rem" }}
              >
                {NAV_ICONS[n.id]}
                <span>{label}</span>
                <span className="opacity-40 font-pixel" style={{ fontSize: "0.38rem" }}>[{idx + 1}]</span>
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

      <footer className="border-t-2 border-[rgba(232,216,176,0.14)] px-4 py-2 text-[0.65rem] text-[#8a9ea8] flex flex-wrap gap-3 justify-between font-vt">
        <span>
          RELIC CAPITAL — A FICTIONAL STRATEGY GAME. All currency, instruments, sites labeled &quot;fictional&quot;, and artifact attributions are simulated for gameplay; real sites are referenced respectfully.
        </span>
        <span className="flex items-center gap-2">
          <IconSaveDot size={8} color={saveIndicatorFresh(game.lastSaveAt) ? "#4da87a" : "#2a3d4a"} />
          {saveIndicatorFresh(game.lastSaveAt) ? "PROGRESS SAVED" : "SAVING..."}
          <button
            className="btn btn-ghost !py-0.5 !px-2 !text-[0.45rem] ml-2"
            onClick={() => game.setModal({ kind: "confirm-reset" })}
          >
            NEW GAME / RESET
          </button>
        </span>
      </footer>


      {/* Tutorial coach card: persists throughout onboarding until completed or skipped */}
      {game.inTutorial() && <TutorialModal />}

      {/* Ephemeral Modals */}
      {game.modal?.kind === "event" && <EventModal eventId={game.modal.eventId} />}
      {game.modal?.kind === "xp-report" && <XpReportModal />}
      {game.modal?.kind === "achievement" && <AchievementModal ids={game.modal.ids} />}
      {game.modal?.kind === "assemblage" && <AssemblageModal ids={game.modal.ids} />}
      {game.modal?.kind === "confirm-reset" && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => game.setModal(null)}>
          <div className="panel-elevated p-6 max-w-md rise-in" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-pixel)", fontSize: "0.65rem", color: "var(--danger)", marginBottom: "0.75rem" }}>
              RESET THE INSTITUTE?
            </h3>
            <p className="text-sm text-[#8a9ea8] mb-4" style={{ fontFamily: "var(--font-vt323)" }}>
              THIS PERMANENTLY WIPES YOUR CURRENT SAVE: ARCHIVE, FINANCES, MARKET POSITIONS AND TUTORIAL PROGRESS. THIS CANNOT BE UNDONE.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={() => game.setModal(null)}>CANCEL</button>
              <button className="btn btn-primary" onClick={() => { game.setModal(null); game.reset(); setPhaseRaw("start"); }}>
                YES, RESET
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
          className="fixed bottom-14 right-6 z-40 panel-elevated px-4 py-3 text-left rise-in hover:border-[#c89b3c]"
        >
          <span className="tag border-[#c05c38] text-[#c05c38] mb-1 flex items-center gap-1">
            <IconEvent size={10} color="#c05c38" />
            EVENT
          </span>
          <div className="text-sm font-vt">A DECISION AWAITS — CLICK TO RESPOND</div>
        </button>
      )}


      {/* insolvency warning */}
      {s.resources.cash < 0 && (
        <div className="fixed bottom-14 left-6 z-40 panel px-4 py-3 border-[#e04040]">
          <div className="text-[0.5rem] text-[#e04040] flex items-center gap-2" style={{fontFamily:'var(--font-pixel)'}}>INSOLVENCY RISK — CASH IS NEGATIVE</div>
          <div className="text-xs text-[#8a9ea8] mt-1" style={{fontFamily:'var(--font-vt323)'}}>SELL MARKET POSITIONS, OR WIN A GRANT: APPLY NOW IN FINANCE &amp; GRANTS.</div>
        </div>
      )}

    </div>
  );
}

function saveIndicatorFresh(t: number) {
  return Date.now() - t < 10000 || t === 0;
}
