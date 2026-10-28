"use client";

import React, { CSSProperties } from "react";
import Image from "next/image";
import { DoctorId, DOCTORS } from "./avatarData";

export interface PixelAvatarProps {
  /** Character ID or role ID (e.g. "dr_linh", "dr_minh", or "field", "epigrapher") */
  doctorId?: DoctorId | string;
  /** Width & height in pixels */
  size?: number;
  /** Frame styling */
  frame?: "pixel-box" | "circle" | "gold" | "none";
  /** Add subtle retro animated bobbing/breathing */
  animated?: boolean;
  /** Speaking state for dialogue/tutorial */
  speaking?: boolean;
  /** Tooltip showing doctor info */
  showTooltip?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/** Map generic role IDs or names to doctor character IDs */
export function resolveDoctorId(idOrRole?: string): DoctorId {
  if (!idOrRole) return "dr_linh";
  const norm = idOrRole.toLowerCase();
  if (norm.includes("linh") || norm === "field" || norm === "director") return "dr_linh";
  if (norm.includes("minh") || norm === "epigrapher") return "dr_minh";
  if (norm.includes("lan") || norm === "conservator") return "dr_lan";
  if (norm.includes("tuan") || norm.includes("tuấn") || norm === "datasci") return "dr_tuan";
  if (norm.includes("mai") || norm === "historian") return "dr_mai";
  return "dr_linh";
}

export default function PixelAvatar({
  doctorId = "dr_linh",
  size = 40,
  frame = "pixel-box",
  animated = false,
  speaking = false,
  showTooltip = false,
  className = "",
  style,
  onClick,
}: PixelAvatarProps) {
  const resolved = resolveDoctorId(doctorId);
  const doc = DOCTORS[resolved] ?? DOCTORS.dr_linh;

  let frameClasses = "";
  let frameStyles: CSSProperties = {};

  if (frame === "pixel-box") {
    frameClasses = "border-2 border-[#c89b3c]/60 bg-[#0d161f] shadow-md";
    frameStyles = {
      boxShadow: "inset 0 0 0 1px #11202e, 2px 2px 0px rgba(0,0,0,0.6)",
    };
  } else if (frame === "circle") {
    frameClasses = "rounded-full border border-[#c89b3c]/60 bg-[#0d161f] overflow-hidden";
  } else if (frame === "gold") {
    frameClasses = "border-2 border-[#f5d26d] bg-[#16222f]";
    frameStyles = {
      boxShadow: "0 0 8px rgba(245, 210, 109, 0.4), inset 0 0 0 1px #c89b3c",
    };
  }

  const animationClass = speaking
    ? "avatar-speaking"
    : animated
    ? "avatar-idle-breathe"
    : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${frameClasses} ${animationClass} ${className}`}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        ...frameStyles,
        ...style,
      }}
      title={showTooltip ? `${doc.name} — ${doc.title} (${doc.specialty})` : undefined}
      onClick={onClick}
    >
      <Image
        src={`/assets/avatars/${resolved}.svg`}
        alt={doc.name}
        width={size}
        height={size}
        unoptimized
        priority
        className="w-full h-full object-contain pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      />
      {speaking && (
        <span
          className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#4da87a] border border-[#0d161f] animate-ping"
          title="Speaking..."
        />
      )}
    </div>
  );
}

/** Full card view for doctor profiles (e.g., in Lab or Codex) */
export function DoctorCard({
  doctorId,
  compact = false,
  onSelect,
}: {
  doctorId: DoctorId;
  compact?: boolean;
  onSelect?: () => void;
}) {
  const doc = DOCTORS[doctorId];
  if (!doc) return null;

  return (
    <div
      className="panel p-3 flex items-start gap-3 bg-[#0d1722]/90 border hairline hover:border-[#c89b3c]/60 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <PixelAvatar doctorId={doctorId} size={compact ? 42 : 56} frame="pixel-box" animated />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm text-[#F0E9D9] truncate">{doc.name}</span>
          <span
            className="text-[0.6rem] tag px-1.5 py-0.5"
            style={{ color: doc.badgeColor, borderColor: doc.badgeColor }}
          >
            {doc.role}
          </span>
        </div>
        <p className="text-xs text-[#8a9ea8] mt-0.5">{doc.title}</p>
        {!compact && (
          <>
            <p className="text-[0.7rem] text-[#6D9A83] mt-1">🔬 {doc.specialty}</p>
            <p className="text-[0.72rem] text-[#e8d8b0]/80 italic mt-2 border-l border-[#c89b3c]/40 pl-2">
              &ldquo;{doc.quote}&rdquo;
            </p>
          </>
        )}
      </div>
    </div>
  );
}
