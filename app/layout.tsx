import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "行迹 · 会随你改变的旅行 Agent",
  description: "在保留原计划的前提下，根据位置、预算、天气和即时反馈，动态调整你的旅行。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

