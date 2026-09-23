import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://originmark-platform.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OriginMark - Digital Signature Verification for AI Content",
    template: "%s | OriginMark",
  },
  description:
    "Sign and verify AI-generated content with cryptographic Ed25519 signatures. Ensure authenticity and traceability of AI outputs.",
  keywords: [
    "AI content verification",
    "digital signature",
    "Ed25519",
    "AI authenticity",
    "content provenance",
    "C2PA",
    "AI transparency",
  ],
  authors: [{ name: "OriginMark" }],
  creator: "OriginMark",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "OriginMark",
    title: "OriginMark - Digital Signature Verification for AI Content",
    description:
      "Sign and verify AI-generated content with cryptographic signatures",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OriginMark - AI Content Verification",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OriginMark - AI Content Verification",
    description: "Sign and verify AI-generated content with cryptographic signatures",
    images: ["/og-image.png"],
  },
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favi.png", type: "image/png", sizes: "128x128" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas text-ink antialiased selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}