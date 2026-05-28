import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.simotest.com'),

  title: {
    default: 'SIMO Test - Simulacros CNSC y Examen SIMO',
    template: '%s | SIMO Test',
  },

  description:
    'Practica con simulacros tipo CNSC y examen SIMO en Colombia. Prepárate para concursos públicos con preguntas y pruebas reales.',

  keywords: [
    'SIMO',
    'examen SIMO',
    'CNSC',
    'simulacros CNSC',
    'concursos públicos Colombia',
    'preguntas CNSC',
    'pruebas SIMO',
    'empleo público Colombia',
    'simulacro SIMO',
    'preparación CNSC',
  ],

  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },

  openGraph: {
    title: 'SIMO Test - Simulacros CNSC y Examen SIMO',

    description:
      'Prepárate para concursos públicos en Colombia con simulacros tipo CNSC y examen SIMO.',

    url: 'https://www.simotest.com',

    siteName: 'SIMO Test',

    locale: 'es_CO',

    type: 'website',

    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SIMO Test - Plataforma de simulacros CNSC',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: 'SIMO Test - Simulacros CNSC y Examen SIMO',

    description:
      'Practica simulacros tipo CNSC y examen SIMO en Colombia.',

    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://www.simotest.com',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })()
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`}>
        <ClerkProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClerkProvider>

        <Analytics />
        <SpeedInsights />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GA_ID}
          />
        )}
      </body>
    </html>
  );
}

