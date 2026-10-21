# Relic Capital

An archaeology, research, and finance strategy game set across Vietnam's historical landscapes.

*Every excavation is an investment. Every discovery is a hypothesis.*

🎮 **Play Live:** [https://reliccapital.vercel.app](https://reliccapital.vercel.app)

---

## 🏛️ Overview

In **Relic Capital**, you direct an independent research institute for Vietnamese archaeology. Balance the thrill of fieldwork with institutional survival:
- **Expeditions & Excavations**: Survey and excavate authentic and fictionalized historical sites across Vietnam (Cổ Loa, Trà Kiệu, Óc Eo, Má Thẹn, Hòa Bình, and more).
- **Research Lab**: Unearth artifacts, form hypotheses, run material analyses, verify findings against field evidence, and publish peer-reviewed papers.
- **Financial Strategy**: Manage institutional runway, cash flow, equipment depreciation, staff salaries, and research grants.
- **Simulated Markets**: Navigate macroeconomic cycles and trade financial instruments to fund expensive deep-layer excavation campaigns.
- **Codex & Archival Documentation**: Track discoveries, field notes, historical context, and archaeological methodologies.

> **Note**: All currency (đ), financial markets, instruments, and select survey scenarios are simulated in-game models for gameplay purposes. Real archaeological sites and cultural traditions are referenced with respect and academic context.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS & Vanilla CSS design system with custom typography (Cormorant Garamond, Inter)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/quannnguyen2009/relic-capital.git
cd relic-capital

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the test suite and audit scripts:

```bash
# Run unit & engine invariant tests
npx vitest run

# Run end-to-end simulation audit
npx vite-node scripts/full-audit.ts

# Run smoke test script
npx tsx scripts/smoke.ts
```

---

## 📜 License & Asset Attributions

All Wikimedia Commons photographic assets and licenses are detailed in [`public/assets/ATTRIBUTIONS.md`](public/assets/ATTRIBUTIONS.md).
