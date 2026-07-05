// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- Added Toaster import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEET Ecosystem",
  description: "Your ultimate NEET prep companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // <-- Added for next-themes compatibility
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50">
        {children}
        <Toaster richColors position="top-center" theme="dark" /> {/* <-- Added Toaster */}
      </body>
    </html>
  );
}
