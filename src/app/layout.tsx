import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
export const metadata: Metadata = { title: "RepoCosmos — any GitHub repo as a 3D galaxy", description: "Paste a public GitHub repository and explore it as an interactive galaxy." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${inter.variable} ${grotesk.variable}`}><body className="font-sans antialiased">{children}</body></html>;
}
