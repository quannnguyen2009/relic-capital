import type { GameState, Difficulty } from "../engine/types";
import { DIFFICULTIES } from "../data/systems";

export function newGame(difficulty: Difficulty = "standard", seed?: number): GameState {
  const d = DIFFICULTIES[difficulty];
  const s: GameState = {
    version: 3,
    seed: seed ?? Math.floor(Math.random() * 2147483647),
    difficulty,
    day: 1,
    createdAt: Date.now(),

    resources: {
      cash: d.startingCash,
      research: d.startingResearch,
      supplies: d.startingSupplies,
      energy: 100,
      knowledge: 15,
      reputation: 0,
      conservation: 5,
    },
    morale: 72,

    siteUnlocked: ["delta-lien-lau"],
    regionUnlocked: ["delta"],

    staff: [],
    equipmentOwned: [],

    expedition: null,
    plannedExpedition: null,

    artifacts: [],
    refRecordsSeen: [],

    researchReports: [],
    techResearched: [],

    ledger: [],
    grantApplications: [],
    grantsCooldown: {},

    market: {
      prices: {},
      positions: [],
      trades: [],
      events: [],
      watchlist: [],
    },

    activeEvents: [],
    eventHistory: [],

    journal: [
      { day: 1, entry: "Institute founded. Dr. Linh hands over the keys and a thin ledger.", kind: "progress" },
    ],
    achievements: [],
    completedObjectives: [],

    flags: {},
    tutorialStep: 1,
    tutorialSkipped: false,
    tutorialActive: true,
    tutorialReplay: false,

    campaignChapter: 0,
    campaignCompleted: false,

    rivalClaims: [],
    discoveryStreak: 0,
  };
  return s;
}
