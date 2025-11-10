import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TelemetryProvider } from "@/components/telemetry-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Azora Sapiens - Get Paid to Learn",
  description:
    "Transform education from cost to paid work. Earn cryptocurrency while learning with AI tutors. Graduate debt-free with real experience.",
  generator: "v0.app",
}

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
