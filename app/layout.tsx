import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "والکس - بازار رمزارزها",
  description: "پلتفرم حرفه‌ای معاملات رمزارز با نمودارهای تعاملی و تحلیل تکنیکال",
  keywords: "رمزارز, بیتکوین, اتریوم, والکس, ترید, نمودار, تحلیل تکنیکال",
  authors: [{ name: "Wallex" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
