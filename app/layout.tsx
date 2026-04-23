import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "HaritaDocs",
  description: "A guided workspace for consultants and project teams to review files, track progress, and prepare submissions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-bg)] text-[13px] text-[var(--color-text-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
