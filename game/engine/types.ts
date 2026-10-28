// ── Resources ────────────────────────────────────────────────────────────────
export type ResourceKey =
  | "cash"
  | "research"
  | "supplies"
  | "energy"
  | "knowledge"
  | "reputation"
  | "conservation";

export type Difficulty = "story" | "standard" | "expert";

/** How deep into the stratigraphy an expedition digs. */
export type DepthBand = "surface" | "cultural" | "deep";

export type RegionId = "north" | "delta" | "central" | "highlands" | "south";

export interface Region {
  id: RegionId;
  name: string;
  theme: string;
  unlockCost: number; // cash to survey commission (0 = start unlocked for delta)
  requiresReputation: number;
}

// ── Sites ────────────────────────────────────────────────────────────────────
export interface Site {
  id: string;
  name: string;
  region: RegionId;
  /** "real" = grounded in real archaeology, "fictional" = explicitly invented gameplay scenario */
  status: "real" | "fictional";
  desc: string;
  significance: number; // 1–10 historical significance
  dataQuality: number; // 1–10 how well the area is documented
  difficulty: 1 | 2 | 3 | 4 | 5;
  baseCost: number; // baseđ expedition cost multiplier anchor
  risk: 1 | 2 | 3 | 4 | 5; // environmental risk
  artifactCategories: ArtifactCategory[];
  eras: EraId[];
  requiresReputation: number;
  requiresTech?: string;
  unlockCost: number; // cash to unlock, 0 if unlocked at start
  grants: string[]; // potential grant ids
  image?: string;
}

// ── Eras ─────────────────────────────────────────────────────────────────────
export type EraId = "phung-nguyen" | "dong-dau" | "go-mun" | "dong-son" | "champa" | "van-lang-folk" | "trade-network";

export interface Era {
  id: EraId;
  name: string;
  range: string;
  desc: string;
}

// ── Artifacts ────────────────────────────────────────────────────────────────
export type ArtifactCategory =
  | "pottery"
  | "bronze"
  | "tool"
  | "inscription"
  | "coin"
  | "architecture"
  | "manuscript";

export type Condition =
  | "pristine"
  | "good"
  | "fair"
  | "poor"
  | "fragile";

export interface DiscoveryWeights {
  category: Partial<Record<ArtifactCategory, number>>;
}

export interface ArtifactTemplate {
  id: string;
  name: string;
  category: ArtifactCategory;
  material: string;
  eras: EraId[];
  baseSignificance: number; // 1–10
  baseValue: number; // economic relevance (licensed research value / market events), in đ
  desc: string;
  minDifficulty: number; // sites of at least this difficulty can yield it
  regions: RegionId[];
  rarity: "common" | "uncommon" | "rare" | "exceptional";
}

export type ResearchStatus = "unanalyzed" | "classified" | "under review" | "verified" | "published";

export interface Evidence {
  id: string;
  kind: "stratigraphic" | "typological" | "material" | "ioaGeo" | "contextual" | "refMatch" | "inscription";
  label: string;
  detail: string;
  /** how strongly this evidence supports the leading hypothesis, 0-1 */
  support: number;
}

export interface PlayerArtifact {
  uid: string;
  templateId: string;
  name: string;
  category: ArtifactCategory;
  material: string;
  period: string; // human-readable estimated period
  eraHint: EraId | null;
  trueEra: EraId; // hidden truth used by the engine for scoring
  siteId: string;
  context: string; // excavation context note
  description: string;
  condition: Condition;
  significance: number; // 1-10 measured
  evidencedValue: number; // economic relevance for simulated instruments/events
  confidence: number; // 0-1 attribution confidence of the current leading hypothesis
  confidenceLabel: "hypothesis" | "probable" | "robust" | "verified";
  provenance: number; // 0-1 completeness
  status: ResearchStatus;
  hypotheses: ArtifactHypothesis[];
  evidences: Evidence[];
  conservationReq: string;
  researchLog: { day: number; entry: string }[];
  acquiredDay: number;
  accessibility: number; // 0-1 documented + published accessibility
  image?: string;
  /** Tracks which ops have been run (for diminishing returns) */
  opsRun?: Partial<Record<string, number>>;
  /** Day the artifact was last conserved (treated/stabilized) */
  lastConservationDay?: number;
  /** True when a rival institute has publicly disputed this finding */
  rivalClaim?: boolean;
  /** Bonus confidence from assemblage coherence (same site, same era) */
  assemblageBonus?: number;
}

export interface ArtifactHypothesis {
  id: string;
  statement: string;
  probability: number; // 0-1
}

// ── Team ─────────────────────────────────────────────────────────────────────
export type RoleId = "field" | "epigrapher" | "conservator" | "dataSci" | "logistics" | "historian" | "director";

export interface StaffDef {
  id: RoleId;
  title: string;
  desc: string;
  salary: number; // per day (đ)
  hireCost: number;
  skill: number; // 1-5
  ability: string;
  requiresReputation?: number;
}

