import type {
  StaffDef, EquipmentDef, GrantDef, ResearchTechDef, GameEventDef,
  DifficultyDef, CampaignChapter, RefRecord, Instrument, AchievementDef, GameState,
} from "../engine/types";

// ── Staff ────────────────────────────────────────────────────────────────────
export const STAFF_DEFS: StaffDef[] = [
  { id: "field", title: "Field Archaeologist", desc: "Improves excavation efficiency and discovery quality.", salary: 1400, hireCost: 16000, skill: 3, ability: "+15% excavation efficiency" },
  { id: "epigrapher", title: "Epigrapher", desc: "Specialist in inscriptions and scripts; unlocks inscription analysis quality.", salary: 1600, hireCost: 20000, skill: 3, ability: "+30% inscription analysis support", requiresReputation: 8 },
  { id: "conservator", title: "Conservator", desc: "Reduces artifact damage risk and conservation costs.", salary: 1500, hireCost: 18000, skill: 3, ability: "+35% damage reduction, −25% conservation cost" },
  { id: "dataSci", title: "Data Scientist", desc: "Improves AI analysis efficiency and evidence extraction.", salary: 1700, hireCost: 22000, skill: 3, ability: "−20% research cost, +10% evidence quality" },
  { id: "logistics", title: "Logistics Officer", desc: "Reduces expedition expenses and supply waste.", salary: 1300, hireCost: 15000, skill: 3, ability: "−12% expedition cost" },
  { id: "historian", title: "Historian", desc: "Improves contextual interpretation and publication quality.", salary: 1500, hireCost: 19000, skill: 3, ability: "+25% publication/grant quality" },
];

export const STAFF_NAMES = ["Minh", "Hương", "Tuấn", "Lan", "Phúc", "Thảo", "Dũng", "Việt", "Mai", "Long", "Trang", "Quang"];

// ── Equipment ────────────────────────────────────────────────────────────────
export const EQUIPMENT_DEFS: EquipmentDef[] = [
  { id: "survey-kit", name: "Survey Kit", desc: "Basic grid, total station, field notebooks.", cost: 14000, maintenancePerDay: 300, effects: { surveyQuality: 0.15, documentationQuality: 0.1 } },
  { id: "dig-tools", name: "Excavation Tool Set", desc: "Trowels, sieves, shoring — the fieldwork essentials.", cost: 10000, maintenancePerDay: 200, effects: { excavationEfficiency: 0.15 } },
  { id: "imaging", name: "High-Resolution Imaging", desc: "RTI and macro photography for artifacts in situ.", cost: 26000, maintenancePerDay: 500, effects: { evidenceQuality: 0.2, documentationQuality: 0.15 }, requiresReputation: 12 },
  { id: "scanner", name: "Portable Scanner", desc: "Structured-light scanning for 3D documentation.", cost: 34000, maintenancePerDay: 700, effects: { evidenceQuality: 0.25, documentationQuality: 0.2 }, requiresTech: "photogrammetry", requiresReputation: 16 },
  { id: "conservation-kit", name: "Conservation Kit", desc: "Stabilization materials, micro-environments, packing.", cost: 20000, maintenancePerDay: 400, effects: { damageReduction: 0.3, conservationCostReduction: 0.2 } },
  { id: "doc-station", name: "Digital Documentation Station", desc: "Field database,GIS, labeling workflow.", cost: 24000, maintenancePerDay: 450, effects: { documentationQuality: 0.25, surveyQuality: 0.1 }, requiresReputation: 10 },
  { id: "sieve-rig", name: "Wet-Sieve Rig", desc: "Recovers small finds and residues from bulk soil.", cost: 16000, maintenancePerDay: 350, effects: { excavationEfficiency: 0.1, evidenceQuality: 0.08 } },
  { id: "shelter", name: "Field Shelter System", desc: "Protects exposed sections from rain and sun damage.", cost: 22000, maintenancePerDay: 400, effects: { damageReduction: 0.25 }, requiresReputation: 8 },
];

