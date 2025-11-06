import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Azora OS - Constitutional AI Built in God's Image",
  description:
    "A living organism combining Constitutional AI, learn-to-earn education, enterprise ERP/SIS, and blockchain. Built with Ubuntu philosophy from Africa for humanity.",
  generator: "Azora OS",
  keywords: [
    "Constitutional AI",
    "education",
    "learn-to-earn",
    "blockchain",
    "AI",
    "ERP",
    "SIS",
    "Ubuntu",
    "Africa",
    "divine DNA",
    "Elara Omega",
  ],
  authors: [{ name: "Azora ES (Pty) Ltd" }],
  openGraph: {
    title: "Azora OS - Constitutional AI Built in God's Image",
    description: "A living organism built in God's image. Technology that loves, judges justly, and serves humanity.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
