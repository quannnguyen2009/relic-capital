import type { Metadata } from "next";
import { Press_Start_2P, VT323, Chakra_Petch, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

// Press Start 2P: Pure 8-bit arcade headers (ASCII/English chrome)
const pixel = Press_Start_2P({ subsets: ["latin"], weight: ["400"], variable: "--font-pixel" });

// VT323: Authentic retro pixel terminal font with native Vietnamese subset
const vt323Font = VT323({
  subsets: ["vietnamese", "latin", "latin-ext"],
  weight: "400",
  variable: "--font-vt323",
});

// Chakra Petch: Geometric retro/arcade techno font with native Vietnamese subset
const chakraFont = Chakra_Petch({
  subsets: ["vietnamese", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
});

// Be Vietnam Pro: Native Vietnamese font designed specifically for Vietnamese typography
const vietnamFont = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vietnam",
});

export const metadata: Metadata = {
  title: "Relic Capital",
  description: "A Vietnamese archaeology strategy game — every excavation is an investment, every discovery a hypothesis.",
  icons: {
    icon: "/assets/logo.svg",
    shortcut: "/assets/logo.svg",
    apple: "/assets/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${vt323Font.variable} ${chakraFont.variable} ${vietnamFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
