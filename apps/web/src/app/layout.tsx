import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query-client";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "EduNexus - College Management Platform",
  description: "AI-first, student-centric college management platform for Indian engineering colleges",
  manifest: "/manifest.json",
  applicationName: "EduNexus",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduNexus",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/favicon.png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://edunexus.app",
    siteName: "EduNexus",
    title: "EduNexus - College Management Platform",
    description: "AI-first, student-centric college management platform for Indian engineering colleges",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "EduNexus Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduNexus - College Management Platform",
    description: "AI-first, student-centric college management platform for Indian engineering colleges",
    images: ["/icons/icon-512x512.png"],
  },
  keywords: [
    "college management",
    "education ERP",
    "student portal",
    "attendance management",
    "fee management",
    "engineering college",
    "India",
    "AI education",
  ],
  authors: [{ name: "EduNexus Team" }],
  creator: "EduNexus",
  publisher: "EduNexus",
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* PWA Meta Tags */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="EduNexus" />
          <meta name="msapplication-TileColor" content="#4F46E5" />
          <meta name="msapplication-tap-highlight" content="no" />

          {/* Splash screens for iOS */}
          <link
            rel="apple-touch-startup-image"
            href="/icons/icon-512x512.png"
            media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
