"use client";
import { useState, useEffect } from "react";
import { useGame } from "@/game/store";
import { runwayDays, fmt } from "@/game/engine/core";
import { t } from "@/game/i18n";
import { isMuted, toggleMute } from "@/game/sound";

const money = (n: number) => `${fmt(n)} đ`;

export default function StatusBar() {
  const g = useGame();
  const s = g.s;
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  if (!s) return null;
  const rl = runwayDays(s);
  const lang = g.lang ?? "en";

  const handleToggleSound = () => {
    const next = toggleMute();
    setMutedState(next);
  };

  const handleToggleLang = () => {
    g.setLang(lang === "en" ? "vi" : "en");
  };

  return (
    <header className="border-b hairline bg-[#0b1822] sticky top-0 z-30 shadow-md">
      <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-x-4 gap-y-1.5 flex-wrap">
        {/* Institute Branding */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg tracking-wide text-[#F0E9D9]">
            {t("instituteTitle", lang)}
          </span>
          <span className="text-[#A2B0B2] text-xs hidden lg:inline font-light border-l border-[#22384a] pl-2">
            {t("instituteSubtitle", lang)}
          </span>
        </div>

        <span className="flex-1" />

        {/* Active Exhibition badge */}
        {s.activeExhibition && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#C28B49]/40 bg-[#C28B49]/10 text-xs">
            <span className="text-[#C28B49]">🏛️</span>
            <span className="text-[#F0E9D9] font-medium truncate max-w-[140px]">{s.activeExhibition.title}</span>
            <span className="text-[#6D9A83] num">+{fmt(s.activeExhibition.dailyRevenue)}đ/d</span>
          </div>
        )}

        {/* Core Institutional Stats */}
        <Stat label={t("day", lang)} tip="Calendar day: operational burn is charged, expeditions progress, market fluctuates.">
          {s.day}
        </Stat>

        <Stat
          label={t("cash", lang)}
          tip="Current liquid institutional funds (in-game đ). Keep positive to avoid insolvency."
          warn={s.resources.cash < 20000}
        >
          {money(s.resources.cash)}
        </Stat>

        <Stat label={t("research", lang)} tip="Scientific research points consumed by artifact classification, stratigraphy, and verification.">
          {Math.floor(s.resources.research)}
        </Stat>

        <Stat label={t("reputation", lang)} tip="Prestige earned from publications and excavations. Unlocks sites, grants, and specialized staff.">
          {s.resources.reputation}
        </Stat>

        {/* Color-coded Runway Health */}
        <div className="tthost" tabIndex={0}>
          <div className="text-[0.62rem] uppercase tracking-wider text-[#A2B0B2]">{t("runway", lang)}</div>
          <div className={`num text-sm font-semibold flex items-center gap-1 ${
            rl === null
              ? "text-[#6D9A83]"
              : rl > 30
              ? "text-[#6D9A83]"
              : rl >= 10
              ? "text-[#C28B49]"
              : "text-[#D66D67] animate-pulse"
          }`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              rl === null || rl > 30 ? "bg-[#6D9A83]" : rl >= 10 ? "bg-[#C28B49]" : "bg-[#D66D67]"
            }`} />
            {rl === null ? t("stableRunway", lang) : `${rl}${t("daysCount", lang)}`}
          </div>
          <div className="tthost-body">
            Days remaining before funds deplete at current daily burn rate.
          </div>
        </div>

        {/* Audio Mute Toggle */}
        <button
          className="btn btn-ghost !py-1 !px-2 !text-xs text-[#A2B0B2] hover:text-[#F0E9D9]"
          onClick={handleToggleSound}
          title={muted ? t("soundMuted", lang) + " (Click to unmute - shortcut 'M')" : t("soundOn", lang) + " (Click to mute - shortcut 'M')"}
        >
          {muted ? "🔇" : "🔊"}
        </button>

        {/* Bilingual Language Toggle */}
        <button
          className="btn btn-ghost !py-1 !px-2.5 !text-xs text-[#C28B49] border-[#C28B49]/30 hover:border-[#C28B49]"
          onClick={handleToggleLang}
          title="Switch language between English and Tiếng Việt"
        >
          {lang === "en" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
        </button>

        {/* Advance Day Action */}
        <button
          className="btn btn-ghost !py-1 !text-[0.75rem] border border-[#22384a] hover:border-[#C28B49]"
          disabled={g.inTutorial()}
          onClick={() => g.nextDay()}
          title={g.inTutorial() ? "Complete the guided instruction flow first before advancing calendar days." : "Passes one day: charges operational expenses, advances digs (Spacebar)"}
        >
          {t("advanceDay", lang)}
        </button>
      </div>
    </header>
  );
}

function Stat({ label, tip, children, warn }: { label: string; tip: string; children: React.ReactNode; warn?: boolean }) {
  return (
    <div className="tthost" tabIndex={0}>
      <div className="text-[0.62rem] uppercase tracking-wider text-[#A2B0B2]">{label}</div>
      <div className={`num text-sm font-semibold ${warn ? "text-[#D66D67]" : "text-[#F0E9D9]"}`}>{children}</div>
      <div className="tthost-body">{tip}</div>
    </div>
  );
}
