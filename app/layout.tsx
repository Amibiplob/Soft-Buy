import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SoftBuy",
  description: "SoftBuy Best deal all the time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-green-50">
        <SessionProviderWrapper>
          <CartProvider>
            <Navbar />
            {children}
            <Toaster />
            <Footer />
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
