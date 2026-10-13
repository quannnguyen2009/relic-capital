"use client";
import { useGame } from "@/game/store";
import { runwayDays, fmt } from "@/game/engine/core";

const money = (n: number) => `${fmt(n)} đ`;

export default function StatusBar() {
  const g = useGame();
  const s = g.s;
  if (!s) return null;
  const rl = runwayDays(s);

  return (
    <header className="border-b hairline bg-[#0b1822] sticky top-0 z-30">
      <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-x-5 gap-y-1 flex-wrap">
        <span className="font-display text-lg tracking-wide">
          Relic Capital
          <span className="text-[#A2B0B2] text-sm ml-2 hidden sm:inline">Independent Institute for Vietnamese Archaeology</span>
        </span>
        <span className="flex-1" />
        <Stat label="Day" tip="Press “Advance day” to pass time: expenses are charged, the market ticks, expeditions progress.">
          {s.day}
        </Stat>
        <Stat label="Cash" tip="Available money (fictional in-game đ). Watch the runway — it tells you how long you can keep going." warn={s.resources.cash < 20000}>
          {money(s.resources.cash)}
        </Stat>
        <Stat label="Research" tip="Points spent on analyzing and verifying finds in the Research Lab.">
          {Math.floor(s.resources.research)}
        </Stat>
        <Stat label="Reputation" tip="Earned by digging and publishing. Unlocks new sites, staff and grants.">
          {s.resources.reputation}
        </Stat>
        <Stat label="Runway" tip="Days you can still operate at current spending. If empty, cash flow is stable.">
          {rl === null ? "stable" : `${rl}d`}
        </Stat>
        <button className="btn btn-ghost !py-1 !text-[0.75rem]" onClick={() => g.nextDay()} title="Passes one day: charges expenses, advances digs">
          Advance day →
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
