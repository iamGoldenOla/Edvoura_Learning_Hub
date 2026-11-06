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
    default: "Edvoura Learning Hub | Global K-12 Online Tutoring & Academic Mastery",
    template: "%s | Edvoura Learning Hub",
  },
  description:
    "Edvoura is the premier global online tutoring platform trusted by international and diaspora families across the UK, US, Canada, China, Japan, Russia, UAE, and Nigeria. Connect with certified 1-on-1 tutors starting from $20/hr across Cambridge IGCSE, IB, US Common Core, and WAEC curricula.",
  keywords: [
    // Global & Diaspora Corridors (GEO / AEO)
    "online tutoring international students",
    "English online tutor Japan Tokyo expat",
    "K-12 online tutoring China Shanghai Beijing",
    "Cambridge IGCSE online tutoring Russia",
    "Nigerian diaspora online tutoring UK",
    "US Common Core math tutor Canada US",
    "International Baccalaureate IB online tutor",
    "Singapore math Olympiad problem solving",
    "WAEC JAMB past questions practice online",
    "certified virtual tutors Grades 1-12",
    "EYFS nursery preschool early years online",
    "Edvoura Learning Hub",
    "EdTech global tutoring platform",
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
    title: "Edvoura Learning Hub | Global K-12 Online Tutoring & Academic Mastery",
    description:
      "Elite 1-on-1 tutoring starting at $20/hr. Certified educators for Cambridge IGCSE, IB, US Common Core, and WAEC across UK, US, Canada, China, Japan, Russia & Nigeria.",
    url: baseUrl,
    siteName: "Edvoura Learning Hub",
    locale: "en_US",
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
    title: "Edvoura Learning Hub | Global K-12 Online Tutoring & Academic Mastery",
    description:
      "Elite 1-on-1 tutoring starting at $20/hr. Supporting UK, US, Canadian, Asian, and African curricula with interactive whiteboards and 300,000+ practice questions.",
    creator: "@edvoura",
    images: ["/og-card.svg"],
  },
  other: {
    // LinkedIn & Professional Web Previews
    "linkedin:owner": "https://www.linkedin.com/company/edvoura",
    "og:see_also": "https://www.linkedin.com/company/edvoura",
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
        "Premier global online tutoring and learning platform providing 1-on-1 live lessons, international curriculum mastery, and digital classroom tools for K-12 students worldwide.",
      foundingDate: "2024",
      areaServed: [
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Canada" },
        { "@type": "Country", name: "China" },
        { "@type": "Country", name: "Japan" },
        { "@type": "Country", name: "Russia" },
        { "@type": "Country", name: "Nigeria" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "Australia" },
        { "@type": "Country", name: "Singapore" },
        { "@type": "Country", name: "Germany" },
        { "@type": "Country", name: "France" },
        { "@type": "Country", name: "Ghana" },
      ],
      knowsAbout: [
        "Cambridge Assessment International Education (CIE / IGCSE)",
        "International Baccalaureate (IB PYP, MYP & DP)",
        "British National Curriculum (Key Stages 1-4 & GCSE)",
        "US Common Core State Standards (K-12)",
        "West African Examinations Council (WAEC & NECO)",
        "Singapore Mathematics & Global Olympiad Problem Solving",
        "Early Years Foundation Stage (EYFS)",
        "Multilingual Literacy & Open Storybooks",
        "STEM Education and Mental Mathematics",
      ],
      priceRange: "$20 - $30 per hour",
      sameAs: [
        "https://www.linkedin.com/company/edvoura",
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
          name: "Can international families in China, Japan, Russia, the UK, and the US use Edvoura?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Edvoura is built for international, expat, and diaspora families worldwide. Our certified bilingual and English-medium tutors accommodate time zones across Asia (JST, CST), Europe/UK (MSK, GMT/BST), North America (EST, CST, PST), and Africa (WAT).",
          },
        },
        {
          "@type": "Question",
          name: "Which international curricula does Edvoura support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Edvoura supports Cambridge IGCSE, International Baccalaureate (IB), British National Curriculum (Key Stages 1-4 & GCSE), US Common Core (Grades 1-12), Singapore Math, and West African WAEC/JAMB standards.",
          },
        },
        {
          "@type": "Question",
          name: "How much does online tutoring cost on Edvoura?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Edvoura tutoring plans start at $20 per session ($240/month for 12 sessions). This provides top-tier certified educators and interactive digital whiteboards at 50% to 70% below local tutoring rates in Tokyo, London, New York, or Shanghai.",
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
