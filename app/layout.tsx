import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Caredent",
  description: "探究プログラム・ボランティア募集プラットフォーム",
  metadataBase: new URL("https://tankyuu-program.vercel.app"),
  openGraph: {
    title: "Caredent",
    description: "探究プログラム・ボランティア募集プラットフォーム",
    url: "https://tankyuu-program.vercel.app",
    siteName: "Caredent",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "Caredent",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caredent",
    description: "探究プログラム・ボランティア募集プラットフォーム",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} antialiased`}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
