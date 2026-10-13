"use client";
import { useState } from "react";
import { useGame } from "@/game/store";
import { GAME_EVENTS } from "@/game/data/systems";

export default function EventModal({ eventId }: { eventId: string }) {
  const g = useGame();
  const def = GAME_EVENTS.find((e) => e.id === eventId);
  const [msg, setMsg] = useState<string | null>(null);
  if (!def) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => g.setModal(null)}>
      <div className="panel-elevated w-full max-w-lg p-6 rise-in" onClick={(e) => e.stopPropagation()}>
        <div className="tag border-[#B9654B] text-[#B9654B] mb-2">Event · day {g.s!.day}</div>
        <h3 className="font-display text-2xl mb-2">{def.title}</h3>
        <p className="text-sm text-[#A2B0B2] mb-4">{def.text}</p>

        <div className="space-y-2">
          {def.options.map((o) => (
            <button
              key={o.id}
              className="w-full text-left p-3 rounded border hairline hover:border-[#C28B49] transition-colors"
              onClick={() => {
                const r = g.eventChoose(o.id) as { ok: boolean; reason?: string; text?: string };
                setMsg(r.ok ? r.text ?? "Decision applied." : r.reason ?? "Not possible.");
              }}
            >
              <div className="text-sm">{o.label}</div>
              <div className="text-[0.7rem] text-[#A2B0B2]">{o.costText}{o.rng ? ` · outcome weighted ~${Math.round(o.rng.p * 100)}% in your favor` : ""}</div>
            </button>
          ))}
        </div>

        {msg && <p className="text-sm text-[#C28B49] mt-3">{msg} <button className="underline ml-2" onClick={() => g.setModal(null)}>Continue</button></p>}
      </div>
    </div>
  );
}
