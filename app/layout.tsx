import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "HaritaDocs",
  description: "A guided workspace for consultants and project teams to review files, track progress, and prepare submissions.",
};

const themeScript = `
(() => {
  const storageKey = 'harita-theme';
  const stored = window.localStorage.getItem(storageKey);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored === 'light' || stored === 'dark' || stored === 'system'
    ? (stored === 'system' ? (systemPrefersDark ? 'dark' : 'light') : stored)
    : (systemPrefersDark ? 'dark' : 'light');
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-[var(--color-bg)] text-[13px] text-[var(--color-text-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
