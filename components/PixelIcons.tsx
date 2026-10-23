/**
 * Pixel Art SVG Icon Library
 * All icons drawn on 16x16 pixel grid using SVG <rect> elements.
 * This ensures true pixel-perfect rendering at any scale.
 */

import { CSSProperties } from "react";

type IconProps = {
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
};

function Icon({
  size = 16,
  children,
  viewBox = "0 0 16 16",
  style,
  className,
}: {
  size?: number;
  children: React.ReactNode;
  viewBox?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated", ...style }}
      className={className}
    >
      {children}
    </svg>
  );
}

/** 🔊 Speaker / sound on */
export function IconSoundOn({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* speaker body */}
      <rect x="2" y="5" width="3" height="6" fill={color} />
      {/* cone */}
      <rect x="5" y="4" width="1" height="1" fill={color} />
      <rect x="5" y="5" width="2" height="6" fill={color} />
      <rect x="5" y="11" width="1" height="1" fill={color} />
      {/* sound waves */}
      <rect x="9" y="6" width="1" height="4" fill={color} opacity="0.7" />
      <rect x="11" y="4" width="1" height="8" fill={color} opacity="0.5" />
      <rect x="13" y="2" width="1" height="12" fill={color} opacity="0.3" />
    </Icon>
  );
}

/** 🔇 Muted speaker */
export function IconSoundOff({ size = 16, color = "#8a9ea8", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="2" y="5" width="3" height="6" fill={color} />
      <rect x="5" y="4" width="1" height="1" fill={color} />
      <rect x="5" y="5" width="2" height="6" fill={color} />
      <rect x="5" y="11" width="1" height="1" fill={color} />
      {/* X for mute */}
      <rect x="10" y="6" width="2" height="2" fill="#e04040" />
      <rect x="12" y="8" width="2" height="2" fill="#e04040" />
      <rect x="12" y="6" width="2" height="2" fill="#e04040" />
      <rect x="10" y="8" width="2" height="2" fill="#e04040" />
    </Icon>
  );
}

/** 🏛️ Museum / Institution */
export function IconMuseum({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* roof */}
      <rect x="3" y="2" width="10" height="1" fill={color} />
      <rect x="4" y="3" width="8" height="1" fill={color} />
      {/* pediment */}
      <rect x="2" y="4" width="12" height="2" fill={color} />
      {/* columns */}
      <rect x="3" y="6" width="2" height="7" fill={color} />
      <rect x="7" y="6" width="2" height="7" fill={color} />
      <rect x="11" y="6" width="2" height="7" fill={color} />
      {/* base */}
      <rect x="2" y="13" width="12" height="2" fill={color} />
    </Icon>
  );
}

/** 🔒 Lock */
export function IconLock({ size = 16, color = "#8a9ea8", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* shackle */}
      <rect x="5" y="3" width="6" height="1" fill={color} />
      <rect x="4" y="4" width="1" height="4" fill={color} />
      <rect x="11" y="4" width="1" height="4" fill={color} />
      {/* body */}
      <rect x="3" y="7" width="10" height="7" fill={color} />
      {/* keyhole */}
      <rect x="7" y="9" width="2" height="1" fill="#060a0e" />
      <rect x="6" y="10" width="4" height="1" fill="#060a0e" />
      <rect x="7" y="11" width="2" height="2" fill="#060a0e" />
    </Icon>
  );
}

/** ▶ Play / Enter arrow */
export function IconEnter({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="3" y="7" width="8" height="2" fill={color} />
      <rect x="8" y="5" width="2" height="2" fill={color} />
      <rect x="10" y="7" width="2" height="2" fill={color} />
      <rect x="8" y="9" width="2" height="2" fill={color} />
    </Icon>
  );
}

