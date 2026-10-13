import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";

const bangla = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bangla",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const platformName = process.env.NEXT_PUBLIC_PLATFORM_NAME ?? "xyz";

export const metadata: Metadata = {
  title: { default: `${platformName} | School Management`, template: `%s | ${platformName}` },
  description: "Admission, attendance, fees and results for schools, madrasas and coaching centers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF3DC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${bangla.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
