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
    default: "Edvoura Learning Hub | K-12 Online Tutoring for Global & Diaspora Families",
    template: "%s | Edvoura Learning Hub",
  },
  description:
    "Edvoura is the premier global online tutoring hub trusted by parents in the UK, US, Canada, and Nigeria. Connect with certified 1-on-1 tutors starting from $7/hr across British National Curriculum (GCSE), US Common Core, and Nigerian WAEC/JAMB standards.",
  keywords: [
    // Diaspora Specific (GEO/AEO)
    "Nigerian diaspora online tutoring UK",
    "online tutor for African kids abroad",
    "affordable GCSE tutor UK for diaspora",
    "US Common Core math tutor Canada US",
    "African storybooks for children abroad",
    "11-plus exam preparation diaspora",
    "WAEC past questions practice online",
    "JAMB CBT practice online",
    "online tutoring Nigeria and UK",
    "certified virtual tutors Grades 1-12",
    "EYFS nursery preschool early years online",
    "Edvoura Learning Hub",
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
    title: "Edvoura Learning Hub | K-12 Online Tutoring for Global & Diaspora Families",
    description:
      "Connect with certified 1-on-1 tutors starting from $7/hr. British Curriculum (GCSE), US Common Core, and Nigerian WAEC/JAMB mastery tailored for families in the UK, US, Canada & Nigeria.",
    url: baseUrl,
    siteName: "Edvoura Learning Hub",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/og-card.svg",
        width: 1200,
        height: 630,
        alt: "Edvoura Learning Hub — 1-on-1 Online Tutoring for Global & Diaspora Families",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edvoura Learning Hub | K-12 Online Tutoring for Global & Diaspora Families",
    description:
      "Certified 1-on-1 tutoring starting at $7/hr. Supporting UK, US, Canadian, and Nigerian curricula with interactive whiteboards and 300,000+ practice questions.",
    creator: "@edvoura",
    images: ["/og-card.svg"],
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

// Rich Entity Graph for Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO)
const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#organization`,
      name: "Edvoura Learning Hub",
      url: baseUrl,
      logo: `${baseUrl}/icon.svg`,
      description:
        "Premier global online tutoring platform providing 1-on-1 live lessons, curriculum mastery, and open storybooks for K-12 students worldwide.",
      foundingDate: "2024",
      areaServed: [
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "Nigeria" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Australia" },
        { "@type": "Country", name: "Ghana" },
      ],
      knowsAbout: [
        "British National Curriculum (Key Stages 1-4 & GCSE)",
        "US Common Core State Standards (K-12)",
        "West African Senior School Certificate Examination (WAEC)",
        "Joint Admissions and Matriculation Board (JAMB/UTME)",
        "Early Years Foundation Stage (EYFS)",
        "African Storybooks & Multilingual Literacy",
        "STEM Education and Mental Mathematics",
      ],
      priceRange: "$7 - $12 per hour",
      sameAs: [
        "https://twitter.com/edvoura",
        "https://facebook.com/edvoura",
        "https://instagram.com/edvoura",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Can diaspora parents in the UK, US, and Canada use Edvoura for their children?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Edvoura is specifically optimized for diaspora and international families. Tutors are available 24/7 across UK (GMT/BST), US/Canada (EST, CST, PST), and European time zones, providing culturally grounded, curriculum-aligned 1-on-1 tutoring.",
          },
        },
        {
          "@type": "Question",
          name: "Which curricula does Edvoura support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Edvoura supports the British National Curriculum (Key Stage 1–4, 11-plus, and GCSE), US Common Core (Grades 1–12), Nigerian National Curriculum (NERDC, WAEC, NECO, JAMB/UTME), and Indian CBSE/ICSE standards.",
          },
        },
        {
          "@type": "Question",
          name: "How much does online tutoring cost on Edvoura compared to local UK or US tutors?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "While local private tutoring in the UK or US typically costs $40 to $80 per hour (£35 to £65/hr), Edvoura packages start from just $7 to $12 per session—saving diaspora parents over 70% while providing certified 1-on-1 educators and interactive digital whiteboards.",
          },
        },
        {
          "@type": "Question",
          name: "How do lessons take place on Edvoura?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Lessons take place in real-time inside the Edvoura Classroom Hub, featuring live HD video, the interactive EDVOURA Whiteboard, individual student seat-work desks, PDF annotation, and recorded sessions for parent review.",
          },
        },
      ],
    },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
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
