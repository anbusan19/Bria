import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import FaviconLinks from "./components/FaviconLinks";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sync - Visual CI/CD for the Enterprise",
  description: "The first deterministic infrastructure for Generative AI. Transform image generation from a creative task into an infrastructure process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#050505] text-white selection:bg-accent selection:text-black font-sans">
        <FaviconLinks />
        {children}
      </body>
    </html>
  );
}
