import type { Metadata } from "next";
import { Inter, Gowun_Batang } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const gowunBatang = Gowun_Batang({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gowun-batang",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lian2nd.github.io"),
  title: {
    default: "Alfian Nur Usyaid — Fullstack Developer",
    template: "%s | Alfian Nur Usyaid",
  },
  description:
    "Portfolio of Alfian Nur Usyaid — Fullstack Developer specializing in Next.js, Laravel, Flask, and Blockchain. Cumlaude CS graduate (GPA 3.94) based in Bogor, Indonesia.",
  keywords: [
    "Alfian Nur Usyaid",
    "Fullstack Developer",
    "Next.js Developer",
    "Laravel Developer",
    "React Developer",
    "Web Developer Indonesia",
    "Blockchain Developer",
    "Portfolio",
    "Software Engineer",
  ],
  authors: [{ name: "Alfian Nur Usyaid", url: "https://lian2nd.github.io" }],
  creator: "Alfian Nur Usyaid",
  publisher: "Alfian Nur Usyaid",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://lian2nd.github.io",
  },
  openGraph: {
    title: "Alfian Nur Usyaid — Fullstack Developer",
    description:
      "Portfolio of Alfian Nur Usyaid — Fullstack Developer specializing in Next.js, Laravel, Flask, and Blockchain. Cumlaude CS graduate (GPA 3.94).",
    url: "https://lian2nd.github.io",
    siteName: "Alfian Nur Usyaid Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/img/hero.png",
        width: 1200,
        height: 630,
        alt: "Alfian Nur Usyaid — Fullstack Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfian Nur Usyaid — Fullstack Developer",
    description:
      "Fullstack Developer specializing in Next.js, Laravel, Flask, and Blockchain. Open for work.",
    images: ["/img/hero.png"],
  },
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${gowunBatang.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
