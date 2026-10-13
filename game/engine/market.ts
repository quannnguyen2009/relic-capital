import type { GameState, Instrument, MarketEvent, PricePoint, Position, Trade } from "./types";
import { INSTRUMENTS, GAME_EVENTS } from "../data/systems";
import { rngFor } from "./rng";
import { clamp } from "./core";

export const TRADE_FEE = 0.02; // 2% per trade

export function initMarket(s: GameState) {
  for (const inst of INSTRUMENTS) {
    if (!s.market.prices[inst.id] || s.market.prices[inst.id].length === 0) {
      const rng = rngFor(s.seed, `mkt-init-${inst.id}`);
      const series: PricePoint[] = [];
      let p = inst.basePrice;
      for (let d = 0; d <= s.day; d++) {
        series.push({ day: 1, price: Math.round(p * 100) / 100 });
        p *= 1 + (rng.next() - 0.5) * inst.volatility * 0.08;
      }
      // replace with sequential days
      s.market.prices[inst.id] = series.map((sp, i) => ({ day: s.day - (series.length - 1 - i), price: sp.price }));
    }
  }
}

/** Deterministic daily tick: price drift + game-variable coupling + event shocks */
export function marketTick(s: GameState) {
  const rng = rngFor(s.seed, `mkt-tick-${s.day}`);
  for (const inst of INSTRUMENTS) {
    const series = s.market.prices[inst.id] ?? [];
    const last = series.length ? series[series.length - 1].price : inst.basePrice;

    // game-variable coupling: artifacts published/verified push DGH-V; conservation pushes CNT-T etc.
    let fundamental = 0;
    const verifiedCount = s.artifacts.filter((a) => a.confidenceLabel === "verified" || a.status === "published").length;
    const digiCount = s.artifacts.filter((a) => a.accessibility >= 0.5).length;
    const conservedCount = s.artifacts.filter((a) => a.condition === "pristine" || a.condition === "good").length;
    if (inst.id === "digi-vn") fundamental = digiCount * 0.0009 + verifiedCount * 0.0004;
    if (inst.id === "consotech") fundamental = conservedCount * 0.0007;
    if (inst.id === "silkroute") fundamental = Number(s.flags.regionsExplored ?? 1) * 0.0011;
    if (inst.id === "fieldrobot") fundamental = s.techResearched.length * 0.0008;
    if (inst.id === "stablecore") fundamental = 0.0003;

    const noise = (rng.next() - 0.5) * inst.volatility * 0.06;
    // mean reversion toward base
    const reversion = (inst.basePrice - last) / inst.basePrice * 0.02;
    const change = fundamental + noise + reversion;
    const price = Math.max(1, Math.round(last * (1 + change) * 100) / 100);
    series.push({ day: s.day, price });
    if (series.length > 60) series.shift();
    s.market.prices[inst.id] = series;
  }

  // occasional market event shock
  if (rng.chance(0.06)) {
    const inst = rng.pick(INSTRUMENTS);
    const impact = (rng.next() - 0.4) * inst.volatility * 0.35;
    const ev: MarketEvent = {
      id: `me-${s.day}-${inst.id}`,
      instrumentId: inst.id,
      day: s.day,
      text:
        impact >= 0
          ? `Positive wire: heritage-sector interest lifts ${inst.symbol}.`
          : `Negative wire: funding uncertainty drags ${inst.symbol}.`,
      impact,
    };
    s.market.events.push(ev);
    const series = s.market.prices[inst.id];
    const last = series[series.length - 1].price;
    series[series.length - 1] = { day: s.day, price: Math.max(1, Math.round(last * (1 + impact) * 100) / 100) };
  }
}

export function priceOf(s: GameState, instrumentId: string): number {
  const series = s.market.prices[instrumentId];
  return series && series.length ? series[series.length - 1].price : 0;
}

export function positionOf(s: GameState, instrumentId: string): Position | null {
  return s.market.positions.find((p) => p.instrumentId === instrumentId) ?? null;
}

export function portfolioValue(s: GameState): number {
  return s.market.positions.reduce((a, p) => a + p.shares * priceOf(s, p.instrumentId), 0);
}

export function buy(s: GameState, instrumentId: string, shares: number): { ok: boolean; reason?: string } {
  if (!Number.isFinite(shares) || shares <= 0 || !Number.isInteger(shares)) return { ok: false, reason: "Share count must be a positive whole number." };
  const price = priceOf(s, instrumentId);
  if (price <= 0) return { ok: false, reason: "No price data." };
  const fee = Math.round(price * shares * TRADE_FEE);
  const total = price * shares + fee;
  if (total > s.resources.cash) return { ok: false, reason: `Insufficient cash: need ${Math.round(total)}đ, have ${Math.floor(s.resources.cash)}đ.` };

  s.resources.cash -= total;
  s.ledger.push({ id: `t-${s.day}-${Date.now()}-${instrumentId}`, day: s.day, amount: -Math.round(total), reason: `Buy ${shares}× ${symbol(s, instrumentId)} @ ${price}đ (fee ${fee}đ)`, kind: "market" });

  const pos = positionOf(s, instrumentId);
  if (pos) {
    const newShares = pos.shares + shares;
    pos.avgCost = (pos.avgCost * pos.shares + price * shares) / newShares;
    pos.shares = newShares;
  } else {
    s.market.positions.push({ instrumentId, shares, avgCost: price });
  }
  const trade: Trade = { id: `${s.market.trades.length}`, day: s.day, instrumentId, side: "buy", shares, price, fee };
  s.market.trades.push(trade);
  return { ok: true };
}

export function sell(s: GameState, instrumentId: string, shares: number): { ok: boolean; reason?: string; proceeds?: number } {
  if (!Number.isFinite(shares) || shares <= 0 || !Number.isInteger(shares)) return { ok: false, reason: "Share count must be a positive whole number." };
  const pos = positionOf(s, instrumentId);
  if (!pos || pos.shares < shares) return { ok: false, reason: `You hold ${pos ? pos.shares : 0} shares.` };
  const price = priceOf(s, instrumentId);
  const fee = Math.round(price * shares * TRADE_FEE);
  const proceeds = Math.round(price * shares - fee);
  s.resources.cash += proceeds;
  s.ledger.push({ id: `t-${s.day}-${Date.now()}-${instrumentId}`, day: s.day, amount: proceeds, reason: `Sell ${shares}× ${symbol(s, instrumentId)} @ ${price}đ (fee ${fee}đ)`, kind: "market" });
  pos.shares -= shares;
  if (pos.shares === 0) s.market.positions = s.market.positions.filter((p) => p.instrumentId !== instrumentId);
  s.market.trades.push({ id: `${s.market.trades.length}`, day: s.day, instrumentId, side: "sell", shares, price, fee });
  return { ok: true, proceeds };
}

function symbol(s: GameState, id: string) {
  return INSTRUMENTS.find((i) => i.id === id)?.symbol ?? id;
}

export function instrumentById(id: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.id === id);
}