/** ← Back arrow */
export function IconBack({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="5" y="7" width="8" height="2" fill={color} />
      <rect x="5" y="7" width="2" height="2" fill={color} />
      <rect x="3" y="7" width="2" height="2" fill={color} />
      <rect x="5" y="5" width="2" height="2" fill={color} />
      <rect x="5" y="9" width="2" height="2" fill={color} />
    </Icon>
  );
}

/** ✓ Check mark */
export function IconCheck({ size = 16, color = "#4da87a", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="2" y="8" width="2" height="2" fill={color} />
      <rect x="4" y="10" width="2" height="2" fill={color} />
      <rect x="6" y="12" width="2" height="2" fill={color} />
      <rect x="8" y="10" width="2" height="2" fill={color} />
      <rect x="10" y="8" width="2" height="2" fill={color} />
      <rect x="12" y="6" width="2" height="2" fill={color} />
    </Icon>
  );
}

/** ○ Circle / empty objective */
export function IconCircle({ size = 16, color = "#8a9ea8", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="5" y="3" width="6" height="1" fill={color} />
      <rect x="3" y="4" width="2" height="1" fill={color} />
      <rect x="11" y="4" width="2" height="1" fill={color} />
      <rect x="2" y="5" width="1" height="6" fill={color} />
      <rect x="13" y="5" width="1" height="6" fill={color} />
      <rect x="3" y="11" width="2" height="1" fill={color} />
      <rect x="11" y="11" width="2" height="1" fill={color} />
      <rect x="5" y="12" width="6" height="1" fill={color} />
    </Icon>
  );
}

/** ⚠ Warning / Alert */
export function IconWarning({ size = 16, color = "#e04040", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* triangle */}
      <rect x="7" y="2" width="2" height="1" fill={color} />
      <rect x="6" y="3" width="4" height="1" fill={color} />
      <rect x="5" y="4" width="6" height="1" fill={color} />
      <rect x="4" y="5" width="8" height="1" fill={color} />
      <rect x="3" y="6" width="10" height="1" fill={color} />
      <rect x="2" y="7" width="12" height="1" fill={color} />
      <rect x="2" y="8" width="12" height="1" fill={color} />
      {/* exclamation */}
      <rect x="7" y="5" width="2" height="4" fill="#0a0e14" />
      <rect x="7" y="10" width="2" height="2" fill="#0a0e14" />
    </Icon>
  );
}

/** 📅 Calendar / Day */
export function IconCalendar({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* frame */}
      <rect x="2" y="4" width="12" height="10" fill={color} opacity="0.2" />
      <rect x="2" y="4" width="12" height="1" fill={color} />
      <rect x="2" y="4" width="1" height="10" fill={color} />
      <rect x="13" y="4" width="1" height="10" fill={color} />
      <rect x="2" y="13" width="12" height="1" fill={color} />
      {/* header bar */}
      <rect x="2" y="4" width="12" height="3" fill={color} opacity="0.5" />
      {/* day tabs */}
      <rect x="5" y="2" width="2" height="3" fill={color} />
      <rect x="9" y="2" width="2" height="3" fill={color} />
      {/* grid dots */}
      <rect x="4" y="9" width="2" height="2" fill={color} opacity="0.6" />
      <rect x="7" y="9" width="2" height="2" fill={color} opacity="0.6" />
      <rect x="10" y="9" width="2" height="2" fill={color} opacity="0.6" />
    </Icon>
  );
}

/** 💰 Coin / Cash */
export function IconCoin({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="5" y="2" width="6" height="1" fill={color} />
      <rect x="3" y="3" width="2" height="1" fill={color} />
      <rect x="11" y="3" width="2" height="1" fill={color} />
      <rect x="2" y="4" width="1" height="8" fill={color} />
      <rect x="13" y="4" width="1" height="8" fill={color} />
      <rect x="3" y="12" width="2" height="1" fill={color} />
      <rect x="11" y="12" width="2" height="1" fill={color} />
      <rect x="5" y="13" width="6" height="1" fill={color} />
      {/* đ symbol */}
      <rect x="7" y="5" width="2" height="6" fill={color} opacity="0.4" />
      <rect x="5" y="7" width="6" height="1" fill={color} opacity="0.4" />
      <rect x="5" y="9" width="6" height="1" fill={color} opacity="0.4" />
    </Icon>
  );
}

