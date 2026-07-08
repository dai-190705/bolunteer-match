import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOCSY",
  description: "学生の可能性を最大化させる。NO ONE CAN STOP YOU",
  metadataBase: new URL("https://www.nocsy.me"),
  openGraph: {
    title: "NOCSY | NO ONE CAN STOP YOU",
    description: "学生の可能性を最大化させる。",
    url: "https://www.nocsy.me",
    siteName: "NOCSY",
    images: [{ url: "/nocsy-ogp.png", width: 1200, height: 630, alt: "NOCSY" }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOCSY | NO ONE CAN STOP YOU",
    description: "学生の可能性を最大化させる。",
    images: ["/nocsy-ogp.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} antialiased`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
