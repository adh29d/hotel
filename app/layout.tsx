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
  themeColor: "#F7F4EF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">
        <OrderProvider>
          <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-[440px] min-h-screen bg-bone">{children}</div>
          </div>
        </OrderProvider>
      </body>
    </html>
  );
}
