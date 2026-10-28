"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt } from "@/game/engine/core";
import { REGIONS, SITES, ERA_LABELS, CATEGORY_LABELS } from "@/game/data/world";
import type { Site, ExpeditionPlan, RegionId } from "@/game/engine/types";
import { playDiscoverySound, playCoinSound } from "@/game/sound";
import {
  PIXEL_MAP_DIMS,
  VIETNAM_STEPPED_PATH,
  REGION_BIOMES,
  PIXEL_SITE_COORDS,
  PIXEL_HANOI_HQ,
  PIXEL_ISLANDS,
  PIXEL_ARCHIPELAGOS,
  PIXEL_RIVERS,
  PIXEL_PEAKS,
  PIXEL_TREES,
} from "./PixelMapData";

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
    return PIXEL_SITE_COORDS[targetSiteId] || null;
  }, [s.expedition]);

  const isDrySeason = (s.day % 60) < 30;

  return (
    <div className="space-y-4">
      <Panel
        title="Overworld Map"
        sub="Pixel art exploration theater of Vietnam. Select excavation grids, monitor active expeditions, and unlock regional field permits."
      >
        {/* Header HUD: Region Filters & Season Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 text-xs">
          {/* Region Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-[#A2B0B2] text-[0.68rem] uppercase tracking-wider mr-1"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
            >
              ZONE:
            </span>
            <button
              onClick={() => setSelectedRegion("all")}
              className={`px-2 py-1 text-[0.68rem] transition-colors border ${
                selectedRegion === "all"
                  ? "bg-[#C28B49] text-[#0a0e14] font-bold border-[#C28B49] shadow-sm"
                  : "bg-[#0f1d27] text-[#A2B0B2] border-[#22394a] hover:border-[#C28B49]/50"
              }`}
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.48rem" }}
            >
              ALL ({SITES.length})
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
                  className={`px-2 py-1 text-[0.68rem] transition-colors border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#C28B49] text-[#0a0e14] font-bold border-[#C28B49]"
                      : isUnlocked
                      ? "bg-[#0f1d27] text-[#A2B0B2] border-[#22394a] hover:border-[#C28B49]/50"
                      : "bg-[#091219] text-[#556b7a] border-transparent hover:border-[#1e303d]"
                  }`}
                  style={{ fontFamily: "var(--font-pixel)", fontSize: "0.48rem" }}
                >
                  <span>{r.name.replace(" Vietnam", "").replace("River ", "")}</span>
                  {!isUnlocked && <span className="text-[0.55rem] text-[#e04040]">🔒</span>}
                </button>
              );
            })}
          </div>

          {/* Season & Expedition Status Badge */}
          <div className="flex items-center gap-2">
            {s.expedition?.phase === "active" && (
              <div className="bg-[#12281e] border border-[#4da87a] px-2.5 py-1 text-[0.65rem] text-[#6ee7b7] flex items-center gap-1.5 animate-pulse">
                <span>⛏️</span>
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}>
                  DIG IN PROGRESS · D{s.expedition.elapsedDays}/{s.expedition.totalDays}
                </span>
              </div>
            )}
            <Tooltip
              text={
                isDrySeason
                  ? "Northeast Monsoon (Mùa Khô): Dry winds across Biển Đông. Safer coastal transit and river excavation."
                  : "Southwest Monsoon (Mùa Mưa): Tropical rains and river flooding. Higher preservation risk."
              }
            >
              <div
                className="bg-[#0b1822] border hairline px-2.5 py-1 text-xs text-[#A2B0B2] flex items-center gap-1.5 cursor-help"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.48rem" }}
              >
                <span className="text-[#C28B49]">{isDrySeason ? "☀️" : "🌧️"}</span>
                <span className="text-[#F0E9D9]">
                  {isDrySeason ? "MÙA KHÔ (DRY)" : "MÙA MƯA (MONSOON)"}
                </span>
              </div>
            </Tooltip>
          </div>
        </div>

        {/* The 16-Bit Pixel Art Overworld Canvas */}
        <div className="relative border-2 border-[#c89b3c]/60 overflow-hidden bg-[#07131e] shadow-2xl">
          {/* Subtle CRT Scanlines Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
            }}
          />

          <div
            className="w-full relative"
            style={{
              aspectRatio: `${PIXEL_MAP_DIMS.width} / ${PIXEL_MAP_DIMS.height}`,
              maxHeight: "740px",
              minHeight: "480px",
            }}
          >
            <svg
              viewBox={`0 0 ${PIXEL_MAP_DIMS.width} ${PIXEL_MAP_DIMS.height}`}
              className="absolute inset-0 w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
              shapeRendering="crispEdges"
              style={{ imageRendering: "pixelated" }}
            >
              <defs>
                {/* Pixel scanline & animation keyframes */}
                <style>{`
                  @keyframes marchDots {
                    0% { stroke-dashoffset: 16; }
                    100% { stroke-dashoffset: 0; }
                  }
                  @keyframes reticlePulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.15); opacity: 1; }
                  }
                  @keyframes waveDrift {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(4px); }
                  }
                  .march-route {
                    animation: marchDots 1.2s linear infinite;
                  }
                  .target-reticle {
                    animation: reticlePulse 1.8s ease-in-out infinite;
                  }
                  .pixel-wave {
                    animation: waveDrift 3s ease-in-out infinite;
                  }
                `}</style>

                {/* Ocean Grid Pattern */}
                <pattern id="pixelOceanPattern" width="32" height="32" patternUnits="userSpaceOnUse">
                  <rect width="32" height="32" fill="#091824" />
                  <rect x="0" y="0" width="32" height="1" fill="#0c1f2e" />
                  <rect x="0" y="0" width="1" height="32" fill="#0c1f2e" />
                  {/* Subtle 2x1 wave sparks */}
                  <rect x="6" y="14" width="3" height="1" fill="#143247" />
                  <rect x="22" y="28" width="4" height="1" fill="#143247" />
                </pattern>
              </defs>

              {/* 1. Deep Ocean Background (Biển Đông) */}
              <rect width={PIXEL_MAP_DIMS.width} height={PIXEL_MAP_DIMS.height} fill="url(#pixelOceanPattern)" />

              {/* 2. Coastal Shelf / Shallow Water halo around Vietnam */}
              <polygon
                points={VIETNAM_STEPPED_PATH}
                fill="none"
                stroke="#15364a"
                strokeWidth="20"
                strokeLinejoin="miter"
              />
              <polygon
                points={VIETNAM_STEPPED_PATH}
                fill="none"
                stroke="#1e4d68"
                strokeWidth="8"
                strokeLinejoin="miter"
              />

              {/* 3. Mainland Vietnam Base Silhouette */}
              <polygon
                points={VIETNAM_STEPPED_PATH}
                fill="#162e24"
                stroke="#3d7e5d"
                strokeWidth="2"
                strokeLinejoin="miter"
              />

              {/* 4. Regional Biome Layers */}
              {Object.entries(REGION_BIOMES).map(([regId, biome]) => {
                const isHovered = activeRegion === regId;
                const isUnlocked = s.regionUnlocked.includes(regId as RegionId);
                return (
                  <g key={regId} className="transition-opacity duration-200">
                    <polygon
                      points={biome.points}
                      fill={isHovered ? "#2b6048" : isUnlocked ? biome.color : "#12201b"}
                      opacity={isHovered ? 0.95 : isUnlocked ? 0.85 : 0.6}
                      stroke={isHovered ? "#f5d26d" : biome.borderColor}
                      strokeWidth={isHovered ? 2 : 1}
                      strokeLinejoin="miter"
                      className="cursor-pointer"
                      onClick={() => setSelectedRegion(regId as RegionId)}
                      onMouseEnter={() => setHoveredRegion(regId)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    />
                  </g>
                );
              })}

              {/* 5. Pixel Rivers (Sông Hồng, Sông Thu Bồn, Sông Cửu Long) */}
              <g id="pixelRivers">
                {PIXEL_RIVERS.map((points, idx) => (
                  <polyline
                    key={idx}
                    points={points}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeLinejoin="bevel"
                    opacity="0.85"
                  />
                ))}
              </g>

              {/* 6. Pixel Mountain Peaks (Hoàng Liên Sơn & Trường Sơn) */}
              <g id="pixelPeaks" fill="#475569" stroke="#1e293b" strokeWidth="1">
                {PIXEL_PEAKS.map((p, i) => (
                  <g key={i}>
                    {/* Stepped pixel mountain icon */}
                    <polygon points={`${p.x},${p.y - 7} ${p.x - 7},${p.y + 3} ${p.x + 7},${p.y + 3}`} fill="#475569" />
                    <polygon points={`${p.x},${p.y - 7} ${p.x},${p.y + 3} ${p.x + 7},${p.y + 3}`} fill="#334155" />
                    {/* Snow / stone tip */}
                    <polygon points={`${p.x},${p.y - 7} ${p.x - 2},${p.y - 3} ${p.x + 2},${p.y - 3}`} fill="#e2e8f0" />
                  </g>
                ))}
              </g>

              {/* 7. Pixel Jungle Canopy in Highlands */}
              <g id="pixelTrees" fill="#15803d">
                {PIXEL_TREES.map((t, i) => (
                  <g key={i}>
                    <rect x={t.x - 1} y={t.y + 2} width="2" height="4" fill="#78350f" />
                    <rect x={t.x - 4} y={t.y - 2} width="8" height="4" fill="#166534" />
                    <rect x={t.x - 2} y={t.y - 5} width="4" height="3" fill="#22c55e" />
                  </g>
                ))}
              </g>

              {/* 8. Pixel Islands (Phú Quốc, Côn Đảo, Cát Bà) */}
              <g id="pixelIslands">
                {PIXEL_ISLANDS.map((isle, i) => (
                  <g key={i}>
                    {/* Stepped pixel island body */}
                    <rect
                      x={isle.x}
                      y={isle.y}
                      width={isle.w}
                      height={isle.h}
                      fill="#1f4e38"
                      stroke="#4da87a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={isle.labelPos[0]}
                      y={isle.labelPos[1]}
                      fill="#8a9ea8"
                      fontSize="7"
                      fontFamily="var(--font-pixel)"
                      textAnchor="middle"
                      letterSpacing="0.05em"
                    >
                      {isle.name}
                    </text>
                  </g>
                ))}
              </g>

              {/* 9. Pixel Archipelagos (Hoàng Sa & Trường Sa) */}
              <g id="pixelArchipelagos">
                {/* Paracels / Hoàng Sa */}
                <g>
                  <rect
                    x={PIXEL_ARCHIPELAGOS.hoangSa.bounds.x}
                    y={PIXEL_ARCHIPELAGOS.hoangSa.bounds.y}
                    width={PIXEL_ARCHIPELAGOS.hoangSa.bounds.w}
                    height={PIXEL_ARCHIPELAGOS.hoangSa.bounds.h}
                    fill="#0e2333"
                    stroke="#1d4866"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.7"
                  />
                  <text
                    x={PIXEL_ARCHIPELAGOS.hoangSa.bounds.x + 50}
                    y={PIXEL_ARCHIPELAGOS.hoangSa.bounds.y + 14}
                    fill="#f5d26d"
                    fontSize="7"
                    fontFamily="var(--font-pixel)"
                    textAnchor="middle"
                    letterSpacing="0.08em"
                  >
                    HOÀNG SA
                  </text>
                  <text
                    x={PIXEL_ARCHIPELAGOS.hoangSa.bounds.x + 50}
                    y={PIXEL_ARCHIPELAGOS.hoangSa.bounds.y + 24}
                    fill="#62899e"
                    fontSize="6"
                    fontFamily="var(--font-pixel)"
                    textAnchor="middle"
                  >
                    PARACEL REEFS
                  </text>
                  {PIXEL_ARCHIPELAGOS.hoangSa.atolls.map((atoll, idx) => (
                    <circle
                      key={idx}
                      cx={atoll.x}
                      cy={atoll.y}
                      r={atoll.r}
                      fill="#2dd4bf"
                      stroke="#0f766e"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Spratlys / Trường Sa */}
                <g>
                  <rect
                    x={PIXEL_ARCHIPELAGOS.truongSa.bounds.x}
                    y={PIXEL_ARCHIPELAGOS.truongSa.bounds.y}
                    width={PIXEL_ARCHIPELAGOS.truongSa.bounds.w}
                    height={PIXEL_ARCHIPELAGOS.truongSa.bounds.h}
                    fill="#0e2333"
                    stroke="#1d4866"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.7"
                  />
                  <text
                    x={PIXEL_ARCHIPELAGOS.truongSa.bounds.x + 55}
                    y={PIXEL_ARCHIPELAGOS.truongSa.bounds.y + 14}
                    fill="#f5d26d"
                    fontSize="7"
                    fontFamily="var(--font-pixel)"
                    textAnchor="middle"
                    letterSpacing="0.08em"
                  >
                    TRƯỜNG SA
                  </text>
                  <text
                    x={PIXEL_ARCHIPELAGOS.truongSa.bounds.x + 55}
                    y={PIXEL_ARCHIPELAGOS.truongSa.bounds.y + 24}
                    fill="#62899e"
                    fontSize="6"
                    fontFamily="var(--font-pixel)"
                    textAnchor="middle"
                  >
                    SPRATLY ATOLLS
                  </text>
                  {PIXEL_ARCHIPELAGOS.truongSa.atolls.map((atoll, idx) => (
                    <circle
                      key={idx}
                      cx={atoll.x}
                      cy={atoll.y}
                      r={atoll.r}
                      fill="#2dd4bf"
                      stroke="#0f766e"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              </g>

              {/* 10. Water Title: BIỂN ĐÔNG (EAST SEA) */}
              <text
                x="480"
                y="240"
                fill="#2a5878"
                fontSize="12"
                fontFamily="var(--font-pixel)"
                letterSpacing="0.2em"
                textAnchor="middle"
                opacity="0.7"
              >
                BIỂN ĐÔNG
              </text>
              <text
                x="480"
                y="254"
                fill="#1b3f57"
                fontSize="6.5"
                fontFamily="var(--font-pixel)"
                letterSpacing="0.1em"
                textAnchor="middle"
                opacity="0.8"
              >
                EAST SEA
              </text>

              {/* 11. Active Expedition Marching Route from Hanoi HQ */}
              {activeExpeditionTarget && (
                <g id="activeExpeditionMarch">
                  <line
                    x1={PIXEL_HANOI_HQ.x}
                    y1={PIXEL_HANOI_HQ.y}
                    x2={activeExpeditionTarget.x}
                    y2={activeExpeditionTarget.y}
                    stroke="#f5d26d"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    className="march-route"
                  />
                  {/* Bouncing Traveler Footstep / Dot */}
                  <circle
                    cx={(PIXEL_HANOI_HQ.x + activeExpeditionTarget.x) / 2}
                    cy={(PIXEL_HANOI_HQ.y + activeExpeditionTarget.y) / 2}
                    r="4"
                    fill="#ffffff"
                    stroke="#c89b3c"
                    strokeWidth="1.5"
                    className="target-reticle"
                  />
                </g>
              )}

              {/* 12. Hanoi Headquarters Landmark Pin */}
              <g
                id="hanoiHq"
                transform={`translate(${PIXEL_HANOI_HQ.x}, ${PIXEL_HANOI_HQ.y})`}
                className="select-none"
              >
                {/* Pavilion roof */}
                <polygon points="-8,-2 0,-8 8,-2 6,4 -6,4" fill="#0f766e" stroke="#f5d26d" strokeWidth="1" />
                <circle cx="0" cy="-2" r="3" fill="#f5d26d" />
                {/* Flag pole & pennant */}
                <rect x="0" y="-14" width="1.5" height="6" fill="#f5d26d" />
                <polygon points="0,-14 7,-11 0,-8" fill="#e11d48" />
                {/* HQ Badge */}
                <rect x="-30" y="6" width="60" height="12" fill="#0b1620" stroke="#f5d26d" strokeWidth="1" />
                <text
                  x="0"
                  y="14"
                  fill="#f5d26d"
                  fontSize="5.5"
                  fontFamily="var(--font-pixel)"
                  textAnchor="middle"
                >
                  HÀ NỘI HQ
                </text>
              </g>

              {/* 13. Pixel Art Archaeological Sites (Landmarks) */}
              <g id="pixelSiteLandmarks">
                {SITES.map((site) => {
                  const coords = PIXEL_SITE_COORDS[site.id];
                  if (!coords) return null;
                  const unlocked = s.siteUnlocked.includes(site.id);
                  const regionOk = s.regionUnlocked.includes(site.region);
                  const isSelected = selected?.id === site.id;
                  const isHovered = hoveredSite?.id === site.id;
                  const isFiltered = selectedRegion === "all" || selectedRegion === site.region;
                  const isExcavating = s.expedition?.phase === "active" && s.expedition.plan.siteId === site.id;

                  const status = !regionOk ? "locked" : unlocked ? "ready" : "permit";

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
                      className="cursor-pointer"
                      opacity={isFiltered ? 1 : 0.4}
                    >
                      {/* Selection / Active Radar Target Reticle */}
                      {(isSelected || isHovered || isExcavating) && (
                        <g className="target-reticle">
                          <rect
                            x="-14"
                            y="-14"
                            width="28"
                            height="28"
                            fill="none"
                            stroke={isExcavating ? "#4da87a" : "#f5d26d"}
                            strokeWidth="1.5"
                            strokeDasharray="4,4"
                          />
                          {/* Corner brackets */}
                          <path d="M-14,-10 L-14,-14 L-10,-14" fill="none" stroke="#f5d26d" strokeWidth="2" />
                          <path d="M10,-14 L14,-14 L14,-10" fill="none" stroke="#f5d26d" strokeWidth="2" />
                          <path d="M-14,10 L-14,14 L-10,14" fill="none" stroke="#f5d26d" strokeWidth="2" />
                          <path d="M10,14 L14,14 L14,10" fill="none" stroke="#f5d26d" strokeWidth="2" />
                        </g>
                      )}

                      {/* Pixel Art Landmark Graphic according to site icon type */}
                      <g>
                        {coords.icon === "castle" && (
                          /* Cổ Loa Triple Rampart Citadel */
                          <g>
                            <rect x="-8" y="-3" width="16" height="9" fill="#52525b" stroke="#27272a" strokeWidth="1" />
                            <rect x="-8" y="-6" width="4" height="3" fill="#71717a" />
                            <rect x="-1" y="-6" width="3" height="3" fill="#71717a" />
                            <rect x="5" y="-6" width="3" height="3" fill="#71717a" />
                            <rect x="-2" y="1" width="4" height="5" fill="#18181b" />
                            <rect x="0" y="-12" width="1.5" height="6" fill="#f5d26d" />
                            <polygon points="0,-12 6,-9 0,-6" fill="#e11d48" />
                          </g>
                        )}

                        {coords.icon === "cave" && (
                          /* Hòa Bình Mountain Rock Shelter */
                          <g>
                            <polygon points="-9,6 -8,-4 -3,-8 3,-8 8,-4 9,6" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                            <ellipse cx="0" cy="2" rx="4" ry="4" fill="#09090b" />
                            <rect x="-1.5" y="0" width="3" height="3" fill="#ea580c" />
                            <rect x="-0.5" y="-2" width="1.5" height="2" fill="#fde047" />
                          </g>
                        )}

                        {coords.icon === "trench" && (
                          /* Liên Lậu Excavation Grid Trench */
                          <g>
                            <rect x="-8" y="-5" width="16" height="10" fill="#2d1d0e" stroke="#854d0e" strokeWidth="1" />
                            <line x1="-8" y1="0" x2="8" y2="0" stroke="#ca8a04" strokeDasharray="2,2" />
                            <circle cx="2" cy="0" r="3" fill="#c89b3c" stroke="#fef08a" strokeWidth="0.8" />
                            <rect x="-6" y="-3" width="2" height="6" fill="#92400e" />
                          </g>
                        )}

                        {coords.icon === "kiln" && (
                          /* Má Thẹn Pottery Kiln Mound */
                          <g>
                            <path d="M-7,5 L-7,0 Q-7,-7 0,-7 Q7,-7 7,0 L7,5 Z" fill="#c2410c" stroke="#431407" strokeWidth="1" />
                            <rect x="-2.5" y="0" width="5" height="5" fill="#fbbf24" />
                            {/* Smoke puffs */}
                            <circle cx="2" cy="-10" r="2" fill="#cbd5e1" opacity="0.8" />
                            <circle cx="5" cy="-14" r="2.5" fill="#cbd5e1" opacity="0.6" />
                          </g>
                        )}

                        {coords.icon === "tower" && (
                          /* Trà Kiệu Champa Brick Pagoda Tower */
                          <g>
                            <rect x="-7" y="1" width="14" height="4" fill="#991b1b" stroke="#450a0a" strokeWidth="1" />
                            <rect x="-5" y="-3" width="10" height="4" fill="#b91c1c" />
                            <rect x="-3" y="-7" width="6" height="4" fill="#dc2626" />
                            <rect x="-1" y="-11" width="2" height="4" fill="#f5d26d" />
                            <rect x="-1.5" y="1" width="3" height="4" fill="#18181b" />
                          </g>
                        )}

                        {coords.icon === "dolmen" && (
                          /* Đắk Sơn Megalithic Standing Stone */
                          <g>
                            <rect x="-4" y="-8" width="8" height="13" fill="#57534e" stroke="#1c1917" strokeWidth="1" />
                            <rect x="-1.5" y="-4" width="3" height="4" fill="#a8a29e" />
                            <rect x="-8" y="-3" width="3" height="8" fill="#44403c" />
                            <rect x="5" y="-4" width="3" height="9" fill="#44403c" />
                          </g>
                        )}

                        {coords.icon === "port" && (
                          /* Óc Eo Port & Ancient Trading Vessel */
                          <g>
                            <rect x="-9" y="1" width="8" height="3" fill="#78350f" stroke="#451a03" strokeWidth="0.8" />
                            <polygon points="-3,1 9,1 7,5 -4,5" fill="#451a03" />
                            <polygon points="0,0 7,-8 0,-8" fill="#fed7aa" stroke="#ca8a04" strokeWidth="0.6" />
                            <polygon points="-1,0 -6,-6 -1,-6" fill="#fde68a" stroke="#ca8a04" strokeWidth="0.6" />
                          </g>
                        )}
                      </g>

                      {/* Active Digging Shovel Indicator */}
                      {isExcavating && (
                        <g transform="translate(6, -10)" className="animate-bounce">
                          <rect x="0" y="0" width="2" height="6" fill="#ca8a04" />
                          <polygon points="-2,6 4,6 1,10" fill="#94a3b8" />
                        </g>
                      )}

                      {/* Site Name Label Tag */}
                      <g
                        transform={`translate(${coords.labelOffset[0]}, ${coords.labelOffset[1]})`}
                        pointerEvents="none"
                      >
                        <rect
                          x={coords.labelAnchor === "left" ? -84 : 0}
                          y="-7"
                          width="84"
                          height="14"
                          fill="#09141f"
                          stroke={isSelected ? "#f5d26d" : isHovered ? "#ffffff" : status === "ready" ? "#c89b3c" : "#22394a"}
                          strokeWidth="1"
                          opacity="0.95"
                        />
                        <text
                          x={coords.labelAnchor === "left" ? -42 : 42}
                          y="2.5"
                          fill={status === "ready" ? "#f5d26d" : status === "permit" ? "#a8b8c0" : "#64748b"}
                          fontSize="5.5"
                          fontFamily="var(--font-pixel)"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {coords.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* 14. Retro Arcade Compass Rose */}
              <g id="pixelCompass" transform="translate(485, 95)" opacity="0.9">
                <rect x="-24" y="-24" width="48" height="48" fill="#091824" stroke="#c89b3c" strokeWidth="1.5" />
                <polygon points="0,-18 3,-4 0,0 -3,-4" fill="#f5d26d" />
                <polygon points="0,18 3,4 0,0 -3,4" fill="#38546a" />
                <polygon points="18,0 4,3 0,0 4,-3" fill="#38546a" />
                <polygon points="-18,0 -4,3 0,0 -4,-3" fill="#38546a" />
                <text x="0" y="-12" fill="#f5d26d" fontSize="6.5" fontFamily="var(--font-pixel)" textAnchor="middle">
                  N
                </text>
              </g>

              {/* 15. Retro Map Cartouche */}
              <g id="pixelCartouche" transform="translate(16, 642)">
                <rect x="0" y="0" width="145" height="42" fill="#091824" stroke="#c89b3c" strokeWidth="1.5" />
                <text x="8" y="14" fill="#f5d26d" fontSize="6" fontFamily="var(--font-pixel)">
                  RELIC CAPITAL
                </text>
                <text x="8" y="24" fill="#8a9ea8" fontSize="5" fontFamily="var(--font-pixel)">
                  SURVEY THEATER
                </text>
                <text x="8" y="34" fill="#4da87a" fontSize="5" fontFamily="var(--font-pixel)">
                  SECTOR: 8°N–24°N
                </text>
              </g>
            </svg>

            {/* Hovered Site Quick Dossier Card */}
            {hoveredSite && (
              <div
                className="absolute z-30 pointer-events-none p-3 bg-[#091520]/95 border-2 border-[#c89b3c] shadow-2xl max-w-xs transition-opacity duration-150 rise-in select-none"
                style={{
                  left: `${((PIXEL_SITE_COORDS[hoveredSite.id]?.x ?? 280) / PIXEL_MAP_DIMS.width) * 100}%`,
                  top: `${((PIXEL_SITE_COORDS[hoveredSite.id]?.y ?? 350) / PIXEL_MAP_DIMS.height) * 100}%`,
                  transform: "translate(-50%, -125%)",
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#22394a] pb-1.5 mb-1.5">
                  <span
                    className="text-xs text-[#F0E9D9] font-bold truncate"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: "0.55rem" }}
                  >
                    {hoveredSite.name}
                  </span>
                  <span
                    className="tag text-[#f5d26d] border-[#f5d26d]/60 !py-0 !px-1"
                    style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
                  >
                    ★ {hoveredSite.significance}/10
                  </span>
                </div>
                <p className="text-[0.72rem] text-[#8a9ea8] line-clamp-2 mb-2 leading-relaxed font-sans">
                  {hoveredSite.desc}
                </p>
                <div
                  className="flex items-center justify-between text-[0.62rem] text-[#c89b3c]"
                  style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
                >
                  <span>{REGIONS.find((r) => r.id === hoveredSite.region)?.name}</span>
                  <span>~{fmt(hoveredSite.baseCost)} đ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Region Unlock Permits Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t hairline">
          <div className="text-xs text-[#8a9ea8]">
            <span className="text-[#F0E9D9] font-bold" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}>
              REGIONAL SURVEY PERMITS:
            </span>{" "}
            Unlock distant archaeological zones as institute reputation grows.
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
                    style={{ fontFamily: "var(--font-pixel)", fontSize: "0.48rem" }}
                  >
                    Unlock {r.name} — {fmt(r.unlockCost)} đ · rep {r.requiresReputation}
                  </button>
                </Tooltip>
              );
            })}
            {REGIONS.every((r) => s.regionUnlocked.includes(r.id)) && (
              <span className="tag text-xs text-[#6D9A83] border-[#6D9A83]/40" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.48rem" }}>
                ✓ ALL REGIONAL PERMITS SECURED
              </span>
            )}
          </div>
        </div>
      </Panel>

      {/* Selected Site Detail Modal */}
      {selected && <SiteDetail site={selected} onClose={() => setSelected(null)} />}

      {/* Excavation Sites Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8a9ea8] px-1">
          <span
            className="uppercase tracking-wider font-bold text-[#F0E9D9]"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "0.52rem" }}
          >
            {selectedRegion === "all"
              ? "ALL EXCAVATION SITES"
              : `SITES IN ${REGIONS.find((r) => r.id === selectedRegion)?.name.toUpperCase()}`}
          </span>
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}>
            {filteredSites.length} / {SITES.length} SITES AVAILABLE
          </span>
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
      className={`panel p-0 overflow-hidden transition-all duration-200 hover:border-[#C28B49] ${
        !regionOk ? "opacity-55" : ""
      }`}
    >
      <div
        className="h-28 bg-cover bg-center border-b hairline relative cursor-pointer group"
        style={{ backgroundImage: `url(${site.image ?? "/assets/sites/coloas.jpg"})`, imageRendering: "pixelated" }}
        onClick={onSelect}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#09131B] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        {!regionOk && (
          <div
            className="absolute inset-0 bg-[#09131B]/75 flex items-center justify-center text-[#e04040] font-bold p-2 text-center"
            style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
          >
            🔒 REGION LOCKED — SECURE PERMIT ABOVE
          </div>
        )}
        <div
          className="absolute top-2 left-2 tag bg-[#0b1822]/90 border hairline text-[0.6rem]"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "0.42rem" }}
        >
          {site.status === "fictional" ? "FICTIONAL MODEL" : "SURVEYED SITE"}
        </div>
        <div
          className="absolute bottom-2 right-2 tag bg-[#0b1822]/90 border hairline text-[#f5d26d] text-[0.6rem]"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
        >
          ★ SIG {site.significance}/10
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-baseline gap-2">
          <h3
            className="font-display text-base hover:text-[#C28B49] cursor-pointer transition-colors truncate"
            onClick={onSelect}
          >
            {site.name}
          </h3>
          <span className="text-[0.7rem] text-[#8a9ea8] shrink-0 font-sans">
            {REGIONS.find((r) => r.id === site.region)?.name}
          </span>
        </div>
        <p className="text-xs text-[#8a9ea8] mt-1 line-clamp-2 font-sans">{site.desc}</p>
        <div className="flex gap-3 mt-2 num text-[0.7rem] text-[#8a9ea8]">
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
            <span key={c} className="tag text-[0.62rem]" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.42rem" }}>
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
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
            >
              PLAN EXPEDITION ►
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
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
              >
                UNLOCK SITE — {fmt(site.unlockCost)} đ
              </button>
            </Tooltip>
          ) : (
            <button
              className="btn btn-ghost w-full justify-center"
              disabled
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
            >
              REGION LOCKED
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 select-none"
      onClick={onClose}
    >
      <div
        className="panel-elevated w-full max-w-2xl max-h-[90vh] overflow-y-auto rise-in border-2 border-[#C28B49] shadow-2xl bg-[#0a141d]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-40 bg-cover bg-center border-b-2 border-[#C28B49] relative"
          style={{ backgroundImage: `url(${site.image ?? "/assets/sites/coloas.jpg"})`, imageRendering: "pixelated" }}
        >
          <button
            className="btn btn-ghost absolute top-2 right-2 !py-0.5 !px-2 bg-[#09131B]/90 border hairline"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a141d] via-[#0a141d]/90 to-transparent p-5">
            <h3
              className="font-display text-2xl text-[#F0E9D9]"
              style={{ textShadow: "0 0 10px rgba(200, 155, 60, 0.5)" }}
            >
              {site.name}
            </h3>
            <span
              className="text-xs text-[#C28B49] font-bold"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
            >
              {REGIONS.find((r) => r.id === site.region)?.name} · EXCAVATION GRID
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="tag" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}>
              {site.status === "fictional" ? "FICTIONAL SCENARIO" : "DOCUMENTED REAL SITE"}
            </span>
            <span className="tag" style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}>
              {REGIONS.find((r) => r.id === site.region)?.name}
            </span>
            {site.eras.map((e) => (
              <span
                key={e}
                className="tag text-[#f5d26d] border-[#f5d26d]/60"
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
              >
                {ERA_LABELS[e]}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#F0E9D9]/90 mb-4 leading-relaxed font-sans">{site.desc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 num text-sm">
            <KV k="Significance" v={`${site.significance}/10`} tip="How important discoveries here might be." />
            <KV
              k="Data quality"
              v={`${site.dataQuality}/10`}
              tip="How well the area is already surveyed — affects context quality."
            />
            <KV k="Difficulty" v={`${site.difficulty}/5`} tip="Drives expedition cost per day." />
            <KV k="Risk level" v={`${site.risk}/5`} tip="Chance of mishaps that damage finds." />
            <KV k="Base budget" v={`≈ ${fmt(site.baseCost)} đ`} tip="Base budget multiplier anchor." />
            <KV
              k="Rep required"
              v={site.requiresReputation.toString()}
              tip="Institute reputation needed to operate here."
            />
          </div>
          <div className="mt-4 text-xs text-[#8a9ea8]">
            <div
              className="uppercase tracking-wider mb-1 font-bold text-[#F0E9D9]"
              style={{ fontFamily: "var(--font-pixel)", fontSize: "0.5rem" }}
            >
              POTENTIAL GRANTS &amp; AWARDS
            </div>
            {site.grants.join(" · ")}
          </div>
          <div className="mt-5 flex justify-end gap-3 pt-3 border-t hairline">
            <button className="btn btn-ghost" onClick={onClose}>
              Back
            </button>
            {unlocked ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  g.setPlan(defaultPlan(site.id));
                  g.setScreen("expedition");
                  onClose();
                }}
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.55rem" }}
              >
                PLAN EXPEDITION HERE ►
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
                style={{ fontFamily: "var(--font-pixel)", fontSize: "0.55rem" }}
              >
                UNLOCK SITE — {fmt(site.unlockCost)} đ
              </button>
            ) : (
              <button className="btn btn-ghost" disabled>
                Region Locked
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
      <div className="border hairline rounded-none p-2.5 bg-[#091520]/80 cursor-help hover:border-[#C28B49] transition-colors">
        <div
          className="uppercase tracking-wider text-[#8a9ea8] mb-0.5"
          style={{ fontFamily: "var(--font-pixel)", fontSize: "0.45rem" }}
        >
          {k}
        </div>
        <div className="num font-bold text-[#F0E9D9]">{v}</div>
      </div>
    </Tooltip>
  );
}
