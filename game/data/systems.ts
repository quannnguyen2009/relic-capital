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
  // First-accessible grant: just 2 artifacts with basic documentation
  { id: "documentation", name: "Documentation Grant", desc: "Rewards complete, well-organized artifact records.", payout: 45000, repRequired: 1, requires: { minArtifacts: 2, minProvenanceAvg: 0.15 }, durationDays: 4, cooldownDays: 10 },
  { id: "conservation", name: "Conservation Grant", desc: "Rewards safe recovery and preservation of fragile material.", payout: 52000, repRequired: 5, requires: { minArtifacts: 3, minConditionGood: 2 }, durationDays: 5, cooldownDays: 14 },
  { id: "digital-heritage", name: "Digital Heritage Grant", desc: "Rewards digitization and AI-assisted documentation.", payout: 60000, repRequired: 10, requires: { minArtifacts: 6, minDigitized: 4, minVerified: 2 }, durationDays: 5, cooldownDays: 16 },
  { id: "regional-survey", name: "Regional Survey Grant", desc: "Rewards exploration of an under-researched region.", payout: 56000, repRequired: 7, requires: { regionUnderExplored: "highlands", minArtifacts: 4 }, durationDays: 5, cooldownDays: 15 },
  // Second-accessible grant: just 1 published finding
  { id: "public-access", name: "Public Access Grant", desc: "Rewards publishing findings and making research accessible.", payout: 48000, repRequired: 3, requires: { minPublications: 1 }, durationDays: 4, cooldownDays: 12 },
];

