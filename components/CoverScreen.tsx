"use client";
import { useEffect, useState } from "react";
import RelicCapitalLogo from "./RelicCapitalLogo";

/** Cinematic cover/title screen shown on app entry, before the start menu. */
export default function CoverScreen({ onEnter }: { onEnter: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onEnter]);

  return (
    <div className="relative min-h-screen overflow-hidden cursor-pointer select-none" onClick={onEnter}>
      {/* Backdrop photograph — Cổ Loa (real site, used respectfully) */}
      <div
        className="absolute inset-0 bg-cover bg-center cover-zoom"
        style={{ backgroundImage: "url(/assets/sites/coloas.jpg)", imageRendering: "pixelated" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(10,14,20,0.75)" }} />
      {/* Pixel scanline overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 6px)",
          zIndex: 2,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ zIndex: 3 }}>
        {ready && (
          <>
            {/* Pixel Art Logo Emblem */}
            <div className="mb-4 rise-in" style={{ animationDelay: '0.15s' }}>
              <RelicCapitalLogo size={100} variant="emblem" animateGlow />
            </div>

            <p className="tag border-[#c89b3c] text-[#c89b3c] mb-4 rise-in" style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', letterSpacing: '0.1em' }}>
              ARCHAEOLOGY · RESEARCH · FINANCE STRATEGY
            </p>
            <h1
              className="rise-in text-glow-bronze"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'clamp(1.2rem, 5vw, 3rem)',
                lineHeight: 1.3,
                letterSpacing: '0.08em',
                animationDelay: '0.35s',
                color: '#e8d8b0',
              }}
            >
              RELIC{" "}<span style={{ color: '#c89b3c' }}>CAPITAL</span>
            </h1>

            {/* Pixel art decoration line */}
            <div className="mt-6 mb-4 flex items-center gap-2 rise-in" style={{ animationDelay: '0.6s' }}>
              <div style={{ width: 40, height: 2, background: 'var(--bronze)' }} />
              <div style={{ width: 6, height: 6, background: 'var(--bronze)' }} />
              <div style={{ width: 40, height: 2, background: 'var(--bronze)' }} />
            </div>

            <p
              className="text-[#8a9ea8] max-w-xl text-sm rise-in"
              style={{ animationDelay: '0.8s', fontFamily: 'var(--font-vt323)', fontSize: '1.1rem' }}
            >
              EVERY TRENCH IS AN INVESTMENT. EVERY DISCOVERY IS A HYPOTHESIS.
              DIRECT AN INDEPENDENT RESEARCH INSTITUTE IN VIETNAM&apos;S FIELDS —
              DIG, ANALYZE, VERIFY, PUBLISH, AND KEEP THE LEDGER ALIVE.
            </p>
            <button
              className="btn btn-primary mt-10 !px-8 !py-3 gild-flash rise-in"
              style={{ animationDelay: '1.25s', fontSize: '1rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onEnter();
              }}
            >
              [ENTER THE SITE] ►
            </button>
            <p className="text-[0.45rem] text-[#4a6070] mt-8 rise-in" style={{ animationDelay: '1.6s', fontFamily: 'var(--font-pixel)' }}>
              PRESS ENTER · ALL IN-GAME CURRENCY, INSTRUMENTS AND SCENARIOS ARE FICTIONAL
            </p>
          </>
        )}
      </div>
    </div>
  );
}
