import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["vietnamese", "latin"], weight: ["500", "600", "700"], variable: "--font-serif" });
const sans = Inter({ subsets: ["vietnamese", "latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Relic Capital",
  description: "A Vietnamese archaeology strategy game — every excavation is an investment, every discovery a hypothesis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
