"use client";
import { ReactNode } from "react";

export function Panel({ title, sub, children, className = "", action }: { title?: string; sub?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`panel p-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-baseline justify-between mb-3">
          <div>
            {title && <h2 className="font-display tracking-wider" style={{ fontSize: '1rem', color: 'var(--bronze)', textTransform: 'uppercase', fontWeight: 700 }}>{title}</h2>}
            {sub && <p className="text-xs text-[#8a9ea8] mt-0.5 font-vt" style={{ fontSize: '0.85rem' }}>{sub}</p>}
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
      <div className="mb-1 font-display tracking-wide font-bold" style={{ fontSize: '0.95rem', color: 'var(--bronze)', textTransform: 'uppercase' }}>{title}</div>
      <p className="text-sm text-[#8a9ea8] max-w-md mx-auto mb-3 font-vt" style={{ fontSize: '0.9rem' }}>{body}</p>
      {action}
    </div>
  );
}

export function Bar({ value, max = 1, color = "#4da87a" }: { value: number; max?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="px-bar-track">
      <div
        className="px-bar-fill"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}


export function ConfidenceBadge({ c }: { c: string }) {
  const map: Record<string, [string, string]> = {
    hypothesis: ["HYPOTHESIS", "#8a9ea8"],
    probable:   ["PROBABLE",   "#4da87a"],
    robust:     ["ROBUST",     "#c89b3c"],
    verified:   ["VERIFIED",   "#f0c040"],
  };
  const [label, color] = map[c] ?? map.hypothesis;
  return <span className="tag" style={{ color, borderColor: color }}>{label}</span>;
}

