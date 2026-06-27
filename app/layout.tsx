import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fabohax.github.io/todo"
  ),
  applicationName: "todo",
  title: {
    default: "todo - Minimal Task Tracker",
    template: "%s | todo",
  },
  description:
    "A minimal, local-first task tracker for adding tasks, completing work, importing backups, and visualizing completion streaks.",
  keywords: [
    "todo app",
    "task tracker",
    "minimal todo list",
    "local-first productivity",
    "completion heatmap",
  ],
  authors: [{ name: "fabohax", url: "https://github.com/fabohax" }],
  creator: "fabohax",
  publisher: "fabohax",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "todo - Minimal Task Tracker",
    description:
      "A minimal, local-first task tracker with backups and a completion heatmap.",
    siteName: "todo",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "todo app icon",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "todo - Minimal Task Tracker",
    description:
      "A minimal, local-first task tracker with backups and a completion heatmap.",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "todo",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any",
    description:
      "A minimal, local-first task tracker for adding tasks, completing work, importing backups, and visualizing completion streaks.",
    author: {
      "@type": "Person",
      name: "fabohax",
      url: "https://github.com/fabohax",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
