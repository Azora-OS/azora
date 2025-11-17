import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Azora Marketplace Ui - Azora OS',
  description: 'Ubuntu Constitutional AI Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}