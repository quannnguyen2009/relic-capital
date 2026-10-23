"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt } from "@/game/engine/core";
import { REGIONS, SITES, ERA_LABELS, CATEGORY_LABELS } from "@/game/data/world";
import type { Site, ExpeditionPlan, RegionId } from "@/game/engine/types";
import { playDiscoverySound, playCoinSound } from "@/game/sound";
import {
  MAP_DIMENSIONS,
  VIETNAM_MAINLAND_PATH,
  VIETNAM_ISLANDS,
  NEIGHBORS,
  RIVERS,
  RELIEF_TERRAIN,
  HISTORICAL_ROUTES,
  PARACEL_ISLANDS,
  SPRATLY_ISLANDS,
  GRATICULE,
  SITE_COORDS,
  HANOI_HQ,
  REGION_LABELS,
} from "./mapData";

function defaultPlan(siteId: string): ExpeditionPlan {
  return { siteId, workers: 4, days: 4, equipment: [], survey: true, careful: true, objective: "balanced" };
}

export default function MapScreen() {
  const g = useGame();
  const s = g.s!;
  const [selected, setSelected] = useState<Site | null>(null);
  const [hoveredSite, setHoveredSite] = useState<Site | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | "all">("all");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Map layer visibility toggles
  const [showTopography, setShowTopography] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showGraticule, setShowGraticule] = useState(true);

  // Filtered sites for list
  const filteredSites = useMemo(() => {
    if (selectedRegion === "all") return SITES;
    return SITES.filter((site) => site.region === selectedRegion);
  }, [selectedRegion]);

  const activeRegion = hoveredRegion || (selectedRegion !== "all" ? selectedRegion : null);

  // Active expedition target site coords
  const activeExpeditionTarget = useMemo(() => {
    if (!s.expedition || s.expedition.phase !== "active") return null;
    const targetSiteId = s.expedition.plan.siteId;
    return SITE_COORDS[targetSiteId] || null;
  }, [s.expedition]);

  const isDrySeason = (s.day % 60) < 30;

  return (
    <div className="space-y-5">
      <Panel
        title="Exploration Map"
        sub="High-precision archaeological survey of Vietnam and surrounding maritime realms. Real historical landscapes and prehistoric contexts are mapped with authenticity. Click a site marker to inspect."
      >
        {/* Map Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          {/* Region Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#A2B0B2] text-[0.7rem] uppercase tracking-wider mr-1">Region:</span>
            <button
              onClick={() => setSelectedRegion("all")}
              className={`px-2 py-0.5 rounded text-[0.7rem] transition-colors border ${
                selectedRegion === "all"
                  ? "bg-[#C28B49] text-[#121c24] font-semibold border-[#C28B49]"
                  : "bg-[#0f1d27] text-[#A2B0B2] border-transparent hover:border-[#2a4355]"
              }`}
            >
              All Regions ({SITES.length})
            </button>
            {REGIONS.map((r) => {
              const isUnlocked = s.regionUnlocked.includes(r.id);
              const isSelected = selectedRegion === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  onMouseEnter={() => setHoveredRegion(r.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className={`px-2 py-0.5 rounded text-[0.7rem] transition-colors border flex items-center gap-1 ${
                    isSelected
                      ? "bg-[#C28B49] text-[#121c24] font-semibold border-[#C28B49]"
                      : isUnlocked
                      ? "bg-[#0f1d27] text-[#A2B0B2] border-[#22394a] hover:border-[#C28B49]/50"
                      : "bg-[#0a141c] text-[#556b7a] border-transparent hover:border-[#1e303d]"
                  }`}
                >
                  <span>{r.name}</span>
                  {!isUnlocked && <span className="text-[0.6rem] opacity-60">🔒</span>}
                </button>
              );
            })}
          </div>

          {/* Layer toggles & Monsoon Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#0a1620] p-0.5 rounded border hairline text-[0.68rem]">
              <button
                onClick={() => setShowTopography(!showTopography)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showTopography ? "bg-[#183142] text-[#F0E9D9]" : "text-[#708896] hover:text-[#A2B0B2]"
                }`}
                title="Toggle mountain relief and delta contours"
              >
                🏔 Topography
              </button>
              <button
                onClick={() => setShowRoutes(!showRoutes)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showRoutes ? "bg-[#183142] text-[#F0E9D9]" : "text-[#708896] hover:text-[#A2B0B2]"
                }`}
                title="Toggle ancient Maritime Silk Road sea lanes"
              >
                ⛵ Trade Routes
              </button>
              <button
                onClick={() => setShowGraticule(!showGraticule)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  showGraticule ? "bg-[#183142] text-[#F0E9D9]" : "text-[#708896] hover:text-[#A2B0B2]"
                }`}
                title="Toggle geographic grid and oceanic reefs"
              >
                🧭 Graticule
              </button>
            </div>

            {/* Season Badge */}
            <Tooltip
              text={
                isDrySeason
                  ? "Northeast Monsoon (Mùa Khô): Prevailing winds blow from NE across Biển Đông. Safer coastal transit and river excavation."
                  : "Southwest Monsoon (Mùa Mưa): Heavy tropical squalls and monsoon currents. Higher environmental mishap risk."
              }
            >
              <div className="bg-[#0b1822] border hairline px-2.5 py-1 rounded text-xs text-[#A2B0B2] flex items-center gap-1.5 cursor-help">
                <span className="text-[#C28B49]">{isDrySeason ? "☀️" : "🌦"}</span>
                <span className="text-[0.7rem] font-medium text-[#F0E9D9]">
                  {isDrySeason ? "Mùa Khô (NE Monsoon)" : "Mùa Mưa (SW Monsoon)"}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* The Cartographic Frame */}
        <div className="relative rounded-lg border hairline overflow-hidden bg-[#07111a] shadow-2xl transition-all duration-300">
          <div className="w-full relative" style={{ aspectRatio: "850 / 1000", maxHeight: "760px", minHeight: "520px" }}>
            <svg
              viewBox={`0 0 ${MAP_DIMENSIONS.width} ${MAP_DIMENSIONS.height}`}
              className="absolute inset-0 w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Visual styling and keyframe animations */}
                <style>{`
                  @keyframes expeditionPulse {
                    0% { stroke-dashoffset: 40; }
                    100% { stroke-dashoffset: 0; }
                  }
                  @keyframes beaconRadar {
                    0% { r: 5; opacity: 0.9; }
                    100% { r: 18; opacity: 0; }
                  }
                  @keyframes waypointPulse {
                    0%, 100% { transform: scale(1); opacity: 0.85; }
                    50% { transform: scale(1.3); opacity: 1; }
                  }
                  .expedition-vector {
                    animation: expeditionPulse 1.8s linear infinite;
                  }
                  .beacon-pulse {
                    animation: beaconRadar 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
                  }
                `}</style>

                {/* Ocean Background Gradient */}
                <radialGradient id="oceanBathymetry" cx="65%" cy="45%" r="75%">
                  <stop offset="0%" stopColor="#0c1d29" />
                  <stop offset="45%" stopColor="#091621" />
                  <stop offset="100%" stopColor="#050e15" />
                </radialGradient>

                {/* Vietnam Landmass Gradient */}
                <linearGradient id="vietnamLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1a3240" />
                  <stop offset="35%" stopColor="#162a36" />
                  <stop offset="70%" stopColor="#13232e" />
                  <stop offset="100%" stopColor="#0f1d26" />
                </linearGradient>

                {/* Neighboring Continents Gradient */}
                <linearGradient id="neighborLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#111f28" />
                  <stop offset="100%" stopColor="#0b151c" />
                </linearGradient>

                {/* River Glow Gradient */}
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3c6b87" />
                  <stop offset="100%" stopColor="#538fae" />
                </linearGradient>

                {/* Shallows / Coastal Shelf Glow Filter */}
                <filter id="coastalGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Pin Shadow Filter */}
                <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
                </filter>

                {/* Fine Graticule Dot Pattern */}
                <pattern id="graticuleDots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="0.6" fill="#1b2d3c" opacity="0.6" />
                </pattern>

                {/* Map Frame Clip with rounded corners */}
                <clipPath id="mapFrameClip">
                  <rect x="0" y="0" width={MAP_DIMENSIONS.width} height={MAP_DIMENSIONS.height} rx="8" />
                </clipPath>
              </defs>

              {/* Clipped Cartographic Group */}
              <g clipPath="url(#mapFrameClip)">
                {/* 1. Base Nautical Ocean Background */}
                <rect width={MAP_DIMENSIONS.width} height={MAP_DIMENSIONS.height} fill="url(#oceanBathymetry)" />
                <rect width={MAP_DIMENSIONS.width} height={MAP_DIMENSIONS.height} fill="url(#graticuleDots)" opacity="0.75" />

                {/* 2. Bathymetry / Coastal Shelf Depth Contours */}
                <g opacity="0.5">
                  <path d={VIETNAM_MAINLAND_PATH} fill="none" stroke="#1d384c" strokeWidth="18" filter="url(#coastalGlow)" />
                  <path d={VIETNAM_MAINLAND_PATH} fill="none" stroke="#2a4f6a" strokeWidth="6" opacity="0.6" />
                  <path d={NEIGHBORS.hainan} fill="none" stroke="#1d384c" strokeWidth="12" filter="url(#coastalGlow)" />
                  <path d={NEIGHBORS.cambodia} fill="none" stroke="#1d384c" strokeWidth="12" filter="url(#coastalGlow)" />
                </g>

                {/* 3. Graticule Lines (Parallels & Meridians) */}
                {showGraticule && (
                  <g opacity="0.6">
                    {GRATICULE.parallels.map((p) => (
                      <g key={p.lat}>
                        <line
                          x1="0"
                          y1={p.y}
                          x2={MAP_DIMENSIONS.width}
                          y2={p.y}
                          stroke="#1a3142"
                          strokeWidth="0.6"
                          strokeDasharray="3,3"
                        />
                        <text
                          x="10"
                          y={p.y - 4}
                          fill="#446479"
                          fontSize="9"
                          fontFamily="monospace"
                          opacity="0.8"
                        >
                          {p.label}
                        </text>
                      </g>
                    ))}
                    {GRATICULE.meridians.map((m) => (
                      <g key={m.lon}>
                        <line
                          x1={m.x}
                          y1="0"
                          x2={m.x}
                          y2={MAP_DIMENSIONS.height}
                          stroke="#1a3142"
                          strokeWidth="0.6"
                          strokeDasharray="3,3"
                        />
                        <text
                          x={m.x + 4}
                          y="18"
                          fill="#446479"
                          fontSize="9"
                          fontFamily="monospace"
                          opacity="0.8"
                        >
                          {m.label}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* 4. Neighboring Continents & Landmasses */}
                <g id="neighborCountries">
                  {/* China Mainland */}
                  <path d={NEIGHBORS.china} fill="url(#neighborLandGrad)" stroke="#233a4c" strokeWidth="0.8" opacity="0.9" />
                  {/* Hainan Island */}
                  <path d={NEIGHBORS.hainan} fill="url(#neighborLandGrad)" stroke="#325066" strokeWidth="0.9" opacity="0.95" />
                  {/* Laos */}
                  <path d={NEIGHBORS.laos} fill="url(#neighborLandGrad)" stroke="#233a4c" strokeWidth="0.8" opacity="0.9" />
                  {/* Cambodia */}
                  <path d={NEIGHBORS.cambodia} fill="url(#neighborLandGrad)" stroke="#233a4c" strokeWidth="0.8" opacity="0.9" />
                  {/* Thailand */}
                  <path d={NEIGHBORS.thailand} fill="url(#neighborLandGrad)" stroke="#233a4c" strokeWidth="0.8" opacity="0.9" />

                  {/* Neighbor labels */}
                  <text x="560" y="80" fill="#314e62" fontSize="12" letterSpacing="0.15em" fontFamily="serif" textAnchor="middle">
                    CHINA (TRUNG HOA)
                  </text>
                  <text x="568" y="295" fill="#3e6078" fontSize="10" letterSpacing="0.1em" fontFamily="serif" textAnchor="middle">
                    ĐẢO HẢI NAM
                  </text>
                  <text x="568" y="309" fill="#2d495c" fontSize="8" textAnchor="middle">
                    (Hainan Dao)
                  </text>
                  <text x="210" y="320" fill="#314e62" fontSize="11" letterSpacing="0.15em" fontFamily="serif" textAnchor="middle">
                    LAOS (VƯƠNG QUỐC LÀO)
                  </text>
                  <text x="180" y="710" fill="#314e62" fontSize="11" letterSpacing="0.15em" fontFamily="serif" textAnchor="middle">
                    CAMBODIA (CHÂN LẠP)
                  </text>
                  <text x="90" y="580" fill="#2a4354" fontSize="10" letterSpacing="0.12em" fontFamily="serif" textAnchor="middle">
                    SIAM (XIÊM LA)
                  </text>
                </g>

                {/* 5. Ancient Maritime Silk Road Trade Routes */}
                {showRoutes && (
                  <g id="historicalTradeRoutes" opacity="0.65">
                    {HISTORICAL_ROUTES.map((route) => (
                      <path
                        key={route.id}
                        d={route.d}
                        fill="none"
                        stroke="#C28B49"
                        strokeWidth="1.2"
                        strokeDasharray="4,4"
                        opacity="0.6"
                      />
                    ))}
                    {/* Trade route markers / subtle sailing caravel hint */}
                    <text x="180" y="880" fill="#C28B49" fontSize="8.5" fontFamily="serif" letterSpacing="0.08em" opacity="0.8">
                      ⛵ Đường biển Phù Nam — Mã Lai
                    </text>
                    <text x="520" y="620" fill="#C28B49" fontSize="8.5" fontFamily="serif" letterSpacing="0.08em" opacity="0.8">
                      ⛵ Hải trình Champa — Biển Đông
                    </text>
                  </g>
                )}

                {/* 6. Vietnam Mainland Landmass */}
                <g id="vietnamLandmass">
                  {/* Subtle Region Highlight Wash */}
                  {activeRegion && (
                    <g opacity="0.25">
                      {activeRegion === "north" && <circle cx="280" cy="140" r="110" fill="#6D9A83" filter="url(#coastalGlow)" />}
                      {activeRegion === "delta" && <circle cx="360" cy="210" r="75" fill="#C28B49" filter="url(#coastalGlow)" />}
                      {activeRegion === "central" && <path d="M 330,300 Q 420,440 500,550 L 440,560 Q 360,440 280,310 Z" fill="#6D9A83" filter="url(#coastalGlow)" />}
                      {activeRegion === "highlands" && <circle cx="450" cy="670" r="90" fill="#B9654B" filter="url(#coastalGlow)" />}
                      {activeRegion === "south" && <circle cx="330" cy="880" r="105" fill="#6D9A83" filter="url(#coastalGlow)" />}
                    </g>
                  )}

                  {/* Primary Mainland Geometry */}
                  <path
                    d={VIETNAM_MAINLAND_PATH}
                    fill="url(#vietnamLandGrad)"
                    stroke="#43728f"
                    strokeWidth="1.2"
                    className="transition-all duration-300"
                  />

                  {/* Major Coastal Islands (Phú Quốc, Côn Đảo, Cát Bà, Lý Sơn, Phú Quý) */}
                  {VIETNAM_ISLANDS.map((isle, i) => (
                    <g key={i}>
                      <path d={isle.d} fill="url(#vietnamLandGrad)" stroke="#43728f" strokeWidth="0.9" />
                      {isle.name !== "Island" && (
                        <text
                          x={isle.center[0] + 8}
                          y={isle.center[1] + 3}
                          fill="#7da0b3"
                          fontSize="7.5"
                          fontFamily="sans-serif"
                          opacity="0.85"
                        >
                          {isle.name}
                        </text>
                      )}
                    </g>
                  ))}
                </g>

                {/* 7. Topographical Relief (Mountain ranges & alluvial river deltas) */}
                {showTopography && (
                  <g id="topographyRelief" opacity="0.75" pointerEvents="none">
                    {/* Northwest Mountains / Hoàng Liên Sơn */}
                    <path d={RELIEF_TERRAIN.northwest} fill="#1c3647" opacity="0.45" />
                    <text x="210" y="120" fill="#466f87" fontSize="8" fontFamily="serif" letterSpacing="0.08em">
                      ▲ Hoàng Liên Sơn (Fansipan)
                    </text>

                    {/* Annamite Range / Dãy Trường Sơn */}
                    <path d={RELIEF_TERRAIN.truongSon} fill="#183140" opacity="0.5" />
                    <text
                      x="355"
                      y="435"
                      fill="#466f87"
                      fontSize="8"
                      fontFamily="serif"
                      letterSpacing="0.1em"
                      transform="rotate(50 355 435)"
                    >
                      ▲ DÃY TRƯỜNG SƠN (ANNAMITE RANGE)
                    </text>

                    {/* Central Highlands Plateau (Tây Nguyên) */}
                    <path d={RELIEF_TERRAIN.highlands} fill="#1c3647" opacity="0.4" />
                    <text x="445" y="660" fill="#466f87" fontSize="8" fontFamily="serif" letterSpacing="0.08em" textAnchor="middle">
                      Cao nguyên Tây Nguyên
                    </text>

                    {/* Red River Delta (Alluvial plain) */}
                    <path d={RELIEF_TERRAIN.redRiverDelta} fill="#183d38" opacity="0.35" />

                    {/* Mekong River Delta (Alluvial plain) */}
                    <path d={RELIEF_TERRAIN.mekongDelta} fill="#183d38" opacity="0.35" />
                  </g>
                )}

                {/* 8. Hydrology / Rivers Network */}
                <g id="riverSystems">
                  {RIVERS.map((r, i) => (
                    <path
                      key={i}
                      d={r.d}
                      fill="none"
                      stroke="url(#riverGrad)"
                      strokeWidth={r.name.includes("Mekong") || r.name.includes("Hong") ? "1.4" : "0.9"}
                      opacity="0.8"
                    />
                  ))}
                  {/* River Labels */}
                  <text x="360" y="215" fill="#4a7d9b" fontSize="7.5" fontStyle="italic">S. Hồng</text>
                  <text x="300" y="810" fill="#4a7d9b" fontSize="7.5" fontStyle="italic">S. Tiền & S. Hậu</text>
                </g>

                {/* 9. Oceanic Archipelagos (Hoàng Sa & Trường Sa) */}
                {showGraticule && (
                  <g id="archipelagos">
                    {/* Quần đảo Hoàng Sa (Paracels) */}
                    <g id="hoangSaGroup">
                      <rect x="660" y="420" width="130" height="90" fill="#0c1f2e" opacity="0.35" rx="6" stroke="#254359" strokeWidth="0.6" strokeDasharray="2,2" />
                      <text x="725" y="438" fill="#F0E9D9" fontSize="10" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.08em">
                        QUẦN ĐẢO HOÀNG SA
                      </text>
                      <text x="725" y="450" fill="#5b829b" fontSize="7.5" textAnchor="middle">
                        (Paracel Islands)
                      </text>
                      {PARACEL_ISLANDS.map((isle, i) => (
                        <g key={i}>
                          <circle cx={isle.pos[0]} cy={isle.pos[1]} r={isle.r} fill="#6D9A83" stroke="#F0E9D9" strokeWidth="0.6" />
                          <circle cx={isle.pos[0]} cy={isle.pos[1]} r={isle.r + 3} fill="none" stroke="#6D9A83" strokeWidth="0.4" opacity="0.5" strokeDasharray="1,1" />
                        </g>
                      ))}
                    </g>

                    {/* Quần đảo Trường Sa (Spratlys) */}
                    <g id="truongSaGroup">
                      <rect x="660" y="780" width="155" height="150" fill="#0c1f2e" opacity="0.35" rx="6" stroke="#254359" strokeWidth="0.6" strokeDasharray="2,2" />
                      <text x="735" y="800" fill="#F0E9D9" fontSize="10" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="0.08em">
                        QUẦN ĐẢO TRƯỜNG SA
                      </text>
                      <text x="735" y="812" fill="#5b829b" fontSize="7.5" textAnchor="middle">
                        (Spratly Islands)
                      </text>
                      {SPRATLY_ISLANDS.map((isle, i) => (
                        <g key={i}>
                          <circle cx={isle.pos[0]} cy={isle.pos[1]} r={isle.r} fill="#6D9A83" stroke="#F0E9D9" strokeWidth="0.6" />
                          <circle cx={isle.pos[0]} cy={isle.pos[1]} r={isle.r + 3} fill="none" stroke="#6D9A83" strokeWidth="0.4" opacity="0.5" strokeDasharray="1,1" />
                        </g>
                      ))}
                    </g>
                  </g>
                )}

                {/* 10. Major Maritime Labels */}
                <g id="maritimeLabels" opacity="0.85">
                  <text x="680" y="340" fill="#4a7694" fontSize="16" fontFamily="serif" letterSpacing="0.25em" fontWeight="bold" textAnchor="middle">
                    BIỂN ĐÔNG
                  </text>
                  <text x="680" y="358" fill="#36586f" fontSize="9.5" letterSpacing="0.1em" textAnchor="middle">
                    (EAST SEA / SOUTH CHINA SEA)
                  </text>

                  <text x="470" y="240" fill="#3e647e" fontSize="11" fontFamily="serif" letterSpacing="0.12em" textAnchor="middle">
                    VỊNH BẮC BỘ
                  </text>
                  <text x="470" y="253" fill="#2d495c" fontSize="8" textAnchor="middle">
                    (Gulf of Tonkin)
                  </text>

                  <text x="140" y="930" fill="#3e647e" fontSize="11" fontFamily="serif" letterSpacing="0.12em" textAnchor="middle">
                    VỊNH THÁI LAN
                  </text>
                  <text x="140" y="943" fill="#2d495c" fontSize="8" textAnchor="middle">
                    (Gulf of Thailand)
                  </text>
                </g>

                {/* 11. Regional Context Labels */}
                <g id="regionalLabels" opacity="0.65" pointerEvents="none">
                  {REGION_LABELS.map((rl) => {
                    const isHovered = hoveredRegion === rl.id || selectedRegion === rl.id;
                    return (
                      <g key={rl.id} className="transition-opacity duration-200">
                        <text
                          x={rl.x}
                          y={rl.y}
                          fill={isHovered ? "#C28B49" : "#688d9e"}
                          fontSize={isHovered ? "11" : "9.5"}
                          fontWeight="bold"
                          letterSpacing="0.1em"
                          textAnchor="middle"
                          fontFamily="serif"
                        >
                          {rl.vi.toUpperCase()}
                        </text>
                        <text
                          x={rl.x}
                          y={rl.y + 11}
                          fill={isHovered ? "#F0E9D9" : "#496877"}
                          fontSize="7"
                          textAnchor="middle"
                        >
                          {rl.sub}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* 12. Active Expedition Vector line from Hanoi HQ */}
                {activeExpeditionTarget && (
                  <g id="activeExpeditionVector">
                    <line
                      x1={HANOI_HQ.x}
                      y1={HANOI_HQ.y}
                      x2={activeExpeditionTarget.x}
                      y2={activeExpeditionTarget.y}
                      stroke="#C28B49"
                      strokeWidth="2"
                      strokeDasharray="6,4"
                      className="expedition-vector"
                    />
                    {/* Glowing Traveling Dot */}
                    <circle
                      cx={(HANOI_HQ.x + activeExpeditionTarget.x) / 2}
                      cy={(HANOI_HQ.y + activeExpeditionTarget.y) / 2}
                      r="4"
                      fill="#F0E9D9"
                      stroke="#C28B49"
                      strokeWidth="1.5"
                    />
                  </g>
                )}

                {/* 13. Hanoi HQ Landmark Pin */}
                <g id="hanoiHqPin" transform={`translate(${HANOI_HQ.x}, ${HANOI_HQ.y})`}>
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#C28B49" strokeWidth="0.8" opacity="0.4" className="beacon-pulse" />
                  <circle cx="0" cy="0" r="4.5" fill="#C28B49" stroke="#F0E9D9" strokeWidth="1.2" />
                  <polygon
                    points="0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2"
                    fill="#F0E9D9"
                  />
                  {/* Label badge */}
                  <rect x="-32" y="-22" width="64" height="14" rx="3" fill="#0b1822" stroke="#C28B49" strokeWidth="0.8" opacity="0.9" />
                  <text x="0" y="-12" fill="#C28B49" fontSize="8" fontWeight="bold" textAnchor="middle">
                    Hà Nội HQ
                  </text>
                </g>

                {/* 14. Archaeological Site Markers (Pins) */}
                <g id="siteMarkers">
                  {SITES.map((site) => {
                    const coords = SITE_COORDS[site.id];
                    if (!coords) return null;
                    const unlocked = s.siteUnlocked.includes(site.id);
                    const regionOk = s.regionUnlocked.includes(site.region);
                    const isSelected = selected?.id === site.id;
                    const isHovered = hoveredSite?.id === site.id;
                    const isFiltered = selectedRegion === "all" || selectedRegion === site.region;

                    const status: "available" | "unlockable" | "region-locked" = !regionOk
                      ? "region-locked"
                      : unlocked
                      ? "available"
                      : "unlockable";

                    return (
                      <g
                        key={site.id}
                        transform={`translate(${coords.x}, ${coords.y})`}
                        onClick={() => {
                          setSelected(site);
                          playDiscoverySound();
                        }}
                        onMouseEnter={() => setHoveredSite(site)}
                        onMouseLeave={() => setHoveredSite(null)}
                        className="cursor-pointer transition-transform duration-200"
                        opacity={isFiltered ? 1 : 0.4}
                        filter="url(#pinShadow)"
                      >
                        {/* Radar wave when available */}
                        {status === "available" && (
                          <circle cx="0" cy="0" r="6" fill="none" stroke="#C28B49" strokeWidth="1" className="beacon-pulse" />
                        )}

                        {/* Outer Pin Halo */}
                        <circle
                          cx="0"
                          cy="0"
                          r={isSelected ? 10 : isHovered ? 9 : 7}
                          fill={
                            status === "available"
                              ? isSelected ? "#e6a858" : "#C28B49"
                              : status === "unlockable"
                              ? "#1b3540"
                              : "#152028"
                          }
                          stroke={
                            status === "available"
                              ? "#F0E9D9"
                              : status === "unlockable"
                              ? "#6D9A83"
                              : "#39505e"
                          }
                          strokeWidth={isSelected ? 2 : 1.5}
                          strokeDasharray={status === "region-locked" ? "2,2" : undefined}
                          className="transition-all duration-150"
                        />

                        {/* Center Dot or Significance Star */}
                        <circle
                          cx="0"
                          cy="0"
                          r={status === "available" ? 2.5 : 2}
                          fill={status === "available" ? "#121d25" : status === "unlockable" ? "#6D9A83" : "#4a6578"}
                        />

                        {/* Leader label badge */}
                        <g transform={`translate(${coords.labelDx}, ${coords.labelDy})`} pointerEvents="none">
                          <rect
                            x={coords.labelDx < 0 ? -110 : 0}
                            y="-9"
                            width="110"
                            height="18"
                            rx="3"
                            fill="#08141d"
                            stroke={isSelected ? "#C28B49" : isHovered ? "#F0E9D9" : "#243d4f"}
                            strokeWidth={isSelected ? "1.2" : "0.7"}
                            opacity="0.95"
                          />
                          <text
                            x={coords.labelDx < 0 ? -55 : 55}
                            y="3"
                            fill={isSelected ? "#F0E9D9" : isHovered ? "#F0E9D9" : "#B8C7C9"}
                            fontSize="8"
                            fontWeight={isSelected || isHovered ? "bold" : "500"}
                            textAnchor="middle"
                          >
                            {site.name.length > 17 ? site.name.slice(0, 16) + "…" : site.name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* 15. Cartographic Accents: Antique Windrose Compass & Scale Bar */}
                <g id="cartographicCompass" transform="translate(730, 140)" opacity="0.85">
                  {/* Outer Rings */}
                  <circle cx="0" cy="0" r="38" fill="#091823" opacity="0.6" stroke="#254359" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="34" fill="none" stroke="#C28B49" strokeWidth="0.6" strokeDasharray="1.5,1.5" />
                  <circle cx="0" cy="0" r="26" fill="none" stroke="#254359" strokeWidth="0.5" />

                  {/* 8-Pointed Star Compass Rose */}
                  {/* North Point (Bronze) */}
                  <polygon points="0,0 -4,-8 0,-30 4,-8" fill="#C28B49" stroke="#F0E9D9" strokeWidth="0.4" />
                  <polygon points="0,0 0,-30 -4,-8" fill="#a07238" />
                  {/* South Point */}
                  <polygon points="0,0 -3,6 0,24 3,6" fill="#32546a" stroke="#F0E9D9" strokeWidth="0.3" />
                  {/* East Point */}
                  <polygon points="0,0 6,-3 24,0 6,3" fill="#32546a" stroke="#F0E9D9" strokeWidth="0.3" />
                  {/* West Point */}
                  <polygon points="0,0 -6,-3 -24,0 -6,3" fill="#32546a" stroke="#F0E9D9" strokeWidth="0.3" />

                  {/* Intercardinal Points */}
                  <polygon points="0,0 4,-4 16,-16 2,-2" fill="#203a4b" />
                  <polygon points="0,0 -4,-4 -16,-16 -2,-2" fill="#203a4b" />
                  <polygon points="0,0 4,4 16,16 2,2" fill="#203a4b" />
                  <polygon points="0,0 -4,4 -16,16 -2,2" fill="#203a4b" />

                  {/* North Arrow Tag */}
                  <text x="0" y="-34" fill="#C28B49" fontSize="10" fontWeight="bold" fontFamily="serif" textAnchor="middle">
                    N
                  </text>
                  <text x="0" y="32" fill="#4f7287" fontSize="7" textAnchor="middle">S</text>
                  <text x="32" y="2.5" fill="#4f7287" fontSize="7" textAnchor="middle">E</text>
                  <text x="-32" y="2.5" fill="#4f7287" fontSize="7" textAnchor="middle">W</text>
                </g>

                {/* 16. Archival Chart Title & Scale Block (Cartouche) */}
                <g id="cartoucheTitle" transform="translate(24, 930)" opacity="0.9">
                  <rect x="0" y="0" width="180" height="52" rx="4" fill="#08141d" stroke="#254359" strokeWidth="0.8" opacity="0.9" />
                  <text x="10" y="16" fill="#C28B49" fontSize="9" fontWeight="bold" fontFamily="serif" letterSpacing="0.08em">
                    BẢN ĐỒ THÁM HIỂM KHẢO CỔ
                  </text>
                  <text x="10" y="28" fill="#7190a2" fontSize="7.2" fontFamily="sans-serif">
                    Archaeological Survey Chart · 8°N–24°N
                  </text>
                  {/* Metric Bar Scale */}
                  <g transform="translate(10, 36)">
                    <rect x="0" y="0" width="140" height="3" fill="#1b303f" stroke="#486e87" strokeWidth="0.5" />
                    <rect x="0" y="0" width="35" height="3" fill="#C28B49" />
                    <rect x="70" y="0" width="35" height="3" fill="#C28B49" />
                    <text x="0" y="10" fill="#52788f" fontSize="6.5">0</text>
                    <text x="70" y="10" fill="#52788f" fontSize="6.5">250 km</text>
                    <text x="140" y="10" fill="#52788f" fontSize="6.5">500 km</text>
                  </g>
                </g>
              </g>
            </svg>

            {/* Floating Marker Quick-Hover Card */}
            {hoveredSite && (
              <div
                className="absolute z-30 pointer-events-none panel p-2.5 bg-[#091520]/95 border-[#C28B49]/60 shadow-xl max-w-xs transition-opacity duration-150 rise-in"
                style={{
                  left: `${(SITE_COORDS[hoveredSite.id]?.x / MAP_DIMENSIONS.width) * 100}%`,
                  top: `${(SITE_COORDS[hoveredSite.id]?.y / MAP_DIMENSIONS.height) * 100}%`,
                  transform: "translate(-50%, -125%)",
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b hairline pb-1 mb-1.5">
                  <span className="font-display text-xs text-[#F0E9D9] font-semibold">{hoveredSite.name}</span>
                  <span className="tag text-[0.6rem] !py-0 !px-1 text-[#C28B49] border-[#C28B49]/40">
                    ★ {hoveredSite.significance}/10
                  </span>
                </div>
                <p className="text-[0.68rem] text-[#A2B0B2] line-clamp-2 mb-1.5 leading-snug">{hoveredSite.desc}</p>
                <div className="flex items-center justify-between text-[0.65rem] text-[#7d99a8]">
                  <span>{REGIONS.find((r) => r.id === hoveredSite.region)?.name}</span>
                  <span className="font-medium text-[#C28B49]">~{fmt(hoveredSite.baseCost)} đ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Region Commission / Unlock Action Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t hairline">
          <div className="text-xs text-[#A2B0B2]">
            <span className="text-[#F0E9D9] font-medium">Regional Access:</span> Expand expedition operations to new geographic zones with institutes grants.
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.filter((r) => !s.regionUnlocked.includes(r.id)).map((r) => {
              const canUnlock = s.resources.reputation >= r.requiresReputation && s.resources.cash >= r.unlockCost;
              return (
                <Tooltip
                  key={r.id}
                  text={`Commission regional access: ${r.theme}. Requires ${r.requiresReputation} reputation and ${fmt(r.unlockCost)} đ.`}
                >
                  <button
                    className={`btn text-xs ${canUnlock ? "btn-jade" : "btn-ghost opacity-60"}`}
                    disabled={!canUnlock}
                    onClick={() => {
                      g.unlockRegion(r.id);
                      playCoinSound();
                    }}
                  >
                    Unlock {r.name} — {fmt(r.unlockCost)} đ · rep {r.requiresReputation}
                  </button>
                </Tooltip>
              );
            })}
            {REGIONS.every((r) => s.regionUnlocked.includes(r.id)) && (
              <span className="tag text-xs text-[#6D9A83] border-[#6D9A83]/40">
                ✓ All regional survey permits secured
              </span>
            )}
          </div>
        </div>
      </Panel>

      {/* Selected Site Detail Modal */}
      {selected && <SiteDetail site={selected} onClose={() => setSelected(null)} />}

      {/* Site Cards Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#A2B0B2] px-1">
          <span className="uppercase tracking-wider font-semibold text-[0.72rem] text-[#F0E9D9]">
            {selectedRegion === "all"
              ? "All Excavation Sites & Grids"
              : `Sites in ${REGIONS.find((r) => r.id === selectedRegion)?.name}`}
          </span>
          <span>Showing {filteredSites.length} of {SITES.length} sites</span>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSites.map((site) => (
            <SiteCard key={site.id} site={site} onSelect={() => setSelected(site)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteCard({ site, onSelect }: { site: Site; onSelect: () => void }) {
  const g = useGame();
  const s = g.s!;
  const unlocked = s.siteUnlocked.includes(site.id);
  const regionOk = s.regionUnlocked.includes(site.region);

  return (
    <div
      className={`panel p-0 overflow-hidden transition-all duration-200 hover:border-[#C28B49]/40 ${
        !regionOk ? "opacity-55" : ""
      }`}
    >
      <div
        className="h-28 bg-cover bg-center border-b hairline relative cursor-pointer group"
        style={{ backgroundImage: `url(${site.image ?? "/assets/sites/DEFAULT.jpg"})` }}
        onClick={onSelect}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#09131B] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        {!regionOk && (
          <div className="absolute inset-0 bg-[#09131B]/70 flex items-center justify-center text-xs text-[#A2B0B2] font-medium backdrop-blur-[1px]">
            🔒 Region Locked — Secure permit above
          </div>
        )}
        <div className="absolute top-2 left-2 tag bg-[#0b1822]/90 border hairline backdrop-blur-sm text-[0.65rem]">
          {site.status === "fictional" ? "Fictional scenario" : "Real site (surveyed)"}
        </div>
        <div className="absolute bottom-2 right-2 tag bg-[#0b1822]/90 border hairline text-[#C28B49] text-[0.65rem]">
          ★ Sig {site.significance}/10
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-baseline">
          <h3
            className="font-display text-lg hover:text-[#C28B49] cursor-pointer transition-colors"
            onClick={onSelect}
          >
            {site.name}
          </h3>
          <span className="text-xs text-[#A2B0B2]">{REGIONS.find((r) => r.id === site.region)?.name}</span>
        </div>
        <p className="text-xs text-[#A2B0B2] mt-1 line-clamp-2">{site.desc}</p>
        <div className="flex gap-3 mt-2 num text-[0.7rem] text-[#A2B0B2]">
          <Tooltip text="Historical significance (1–10): drives artifact value and institute grant payout.">
            <span>Sig {site.significance}</span>
          </Tooltip>
          <Tooltip text="Difficulty: cost and worker skill requirement (1–5).">
            <span>D{site.difficulty}</span>
          </Tooltip>
          <Tooltip text="Environmental risk (1–5): mishaps and preservation challenges during excavation.">
            <span>R{site.risk}</span>
          </Tooltip>
          <Tooltip text="Base expedition budget anchor.">
            <span>~{fmt(site.baseCost)} đ</span>
          </Tooltip>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {site.artifactCategories.map((c) => (
            <span key={c} className="tag text-[0.65rem]">
              {CATEGORY_LABELS[c]}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          {unlocked ? (
            <button
              className="btn btn-primary w-full justify-center"
              onClick={() => {
                g.setPlan(defaultPlan(site.id));
                g.setScreen("expedition");
              }}
            >
              Plan expedition
            </button>
          ) : regionOk ? (
            <Tooltip
              text={
                s.resources.reputation >= site.requiresReputation
                  ? `Pays for land survey agreements and excavation permit. ${fmt(site.unlockCost)} đ.`
                  : `Requires ${site.requiresReputation} reputation to negotiate access (current: ${s.resources.reputation}).`
              }
            >
              <button
                className="btn btn-jade w-full justify-center"
                disabled={s.resources.reputation < site.requiresReputation || s.resources.cash < site.unlockCost}
                onClick={() => {
                  g.setPlan(defaultPlan(site.id));
                  g.unlockSite(site.id);
                  playCoinSound();
                  g.setScreen("expedition");
                }}
              >
                Unlock — {fmt(site.unlockCost)} đ
              </button>
            </Tooltip>
          ) : (
            <button className="btn btn-ghost w-full justify-center" disabled>
              Region locked
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SiteDetail({ site, onClose }: { site: Site; onClose: () => void }) {
  const g = useGame();
  const s = g.s!;
  const unlocked = s.siteUnlocked.includes(site.id);
  const regionOk = s.regionUnlocked.includes(site.region);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="panel-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto rise-in border-[#C28B49]/40 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-40 bg-cover bg-center border-b hairline relative"
          style={{ backgroundImage: `url(${site.image ?? "/assets/sites/DEFAULT.jpg"})` }}
        >
          <button
            className="btn btn-ghost absolute top-2 right-2 !py-0.5 !px-2 bg-[#09131B]/80 backdrop-blur-sm"
            onClick={onClose}
          >
            Close ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09131B] via-[#09131B]/80 to-transparent p-5">
            <h3 className="font-display text-2xl text-[#F0E9D9]">{site.name}</h3>
            <span className="text-xs text-[#C28B49] font-medium">
              {REGIONS.find((r) => r.id === site.region)?.name} · Historical Archaeology
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="tag">
              {site.status === "fictional" ? "Fictional scenario" : "Real site — fictionalized expedition model"}
            </span>
            <span className="tag">{REGIONS.find((r) => r.id === site.region)?.name}</span>
            {site.eras.map((e) => (
              <span key={e} className="tag text-[#C28B49] border-[#C28B49]/40">
                {ERA_LABELS[e]}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#F0E9D9]/85 mb-4 leading-relaxed">{site.desc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 num text-sm">
            <KV k="Historical significance" v={`${site.significance}/10`} tip="How important finds here might be." />
            <KV
              k="Data quality"
              v={`${site.dataQuality}/10`}
              tip="How well the area is already documented — affects context quality."
            />
            <KV k="Difficulty" v={`${site.difficulty}/5`} tip="Drives expedition cost per day." />
            <KV k="Environmental risk" v={`${site.risk}/5`} tip="Chance of mishaps that damage finds." />
            <KV k="Base cost" v={`≈ ${fmt(site.baseCost)} đ`} tip="Cost anchor; your plan multiplies this." />
            <KV
              k="Rep needed"
              v={site.requiresReputation.toString()}
              tip="Institute reputation required to operate here."
            />
          </div>
          <div className="mt-4 text-xs text-[#A2B0B2]">
            <div className="uppercase tracking-wider mb-1 font-semibold text-[#F0E9D9]">Potential grants</div>
            {site.grants.join(" · ")}
          </div>
          <div className="mt-5 flex justify-end gap-3 pt-3 border-t hairline">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            {unlocked ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  g.setPlan(defaultPlan(site.id));
                  g.setScreen("expedition");
                  onClose();
                }}
              >
                Plan expedition here →
              </button>
            ) : regionOk ? (
              <button
                className="btn btn-jade"
                disabled={s.resources.reputation < site.requiresReputation || s.resources.cash < site.unlockCost}
                onClick={() => {
                  g.setPlan(defaultPlan(site.id));
                  g.unlockSite(site.id);
                  playCoinSound();
                  g.setScreen("expedition");
                  onClose();
                }}
              >
                Unlock site — {fmt(site.unlockCost)} đ
              </button>
            ) : (
              <button className="btn btn-ghost" disabled>
                Region locked
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, tip }: { k: string; v: string; tip: string }) {
  return (
    <Tooltip text={tip}>
      <div className="border hairline rounded p-2.5 bg-[#091520]/60 cursor-help hover:border-[#C28B49]/40 transition-colors">
        <div className="text-[0.62rem] uppercase tracking-wider text-[#A2B0B2] mb-0.5">{k}</div>
        <div className="num font-semibold text-[#F0E9D9]">{v}</div>
      </div>
    </Tooltip>
  );
}
