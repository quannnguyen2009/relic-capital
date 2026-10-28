import React, { CSSProperties } from "react";
import Image from "next/image";

export type LogoVariant = "emblem" | "horizontal" | "stacked" | "badge";

interface RelicCapitalLogoProps {
  /** Size in pixels (width for emblem, or proportional scale) */
  size?: number;
  /** Layout style */
  variant?: LogoVariant;
  /** Enable subtle animated bronze glow/pulse */
  animateGlow?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Show archaeological subline */
  showSubtitle?: boolean;
}

/**
 * Relic Capital Pixel Art Logo Component
 * Authentic 16-bit retro arcade archaeological insignia:
 * - Central Đông Sơn bronze drum sun star (Mặt trời trống đồng)
 * - Concentric geometric bands & flying lac cranes (chim Lạc)
 * - Crossed archaeological excavation trowel & survey instrument
 * - Ancient square-hole cash coins (tiền đồng cổ thông bảo) for Capital
 * - Imperial lotus finial crest & "RC" seal plate
 */
export default function RelicCapitalLogo({
  size = 64,
  variant = "emblem",
  animateGlow = false,
  className = "",
  style,
  showSubtitle = true,
}: RelicCapitalLogoProps) {
  const emblemElement = (
    <div
      className={`relative inline-block select-none ${animateGlow ? "logo-glow-pulse" : ""}`}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    >
      <Image
        src="/assets/logo.svg"
        alt="Relic Capital Emblem"
        width={size}
        height={size}
        unoptimized
        priority
        className="w-full h-full object-contain"
        style={{
          imageRendering: "pixelated",
          filter: animateGlow ? "drop-shadow(0 0 10px rgba(200, 155, 60, 0.4))" : undefined,
        }}
      />
    </div>
  );

  if (variant === "emblem") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`} style={style}>
        {emblemElement}
      </div>
    );
  }

  if (variant === "horizontal") {
    const scale = size / 48;
    return (
      <div
        className={`inline-flex items-center gap-3 select-none ${className}`}
        style={{
          fontFamily: "var(--font-pixel)",
          ...style,
        }}
      >
        {emblemElement}
        <div className="flex flex-col text-left">
          <div
            className="text-glow-bronze leading-none tracking-wider font-bold"
            style={{
              fontSize: `${Math.max(0.7, 0.9 * scale)}rem`,
              color: "#e8d8b0",
              letterSpacing: "0.12em",
            }}
          >
            RELIC <span style={{ color: "#c89b3c" }}>CAPITAL</span>
          </div>
          {showSubtitle && (
            <div
              className="text-[#8a9ea8] mt-1 tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: `${Math.max(0.75, 1 * scale)}rem`,
                letterSpacing: "0.08em",
              }}
            >
              ARCHAEOLOGY · RESEARCH · FINANCE
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    const scale = size / 64;
    return (
      <div
        className={`flex flex-col items-center text-center select-none ${className}`}
        style={{
          fontFamily: "var(--font-pixel)",
          ...style,
        }}
      >
        {emblemElement}
        <div
          className="text-glow-bronze mt-3 leading-none tracking-widest font-bold"
          style={{
            fontSize: `${Math.max(0.8, 1.2 * scale)}rem`,
            color: "#e8d8b0",
          }}
        >
          RELIC <span style={{ color: "#c89b3c" }}>CAPITAL</span>
        </div>
        {/* Pixel decorative rule */}
        <div className="mt-2.5 mb-1.5 flex items-center gap-2">
          <div style={{ width: 28 * scale, height: 2, background: "var(--bronze)" }} />
          <div style={{ width: 4 * scale, height: 4 * scale, background: "var(--bronze)" }} />
          <div style={{ width: 28 * scale, height: 2, background: "var(--bronze)" }} />
        </div>
        {showSubtitle && (
          <div
            className="text-[#8a9ea8] tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: `${Math.max(0.85, 1.1 * scale)}rem`,
              letterSpacing: "0.08em",
            }}
          >
            ARCHAEOLOGICAL RESEARCH &amp; INVESTMENT STRATEGY
          </div>
        )}
      </div>
    );
  }

  // "badge" variant: bordered retro container
  return (
    <div
      className={`inline-flex items-center gap-3 p-2 bg-[#0b141d]/90 border border-[#c89b3c]/50 shadow-md ${className}`}
      style={{
        boxShadow: "inset 0 0 0 1px #2d6657, 0 4px 12px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {emblemElement}
      <div className="flex flex-col">
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "0.65rem",
            color: "#f5d26d",
            letterSpacing: "0.08em",
          }}
        >
          RELIC CAPITAL
        </span>
        <span
          style={{
            fontFamily: "var(--font-vt323)",
            fontSize: "0.85rem",
            color: "#8a9ea8",
          }}
        >
          INSTITUTE ARCHIVE
        </span>
      </div>
    </div>
  );
}
