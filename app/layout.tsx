import type { Metadata, Viewport } from "next"
import { Fraunces, Inter } from "next/font/google"

import { ThemeScript } from "@/components/layout/theme"
import { MotionProvider } from "@/components/shared/reveal"
import { Toaster } from "@/components/ui/sonner"
import { camper } from "@/content/camper"
import { siteUrl } from "@/lib/site"

import "./globals.css"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" })
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: camper.seo.title, template: `%s | ${camper.name}` },
  description: camper.seo.description,
  keywords: camper.seo.keywords,
  applicationName: camper.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    siteName: camper.name,
    title: camper.seo.title,
    description: camper.seo.description,
    url: "/",
    images: [{ url: camper.hero.image, width: 2400, height: 1350, alt: camper.hero.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: camper.seo.title,
    description: camper.seo.description,
    images: [camper.hero.image],
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#111913" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hu" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#tartalom"
          className="sr-only z-[60] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Ugrás a tartalomra
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
