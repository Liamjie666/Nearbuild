import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { HardwareProvider } from "@/contexts/HardwareContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NeraBuild 黑匣装机 - All in Black, Build in 3D",
  description: "专业的3D可视化装机平台，为DIY游戏玩家提供全硬件数据库、性能模拟器和一键下单服务",
  keywords: "装机,DIY,游戏电脑,3D可视化,硬件配置,性能测试",
  authors: [{ name: "NeraBuild Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "NeraBuild 黑匣装机",
    description: "All in Black, Build in 3D - 专业的3D可视化装机平台",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={poppins.variable}>
        <HardwareProvider>
          {children}
        </HardwareProvider>
      </body>
    </html>
  );
}
