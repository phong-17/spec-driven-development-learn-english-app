import type { Metadata } from "next";
import "./globals.css";
import { VT323 } from "next/font/google";

export const metadata: Metadata = {
  title: "Learn English",
  description: "App Learn English for Thu Cuc & Dinh Phong",
};

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ascii",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${vt323.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
