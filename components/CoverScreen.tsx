"use client";
import { useEffect, useState } from "react";

/** Cinematic cover/title screen shown on app entry, before the start menu. */
export default function CoverScreen({ onEnter }: { onEnter: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400); // small beat before title fades in
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
        style={{ backgroundImage: "url(/assets/sites/coloas.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09131B]/70 via-[#09131B]/85 to-[#09131B]" />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(9,19,27,0.9) 100%)" }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        {ready && (
          <>
            <p className="tag border-[#C28B49] text-[#C28B49] mb-6 rise-in">An archaeology · research · finance strategy game</p>
            <h1
              className="font-display text-5xl md:text-7xl leading-none tracking-wide rise-in"
              style={{ animationDelay: "0.35s" }}
            >
              Relic <span className="text-[#C28B49]">Capital</span>
            </h1>
            <p
              className="text-[#A2B0B2] max-w-xl mt-6 text-sm md:text-base rise-in"
              style={{ animationDelay: "0.8s" }}
            >
              Every trench is an investment. Every discovery is a hypothesis.
              Direct an independent research institute in Vietnam&apos;s fields —
              dig, analyze, verify, publish, and keep the ledger alive.
            </p>
            <button
              className="btn btn-primary mt-10 !px-8 !py-3 !text-base gild-flash rise-in"
              style={{ animationDelay: "1.25s" }}
              onClick={(e) => {
                e.stopPropagation();
                onEnter();
              }}
            >
              Enter the site →
            </button>
            <p className="text-[0.65rem] text-[#5f7d8c] mt-8 rise-in" style={{ animationDelay: "1.6s" }}>
              Press Enter · all in-game currency, instruments and scenarios are fictional
            </p>
          </>
        )}
      </div>
    </div>
  );
}
