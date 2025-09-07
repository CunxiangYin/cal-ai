import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cal AI - 智能卡路里追踪",
  description: "AI驱动的饮食记录和营养分析应用",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Fixed Header */}
          <Header title="Cal AI" />
          
          {/* Main Content */}
          <main className="pt-14 pb-16 h-screen">
            <div className="h-full max-w-md mx-auto bg-white">
              {children}
            </div>
          </main>
          
          {/* Fixed Bottom Navigation */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
