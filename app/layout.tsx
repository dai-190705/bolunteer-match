import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOCSY",
  description: "学生の可能性を最大化させる。",
  metadataBase: new URL("https://www.nocsy.me"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