export interface StaffMember {
  instanceId: string;
  roleId: RoleId;
  name: string;
  skill: number; // 1-5
  hiredDay: number;
  energy: number; // 0-100
  moraleAtHire: number;
  /** Days on the team; every 30 days grants +1 effective skill (capped at 5) */
  seniorityDays?: number;
}

// ── Equipment ────────────────────────────────────────────────────────────────
export interface EquipmentDef {
  id: string;
  name: string;
  desc: string;
  cost: number; // purchase
  maintenancePerDay: number;
  effects: {
    surveyQuality?: number; // 0-1 multiplier addition
    excavationEfficiency?: number;
    evidenceQuality?: number;
    damageReduction?: number; // 0-1
    documentationQuality?: number;
    conservationCostReduction?: number;
  };
  requiresTech?: string;
  requiresReputation?: number;
}

// ── Expedition ───────────────────────────────────────────────────────────────
export interface ExpeditionPlan {
  siteId: string;
  workers: number;
  days: number;
  equipment: string[]; // equipment ids brought
  survey: boolean; // survey first?
  careful: boolean; // carefully recover vs speed
  objective: "survey" | "balanced" | "intensive";
  /** Target stratigraphic band. Omitted = "cultural" for older saves. */
  depth?: DepthBand;
}

export interface ExpeditionEvent {
  day: number;
  text: string;
  kind: "info" | "good" | "bad" | "decision";
}

export type ExpeditionPhase = "planning" | "active" | "paused" | "complete";

export interface Expedition {
  id: string;
  plan: ExpeditionPlan;
  phase: ExpeditionPhase;
  startedDay: number;
  elapsedDays: number;
  totalDays: number;
  spent: number;
  budget: number;
  eventLog: ExpeditionEvent[];
  discoveries: string[]; // artifact uids
  discoveryBoost?: number; // from mid-expedition decisions
  /** Consecutive dig days without a find — feeds the field-hunch bonus. */
  dryDays?: number;
  tutorialDecisionDone?: boolean;
  pendingDecision?: {
    id: string;
    prompt: string;
    options: { id: string; label: string; costCash?: number; effectText: string }[];
  };
  outcomeSummary?: string;
  siteStatus: "intact" | "exhausted";
}

// ── Research lab ─────────────────────────────────────────────────────────────
export type ResearchOp =
  | "typology"
  | "material"
  | "inscription"
  | "classification"
  | "period"
  | "refMatch"
  | "contextual"
  | "anomaly"
  | "confidence";

export interface ResearchReport {
  op: ResearchOp;
  artifactUid: string;
  day: number;
  interpretation: string;
  confidence: number; // 0-1
  supporting: string[];
  missing: string[];
  nextStep: string;
  sources: string[]; // reference-record ids; may be fictional — labeled
  cost: { research: number; days?: number };
  engine: "rule-based" | "ai-assisted";
}

// ── Reference records (local collection used by lab) ─────────────────────────
export interface RefRecord {
  id: string;
  name: string;
  category: ArtifactCategory;
  era: EraId;
  material: string;
  region: RegionId;
  note: string;
  ref: string; // source label (museum/publication); only real, reputable ones
}

// ── Finance ──────────────────────────────────────────────────────────────────
export interface LedgerEntry {
  id: string;
  day: number;
  amount: number; // +income / -expense, in đ
  reason: string;
  kind: "operations" | "salary" | "expedition" | "grant" | "publication" | "market" | "equipment" | "conservation" | "research" | "other";
}

export interface GrantDef {
  id: string;
  name: string;
  desc: string;
  payout: number;
  repRequired: number;
  /** eligibility checks the UI + engine both evaluate */
  requires: {
    minArtifacts?: number;
    minVerified?: number;
    minPublished?: number;
    minProvenanceAvg?: number;
    minDigitized?: number; // artifacts with accessibility ≥ 0.5
    regionUnderExplored?: RegionId; // must have ≥1 expedition result in that region
    minConditionGood?: number; // artifacts with condition pristine|good
    minPublications?: number;
  };
  durationDays: number; // evaluation period after applying
  cooldownDays: number;
}

export interface GrantApplication {
  grantId: string;
  appliedDay: number;
  decisionDay: number;
  status: "pending" | "approved" | "rejected";
  score: number; // 0-1 quality score at application
  note: string;
}

// ── Market ───────────────────────────────────────────────────────────────────
export interface Instrument {
  id: string;
  name: string;
  symbol: string;
  desc: string;
  basePrice: number;
  volatility: number; // 0-1
  liquidity: "thin" | "moderate" | "high";
  riskLevel: 1 | 2 | 3 | 4 | 5;
  sectorDesc: string;
}

export interface PricePoint {
  day: number;
  price: number;
}

export interface Position {
  instrumentId: string;
  shares: number;
  avgCost: number;
}

export interface Trade {
  id: string;
  day: number;
  instrumentId: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  fee: number;
}

export interface MarketEvent {
  id: string;
  instrumentId: string; // or "market" for broad
  day: number;
  text: string;
  impact: number; // fractional price change
}

