import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AppNav from "@/components/AppNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "献立ナビ - スマート献立管理・在庫ナビ",
  description: "冷蔵庫の在庫から最適な献立を提案するWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <AppNav />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