// ── Grants ───────────────────────────────────────────────────────────────────
export const GRANTS: GrantDef[] = [
  { id: "documentation", name: "Documentation Grant", desc: "Rewards complete, well-organized artifact records.", payout: 45000, repRequired: 2, requires: { minArtifacts: 2, minProvenanceAvg: 0.3 }, durationDays: 4, cooldownDays: 10 },
  { id: "conservation", name: "Conservation Grant", desc: "Rewards safe recovery and preservation of fragile material.", payout: 52000, repRequired: 6, requires: { minArtifacts: 4, minConditionGood: 2 }, durationDays: 5, cooldownDays: 14 },
  { id: "digital-heritage", name: "Digital Heritage Grant", desc: "Rewards digitization and AI-assisted documentation.", payout: 60000, repRequired: 10, requires: { minArtifacts: 8, minDigitized: 5, minVerified: 3 }, durationDays: 5, cooldownDays: 16 },
  { id: "regional-survey", name: "Regional Survey Grant", desc: "Rewards exploration of an under-researched region.", payout: 56000, repRequired: 8, requires: { regionUnderExplored: "highlands", minArtifacts: 5 }, durationDays: 5, cooldownDays: 15 },
  { id: "public-access", name: "Public Access Grant", desc: "Rewards publishing findings and making research accessible.", payout: 48000, repRequired: 4, requires: { minPublications: 2 }, durationDays: 4, cooldownDays: 12 },
];

// ── Research tech tree ───────────────────────────────────────────────────────
export const TECHS: ResearchTechDef[] = [
  { id: "stratigraphic-control", name: "Stratigraphic Control", desc: "Single-context recording: better context evidence from every dig.", cost: { research: 60 }, effects: { evidenceBonus: 0.1, damageReduction: 0.1 } },
  { id: "photogrammetry", name: "Photogrammetry Pipeline", desc: "3D capture workflow; unlocks the Portable Scanner.", cost: { research: 90, cash: 18000 }, effects: { evidenceBonus: 0.12 } },
  { id: "analytical-lab", name: "Analytical Laboratory", desc: "On-site material analysis — cheaper, deeper analyses.", cost: { research: 130, cash: 26000, requiresTech: ["stratigraphic-control"] }, effects: { analysisCostReduction: 0.2, evidenceBonus: 0.08 } },
  { id: "radiocarbon-access", name: "Radiocarbon Access", desc: "Paid-access radiocarbon dating: sharp period confidence gains.", cost: { research: 170, cash: 40000, requiresTech: ["analytical-lab"] }, effects: { evidenceBonus: 0.2 } },
  { id: "dn-chrono", name: "Đông Sơn Type Series", desc: "Institutewide reference typology for Bronze Age ceramics and bronzes.", cost: { research: 110 }, effects: { evidenceBonus: 0.1, expeditionEfficiency: 0.05 } },
  { id: "field-school", name: "Field School Program", desc: "Trains workers on-site: expeditions run more efficiently.", cost: { research: 80, cash: 12000 }, effects: { expeditionEfficiency: 0.15 } },
  { id: "climate-shields", name: "Climate Protection Protocol", desc: "Weather response planning; reduces rain/heat damage.", cost: { research: 70, cash: 9000 }, effects: { damageReduction: 0.15 } },
  { id: "open-data", name: "Open Data Initiative", desc: "Publishes datasets, lifting all grants' quality scores and reputation gain.", cost: { research: 100, cash: 14000 }, effects: { siteUnlock: undefined } },
  { id: "text-corpus", name: "Hán–Nôm Text Corpus", desc: "Annotated corpus access; big boost to inscription analysis.", cost: { research: 150, cash: 22000, requiresTech: ["analytical-lab"] }, effects: { evidenceBonus: 0.15 } },
  { id: "vehicle-fleet", name: "Vehicle & Logistics Base", desc: "Institute trucks: lower expedition costs, more supplies carried.", cost: { research: 60, cash: 30000 }, effects: { expeditionEfficiency: 0.2 } },
];