/** 🔬 Research / Microscope */
export function IconResearch({ size = 16, color = "#4da87a", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* eyepiece */}
      <rect x="7" y="1" width="3" height="2" fill={color} />
      {/* tube */}
      <rect x="8" y="3" width="2" height="5" fill={color} />
      {/* stage */}
      <rect x="5" y="8" width="7" height="2" fill={color} />
      {/* base */}
      <rect x="4" y="13" width="8" height="2" fill={color} />
      {/* support */}
      <rect x="7" y="10" width="2" height="3" fill={color} />
      {/* arm */}
      <rect x="4" y="6" width="4" height="2" fill={color} />
    </Icon>
  );
}

/** ⭐ Star / Reputation */
export function IconStar({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="7" y="1" width="2" height="2" fill={color} />
      <rect x="7" y="3" width="2" height="2" fill={color} />
      <rect x="4" y="4" width="8" height="2" fill={color} />
      <rect x="2" y="6" width="12" height="2" fill={color} />
      <rect x="3" y="8" width="10" height="2" fill={color} />
      <rect x="4" y="10" width="3" height="4" fill={color} />
      <rect x="9" y="10" width="3" height="4" fill={color} />
      <rect x="6" y="10" width="4" height="2" fill={color} />
    </Icon>
  );
}

/** 🗺 Map */
export function IconMap({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* paper */}
      <rect x="2" y="2" width="12" height="12" fill={color} opacity="0.2" />
      <rect x="2" y="2" width="12" height="1" fill={color} />
      <rect x="2" y="2" width="1" height="12" fill={color} />
      <rect x="13" y="2" width="1" height="12" fill={color} />
      <rect x="2" y="13" width="12" height="1" fill={color} />
      {/* fold lines */}
      <rect x="6" y="2" width="1" height="12" fill={color} opacity="0.4" />
      <rect x="10" y="2" width="1" height="12" fill={color} opacity="0.4" />
      <rect x="2" y="6" width="12" height="1" fill={color} opacity="0.4" />
      {/* X marker */}
      <rect x="8" y="8" width="2" height="2" fill={color} />
      <rect x="7" y="9" width="4" height="1" fill={color} />
    </Icon>
  );
}

/** ⛺ Expedition / Tent */
export function IconExpedition({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* left tent side */}
      <rect x="2" y="12" width="2" height="1" fill={color} />
      <rect x="4" y="10" width="2" height="2" fill={color} />
      <rect x="6" y="8" width="2" height="2" fill={color} />
      <rect x="6" y="6" width="2" height="2" fill={color} />
      {/* peak */}
      <rect x="7" y="4" width="2" height="2" fill={color} />
      {/* right tent side */}
      <rect x="8" y="6" width="2" height="2" fill={color} />
      <rect x="8" y="8" width="2" height="2" fill={color} />
      <rect x="10" y="10" width="2" height="2" fill={color} />
      <rect x="12" y="12" width="2" height="1" fill={color} />
      {/* base */}
      <rect x="2" y="13" width="12" height="1" fill={color} />
      {/* door */}
      <rect x="7" y="10" width="2" height="3" fill={color} opacity="0.4" />
    </Icon>
  );
}

/** 📦 Archive / Box */
export function IconArchive({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* lid */}
      <rect x="2" y="3" width="12" height="3" fill={color} />
      <rect x="6" y="4" width="4" height="1" fill="#0a0e14" />
      {/* box */}
      <rect x="2" y="6" width="1" height="8" fill={color} />
      <rect x="13" y="6" width="1" height="8" fill={color} />
      <rect x="2" y="13" width="12" height="1" fill={color} />
      <rect x="3" y="6" width="10" height="7" fill={color} opacity="0.2" />
    </Icon>
  );
}

