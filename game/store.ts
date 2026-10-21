"use client";
import { create } from "zustand";
import type { GameState, ExpeditionPlan, ResearchOp, Difficulty, RoleId, RegionId } from "../game/engine/types";
import { newGame } from "../game/engine/newGame";
import {
  advanceDay, startExpedition, validatePlan, estimateExpedition, advanceExpeditionDay,
  resolveExpeditionDecision, evaluateAchievements, evaluateCampaign, runwayDays, spend, earn,
} from "../game/engine/core";
import { runAnalysis, verifyArtifact, publishArtifact, digitizeArtifact } from "../game/engine/research";
import { initMarket, buy, sell, priceOf } from "../game/engine/market";
import { applyGrant, resolveGrants, grantScore } from "../game/engine/grants";
import { maybeSpawnEvent, resolveEvent } from "../game/engine/events";
import { saveGame, loadGame, clearSave, hasSave } from "../game/persistence/save";
import { ACHIEVEMENTS, EQUIPMENT_DEFS, STAFF_DEFS, TECHS, TOTAL_TUTORIAL_STEPS } from "../game/data/systems";
import { SITES, REGIONS } from "../game/data/world";

import { Lang } from "./i18n";
import {
  playCoinSound, playDigSound, playDiscoverySound, playPublishSound,
  playVerifySound, playClickSound
} from "./sound";

export type Screen =
  | "command" | "map" | "expedition" | "archive" | "lab" | "finance" | "market" | "dev" | "codex";

export const STEP_NAV: Record<number, Screen> = {
  1: "command",
  2: "map",
  3: "expedition",
  4: "expedition",
  5: "lab",
  6: "lab",
  7: "archive",
  8: "finance",
  9: "market",
  10: "dev",
  11: "codex",
  12: "command",
};

export type Modal =
  | { kind: "tutorial" } | { kind: "event"; eventId: string }
  | { kind: "xp-report" } | { kind: "confirm-reset" }
  | { kind: "achievement"; ids: string[] } | null;

interface Store {
  s: GameState | null;
  screen: Screen;
  modal: Modal;
  lastSaveAt: number;
  simHint: string;
  lang: Lang;
  setLang: (l: Lang) => void;

  // navigation
  setScreen: (sc: Screen) => void;
  setModal: (m: Modal) => void;
  /** Allowed next screen per tutorial step (null = free navigation). */
  guidedScreen: () => Screen | null;
  /** True while a new player is still completing the guided tutorial. */
  inTutorial: () => boolean;

  // lifecycle
  startNew: (d: Difficulty) => void;
  continueGame: () => boolean;
  reset: () => void;

  // core loop
  nextDay: () => void;
  setPlan: (p: ExpeditionPlan | null) => void;
  launchExpedition: () => { ok: boolean; reason?: string };
  xpChooseDecision: (optionId: string) => { ok: boolean; text?: string };
  eventChoose: (optionId: string) => { ok: boolean; reason?: string };

  // research
  analyze: (uid: string, op: ResearchOp) => { ok: boolean; reason?: string };
  verify: (uid: string) => { ok: boolean; reason?: string };
  publish: (uid: string) => { ok: boolean; reason?: string };
  digitize: (uid: string) => { ok: boolean; reason?: string };

  // finance/dev
  applyForGrant: (id: string) => { ok: boolean; reason?: string };
  grantDetail: (id: string) => ReturnType<typeof grantScore>;
  buyEquipment: (id: string) => { ok: boolean; reason?: string };
  hireStaff: (roleId: RoleId) => { ok: boolean; reason?: string };
  researchTech: (id: string) => { ok: boolean; reason?: string };
  unlockRegion: (id: RegionId) => { ok: boolean; reason?: string };
  unlockSite: (id: string) => { ok: boolean; reason?: string };


  // market
  mktBuy: (id: string, shares: number) => { ok: boolean; reason?: string };
  mktSell: (id: string, shares: number) => { ok: boolean; reason?: string };
  toggleWatch: (id: string) => void;

  // museum
  curateExhibition: (title: string, theme: string, uids: string[]) => { ok: boolean; reason?: string };

  // tutorial
  setTutorialStep: (n: number) => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
}