// ── Market instruments (all fictional, in-game) ──────────────────────────────
export const INSTRUMENTS: Instrument[] = [
  { id: "digi-vn", name: "Digital Heritage Vietnam Fund", symbol: "DGH-V", desc: "Fictional fund tracking museum digitization and archive projects.", basePrice: 42, volatility: 0.35, liquidity: "high", riskLevel: 2, sectorDesc: "Digitization — steady demand, gains when you publish digital records." },
  { id: "consotech", name: "Conservation Technology Trust", symbol: "CNT-T", desc: "Fictional trust around conservation-science equipment providers.", basePrice: 26, volatility: 0.55, liquidity: "moderate", riskLevel: 3, sectorDesc: "Conservation tech — gains when fragile artifacts are safely conserved." },
  { id: "silkroute", name: "Maritime Trade Consortium", symbol: "MTC-X", desc: "Fictional consortium themed on heritage-tourism and trade research.", basePrice: 58, volatility: 0.7, liquidity: "high", riskLevel: 4, sectorDesc: "Trade research — volatile; reacts to maritime finds and events." },
  { id: "fieldrobot", name: "Field Robotics Initiative", symbol: "FRI-L", desc: "Fictional initiative for survey drones and field automation.", basePrice: 18, volatility: 0.8, liquidity: "thin", riskLevel: 5, sectorDesc: "Field robotics — highly volatile, high upside, high risk." },
  { id: "stablecore", name: "Heritage Core Endowment", symbol: "HCE-S", desc: "Fictional low-volatility endowment fund tracking the sector broadly.", basePrice: 80, volatility: 0.12, liquidity: "high", riskLevel: 1, sectorDesc: "Core endowment — slow, stable growth." },
];

// ── Difficulties ─────────────────────────────────────────────────────────────
export const DIFFICULTIES: Record<string, DifficultyDef> = {
  story: { id: "story", name: "Story", desc: "Generous funding, forgiving setbacks.", startingCash: 180000, opExpensePerDay: 1200, eventRisk: 0.6, grantSeverity: 0.8 },
  standard: { id: "standard", name: "Standard", desc: "Balanced costs, meaningful risks.", startingCash: 120000, opExpensePerDay: 1900, eventRisk: 1, grantSeverity: 1 },
  expert: { id: "expert", name: "Expert", desc: "Tighter budgets, greater uncertainty.", startingCash: 95000, opExpensePerDay: 2600, eventRisk: 1.35, grantSeverity: 1.2 },
};

// ── Campaign chapters ────────────────────────────────────────────────────────
export const CAMPAIGN: CampaignChapter[] = [
  {
    id: "ch1",
    title: "Chapter I — First Trenches",
    briefing: "The institute is new, funding tight. Establish credibility in the Red River Delta: run a disciplined survey, recover material safely, and build a documented record.",
    requiredRep: 0,
    objectives: [
      { id: "o1-dig", text: "Complete an expedition" },
      { id: "o1-verify", text: "Verify an artifact finding" },
      { id: "o1-grant", text: "Win a grant" },
    ],
  },
  {
    id: "ch2",
    title: "Chapter II — Bronze and Proof",
    briefing: "Đông Sơn bronzes attract attention — and competing claims. Invest in analysis, verify attributions with reference matching, and build a reputation for rigor.",
    requiredRep: 18,
    objectives: [
      { id: "o2-verified3", text: "Have 3 verified artifacts" },
      { id: "o2-bronze", text: "Recover a Đông Sơn bronze of significance 7+" },
      { id: "o2-rep30", text: "Reach 30 reputation" },
    ],
  },
  {
    id: "ch3",
    title: "Chapter III — Wider Horizons",
    requiredRep: 34,
    briefing: "Beyond the Delta lie older questions — highland exchanges, Champa towers, maritime trade. Lead an ambitious multi-region program and secure the institute's future.",
    objectives: [
      { id: "o3-two-regions", text: "Complete expeditions in 3 different regions" },
      { id: "o3-publish", text: "Publish 5 findings" },
      { id: "o3-cash", text: "Hold ≥ 250,000đ in reserves" },
    ],
  },
];

