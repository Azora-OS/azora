'use client';

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TelemetryProvider } from "@/components/telemetry-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"
import "./globals-premium.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <TelemetryProvider>
            {children}
          </TelemetryProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
