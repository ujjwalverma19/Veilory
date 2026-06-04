import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Veilory | Emotional Wisdom Preservation",
  description: "An AI-powered platform to preserve and search human emotional experiences, life lessons, and growth stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased transition-colors duration-300`}>
        <Navbar />
        <main className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