// ── Reference records (local, non-fabricated source labels) ──────────────────
export const REF_RECORDS: RefRecord[] = [
  { id: "ref-ds-drum", name: "Đông Sơn bronze drum, type Ngọc Lũ", category: "bronze", era: "dong-son", material: "copper-tin-lead alloy", region: "delta", note: "Iconic tympanum with central star, concentric panels, frogs.", ref: "Ngọc Lũ drum, Việt Nam National Museum of History (public display record)" },
  { id: "ref-ds-axe", name: "Socketed bronze axe (Đông Sơn type)", category: "bronze", era: "dong-son", material: "copper alloy", region: "delta", note: "Flared socketed blade, decorative bands at socket.", ref: "Việt Nam National Museum of History, bronze-age collections" },
  { id: "ref-pn-bowl", name: "Phùng Nguyên pedestal bowl", category: "pottery", era: "phung-nguyen", material: "fired clay", region: "north", note: "Pedestaled, burnished, punctate decoration.", ref: "Phùng Nguyên type-site assemblage, published excavation reports" },
  { id: "ref-cs-stele", name: "Champa Sanskrit stele", category: "inscription", era: "champa", material: "sandstone", region: "central", note: "Early Sanskrit inscriptions in Brahmic scripts.", ref: "Trà Kiệu / Mỹ Sơn published stele studies" },
  { id: "ref-oe-coin", name: "Roman coin from Óc Eo", category: "coin", era: "trade-network", material: "bronze/silver", region: "south", note: "Antoninianus of Marcus Aurelius, documented at Óc Eo.", ref: "Óc Eo excavation reports, cited in maritime-trade literature" },
  { id: "ref-hb-adze", name: "Hoabinhian sumatralith", category: "tool", era: "phung-nguyen", material: "stone", region: "north", note: "Large flaked-and-pecked tool from Hòa Bình shelters.", ref: "Hòa Bình culture literature, Colani-era collections" },
  { id: "ref-cl-post", name: "Cổ Loa timber/earthwork evidence", category: "architecture", era: "van-lang-folk", material: "wood/earth", region: "north", note: "Massive earthwork enclosure, wooden structures documented.", ref: "Cổ Loa excavation literature" },
  { id: "ref-gm-cord", name: "Gò Mun cord-marked ware", category: "pottery", era: "go-mun", material: "coarse clay", region: "delta", note: "Grit-tempered, cord-marked domestic wares.", ref: "Gò Mun type-site reports" },
  { id: "ref-mt-mold", name: "Má Thẹn casting mold", category: "bronze", era: "dong-son", material: "clay", region: "delta", note: "Bivalve clay molds from a bronze-casting workshop context.", ref: "Má Thẹn workshop excavation reports" },
  { id: "ref-hn-situla", name: "Đông Sơn situla", category: "bronze", era: "dong-son", material: "copper alloy", region: "delta", note: "Cylindrical bronze vessel with figure friezes.", ref: "Đông Sơn situla literature, national collections" },
];

