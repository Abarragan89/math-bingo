import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "A multiplication bingo caller: spin two reels for a times-table fact, call it out, and verify a player's card.";

export const metadata: Metadata = {
  title: "Math Bingo",
  description: DESCRIPTION,
  applicationName: "Math Bingo",
  appleWebApp: {
    capable: true,
    title: "Math Bingo",
    // Matches the felt background, so the iOS status bar blends into the table.
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0d2b1d",
  // The board is a fixed-height panel; letting it zoom-scroll under a keyboard
  // on iOS makes the controls jump, so the layout stays at scale.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
