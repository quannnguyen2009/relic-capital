"use client";
import { ReactNode } from "react";

export function Panel({ title, sub, children, className = "", action }: { title?: string; sub?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`panel p-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-baseline justify-between mb-3">
          <div>
            {title && <h2 className="font-display text-xl leading-tight">{title}</h2>}
            {sub && <p className="text-xs text-[#A2B0B2] mt-0.5">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="tthost" tabIndex={0}>
      {children}
      <span className="tthost-body">{text}</span>
    </span>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel p-8 text-center">
      <div className="font-display text-lg mb-1">{title}</div>
      <p className="text-sm text-[#A2B0B2] max-w-md mx-auto mb-3">{body}</p>
      {action}
    </div>
  );
}

export function Bar({ value, max = 1, color = "#6D9A83" }: { value: number; max?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 rounded bg-[#0b1720] overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function ConfidenceBadge({ c }: { c: string }) {
  const map: Record<string, [string, string]> = {
    hypothesis: ["Hypothesis", "#A2B0B2"],
    probable: ["Probable", "#6D9A83"],
    robust: ["Robust", "#C28B49"],
    verified: ["Verified", "#D4AF37"],
  };
  const [label, color] = map[c] ?? map.hypothesis;
  return <span className="tag" style={{ color, borderColor: color }}>{label}</span>;
}
