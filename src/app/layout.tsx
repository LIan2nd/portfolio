import type { Metadata } from "next";
import { Inter, Gowun_Batang } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AiVisibilityProvider } from "@/components/AiVisibilityContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { HOME_DESCRIPTION, SITE_URL } from "@/lib/seo";
import { PRIMARY_PROFILE_PHOTO } from "@/lib/profilePhotos";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Alfian Nur Usyaid — Fullstack Web Developer Portfolio",
    template: "%s | Alfian Nur Usyaid",
  },
  description: HOME_DESCRIPTION,
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
  authors: [{ name: "Alfian Nur Usyaid", url: "https://portfolio.liand.web.id" }],
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
    canonical: "https://portfolio.liand.web.id",
  },
  openGraph: {
    title: "Alfian Nur Usyaid — Fullstack Web Developer Portfolio",
    description: HOME_DESCRIPTION,
    url: "https://portfolio.liand.web.id",
    siteName: "LIand",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: PRIMARY_PROFILE_PHOTO.src,
        width: PRIMARY_PROFILE_PHOTO.width,
        height: PRIMARY_PROFILE_PHOTO.height,
        alt: PRIMARY_PROFILE_PHOTO.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfian Nur Usyaid — Fullstack Web Developer Portfolio",
    description: HOME_DESCRIPTION,
    images: [PRIMARY_PROFILE_PHOTO.src],
  },
  verification: {
    google: "5K0Z9r269vfnAcps_OeSx6pAZMDRD4D5iWAWTXV64HU",
  },
  /* Icons are auto-detected by Next.js App Router file convention:
     src/app/favicon.ico, src/app/icon.svg, src/app/apple-icon.png
     Additional PWA sizes served from public/ via manifest.ts */
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
        <ThemeProvider>
          <AiVisibilityProvider>{children}</AiVisibilityProvider>
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
