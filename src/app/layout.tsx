import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "coy · Discover",
  description: "Swipe-based Discover tab for Coy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} antialiased`}><MotionProvider>{children}</MotionProvider></body>
    </html>
  );
}
