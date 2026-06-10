import type { Metadata, Viewport } from "next";
import { Montserrat, Karla, JetBrains_Mono } from "next/font/google";
import { bios } from "@/data/content";
import {
  SITE_URL,
  PERSON_NAME,
  PERSON_ROLE,
  PERSON_FIRST_NAME,
  PERSON_LAST_NAME,
  KEYWORDS,
} from "@/data/site";
import "./globals.css";

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const title = `${PERSON_NAME} — ${PERSON_ROLE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description: bios.es,
  applicationName: PERSON_NAME,
  authors: [{ name: PERSON_NAME, url: SITE_URL }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  keywords: KEYWORDS,
  category: "portfolio",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    firstName: PERSON_FIRST_NAME,
    lastName: PERSON_LAST_NAME,
    title,
    description: bios.es,
    url: SITE_URL,
    siteName: PERSON_NAME,
    locale: "es_ES",
    alternateLocale: ["en_US", "pt_BR"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: bios.es,
  },
  appleWebApp: {
    capable: true,
    title: PERSON_NAME,
    statusBarStyle: "black-translucent",
  },
  icons: { icon: "/angela.jpg", apple: "/angela.jpg" },
};

export const viewport: Viewport = {
  themeColor: "#0A0818",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${karla.variable} ${montserrat.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
