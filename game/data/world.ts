import type { Era, Region, Site, ArtifactTemplate, EraId, RegionId, ArtifactCategory, AssemblageDef } from "../engine/types";

export const REGIONS: Region[] = [
  {
    id: "north",
    name: "Northern Vietnam",
    theme: "Early settlement, Bronze Age material culture, ancient river valleys",
    unlockCost: 46000,
    requiresReputation: 10,
  },
  {
    id: "delta",
    name: "Red River Delta",
    theme: "Đông Sơn cultural contexts and settlement archaeology",
    unlockCost: 0,
    requiresReputation: 0,
  },
  {
    id: "central",
    name: "Central Vietnam",
    theme: "Champa-related heritage and coastal trade",
    unlockCost: 68000,
    requiresReputation: 20,
  },
  {
    id: "highlands",
    name: "Central Highlands",
    theme: "Highland settlement histories and regional exchange",
    unlockCost: 58000,
    requiresReputation: 16,
  },
  {
    id: "south",
    name: "Southern Vietnam",
    theme: "Evidence of historical trade networks and earlier polities",
    unlockCost: 82000,
    requiresReputation: 26,
  },
];

export const ERAS: Era[] = [
  { id: "phung-nguyen", name: "Phùng Nguyên", range: "c. 2000–1500 BCE", desc: "Early farming communities of the Red River valley with early metallurgy." },
  { id: "dong-dau", name: "Đồng Đậu", range: "c. 1500–1100 BCE", desc: "Transitional Bronze Age phase with expanding metal use." },
  { id: "go-mun", name: "Gò Mun", range: "c. 1100–700 BCE", desc: "Late pre-Đông Sơn Bronze Age with distinct ceramics." },
  { id: "dong-son", name: "Đông Sơn", range: "c. 700 BCE–100 CE", desc: "The classic Vietnamese Bronze Age — drums, bronze tools, sophisticated pottery." },
  { id: "champa", name: "Champa period", range: "c. 200–1400 CE", desc: "Hindu-Buddhist coastal polity; brick towers, sandstone sculpture, inscriptions." },
  { id: "van-lang-folk", name: "Văn Lang–Âu Lạc", range: "legendary/early historically", desc: "Legendary early kingdoms associated with Đông Sơn culture." },
  { id: "trade-network", name: "Historical trade era", range: "c. 100–1500 CE", desc: "Maritime exchange across the South China Sea, Óc Eo and later trade hubs." },
];