export const useGame = create<Store>((set, get) => ({
  s: null,
  screen: "command",
  modal: null,
  lastSaveAt: 0,
  simHint: "",
  lang: typeof window !== "undefined" && localStorage.getItem("relic_capital_lang") === "vi" ? "vi" : "en",
  setLang: (l) => {
    if (typeof window !== "undefined") localStorage.setItem("relic_capital_lang", l);
    set({ lang: l });
  },

  setScreen: (sc) => {
    // Hard gate: while the tutorial is active, navigation is restricted to the
    // screen the current step directs the player to — the only way out is
    // completing the tutorial.
    const st = get();
    if (st.inTutorial()) {
      const target = st.guidedScreen();
      if (target && sc !== target) return;
    }
    playClickSound();
    set({ screen: sc });
  },
  setModal: (m) => set({ modal: m }),

  inTutorial: () => {
    const s = get().s;
    return !!s && s.tutorialActive && s.tutorialStep <= TOTAL_TUTORIAL_STEPS;
  },

  guidedScreen: () => {
    const s = get().s;
    if (!s || !s.tutorialActive || s.tutorialStep > TOTAL_TUTORIAL_STEPS) return null;
    return STEP_NAV[s.tutorialStep] ?? "command";
  },

  startNew: (d) => {
    const s = newGame(d);
    initMarket(s);
    saveGame(s);
    set({ s, screen: "command", modal: { kind: "tutorial" }, lastSaveAt: Date.now() });
  },

  continueGame: () => {
    const res = loadGame();
    if (res.ok && res.state) {
      initMarket(res.state);
      const scr = (res.state.tutorialActive && res.state.tutorialStep <= TOTAL_TUTORIAL_STEPS)
        ? (STEP_NAV[res.state.tutorialStep] ?? "command")
        : "command";
      set({ s: res.state, screen: scr, lastSaveAt: Date.now() });
      return true;
    }
    return false;
  },

  reset: () => {
    clearSave();
    set({ s: null, screen: "command", modal: null });
  },

  nextDay: () => {
    const { s } = get();
    if (!s) return;
    advanceDay(s);
    // grant resolutions
    resolveGrants(s);
    // expedition daily
    let report = false;
    let discoveredAny = false;
    if (s.expedition?.phase === "active") {
      const r = advanceExpeditionDay(s);
      if (r.discovered && r.discovered.length > 0) discoveredAny = true;
      if (r.done) report = true;
    }
    if (discoveredAny) playDiscoverySound();
    else if (s.expedition?.phase === "active") playDigSound();

    // random site event
    maybeSpawnEvent(s);
    // achievements
    const ach = evaluateAchievements(s);
    if (ach.length) {
      s.journal.push({ day: s.day, kind: "progress", entry: `Achievement: ${ACHIEVEMENTS.filter((a) => ach.includes(a.id)).map((a) => a.name).join(", ")}` });
    }
    // campaign chapter progression
    evaluateCampaign(s);
    saveGame(s);
    set({ s: { ...s }, modal: report ? { kind: "xp-report" } : ach.length ? { kind: "achievement", ids: ach } : get().modal, lastSaveAt: Date.now() });
  },

  setPlan: (p) => {
    const { s } = get();
    if (!s) return;
    s.plannedExpedition = p;
    set({ s: { ...s } });
  },

  launchExpedition: () => {
    const { s } = get();
    if (!s) return { ok: false, reason: "No game." };
    if (!s.plannedExpedition) return { ok: false, reason: "Choose a site and plan first." };
    const res = startExpedition(s, s.plannedExpedition);
    if (res.ok) {
      playDigSound();
      saveGame(s);
    }
    set({ s: { ...s } });
    return res;
  },

  xpChooseDecision: (optionId) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = resolveExpeditionDecision(s, optionId);
    saveGame(s);
    set({ s: { ...s } });
    return r;
  },

  eventChoose: (optionId) => {
    const { s } = get();
    if (!s) return { ok: false, reason: "No game." };
    const r = resolveEvent(s, optionId);
    saveGame(s);
    set({ s: { ...s } });
    return r;
  },

  analyze: (uid, op) => {
    const { s } = get();
    if (!s) return { ok: false, reason: "No game." };
    const r = runAnalysis(s, uid, op);
    if (r.ok) {
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  verify: (uid) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = verifyArtifact(s, uid);
    if (r.ok) {
      playVerifySound();
      const ach = evaluateAchievements(s);
      evaluateCampaign(s);
      saveGame(s);
      set({ s: { ...s }, modal: ach.length ? { kind: "achievement", ids: ach } : get().modal });
    }
    return r;
  },

  publish: (uid) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = publishArtifact(s, uid);
    if (r.ok) {
      playPublishSound();
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  digitize: (uid) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = digitizeArtifact(s, uid);
    if (r.ok) {
      playClickSound();
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  applyForGrant: (id) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = applyGrant(s, id);
    if (r.ok) {
      playCoinSound();
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  grantDetail: (id) => {
    const { s } = get();
    return grantScore(s!, id);
  },

  buyEquipment: (id) => {
    const { s } = get();
    if (!s) return { ok: false };
    const def = EQUIPMENT_DEFS.find((e) => e.id === id);
    if (!def) return { ok: false, reason: "Unknown equipment." };
    if (s.equipmentOwned.includes(id)) return { ok: false, reason: "Already owned." };
    if (def.requiresReputation && s.resources.reputation < def.requiresReputation) return { ok: false, reason: `Requires ${def.requiresReputation} reputation.` };
    if (s.resources.cash < def.cost) return { ok: false, reason: `Costs ${def.cost}đ.` };
    spend(s, "equipment", `Purchased ${def.name}`, { cash: -def.cost });
    s.equipmentOwned.push(id);
    s.journal.push({ day: s.day, kind: "finance", entry: `Purchased equipment: ${def.name}.` });
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  hireStaff: (roleId) => {
    const { s } = get();
    if (!s) return { ok: false };
    const def = STAFF_DEFS.find((d) => d.id === roleId);
    if (!def) return { ok: false, reason: "Unknown role." };
    if (def.requiresReputation && s.resources.reputation < def.requiresReputation) return { ok: false, reason: `Requires ${def.requiresReputation} reputation.` };
    if (s.staff.length >= 8) return { ok: false, reason: "Team at capacity (8)." };
    if (s.resources.cash < def.hireCost) return { ok: false, reason: `Hiring costs ${def.hireCost}đ.` };
    earn(s, "operations", `Hiring bonus paid — ${def.title}`, -def.hireCost);
    const names = ["Minh", "Hương", "Tuấn", "Lan", "Phúc", "Thảo", "Dũng", "Việt", "Mai", "Long", "Trang", "Quang"];
    s.staff.push({
      instanceId: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roleId,
      name: names[s.staff.length % names.length],
      skill: def.skill,
      hiredDay: s.day,
      energy: 100,
      moraleAtHire: s.morale,
    });
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  researchTech: (id) => {
    const { s } = get();
    if (!s) return { ok: false };
    const t = TECHS.find((x) => x.id === id);
    if (!t) return { ok: false, reason: "Unknown tech." };
    if (s.techResearched.includes(id)) return { ok: false, reason: "Already researched." };
    if (t.cost.requiresTech && !t.cost.requiresTech.every((r) => s.techResearched.includes(r))) return { ok: false, reason: "Prerequisite technology missing." };
    if (t.cost.requiresReputation && s.resources.reputation < t.cost.requiresReputation) return { ok: false, reason: "Reputation too low." };
    if (s.resources.research < t.cost.research) return { ok: false, reason: `Needs ${t.cost.research} research points.` };
    if (t.cost.cash && s.resources.cash < t.cost.cash) return { ok: false, reason: `Needs ${t.cost.cash}đ.` };
    spend(s, "research", `Researched ${t.name}`, { research: -t.cost.research, cash: -(t.cost.cash ?? 0) });
    s.techResearched.push(id);
    if (t.effects.siteUnlock && !s.regionUnlocked.includes(t.effects.siteUnlock)) s.regionUnlocked.push(t.effects.siteUnlock);
    s.journal.push({ day: s.day, kind: "progress", entry: `Research complete: ${t.name}.` });
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  unlockRegion: (id) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = REGIONS.find((x) => x.id === id);
    if (!r) return { ok: false, reason: "Unknown region." };
    if (s.regionUnlocked.includes(id)) return { ok: false, reason: "Already unlocked." };
    if (s.resources.reputation < r.requiresReputation) return { ok: false, reason: `Requires ${r.requiresReputation} reputation.` };
    if (s.resources.cash < r.unlockCost) return { ok: false, reason: `Survey commission costs ${r.unlockCost}đ.` };
    spend(s, "operations", `Regional survey commission: ${r.name}`, { cash: -r.unlockCost });
    s.regionUnlocked.push(id);
    // unlock all sites of the region that have no unlock cost or rep gate
    for (const site of SITES.filter((x) => x.region === id && x.unlockCost === 0)) {
      if (!s.siteUnlocked.includes(site.id)) s.siteUnlocked.push(site.id);
    }
    s.journal.push({ day: s.day, kind: "progress", entry: `Region unlocked: ${r.name}.` });
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  unlockSite: (id) => {
    const { s } = get();
    if (!s) return { ok: false };
    const site = SITES.find((x) => x.id === id);
    if (!site) return { ok: false, reason: "Unknown site." };
    if (s.siteUnlocked.includes(id)) return { ok: false, reason: "Already unlocked." };
    if (!s.regionUnlocked.includes(site.region)) return { ok: false, reason: "Region not unlocked." };
    if (s.resources.reputation < site.requiresReputation) return { ok: false, reason: `Requires ${site.requiresReputation} reputation.` };
    if (s.resources.cash < site.unlockCost) return { ok: false, reason: `Costs ${site.unlockCost}đ.` };
    spend(s, "operations", `Site access agreement: ${site.name}`, { cash: -site.unlockCost });
    s.siteUnlocked.push(id);
    s.journal.push({ day: s.day, kind: "progress", entry: `Site unlocked: ${site.name}.` });
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  mktBuy: (id, shares) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = buy(s, id, shares);
    if (r.ok) {
      playCoinSound();
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  mktSell: (id, shares) => {
    const { s } = get();
    if (!s) return { ok: false };
    const r = sell(s, id, shares);
    if (r.ok) {
      playCoinSound();
      saveGame(s);
      set({ s: { ...s } });
    }
    return r;
  },

  toggleWatch: (id) => {
    const { s } = get();
    if (!s) return;
    if (s.market.watchlist.includes(id)) s.market.watchlist = s.market.watchlist.filter((x) => x !== id);
    else s.market.watchlist.push(id);
    playClickSound();
    saveGame(s);
    set({ s: { ...s } });
  },

  curateExhibition: (title, theme, uids) => {
    const { s } = get();
    if (!s) return { ok: false, reason: "No active game." };
    if (uids.length < 2) return { ok: false, reason: "An exhibition requires at least 2 cataloged artifacts." };
    if (s.resources.cash < 5000) return { ok: false, reason: "Staging an exhibition requires 5,000 đ for curation and display stands." };
    spend(s, "other", `Curate exhibition: ${title}`, { cash: -5000 });

    const curatedArts = s.artifacts.filter((a) => uids.includes(a.uid));
    const avgSig = curatedArts.reduce((acc, a) => acc + a.significance, 0) / curatedArts.length;
    const publishedBonus = curatedArts.filter((a) => a.status === "published").length * 500;
    const dailyRevenue = Math.round(1800 + avgSig * 350 + publishedBonus);
    const repGain = Math.round(3 + curatedArts.length * 1.5 + avgSig);

    s.activeExhibition = {
      id: `exh-${s.day}-${Date.now()}`,
      title,
      theme,
      artifactUids: uids,
      dayStarted: s.day,
      durationDays: 14,
      dailyRevenue,
      reputationGain: repGain,
    };

    curatedArts.forEach((a) => {
      a.accessibility = Math.min(1, a.accessibility + 0.25);
    });

    s.journal.push({
      day: s.day,
      kind: "progress",
      entry: `Staged museum exhibition: "${title}" featuring ${curatedArts.length} artifacts (ticket revenue est. +${dailyRevenue}đ/day).`,
    });

    playPublishSound();
    saveGame(s);
    set({ s: { ...s } });
    return { ok: true };
  },

  setTutorialStep: (n) => {
    const { s } = get();
    if (!s) return;
    s.tutorialStep = n;
    saveGame(s);
    set({ s: { ...s } });
  },

  completeTutorial: () => {
    const { s } = get();
    if (!s) return;
    s.tutorialStep = 99;
    s.tutorialActive = false;
    s.journal.push({ day: s.day, kind: "tutorial", entry: "Tutorial complete. Dr. Linh steps back — the institute is yours." });
    saveGame(s);
    set({ s: { ...s }, modal: null, screen: "command" });
  },

  skipTutorial: () => {
    const { s } = get();
    if (!s) return;
    s.tutorialStep = 99;
    s.tutorialActive = false;
    s.tutorialSkipped = true;
    s.journal.push({ day: s.day, kind: "tutorial", entry: "Tutorial skipped by director. All institute facilities are unlocked for free operation." });
    saveGame(s);
    set({ s: { ...s }, modal: null, screen: "command" });
  },

  replayTutorial: () => {
    const { s } = get();
    if (!s) return;
    s.tutorialStep = 1;
    s.tutorialActive = true;
    s.tutorialReplay = true;
    saveGame(s);
    set({ s: { ...s }, modal: { kind: "tutorial" }, screen: "command" });
  },
}));

export { hasSave, saveGame, loadGame, clearSave, runwayDays, priceOf };