// ── Dynamic events ───────────────────────────────────────────────────────────
export const GAME_EVENTS: GameEventDef[] = [
  {
    id: "rain",
    title: "Sudden Rainfront",
    text: "Local forecast services warn of a multi-day storm front. Open sections could flood and slurry.",
    weight: 10,
    requiresActiveExpedition: true,
    options: [
      { id: "shelter", label: "Cover the trenches, pause digging 2 days", costText: "−2,000đ materials, −2 progress days", cost: { cash: 2000 }, effects: { expeditionProgress: -2, suppliesDelta: -4, damageRisk: -0.1 } },
      { id: "push", label: "Push through and dig faster before the front arrives", costText: "Team energy −15, damage risk ↑", cost: { energy: 15 }, effects: { expeditionProgress: 2, damageRisk: 0.12 },
        rng: { p: 0.55, successText: "Dry days held — you gain two days of work.", failureText: "Rain arrives mid-shift. Sections slurry; some contexts disturbed.", successEffects: { reputation: 1, morale: 3 }, failureEffects: { reputation: -1, morale: -6 } } },
    ],
  },
  {
    id: "specialist-unavailable",
    title: "Specialist Unavailable",
    text: "A key team member is called away to a family matter for several days.",
    weight: 8,
    options: [
      { id: "wait", label: "Wait for them, slow work", costText: "−3 progress days", effects: { expeditionProgress: -3, morale: 2 } },
      { id: "hire-temp", label: "Bring in a temporary contractor", costText: "−12,000đ", cost: { cash: 12000 }, effects: { morale: -2 } },
    ],
  },
  {
    id: "new-inscription",
    title: "Conflicting Reading",
    text: "A newly published study proposes an alternative reading of an inscription your team classified, contradicting your archive record.",
    weight: 7,
    minDay: 8,
    options: [
      { id: "review", label: "Commission a full re-review", costText: "−30 research, −6,000đ", cost: { research: 30, cash: 6000 }, effects: { reputation: 2 } },
      { id: "noteonly", label: "Add a dissent note to the archive only", costText: "free, small reputation cost", effects: { reputation: -1 } },
    ],
  },
  {
    id: "grant-deadline",
    title: "Grant Deadline Approaching",
    text: "A documentation grant window closes in a few days. A rush application scores lower.",
    weight: 7,
    minDay: 6,
    options: [
      { id: "rush", label: "Rush the application now", costText: "lower quality score", effects: { unlockFlag: "grantRush" } },
      { id: "skip", label: "Wait for a better-prepared cycle", costText: "none now", effects: {} },
    ],
  },
  {
    id: "conservation-crisis",
    title: "Conservation Alert",
    text: "Humidity spiked in the artifact store. Several fragile pieces are at risk.",
    weight: 9,
    minDay: 5,
    options: [
      { id: "invest", label: "Emergency climate stabilization", costText: "−14,000đ, −10 research", cost: { cash: 14000, research: 10 }, effects: { reputation: 2, morale: 2 } },
      { id: "rig", label: "Rig basic fans and desiccants", costText: "−3,000đ, condition risk ↑", cost: { cash: 3000 }, effects: { reputation: -1 },
        rng: { p: 0.5, successText: "Improvised rig holds. Fragile pieces survive.", failureText: "Two fragile pieces deteriorate to poor condition." } },
    ],
  },
  {
    id: "ref-collection",
    title: "Reference Visit Offered",
    text: "A partner museum offers your team a supervised study visit to a Đông Sơn type collection.",
    weight: 8,
    minDay: 4,
    options: [
      { id: "go", label: "Send two analysts (costs days, boosts evidence)", costText: "−8,000đ, −2 days, +evidence", cost: { cash: 8000 }, effects: { expeditionProgress: -2, unlockFlag: "refBoost" } },
      { id: "decline", label: "Decline politely", costText: "none", effects: {} },
    ],
  },
  {
    id: "digitization-partner",
    title: "Digitization Partnership",
    text: "A heritage-tech consortium wants to co-fund scanning your archive — for a share of the credit.",
    weight: 8,
    minDay: 10,
    options: [
      { id: "accept", label: "Accept co-funded digitization", costText: "−6,000đ, digitization boost, market event MTC-X", cost: { cash: 6000 }, effects: { unlockFlag: "digiboost" } },
      { id: "alone", label: "Digitize in-house, fully own the data", costText: "−22,000đ all-benefit", cost: { cash: 22000 }, effects: { reputation: 3 } },
    ],
  },
  {
    id: "publication-interest",
    title: "Institutional Interest",
    text: "A university presses your institute for a co-authored paper on your strongest verified finding.",
    weight: 7,
    minDay: 12,
    options: [
      { id: "coauthor", label: "Co-author (faster, shared credit)", costText: "+16,000đ, +3 rep, less ownership", cost: {}, effects: { reputation: 3 } },
      { id: "solo", label: "Publish solo (slower, more prestige)", costText: "−10 research, more prestige", cost: { research: 10 }, effects: { reputation: 5 } },
    ],
  },
  {
    id: "site-dispute",
    title: "Access Dispute",
    text: "A local authority questions your permit scope on the current site field.",
    weight: 6,
    requiresActiveExpedition: true,
    options: [
      { id: "negotiate", label: "Negotiate an expanded permit", costText: "−9,000đ, +1 day", cost: { cash: 9000 }, effects: { expeditionProgress: -1, reputation: 1 } },
      { id: "pause", label: "Pause fieldwork pending review", costText: "−4 progress days", effects: { expeditionProgress: -4, morale: -3 } },
    ],
  },
  {
    id: "find-thief",
    title: "Unauthorized Excavation Signals",
    text: "Night signals suggest looters have targeted the site's periphery.",
    weight: 6,
    requiresActiveExpedition: true,
    options: [
      { id: "guard", label: "Hire night watch", costText: "−7,000đ/day context damaged avoided", cost: { cash: 7000 }, effects: { reputation: 1 } },
      { id: "record", label: "Document the disturbance only", costText: "free, some context lost", effects: { reputation: -1 } },
    ],
  },
  {
    id: "market-shock",
    title: "Sector Wire: Volatility Spike",
    text: "A sector wire reports unusual swings in heritage-technology instruments.",
    weight: 6,
    minDay: 8,
    options: [
      { id: "hedge", label: "Shift exposure to the stable endowment (HCE-S)", costText: "rebalance at fee", effects: { unlockFlag: "marketHedgeHint" } },
      { id: "hold", label: "Hold positions and ride the volatility", costText: "risk/reward", effects: {} },
    ],
  },
  {
    id: "equipment-failure",
    title: "Equipment Failure",
    text: "Critical field equipment fails; spares were not packed.",
    weight: 7,
    requiresActiveExpedition: true,
    options: [
      { id: "repair", label: "Emergency repair + courier spare", costText: "−11,000đ", cost: { cash: 11000 }, effects: { expeditionProgress: -1 } },
      { id: "improvise", label: "Improvise with manual tools", costText: "−5 progress days, team energy −12", cost: { energy: 12 }, effects: { expeditionProgress: -5, morale: -4 } },
    ],
  },
];

// ── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-dig", name: "First Trench", desc: "Complete your first expedition.", check: (s) => Number(s.flags.expeditionsCompleted ?? 0) >= 1 },
  { id: "first-verify", name: "Show Your Work", desc: "Verify an artifact's attribution.", check: (s) => s.artifacts.some((a) => a.confidenceLabel === "verified") },
  { id: "five-artifacts", name: "Growing Archive", desc: "Document 5 artifacts.", check: (s) => s.artifacts.length >= 3 },
  { id: "grantee", name: "Grantee", desc: "Win a grant.", check: (s) => s.grantApplications.some((g) => g.status === "approved") },
  { id: "published", name: "In Print", desc: "Publish 3 findings.", check: (s) => s.artifacts.filter((a) => a.status === "published").length >= 3 },
  { id: "two-regions", name: "Cross the Pass", desc: "Run expeditions in 2 different regions.", check: (s) => new Set(s.artifacts.map((a) => siteRegionOf(a.siteId))).size >= 2 },
  { id: "cash-rich", name: "Runway Secured", desc: "Hold ≥ 200,000đ.", check: (s) => s.resources.cash >= 200000 },
  { id: "all-tech", name: "Rigorous Institute", desc: "Research 5 technologies.", check: (s) => s.techResearched.length >= 5 },
];

export function siteRegionOf(siteId: string): string {
  const map: Record<string, string> = {
    "delta-lien-lau": "delta", "delta-ma-the": "delta", "north-co-loa": "north",
    "north-hoa-binh": "north", "central-tra-kieu": "central", "highlands-dak-son": "highlands", "south-oc-eo": "south",
  };
  return map[siteId] ?? "delta";
}



// ── Tutorial steps ───────────────────────────────────────────────────────────
export interface TutorialStepDef {
  step: number;
  title: string;
  speaker: string;
  body: string;
  /** UI hint: where the player must go / what to do */
  cta?: { label: string; screen: string };
}
export const TUTORIAL: TutorialStepDef[] = [
  { step: 1, title: "The Institute", speaker: "Dr. Linh", body: "Welcome. You direct a small archaeology institute with one site and limited funding. Follow my 8 steps — each one unlocks the next. Press Continue to begin." },
  { step: 2, title: "Choose a Site", speaker: "Dr. Linh", body: "Press Continue — I'll take you to the Exploration Map. There, press “Plan expedition” on the first site card. That's all for this step." },
  { step: 3, title: "Plan the Dig", speaker: "Dr. Linh", body: "The default plan (4 workers, 4 days, survey + careful) is a good first dig. Look at the Estimate panel on the right: it shows cost, supplies and energy. When “Launch expedition” is green, press it." },
  { step: 4, title: "Dig Day by Day", speaker: "Dr. Linh", body: "Press “Dig on — advance one day” until the excavation completes. A field decision may pop up mid-dig — pick any option; all three are safe for the tutorial. Finds appear automatically." },
  { step: 5, title: "First Analysis", speaker: "Dr. Linh", body: "Press Continue — I'll take you to the Research Lab. Select your discovery, then press “Artifact classification”. Every find starts as a hypothesis; analysis builds evidence." },
  { step: 6, title: "Build Evidence", speaker: "Dr. Linh", body: "Run one more analysis (any op — “Reference matching” is good), then press “Verify evidence”. Verification can raise confidence — or honestly report it's not there yet. Either outcome is progress." },
  { step: 7, title: "EARN INCOME", speaker: "Dr. Linh", body: "Press Continue for the Artifact Archive. Open your find and press “Publish” (needs 55%+ confidence). Publication pays đ and reputation — that's how the institute survives. If confidence is short, run one more analysis first." },
  { step: 8, title: "You're Director Now", speaker: "Dr. Linh", body: "That's the whole loop: DIG → ANALYZE → VERIFY → PUBLISH, and keep cash positive. Use “Advance day” in the top bar to pass time. Grants, markets and new regions unlock as reputation grows. Good luck — the trenches await." },
];