export const SITES: Site[] = [
  {
    id: "delta-lien-lau",
    name: "Liên Lậu Survey Grid",
    region: "delta",
    status: "fictional",
    desc: "A fictional training scenario in a real setting: a riverside settlement in the Red River floodplain with dense Đông Sơn-era ceramic scatter and suspected bronze working.",
    significance: 5,
    dataQuality: 4,
    difficulty: 1,
    baseCost: 12000,
    risk: 2,
    artifactCategories: ["pottery", "bronze", "tool"],
    eras: ["phung-nguyen", "dong-son", "dong-dau"],
    requiresReputation: 0,
    unlockCost: 0,
    grants: ["documentation", "public-access"],
    image: "/assets/sites/delta.jpg",
  },
  {
    id: "delta-ma-the",
    name: "Má Thẹn Excavation Block",
    region: "delta",
    status: "real",
    desc: "Inspired by the real Má Thẹn site (掘 mộ) in Duy Tiên, Hà Nam — a documented Đông Sơn-era workshop with large-scale bronze casting remains. Gameplay data is a fictionalized model.",
    significance: 8,
    dataQuality: 6,
    difficulty: 2,
    baseCost: 24000,
    risk: 3,
    artifactCategories: ["bronze", "pottery", "tool", "coin"],
    eras: ["dong-son", "go-mun"],
    requiresReputation: 12,
    unlockCost: 25000,
    grants: ["conservation", "regional-survey"],
    image: "/assets/sites/bronzework.jpg",
  },
  {
    id: "north-co-loa",
    name: "Cổ Loa Outer Works",
    region: "north",
    status: "real",
    desc: "Inspired by the Cổ Loa citadel near Hà Nội — one of Southeast Asia's largest pre-industrial earthwork complexes, associated with the Âu Lạc kingdom. The site is real; expedition scenarios are fictional.",
    significance: 10,
    dataQuality: 7,
    difficulty: 4,
    baseCost: 52000,
    risk: 2,
    artifactCategories: ["bronze", "architecture", "inscription", "coin"],
    eras: ["dong-son", "van-lang-folk"],
    requiresReputation: 22,
    unlockCost: 55000,
    grants: ["documentation", "digital-heritage", "public-access"],
    image: "/assets/sites/coloas.jpg",
  },
  {
    id: "north-hoa-binh",
    name: "Hòa Bình Upland Terrace",
    region: "north",
    status: "real",
    desc: "Inspired by the Hòa Bình culture — a famous Hoabinhian stone-tool industry defined from Vietnamese rock shelters in the 1920s. The region is real; expedition scenarios are fictional.",
    significance: 7,
    dataQuality: 5,
    difficulty: 3,
    baseCost: 32000,
    risk: 4,
    artifactCategories: ["tool", "pottery"],
    eras: ["phung-nguyen"],
    requiresReputation: 14,
    unlockCost: 30000,
    grants: ["regional-survey", "documentation"],
    image: "/assets/sites/hoabinh.jpg",
  },
  {
    id: "central-tra-kieu",
    name: "Trà Kiệu Tower Group",
    region: "central",
    status: "real",
    desc: "Inspired by Trà Kiệu (Simhapura), an early Champa capital with brick temple foundations and sandstone sculpture. The site is real; expedition scenarios are fictional.",
    significance: 9,
    dataQuality: 6,
    difficulty: 4,
    baseCost: 58000,
    risk: 3,
    artifactCategories: ["architecture", "inscription", "bronze"],
    eras: ["champa"],
    requiresReputation: 28,
    unlockCost: 62000,
    grants: ["digital-heritage", "documentation"],
    image: "/assets/sites/champa.jpg",
  },
  {
    id: "highlands-dak-son",
    name: "Đắk Sơn Basin Exchanges",
    region: "highlands",
    status: "fictional",
    desc: "A fictional survey scenario grounded in real highland archaeology: jar-burial and bronze-exchange sites in the Central Highlands linked to regional trade webs.",
    significance: 6,
    dataQuality: 3,
    difficulty: 3,
    baseCost: 40000,
    risk: 4,
    artifactCategories: ["pottery", "bronze", "tool", "coin"],
    eras: ["trade-network", "dong-son"],
    requiresReputation: 18,
    unlockCost: 42000,
    grants: ["regional-survey", "conservation"],
    image: "/assets/sites/highland.jpg",
  },
  {
    id: "south-oc-eo",
    name: "Óc Eo Canal Port",
    region: "south",
    status: "real",
    desc: "Inspired by Óc Eo in An Giang — a famous Fenici–Funan trade entrepôt with Roman coins, Indian jewellery and Middle Eastern links. The site is real; expedition scenarios are fictional.",
    significance: 9,
    dataQuality: 5,
    difficulty: 4,
    baseCost: 64000,
    risk: 3,
    artifactCategories: ["coin", "inscription", "pottery", "bronze"],
    eras: ["trade-network"],
    requiresReputation: 30,
    unlockCost: 75000,
    grants: ["regional-survey", "documentation", "digital-heritage"],
    image: "/assets/sites/oceo.jpg",
  },
];

