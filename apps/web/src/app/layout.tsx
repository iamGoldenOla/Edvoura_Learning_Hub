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

export const metadata: Metadata = {
  title: "Edvoura | Premium K-12 Online Tutoring Hub — Nigeria",
  description:
    "Edvoura connects K-12 students across Nigeria with expert tutors for live sessions via Google Meet. Interactive quizzes, assignments, progress tracking, and parent dashboards — all in one platform. Learn. Grow. Excel.",
  keywords: [
    "online tutoring Nigeria",
    "K-12 learning platform",
    "WAEC preparation",
    "JAMB preparation",
    "Nigerian tutors online",
    "Edvoura",
  ],
  openGraph: {
    title: "Edvoura Learning Hub — Learn. Grow. Excel.",
    description:
      "Nigeria's premier K-12 online tutoring platform. Expert tutors, live sessions, interactive learning tools.",
    url: "https://edvouralearninghub.com",
    siteName: "Edvoura Learning Hub",
    type: "website",
  },
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