// ── Research tech tree ───────────────────────────────────────────────────────
export const TECHS: ResearchTechDef[] = [
  // Tier 1 — unlock after first expedition (cheap, high-impact)
  { id: "stratigraphic-control", name: "Stratigraphic Control", desc: "Single-context recording: better context evidence from every dig.", cost: { research: 40 }, effects: { evidenceBonus: 0.1, damageReduction: 0.1 } },
  { id: "climate-shields",       name: "Climate Protection Protocol", desc: "Weather response planning; reduces rain/heat damage.", cost: { research: 45, cash: 7000 }, effects: { damageReduction: 0.15 } },
  // Tier 2 — mid-game unlocks
  { id: "photogrammetry",   name: "Photogrammetry Pipeline", desc: "3D capture workflow; unlocks the Portable Scanner.", cost: { research: 75, cash: 16000 }, effects: { evidenceBonus: 0.12 } },
  { id: "dn-chrono",        name: "Đông Sơn Type Series", desc: "Institutewide reference typology for Bronze Age ceramics and bronzes.", cost: { research: 80 }, effects: { evidenceBonus: 0.1, expeditionEfficiency: 0.05 } },
  { id: "field-school",     name: "Field School Program", desc: "Trains workers on-site: expeditions run more efficiently.", cost: { research: 65, cash: 10000 }, effects: { expeditionEfficiency: 0.15 } },
  { id: "open-data",        name: "Open Data Initiative", desc: "Publishes datasets, lifting all grants' quality scores and reputation gain.", cost: { research: 85, cash: 12000 }, effects: { siteUnlock: undefined } },
  // Tier 3 — late-game (require prerequisites)
  { id: "analytical-lab",     name: "Analytical Laboratory", desc: "On-site material analysis — cheaper, deeper analyses.", cost: { research: 110, cash: 22000, requiresTech: ["stratigraphic-control"] }, effects: { analysisCostReduction: 0.2, evidenceBonus: 0.08 } },
  { id: "vehicle-fleet",      name: "Vehicle & Logistics Base", desc: "Institute trucks: lower expedition costs, more supplies carried.", cost: { research: 55, cash: 26000 }, effects: { expeditionEfficiency: 0.2 } },
  { id: "text-corpus",        name: "Hán–Nôm Text Corpus", desc: "Annotated corpus access; big boost to inscription analysis.", cost: { research: 130, cash: 20000, requiresTech: ["analytical-lab"] }, effects: { evidenceBonus: 0.15 } },
  { id: "radiocarbon-access", name: "Radiocarbon Access", desc: "Paid-access radiocarbon dating: sharp period confidence gains.", cost: { research: 150, cash: 36000, requiresTech: ["analytical-lab"] }, effects: { evidenceBonus: 0.2 } },
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
  story:    { id: "story",    name: "Story",    desc: "Generous funding, forgiving setbacks.",      startingCash: 200000, startingResearch: 120, startingSupplies: 60, opExpensePerDay: 900,  eventRisk: 0.5, grantSeverity: 0.7 },
  standard: { id: "standard", name: "Standard", desc: "Balanced costs, meaningful risks.",          startingCash: 150000, startingResearch: 80,  startingSupplies: 45, opExpensePerDay: 1600, eventRisk: 0.9, grantSeverity: 0.9 },
  expert:   { id: "expert",   name: "Expert",   desc: "Tighter budgets, greater uncertainty.",      startingCash: 100000, startingResearch: 55,  startingSupplies: 30, opExpensePerDay: 2400, eventRisk: 1.3, grantSeverity: 1.15 },
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
  {
    id: "ch4",
    title: "Chapter IV — International Symposium",
    requiredRep: 55,
    briefing: "The institute has earned international recognition. Prepare your flagship collection for the Southeast Asian Heritage Symposium. Achieve a robust publication record, successfully defend a rival attribution claim, and build a financial endowment that will sustain the institute for generations.",
    objectives: [
      { id: "o4-published10", text: "Publish 10 findings" },
      { id: "o4-defended", text: "Successfully defend a rival claim" },
      { id: "o4-endowment", text: "Hold ≥ 500,000đ in institutional reserves" },
      { id: "o4-all-regions", text: "Unlock all 5 regions" },
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

  // ── New events ──────────────────────────────────────────────────────────
  {
    id: "conference-invite",
    title: "International Conference Invitation",
    text: "The Southeast Asian Heritage Symposium has issued a formal invitation for your institute to present recent findings. A paper presentation would boost international standing but costs preparation time.",
    weight: 7,
    minDay: 20,
    options: [
      { id: "present", label: "Prepare and present a paper (15 RP, +6 rep)", costText: "−15 research, +6 reputation", cost: { research: 15 }, effects: { reputation: 6, morale: 5 } },
      { id: "send-poster", label: "Submit a poster only (5 RP, +2 rep)", costText: "−5 research, +2 reputation", cost: { research: 5 }, effects: { reputation: 2 } },
      { id: "decline-conference", label: "Politely decline — too early for international exposure", costText: "none", effects: {} },
    ],
  },
  {
    id: "rival-collaboration",
    title: "Rival Institute Offers Collaboration",
    text: "The Southeast Asian Heritage Consortium — a competing institute — proposes a joint excavation at a mutually interesting site. Partnership would share costs and finds, but also credit.",
    weight: 6,
    minDay: 18,
    options: [
      { id: "joint-excavation", label: "Accept joint excavation (shared cost and credit)", costText: "+20,000đ grant advance, shared credit", effects: { reputation: 3, morale: 4, unlockFlag: "consortiumPartner" } },
      { id: "counter-solo", label: "Counter-propose solo access — negotiate your own permit", costText: "−8,000đ negotiation, full credit if approved", cost: { cash: 8000 }, effects: { reputation: 1 } },
      { id: "decline-rival", label: "Decline — maintain independence", costText: "none", effects: {} },
    ],
  },
  {
    id: "forgery-allegation",
    title: "Forgery Allegation",
    text: "An anonymous blog post claims one of your published artifacts may be a modern forgery. The claim is unverified, but it is spreading in academic circles.",
    weight: 5,
    minDay: 15,
    options: [
      { id: "commission-forensic", label: "Commission forensic analysis to clear the record (18,000đ)", costText: "−18,000đ, clears allegation", cost: { cash: 18000 }, effects: { reputation: 3, morale: 3 } },
      { id: "publish-rebuttal", label: "Publish a methodological rebuttal (20 research)", costText: "−20 RP, partial reputation recovery", cost: { research: 20 }, effects: { reputation: 1 } },
      { id: "ignore-allegation", label: "Ignore — anonymous claims without evidence", costText: "reputation risk",
        rng: { p: 0.4, successText: "The allegation fades without further traction.", failureText: "Without a response, the claim gains momentum. Reputation damaged.", failureEffects: { reputation: -4, morale: -6 } } },
    ],
  },
  {
    id: "monsoon-flooding",
    title: "Monsoon Flooding Alert",
    text: "Seasonal monsoon rains have flooded roads into the excavation zone. The team is cut off — resupply is impossible until water levels drop.",
    weight: 7,
    requiresActiveExpedition: true,
    options: [
      { id: "air-resupply", label: "Charter helicopter resupply (22,000đ)", costText: "−22,000đ, expedition continues", cost: { cash: 22000 }, effects: { morale: 2 } },
      { id: "work-with-what-we-have", label: "Work with remaining supplies — reduce workers", costText: "−4 energy, expedition slows", cost: { energy: 4 }, effects: { expeditionProgress: -3, morale: -4 } },
      { id: "evacuate-team", label: "Evacuate team and halt dig until access restored", costText: "−6 progress days", effects: { expeditionProgress: -6, morale: -2, suppliesDelta: 6 } },
    ],
  },
  {
    id: "press-coverage",
    title: "Unexpected Press Coverage",
    text: "A local journalist has featured your institute's work in a major publication, generating public interest. This creates both opportunity and scrutiny.",
    weight: 7,
    minDay: 10,
    options: [
      { id: "embrace-media", label: "Embrace the coverage — public engagement talk (+rep, +morale)", costText: "−4,000đ event costs, +5 reputation", cost: { cash: 4000 }, effects: { reputation: 5, morale: 7 } },
      { id: "measured-response", label: "Issue a careful academic statement only", costText: "free, small reputation gain", effects: { reputation: 2 } },
      { id: "no-comment", label: "No comment — let findings speak for themselves", costText: "none",
        rng: { p: 0.6, successText: "Public interest organically grows. Modest reputation gain.", failureText: "Silence is misinterpreted as evasion. Slight reputation dip.", successEffects: { reputation: 1 }, failureEffects: { reputation: -1 } } },
    ],
  },
  {
    id: "intern-offer",
    title: "Graduate Intern Programme",
    text: "A local university offers to place two archaeology graduate students with your institute for a 20-day placement. They would generate extra research points but require supervision time.",
    weight: 8,
    minDay: 8,
    options: [
      { id: "accept-interns", label: "Accept — assign them to the lab (+30 research over 20 days)", costText: "+30 research, −2,000đ admin", cost: { cash: 2000 }, effects: { unlockFlag: "internActive" } },
      { id: "field-interns", label: "Deploy to field support (next expedition +efficiency)", costText: "+expedition efficiency, −2,000đ admin", cost: { cash: 2000 }, effects: { morale: 3, unlockFlag: "internField" } },
      { id: "decline-interns", label: "Decline — no capacity right now", costText: "none", effects: {} },
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
  // New achievements for deep play
  { id: "rival-defender", name: "Stand Your Ground", desc: "Successfully defend a rival institution's attribution claim.", check: (s) => (s.rivalClaims ?? []).some((c) => c.resolved === "defended") },
  { id: "assemblage-scholar", name: "Context is Everything", desc: "Trigger an assemblage coherence bonus (2 co-verified artifacts from the same site-era).", check: (s) => s.artifacts.some((a) => (a.assemblageBonus ?? 0) >= 1) },
  { id: "senior-team", name: "Mentored Corps", desc: "Have a staff member reach skill level 5 through seniority.", check: (s) => s.staff.some((m) => m.skill >= 5 && (m.seniorityDays ?? 0) >= 60) },
  { id: "conservator-active", name: "Preservation First", desc: "Perform conservation treatment on 3 different artifacts.", check: (s) => s.artifacts.filter((a) => (a.lastConservationDay ?? 0) > 0).length >= 3 },
];

export function siteRegionOf(siteId: string): string {
  const map: Record<string, string> = {
    "delta-lien-lau": "delta", "delta-ma-the": "delta", "north-co-loa": "north",
    "north-hoa-binh": "north", "central-tra-kieu": "central", "highlands-dak-son": "highlands", "south-oc-eo": "south",
  };
  return map[siteId] ?? "delta";
}



// ── Tutorial steps ───────────────────────────────────────────────────────────
export const TOTAL_TUTORIAL_STEPS = 12;

export interface TutorialStepDef {
  step: number;
  title: string;
  speaker: string;
  body: string;
  /** UI hint: where the player must go / what to do */
  cta?: { label: string; screen: string };
}
export const TUTORIAL: TutorialStepDef[] = [
  {
    step: 1,
    title: "The Institute",
    speaker: "Dr. Linh",
    body: "Welcome, Director. You are in command of an independent institute dedicated to Vietnamese archaeology. Balance field excavations with institutional survival. Follow this guided tour across all facilities before taking full control — or select Skip at any time.",
    cta: { label: "To Exploration Map", screen: "map" },
  },
  {
    step: 2,
    title: "Exploration Map",
    speaker: "Dr. Linh",
    body: "Here are archaeological sites across Northern, Central, and Southern Vietnam. Each site carries historical strata, risk ratings, and data quality. Select the first site card and press “Plan expedition”.",
    cta: { label: "Plan Expedition", screen: "expedition" },
  },
  {
    step: 3,
    title: "Expedition Logistics",
    speaker: "Dr. Linh",
    body: "Field archaeology is resource-intensive. Review the Estimate panel: labor, supplies, energy, and survey protocols. The default plan (4 workers, 4 days, survey + careful) is a reliable first season. Press “Launch expedition”.",
    cta: { label: "Launch Expedition", screen: "expedition" },
  },
  {
    step: 4,
    title: "Field Excavation",
    speaker: "Dr. Linh",
    body: "Press “Dig on — advance one day” to progress through soil strata. If field decisions appear mid-dig, choose any protocol. Watch for discoveries as your team carefully sifts the trenches.",
    cta: { label: "Advance Day", screen: "expedition" },
  },
  {
    step: 5,
    title: "Research Lab: Analysis",
    speaker: "Dr. Linh",
    body: "Discoveries arrive here in raw condition. Select your artifact, then run “Artifact classification”. Every find starts as a hypothesis; scientific testing builds empirical evidence.",
    cta: { label: "Run Analysis", screen: "lab" },
  },
  {
    step: 6,
    title: "Verification & Publishing",
    speaker: "Dr. Linh",
    body: "Run a second test (“Reference matching”), then press “Verify evidence”. Verification challenges your hypotheses against rigorous standards. If attribution confidence reaches 55%+, you can publish for cash and prestige!",
    cta: { label: "Verify & Publish", screen: "lab" },
  },
  {
    step: 7,
    title: "Artifact Archive",
    speaker: "Dr. Linh",
    body: "Welcome to the Archive — your permanent institutional repository. Here, every find's provenance, condition, historical period, and public accessibility score are cataloged and preserved for posterity.",
    cta: { label: "Explore Archive", screen: "archive" },
  },
  {
    step: 8,
    title: "Finance & Grants",
    speaker: "Dr. Linh",
    body: "Archaeology cannot operate without sustainable funding. Check your cash balance, 7-day burn rate, and Runway. Here you apply for competitive research grants from public and international foundations.",
    cta: { label: "Review Finances", screen: "finance" },
  },
  {
    step: 9,
    title: "Market Observatory",
    speaker: "Dr. Linh",
    body: "Field equipment, conservation chemicals, and regional indices fluctuate. Use the Market Observatory to track simulated price trends, build a watchlist, and trade supplies to hedge against inflation.",
    cta: { label: "Inspect Market", screen: "market" },
  },
  {
    step: 10,
    title: "Institute Development",
    speaker: "Dr. Linh",
    body: "Invest in your future: recruit specialist staff (epigraphers, conservators, historians), upgrade field excavation kits, and install advanced spectrometry instrumentation to boost safety and data quality.",
    cta: { label: "View Upgrades", screen: "dev" },
  },
  {
    step: 11,
    title: "Codex & Archival Lore",
    speaker: "Dr. Linh",
    body: "The Codex preserves field manuals and historical contexts: Đông Sơn bronze drums, Sa Huỳnh burial jars, Óc Eo trade routes, and Champa epigraphy. You can also replay this tutorial here at any time.",
    cta: { label: "Read Codex", screen: "codex" },
  },
  {
    step: 12,
    title: "Director's Commission",
    speaker: "Dr. Linh",
    body: "You have inspected every department of the institute. The core cycle is in your hands: DIG → ANALYZE → VERIFY → PUBLISH, all while managing your operational runway. Press the button below to take full command!",
    cta: { label: "Take Full Command", screen: "command" },
  },
];