/** 📊 Finance / Chart */
export function IconFinance({ size = 16, color = "#4da87a", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* axes */}
      <rect x="2" y="2" width="1" height="12" fill={color} />
      <rect x="2" y="13" width="12" height="1" fill={color} />
      {/* bars */}
      <rect x="4" y="9" width="2" height="4" fill={color} />
      <rect x="7" y="6" width="2" height="7" fill={color} />
      <rect x="10" y="4" width="2" height="9" fill={color} />
      <rect x="13" y="7" width="2" height="6" fill={color} opacity="0.6" />
    </Icon>
  );
}

/** 🛒 Market / Cart */
export function IconMarket({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* cart body */}
      <rect x="3" y="4" width="10" height="7" fill={color} opacity="0.2" />
      <rect x="3" y="4" width="10" height="1" fill={color} />
      <rect x="3" y="4" width="1" height="7" fill={color} />
      <rect x="12" y="4" width="1" height="7" fill={color} />
      <rect x="3" y="10" width="10" height="1" fill={color} />
      {/* handle */}
      <rect x="1" y="4" width="2" height="1" fill={color} />
      {/* wheels */}
      <rect x="5" y="11" width="2" height="2" fill={color} />
      <rect x="9" y="11" width="2" height="2" fill={color} />
    </Icon>
  );
}

/** ⚙ Dev / Settings */
export function IconDev({ size = 16, color = "#8a9ea8", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* gear outer */}
      <rect x="6" y="1" width="4" height="2" fill={color} />
      <rect x="6" y="13" width="4" height="2" fill={color} />
      <rect x="1" y="6" width="2" height="4" fill={color} />
      <rect x="13" y="6" width="2" height="4" fill={color} />
      <rect x="3" y="3" width="2" height="2" fill={color} />
      <rect x="11" y="3" width="2" height="2" fill={color} />
      <rect x="3" y="11" width="2" height="2" fill={color} />
      <rect x="11" y="11" width="2" height="2" fill={color} />
      {/* gear ring */}
      <rect x="4" y="4" width="8" height="8" fill={color} opacity="0.3" />
      <rect x="4" y="4" width="8" height="1" fill={color} />
      <rect x="4" y="11" width="8" height="1" fill={color} />
      <rect x="4" y="4" width="1" height="8" fill={color} />
      <rect x="11" y="4" width="1" height="8" fill={color} />
      {/* center hole */}
      <rect x="6" y="6" width="4" height="4" fill="#0a0e14" />
    </Icon>
  );
}

/** 📖 Codex / Book */
export function IconCodex({ size = 16, color = "#c89b3c", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* spine */}
      <rect x="3" y="2" width="2" height="12" fill={color} />
      {/* cover */}
      <rect x="5" y="2" width="8" height="12" fill={color} opacity="0.3" />
      <rect x="5" y="2" width="8" height="1" fill={color} />
      <rect x="5" y="13" width="8" height="1" fill={color} />
      <rect x="12" y="2" width="1" height="12" fill={color} />
      {/* pages lines */}
      <rect x="6" y="5" width="5" height="1" fill={color} opacity="0.7" />
      <rect x="6" y="7" width="5" height="1" fill={color} opacity="0.7" />
      <rect x="6" y="9" width="5" height="1" fill={color} opacity="0.7" />
      <rect x="6" y="11" width="3" height="1" fill={color} opacity="0.7" />
    </Icon>
  );
}

