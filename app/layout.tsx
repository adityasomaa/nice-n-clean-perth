import type { Metadata, Viewport } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import { ChatProvider } from "@/components/Chat";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

// Poppins matches the logo's wordmark; DM Sans for reading
const poppins = Poppins({ variable: "--font-poppins", weight: ["500", "600", "700"], subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nice-n-clean-perth.vercel.app"),
  title: "Nice N Clean — Carpet, Tile & Upholstery Cleaning Perth Since 1981",
  description:
    "Family-owned carpet, tile and grout, upholstery and rug cleaning in Perth's southern and coastal suburbs since 1981. Truck-mounted hot water extraction, dry in 2–4 hours. 5.0 on Google from 329 reviews.",
  openGraph: {
    title: "Nice N Clean, Perth",
    description: "Carpet, tile, grout and upholstery cleaning since 1981. Book Leon online.",
    images: [{ url: "/images/hero.jpg", width: 1600, height: 1200 }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6fbfc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSans.variable} is-loading antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <SmoothScroll>
          <PageTransition>
            <ChatProvider>{children}</ChatProvider>
          </PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
