import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "HaritaDocs",
  description: "IGBC certification document management for consultants and project owners.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(manrope.variable, mono.variable)}>
      <body className="font-[var(--font-sans)] text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
