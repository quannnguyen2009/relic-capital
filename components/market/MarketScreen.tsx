"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { useGame } from "@/game/store";
import { Panel, Tooltip } from "../ui";
import { fmt } from "@/game/engine/core";
import { priceOf, portfolioValue } from "@/game/engine/market";
import { INSTRUMENTS } from "@/game/data/systems";

export default function MarketScreen() {
  const g = useGame();
  const s = g.s!;
  const [sel, setSel] = useState(INSTRUMENTS[0].id);
  const [qty, setQty] = useState(10);
  const inst = INSTRUMENTS.find((i) => i.id === sel)!;
  const series = s.market.prices[sel] ?? [];
  const price = priceOf(s, sel);
  const pos = s.market.positions.find((p) => p.instrumentId === sel) ?? null;
  const first = series[0]?.price ?? price;
  const change = first ? ((price - first) / first) * 100 : 0;
  const sectorThemeTag: Record<string, { label: string; color: string }> = {
    stablecore: { label: "🏛 Endowment Reserve", color: "#6D9A83" },
    "digi-vn": { label: "💻 Digital Archive Index", color: "#3a8bb0" },
    consotech: { label: "🧪 Conservation Tech", color: "#C28B49" },
    silkroute: { label: "⛵ Maritime Trade Venture", color: "#d97706" },
    fieldrobot: { label: "🛰 Autonomous Survey Robotics", color: "#ef4444" },
  };

  const portVal = portfolioValue(s);
  const totalWealth = s.resources.cash + portVal;
  const portfolioRatio = totalWealth > 0 ? Math.round((portVal / totalWealth) * 100) : 0;

  return (
    <div className="space-y-4">
      <Panel title="Market Observatory & Treasury" sub="Simulated research-sector instruments & institutional endowment funds. Diversify capital reserves to cushion fieldwork operational volatility.">
        <div className="grid sm:grid-cols-3 gap-3 mb-4 text-xs num">
          <div className="panel-elevated p-2.5 border hairline">
            <div className="text-[0.65rem] text-[#A2B0B2] uppercase">Treasury Portfolio</div>
            <div className="text-base text-[#F0E9D9] font-bold">{fmt(portVal)} đ</div>
            <div className="text-[0.65rem] text-[#C28B49]">{portfolioRatio}% allocated to sector instruments</div>
          </div>
          <div className="panel-elevated p-2.5 border hairline">
            <div className="text-[0.65rem] text-[#A2B0B2] uppercase">Liquid Cash Cushion</div>
            <div className="text-base text-[#6D9A83] font-bold">{fmt(s.resources.cash)} đ</div>
            <div className="text-[0.65rem] text-[#A2B0B2]">2% institutional execution fee</div>
          </div>
          <div className="panel-elevated p-2.5 border hairline">
            <div className="text-[0.65rem] text-[#A2B0B2] uppercase">Active Positions</div>
            <div className="text-base text-[#E0D7C5] font-bold">{s.market.positions.length} holdings</div>
            <div className="text-[0.65rem] text-[#A2B0B2]">{s.market.watchlist.length} on active surveillance</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          {/* instrument list */}
          <div className="space-y-2">
            {INSTRUMENTS.map((i) => {
              const seriesI = s.market.prices[i.id] ?? [];
              const p = priceOf(s, i.id);
              const f = seriesI[0]?.price ?? p;
              const pct = f ? ((p - f) / f) * 100 : 0;
              const held = s.market.positions.find((x) => x.instrumentId === i.id);
              const theme = sectorThemeTag[i.id] || { label: "Research Equity", color: "#C28B49" };
              return (
                <button
                  key={i.id}
                  onClick={() => setSel(i.id)}
                  className={`w-full text-left p-2.5 rounded border transition-colors ${sel === i.id ? "border-[#C28B49] bg-[#C28B49]/10" : "hairline hover:border-[#6D9A83]"}`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-display">{i.symbol}</span>
                    <span className="num font-bold">{p.toFixed(2)} đ</span>
                  </div>
                  <div className="flex justify-between text-[0.65rem] text-[#A2B0B2] mt-0.5">
                    <span className="truncate max-w-[160px]">{i.name}</span>
                    <span className={pct >= 0 ? "text-[#6D9A83] font-bold" : "text-[#D66D67] font-bold"}>{pct >= 0 ? "+" : ""}{pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[0.6rem] mt-1.5 pt-1 border-t hairline">
                    <span style={{ color: theme.color }}>{theme.label}</span>
                    {held ? <span className="text-[#C28B49] font-mono">Held: {held.shares}</span> : <span className="text-[#A2B0B2]">No position</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* detail + trade */}
          <div className="panel-elevated p-4">
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <div>
                <h3 className="font-display text-xl">{inst.name} <span className="text-sm text-[#A2B0B2]">({inst.symbol})</span></h3>
                <p className="text-xs text-[#A2B0B2]">{inst.sectorDesc}</p>
              </div>
              <div className="text-right">
                <div className="num text-2xl">{price.toFixed(2)} đ</div>
                <div className={`text-xs ${change >= 0 ? "text-[#6D9A83]" : "text-[#D66D67]"}`}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% since listing</div>
              </div>
            </div>

            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series.map((p) => ({ d: p.day, p: p.price }))}>
                  <XAxis dataKey="d" stroke="#3a5d6e" fontSize={10} />
                  <YAxis stroke="#3a5d6e" fontSize={10} domain={["auto", "auto"]} width={45} />
                  <RTooltip contentStyle={{ background: "#0b1822", border: "1px solid #22384a", fontSize: 12 }} formatter={(v) => [`${Number(v).toFixed(2)} đ`, "Price"]} />
                  <Line type="monotone" dataKey="p" stroke="#C28B49" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs num mt-2">
              <div className="flex justify-between border-b hairline py-1"><span className="text-[#A2B0B2]">Volatility</span><span>{Math.round(inst.volatility * 100)}%</span></div>
              <div className="flex justify-between border-b hairline py-1"><span className="text-[#A2B0B2]">Liquidity</span><span>{inst.liquidity}</span></div>
              <div className="flex justify-between border-b hairline py-1"><span className="text-[#A2B0B2]">Risk level</span><span>{inst.riskLevel}/5</span></div>
              <div className="flex justify-between border-b hairline py-1"><span className="text-[#A2B0B2]">Position</span><span>{pos ? `${pos.shares} @ ${pos.avgCost.toFixed(2)}` : "—"}</span></div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input type="number" min={1} className="input !w-24" value={qty} onChange={(e) => setQty(Math.max(1, Math.floor(+e.target.value || 1)))} />
              <Tooltip text={`Buy ${qty} shares at ${price.toFixed(2)} đ + 2% fee.`}>
                <button className="btn btn-primary !text-xs" onClick={() => g.mktBuy(sel, qty)}>Buy</button>
              </Tooltip>
              <Tooltip text={`Sell ${qty} held shares at ${price.toFixed(2)} đ − 2% fee.`}>
                <button className="btn btn-jade !text-xs" disabled={!pos || pos.shares < qty} onClick={() => g.mktSell(sel, qty)}>Sell</button>
              </Tooltip>
              <Tooltip text="Watchlist highlights the instrument day-to-day.">
                <button className="btn btn-ghost !text-xs" onClick={() => g.toggleWatch(sel)}>
                  {s.market.watchlist.includes(sel) ? "★ Watching" : "☆ Watch"}
                </button>
              </Tooltip>
            </div>
            <p className="text-[0.65rem] text-[#A2B0B2] mt-2">
              {inst.desc} Prices respond to your published/digitized artifacts, conserved material, tech research, regions explored, and seeded sector events. Diversification across risk levels reduces exposure to any single wire shock.
            </p>
          </div>
        </div>

        {/* recent market events */}
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wider text-[#A2B0B2] mb-1">Recent wire</div>
          <ul className="text-xs space-y-0.5 max-h-28 overflow-y-auto">
            {s.market.events.slice(-6).reverse().map((e) => (
              <li key={e.id} className={e.impact >= 0 ? "text-[#6D9A83]" : "text-[#D66D67]"}>
                D{e.day} · {INSTRUMENTS.find((i) => i.id === e.instrumentId)?.symbol} {e.impact >= 0 ? "+" : ""}{(e.impact * 100).toFixed(1)}% — {e.text}
              </li>
            ))}
            {!s.market.events.length && <li className="text-[#A2B0B2]">No sector events yet.</li>}
          </ul>
        </div>
      </Panel>

      {/* trade history */}
      <Panel title="Transaction history" sub="All trades with fee transparency.">
        {s.market.trades.length ? (
          <table className="w-full text-xs num max-h-60">
            <thead className="text-[#A2B0B2] uppercase text-[0.6rem]"><tr><th className="text-left py-1">Day</th><th className="text-left">Side</th><th className="text-left">Instrument</th><th className="text-right">Shares</th><th className="text-right">Price</th><th className="text-right">Fee đ</th></tr></thead>
            <tbody className="divide-y hairline">
              {[...s.market.trades].reverse().slice(0, 10).map((t) => (
                <tr key={t.id}>
                  <td className="py-1">{t.day}</td>
                  <td className={t.side === "buy" ? "text-[#C28B49]" : "text-[#6D9A83]"}>{t.side}</td>
                  <td>{INSTRUMENTS.find((i) => i.id === t.instrumentId)?.symbol}</td>
                  <td className="text-right">{t.shares}</td>
                  <td className="text-right">{t.price.toFixed(2)}</td>
                  <td className="text-right">{t.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-[#A2B0B2]">No trades yet. Consider the low-volatility endowment (HCE-S) before touching FRI-L.</p>}
      </Panel>
    </div>
  );
}
