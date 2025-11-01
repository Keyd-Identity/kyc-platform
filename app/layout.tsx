import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { MobileTabBar } from "@/components/mobile-tab-bar"
import { SplashScreen } from "@/components/splash-screen"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Keyd - Blockchain Identity Verification",
  description: "Verify your identity, humanity, and age with blockchain credentials",
  manifest: "/manifest.json",
  themeColor: "#15DACC",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <SplashScreen />
        <Navbar />
        <main className="min-h-screen mobile-tab-bar-spacing">{children}</main>
        <MobileTabBar />
        <Toaster />
      </body>
    </html>
  )
}
