import type { Metadata } from "next";
import { Syne, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://edvouralearninghub.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Edvoura Learning Hub | K-12 Online Tutoring & Learning Platform",
    template: "%s | Edvoura Learning Hub",
  },
  description:
    "Edvoura is the premier global K-12 online tutoring hub. Connect with expert tutors for live lessons, practice WAEC, JAMB, GCSE & US Common Core quizzes, explore open-licensed storybooks, and track learning mastery.",
  keywords: [
    "online tutoring Nigeria",
    "K-12 learning hub",
    "WAEC past questions practice",
    "JAMB CBT practice online",
    "GCSE online tutoring",
    "US Common Core math",
    "AI quiz generator for students",
    "African storybooks for children",
    "EYFS nursery preschool learning",
    "expert live tutors",
    "Edvoura",
  ],
  authors: [{ name: "Edvoura Learning Hub", url: baseUrl }],
  creator: "Edvoura Learning Hub",
  publisher: "Edvoura",
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "Edvoura Learning Hub | K-12 Online Tutoring & Learning Platform",
    description:
      "Master any subject with 1-on-1 expert tutors, 300,000+ past questions, open-licensed storybooks, and curriculum-aligned practice for Grades 1–12.",
    url: baseUrl,
    siteName: "Edvoura Learning Hub",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/og-card.png",
        width: 1200,
        height: 630,
        alt: "Edvoura Learning Hub — Learn. Grow. Excel.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edvoura Learning Hub | K-12 Online Tutoring & Learning Platform",
    description:
      "Master any subject with 1-on-1 expert tutors, 300,000+ past questions, open-licensed storybooks, and curriculum-aligned practice.",
    creator: "@edvoura",
    images: ["/images/og-card.png"],
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Edvoura Learning Hub",
  url: baseUrl,
  logo: `${baseUrl}/icon.svg`,
  description:
    "Premier global K-12 online tutoring platform, learning practice hub, and storybook library.",
  sameAs: [
    "https://twitter.com/edvoura",
    "https://facebook.com/edvoura",
    "https://instagram.com/edvoura",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} ${geistMono.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5C518" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('PWA ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