export const ARTIFACT_TEMPLATES: ArtifactTemplate[] = [
  // ── Pottery ──
  { id: "pot-dong-son-jar", name: "Đông Sơn burial jar", category: "pottery", material: "fired clay", eras: ["dong-son"], baseSignificance: 6, baseValue: 8000, desc: "Large shouldered jar with comb-incised bands, typical of Đông Sơn burial assemblages.", minDifficulty: 1, regions: ["delta", "north", "highlands"], rarity: "common" },
  { id: "pot-phung-nguyen-bowl", name: "Phùng Nguyên pedestal bowl", category: "pottery", material: "fired clay", eras: ["phung-nguyen"], baseSignificance: 4, baseValue: 4000, desc: "Pedestaled bowl with plain punctate decoration, high quality thin-walled fabric.", minDifficulty: 1, regions: ["delta", "north"], rarity: "common" },
  { id: "pot-cordmarked", name: "Cord-marked cooking pot", category: "pottery", material: "coarse clay", eras: ["go-mun", "dong-dau"], baseSignificance: 3, baseValue: 2500, desc: "Grit-tempered cord-marked ware from a domestic context.", minDifficulty: 1, regions: ["delta", "north", "highlands"], rarity: "common" },
  { id: "pot-highland-jar", name: "Highland storage jar", category: "pottery", material: "sandy clay", eras: ["trade-network", "dong-son"], baseSignificance: 5, baseValue: 6000, desc: "Thick-walled storage jar with paddle-marked surface and carved rim.", minDifficulty: 3, regions: ["highlands", "south"], rarity: "uncommon" },
  { id: "pot-champa-glaze", name: "Sandalwood-glazed sherd cluster", category: "pottery", material: "stoneware", eras: ["champa"], baseSignificance: 6, baseValue: 9000, desc: "Green-glazed stoneware sherds from a temple-footed clinker deposit.", minDifficulty: 4, regions: ["central", "south"], rarity: "uncommon" },

  // ── Bronze ──
  { id: "bronze-drum-fragment", name: "Bronze drum tympanum fragment", category: "bronze", material: "copper-tin alloy", eras: ["dong-son"], baseSignificance: 9, baseValue: 26000, desc: "Cast tympanum fragment with concentric star motif and frog-attachment stubs.", minDifficulty: 2, regions: ["delta", "north", "highlands", "south"], rarity: "rare" },
  { id: "bronze-socketed-axe", name: "Socketed bronze axe", category: "bronze", material: "copper alloy", eras: ["dong-son", "go-mun"], baseSignificance: 5, baseValue: 9000, desc: "Socketed axe with decorated flare-blade, casting seam still visible.", minDifficulty: 1, regions: ["delta", "north", "highlands"], rarity: "common" },
  { id: "bronze-situla-lid", name: "Bronze situla lid", category: "bronze", material: "lead-copper alloy", eras: ["dong-son"], baseSignificance: 7, baseValue: 14000, desc: "Domed lid with four standing figure finials, heavy green patina.", minDifficulty: 2, regions: ["delta", "north"], rarity: "uncommon" },
  { id: "bronze-mold-fragment", name: "Bivalve clay-casting mold", category: "bronze", material: "fired clay + slag", eras: ["dong-son", "go-mun"], baseSignificance: 8, baseValue: 18000, desc: "Half of a clay casting mold for a bronze plough-share — workshop evidence.", minDifficulty: 2, regions: ["delta", "north", "south"], rarity: "rare" },
  { id: "bronze-spearhead", name: "Leaf-shaped spearhead", category: "bronze", material: "copper alloy", eras: ["go-mun", "dong-son"], baseSignificance: 4, baseValue: 7000, desc: "Leaf-shaped spearhead with midrib and buttoned socket-end.", minDifficulty: 1, regions: ["delta", "north", "highlands"], rarity: "common" },

  // ── Tools ──
  { id: "tool-patinated-adze", name: "Patinated stone adze", category: "tool", material: "polished greenstone", eras: ["phung-nguyen", "dong-dau", "go-mun"], baseSignificance: 4, baseValue: 5000, desc: "Patinated adze with shouldered butt — Hoabinhian→Neolithic transition type.", minDifficulty: 1, regions: ["north", "highlands", "delta"], rarity: "common" },
  { id: "tool-quern-fragment", name: "Saddle quern fragment", category: "tool", material: "sandstone", eras: ["phung-nguyen"], baseSignificance: 3, baseValue: 2000, desc: "Grooved grinding surface from a processing area.", minDifficulty: 1, regions: ["north", "delta"], rarity: "common" },
  { id: "tool-chert-flake", name: "Chert flake scraper", category: "tool", material: "chert", eras: ["phung-nguyen", "go-mun"], baseSignificance: 3, baseValue: 2400, desc: "Retouched flake tool — cutting and scraping edge use-wear.", minDifficulty: 1, regions: ["north", "highlands"], rarity: "common" },
  { id: "tool-sondage-chisel", name: "Bronze chisel", category: "tool", material: "copper alloy", eras: ["dong-son"], baseSignificance: 5, baseValue: 8000, desc: "Squared-section chisel for wood and shell working.", minDifficulty: 2, regions: ["delta", "north"], rarity: "uncommon" },

  // ── Inscriptions ──
  { id: "ins-champa-stele", name: "Sandalwood-wood stele fragment", category: "inscription", material: "sandstone", eras: ["champa"], baseSignificance: 10, baseValue: 34000, desc: "Stele fragment carrying two legible Sanskrit lines and panel ornament.", minDifficulty: 4, regions: ["central", "south"], rarity: "exceptional" },
  { id: "ins-translate-tag", name: "Unknown-carved tag", category: "inscription", material: "bone", eras: ["trade-network", "dong-son"], baseSignificance: 6, baseValue: 11000, desc: "Small tag incised with a single unidentified grapheme-like sign.", minDifficulty: 3, regions: ["delta", "highlands", "south"], rarity: "rare" },
  { id: "ins-bricks-stamp", name: "Stamped brick with字符", category: "inscription", material: "fired brick", eras: ["champa"], baseSignificance: 7, baseValue: 12000, desc: "Brick stamped with a short Brahmic-script dedication line.", minDifficulty: 3, regions: ["central"], rarity: "rare" },

  // ── Coins ──
  { id: "coin-wuzhu", name: "Wǔ zhū coin", category: "coin", material: "bronze", eras: ["trade-network"], baseSignificance: 7, baseValue: 15000, desc: "Chinese wǔ zhū cash coin, attests north–south trade contact.", minDifficulty: 3, regions: ["delta", "north", "south"], rarity: "uncommon" },
  { id: "coin-roman", name: "Roman antoninianus", category: "coin", material: "bronze", eras: ["trade-network"], baseSignificance: 10, baseValue: 40000, desc: "Hugely significant: documented Roman coins at Óc Eo attest maritime links.", minDifficulty: 4, regions: ["south"], rarity: "exceptional" },
  { id: "coin-local-cast", name: "Locally cast coin", category: "coin", material: "lead-bonze alloy", eras: ["dong-son", "trade-network"], baseSignificance: 5, baseValue: 6000, desc: "Small local cast coin with uninformative legend.", minDifficulty: 2, regions: ["delta", "south"], rarity: "common" },

  // ── Architecture ──
  { id: "arch-brick-relief", name: "Carved brick relief", category: "architecture", material: "fired brick", eras: ["champa"], baseSignificance: 7, baseValue: 13000, desc: "Brick with a niched ornament and lotus bud — temple wall course.", minDifficulty: 4, regions: ["central"], rarity: "uncommon" },
  { id: "arch-palisade-post", name: "Waterlogged palisade post", category: "architecture", material: "preserved wood", eras: ["dong-son", "van-lang-folk"], baseSignificance: 8, baseValue: 16000, desc: "Waterlogged post — evidence of a large defensive or settlement enclosure.", minDifficulty: 3, regions: ["delta", "north"], rarity: "rare" },
  { id: "arch-tile", name: "Roof tile fragment", category: "architecture", material: "fired clay", eras: ["trade-network", "champa"], baseSignificance: 4, baseValue: 4000, desc: "Taper-bossed roof tile — a more formal structure than the rest of the site.", minDifficulty: 2, regions: ["central", "south", "north"], rarity: "common" },

  // ── Manuscripts ──
  { id: "manuscript-palm-leaf", name: "Palm-leaf manuscript fragment", category: "manuscript", material: "palm leaf", eras: ["champa", "trade-network"], baseSignificance: 9, baseValue: 28000, desc: "Carbonized palm-leaf strip with a few legible aksara.", minDifficulty: 4, regions: ["central", "south"], rarity: "exceptional" },
  { id: "manuscript-mulberry", name: "Dó paper fragment", category: "manuscript", material: "dó paper", eras: ["trade-network"], baseSignificance: 7, baseValue: 17000, desc: "Waterlogged fragment of dó paper bearing a fragmentary brush note — a trade-era document.", minDifficulty: 4, regions: ["south"], rarity: "rare" },
];

