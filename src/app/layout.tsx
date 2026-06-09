import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnonymX | Zero-Trust Data Masking Pipeline",
  description: "Secure GCC FinTech data with Format-Preserving Encryption and real-time masking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} antialiased dark`}>
      <body className="bg-black text-white selection:bg-cyber-emerald/30">
        {children}
      </body>
    </html>
  );
}