// ── Events ───────────────────────────────────────────────────────────────────
export interface GameEventDef {
  id: string;
  title: string;
  text: string;
  weight: number; // relative spawn probability
  minDay?: number;
  requiresActiveExpedition?: boolean;
  options: {
    id: string;
    label: string;
    costText: string;
    effectText?: string;
    cost?: { cash?: number; research?: number; supplies?: number; energy?: number };
    /** deterministic effects applied if chosen */
    effects?: {
      reputation?: number;
      morale?: number;
      suppliesDelta?: number;
      expeditionProgress?: number; // extra days advance (can be negative = delay)
      damageRisk?: number; // modify artifact condition risk
      unlockFlag?: string;
      grantDeadlineDelta?: number;
    };
    rng?: { p: number; successText: string; failureText: string; successEffects?: Record<string, number>; failureEffects?: Record<string, number> };
  }[];
}

export interface ActiveEventChoice {
  eventId: string;
  day: number;
  resolved?: string; // option id chosen
}

// ── Progression ──────────────────────────────────────────────────────────────
export interface ResearchTechDef {
  id: string;
  name: string;
  desc: string;
  cost: { research: number; cash?: number; requiresTech?: string[]; requiresReputation?: number };
  effects: {
    analysisCostReduction?: number;
    evidenceBonus?: number;
    expeditionEfficiency?: number;
    marketFeeReduction?: number;
    conservationCapacityBonus?: number;
    damageReduction?: number;
    siteUnlock?: RegionId;
  };
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  check: (s: GameState) => boolean;
}

export interface DifficultyDef {
  id: Difficulty;
  name: string;
  desc: string;
  startingCash: number;
  startingResearch: number;
  startingSupplies: number;
  opExpensePerDay: number; // base daily operating expense
  eventRisk: number; // multiplier on bad outcomes
  grantSeverity: number; // multiplier on grant scoring thresholds
}

// ── Rival claims ────────────────────────────────────────────────────────────
export interface RivalClaim {
  artifactUid: string;
  rivalName: string; // name of the rival institute
  day: number;
  challengeText: string;
  /** resolved: "defended" | "conceded" | null = still active */
  resolved: "defended" | "conceded" | null;
}

// ── Museum assemblages (collection sets) ────────────────────────────────────
export interface AssemblageDef {
  id: string;
  name: string;
  era: EraId;
  region: RegionId;
  desc: string;
  /** Artifact template ids required for the set. */
  templateIds: string[];
  reward: { cash: number; research: number; reputation: number };
}

// ── Campaign ─────────────────────────────────────────────────────────────────
export interface CampaignChapter {
  id: string;
  title: string;
  briefing: string;
  objectives: { id: string; text: string }[];
  requiredRep: number;
}

// ── Game state ───────────────────────────────────────────────────────────────
export interface GameState {
  version: number;
  seed: number;
  difficulty: DifficultyDef["id"];
  day: number;
  createdAt: number;

  resources: Record<ResourceKey, number>;
  morale: number; // 0-100 team morale

  siteUnlocked: string[]; // site ids
  regionUnlocked: RegionId[];

  staff: StaffMember[];
  equipmentOwned: string[];

  expedition: Expedition | null;
  plannedExpedition: ExpeditionPlan | null;

  artifacts: PlayerArtifact[];
  refRecordsSeen: string[];

  researchReports: ResearchReport[];
  techResearched: string[];

  ledger: LedgerEntry[];
  grantApplications: GrantApplication[];
  grantsCooldown: Record<string, number>; // grantId → day available again

  market: {
    prices: Record<string, PricePoint[]>;
    positions: Position[];
    trades: Trade[];
    events: MarketEvent[];
    watchlist: string[];
  };

  activeEvents: ActiveEventChoice[];
  eventHistory: { day: number; eventId: string }[];

  journal: { day: number; entry: string; kind: "discovery" | "finance" | "event" | "progress" | "tutorial" }[];
  achievements: string[];
  completedObjectives: string[];

  flags: Record<string, boolean | number>;
  tutorialStep: number; // 0 = not started; 1..12 = in progress; 99 = done
  tutorialSkipped: boolean;
  /** True from game start until the guided tutorial is completed (hard gate). */
  tutorialActive: boolean;
  /** True while replaying the tutorial from the Codex (skip re-enabled). */
  tutorialReplay: boolean;

  campaignChapter: number; // 0-based index of active chapter
  campaignCompleted: boolean;
  activeExhibition?: MuseumExhibition | null;

  /** Active rival institute claim disputes */
  rivalClaims: RivalClaim[];
  /** Discovery streak counter: days since last artifact find (during active expedition) */
  discoveryStreak: number;
  /** Museum assemblages already completed and rewarded. */
  completedAssemblages?: string[];
}

export interface MuseumExhibition {
  id: string;
  title: string;
  theme: string;
  artifactUids: string[];
  dayStarted: number;
  durationDays: number;
  dailyRevenue: number;
  reputationGain: number;
}

export const SAVE_VERSION = 3;
export const SAVE_KEY = "relic-capital-save-v1";