/** 🏠 Command / HQ */
export function IconCommand({ size = 16, color = "#e8d8b0", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* roof */}
      <rect x="7" y="2" width="2" height="1" fill={color} />
      <rect x="6" y="3" width="4" height="1" fill={color} />
      <rect x="5" y="4" width="6" height="1" fill={color} />
      <rect x="4" y="5" width="8" height="1" fill={color} />
      <rect x="3" y="6" width="10" height="1" fill={color} />
      {/* walls */}
      <rect x="3" y="7" width="1" height="7" fill={color} />
      <rect x="12" y="7" width="1" height="7" fill={color} />
      <rect x="4" y="13" width="8" height="1" fill={color} />
      {/* door */}
      <rect x="7" y="10" width="2" height="4" fill={color} opacity="0.4" />
      {/* windows */}
      <rect x="5" y="8" width="2" height="2" fill={color} opacity="0.5" />
      <rect x="9" y="8" width="2" height="2" fill={color} opacity="0.5" />
    </Icon>
  );
}

/** Flag / VN */
export function IconFlagVN({ size = 16, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* red bg */}
      <rect x="1" y="3" width="14" height="10" fill="#d62828" />
      {/* star */}
      <rect x="7" y="4" width="2" height="2" fill="#f7d800" />
      <rect x="7" y="10" width="2" height="2" fill="#f7d800" />
      <rect x="4" y="7" width="2" height="2" fill="#f7d800" />
      <rect x="10" y="7" width="2" height="2" fill="#f7d800" />
      <rect x="7" y="7" width="2" height="2" fill="#f7d800" />
      <rect x="5" y="5" width="2" height="2" fill="#f7d800" />
      <rect x="9" y="5" width="2" height="2" fill="#f7d800" />
      <rect x="5" y="9" width="2" height="2" fill="#f7d800" />
      <rect x="9" y="9" width="2" height="2" fill="#f7d800" />
      {/* flagpole */}
      <rect x="1" y="1" width="1" height="14" fill="#8a9ea8" />
    </Icon>
  );
}

/** Flag / GB */
export function IconFlagGB({ size = 16, ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      {/* blue bg */}
      <rect x="2" y="3" width="13" height="10" fill="#012169" />
      {/* white cross */}
      <rect x="2" y="6" width="13" height="4" fill="#fff" />
      <rect x="6" y="3" width="4" height="10" fill="#fff" />
      {/* red cross */}
      <rect x="2" y="7" width="13" height="2" fill="#c8102e" />
      <rect x="7" y="3" width="2" height="10" fill="#c8102e" />
      {/* flagpole */}
      <rect x="1" y="1" width="1" height="14" fill="#8a9ea8" />
    </Icon>
  );
}

/** ⚡ Event / Lightning */
export function IconEvent({ size = 16, color = "#c05c38", ...rest }: IconProps) {
  return (
    <Icon size={size} {...rest}>
      <rect x="9" y="2" width="3" height="1" fill={color} />
      <rect x="8" y="3" width="3" height="1" fill={color} />
      <rect x="7" y="4" width="3" height="1" fill={color} />
      <rect x="6" y="5" width="3" height="1" fill={color} />
      <rect x="5" y="6" width="4" height="2" fill={color} />
      <rect x="7" y="8" width="3" height="1" fill={color} />
      <rect x="6" y="9" width="3" height="1" fill={color} />
      <rect x="5" y="10" width="3" height="1" fill={color} />
      <rect x="4" y="11" width="3" height="1" fill={color} />
      <rect x="3" y="12" width="3" height="1" fill={color} />
    </Icon>
  );
}

/** 💾 Save indicator dot */
export function IconSaveDot({ size = 8, color = "#4da87a", ...rest }: IconProps) {
  return (
    <Icon size={size} viewBox="0 0 8 8" {...rest}>
      <rect x="2" y="0" width="4" height="1" fill={color} />
      <rect x="1" y="1" width="1" height="1" fill={color} />
      <rect x="6" y="1" width="1" height="1" fill={color} />
      <rect x="0" y="2" width="1" height="4" fill={color} />
      <rect x="7" y="2" width="1" height="4" fill={color} />
      <rect x="1" y="6" width="1" height="1" fill={color} />
      <rect x="6" y="6" width="1" height="1" fill={color} />
      <rect x="2" y="7" width="4" height="1" fill={color} />
    </Icon>
  );
}
