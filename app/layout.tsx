import type { Metadata } from "next";
import { Geist, Geist_Mono, Josefin_Sans, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeBackground } from "@/components/ThemeBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "skar zone | Video + Resource Vault",
  description: "Tech | Coding | Dev | Experiments — Curated video content and developer resources by skar zone",
  keywords: ["tech", "coding", "dev", "experiments", "tutorials", "resources", "skar zone"],
  openGraph: {
    title: "skar zone | Video + Resource Vault",
    description: "Tech | Coding | Dev | Experiments",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${josefinSans.variable} ${orbitron.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Providers>
          <ThemeBackground />
          <Navbar />
          <main className="relative z-10 pt-16 min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
