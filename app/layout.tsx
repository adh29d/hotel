import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/lib/OrderContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RMS Pay",
  description: "Express checkout for your stay.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans bg-white">
        <OrderProvider>
          <div className="min-h-[100dvh] flex justify-center bg-[#0a0a0a]">
            <div className="w-full max-w-[440px] min-h-[100dvh] bg-white relative overflow-hidden">
              {children}
            </div>
          </div>
        </OrderProvider>
      </body>
    </html>
  );
}
