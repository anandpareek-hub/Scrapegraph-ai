import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ScrapeGraph Studio",
  description: "A Vercel scraper workspace powered by ScrapeGraphAI.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
