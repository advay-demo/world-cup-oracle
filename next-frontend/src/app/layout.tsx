import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "World Cup Oracle AI | FIFA 2026 Predictions & Analytics",
  description:
    "The world's most advanced AI-powered FIFA World Cup 2026 prediction platform. Featuring Monte Carlo simulations, ELO ratings, xG models, and ensemble AI for all 48 nations.",
  keywords: ["FIFA World Cup 2026", "football predictions", "AI analytics", "ELO ratings"],
  openGraph: {
    title: "World Cup Oracle AI",
    description: "Premium AI football analytics for FIFA World Cup 2026",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="stadium-gradient noise-texture min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
