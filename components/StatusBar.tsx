"use client";
import { useState, useEffect } from "react";
import { useGame } from "@/game/store";
import { runwayDays, fmt } from "@/game/engine/core";
import { t } from "@/game/i18n";
import { isMuted, toggleMute } from "@/game/sound";
import {
  IconSoundOn, IconSoundOff, IconFlagVN, IconFlagGB,
  IconMuseum, IconSaveDot
} from "./PixelIcons";
import RelicCapitalLogo from "./RelicCapitalLogo";

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
        {/* Institute Branding with Pixel Logo */}
        <div className="flex items-center gap-2.5">
          <RelicCapitalLogo size={22} variant="emblem" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg tracking-wide text-[#F0E9D9]">
              {t("instituteTitle", lang)}
            </span>
            <span className="text-[#A2B0B2] text-xs hidden lg:inline font-light border-l border-[#22384a] pl-2">
              {t("instituteSubtitle", lang)}
            </span>
          </div>
        </div>

        <span className="flex-1" />

        {/* Active Exhibition badge */}
        {s.activeExhibition && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border border-[#c89b3c]/40 bg-[#c89b3c]/10 text-xs">
            <IconMuseum size={12} />
            <span className="text-[#e8d8b0] font-medium truncate max-w-[140px] font-vt" style={{ fontSize: "0.85rem" }}>{s.activeExhibition.title}</span>
            <span className="text-[#4da87a] num">{fmt(s.activeExhibition.dailyRevenue)}đ/d</span>
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
          <div className="font-vt uppercase tracking-wider text-[#8a9ea8]" style={{ fontSize: "0.75rem" }}>{t("runway", lang)}</div>
          <div className={`num font-semibold flex items-center gap-1 ${
            rl === null
              ? "text-[#4da87a]"
              : rl > 30
              ? "text-[#4da87a]"
              : rl >= 10
              ? "text-[#c89b3c]"
              : "text-[#e04040] pulse-soft"
          }`} style={{ fontSize: "0.9rem" }}>
            <IconSaveDot
              size={8}
              color={
                rl === null || rl > 30 ? "#4da87a" : rl >= 10 ? "#c89b3c" : "#e04040"
              }
            />
            {rl === null ? t("stableRunway", lang) : `${rl}${t("daysCount", lang)}`}
          </div>
          <div className="tthost-body">
            Days remaining before funds deplete at current daily burn rate.
          </div>
        </div>



        {/* Audio Mute Toggle */}
        <button
          className="btn btn-ghost !py-1 !px-2 !text-xs text-[#8a9ea8] hover:text-[#e8d8b0]"
          onClick={handleToggleSound}
          title={muted ? t("soundMuted", lang) + " (Click to unmute - shortcut 'M')" : t("soundOn", lang) + " (Click to mute - shortcut 'M')"}
        >
          {muted ? <IconSoundOff size={14} /> : <IconSoundOn size={14} />}
        </button>

        {/* Bilingual Language Toggle */}
        <button
          className="btn btn-ghost !py-1 !px-2 text-[#c89b3c] border-[#c89b3c]/30 hover:border-[#c89b3c] flex items-center gap-1 font-vt"
          style={{ fontSize: "0.85rem" }}
          onClick={handleToggleLang}
          title="Switch language between English and Tiếng Việt"
        >
          {lang === "en" ? <IconFlagVN size={14} /> : <IconFlagGB size={14} />}
          <span>{lang === "en" ? "Tiếng Việt" : "English"}</span>
        </button>


        {/* Advance Day Action */}
        <button
          className="btn btn-ghost !py-1 border border-[#22384a] hover:border-[#c89b3c] font-vt"
          style={{ fontSize: "0.85rem" }}
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

function Stat({ label, tip, children, warn, icon }: { label: string; tip: string; children: React.ReactNode; warn?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="tthost" tabIndex={0}>
      {/* Use font-vt (Pixelify Sans) for labels — they may be Vietnamese via i18n */}
      <div className="flex items-center gap-1 uppercase tracking-wider text-[#8a9ea8] font-vt mb-0.5" style={{ fontSize: "0.7rem" }}>
        {icon}
        {label}
      </div>
      <div className={`num font-semibold ${warn ? "text-[#e04040]" : "text-[#e8d8b0]"}`} style={{ fontSize: "0.95rem" }}>{children}</div>
      <div className="tthost-body">{tip}</div>
    </div>
  );
}