// ── Museum assemblages ───────────────────────────────────────────────────────
// Collection sets built from specific artifact types. Cataloging every piece in
// a set (running any analysis on it) completes the assemblage for a reward.
export const ASSEMBLAGES: AssemblageDef[] = [
  {
    id: "delta-type-series",
    name: "Red River Type Series",
    era: "dong-son",
    region: "delta",
    desc: "A household assemblage and its metalwork: the founding display of any delta museum.",
    templateIds: ["pot-dong-son-jar", "pot-phung-nguyen-bowl", "bronze-socketed-axe"],
    reward: { cash: 30000, research: 20, reputation: 6 },
  },
  {
    id: "dong-son-workshop",
    name: "Đông Sơn Workshop",
    era: "dong-son",
    region: "delta",
    desc: "Casting mold, ritual vessel and a drum fragment — the full bronze-worker's story.",
    templateIds: ["bronze-mold-fragment", "bronze-situla-lid", "bronze-drum-fragment"],
    reward: { cash: 60000, research: 30, reputation: 10 },
  },
  {
    id: "co-loa-earthworks",
    name: "Cổ Loa Earthworks",
    era: "van-lang-folk",
    region: "north",
    desc: "Monumental defence and its bronze age roots: a citadel in three objects.",
    templateIds: ["arch-palisade-post", "bronze-drum-fragment", "bronze-socketed-axe"],
    reward: { cash: 65000, research: 35, reputation: 12 },
  },
  {
    id: "highland-exchange",
    name: "Đắk Sơn Exchange",
    era: "trade-network",
    region: "highlands",
    desc: "A highland jar, a Chinese coin and a carved tag — trade routes before the coast.",
    templateIds: ["pot-highland-jar", "coin-wuzhu", "ins-translate-tag"],
    reward: { cash: 70000, research: 40, reputation: 12 },
  },
  {
    id: "champa-stone",
    name: "Champa Stone & Script",
    era: "champa",
    region: "central",
    desc: "Two inscriptions and a temple relief: the Champa court in stone.",
    templateIds: ["ins-champa-stele", "ins-bricks-stamp", "arch-brick-relief"],
    reward: { cash: 90000, research: 50, reputation: 18 },
  },
  {
    id: "oc-eo-cosmopolitan",
    name: "Óc Eo Cosmopolitan",
    era: "trade-network",
    region: "south",
    desc: "A Roman coin, a trade-era document and a storage jar from the canal port.",
    templateIds: ["coin-roman", "manuscript-mulberry", "pot-highland-jar"],
    reward: { cash: 110000, research: 60, reputation: 22 },
  },
];

export const CATEGORY_LABELS: Record<ArtifactCategory, string> = {
  pottery: "Pottery",
  bronze: "Bronze",
  tool: "Tool",
  inscription: "Inscription",
  coin: "Coin",
  architecture: "Architecture",
  manuscript: "Manuscript",
};

export const ERA_LABELS: Record<EraId, string> = Object.fromEntries(
  ERAS.map((e) => [e.id, e.name])
) as Record<EraId, string>;

export const REGION_LABELS: Record<RegionId, string> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r.name])
) as Record<RegionId, string>;

export const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  exceptional: "Exceptional",
};
