import './globals.css'

export const metadata = {
  title: 'AZORA - World\'s Best Education Platform',
  description: 'Learn, Code, Earn. Revolutionary AI-powered education where students become millionaire CEOs while learning.',
  keywords: 'education, AI tutoring, online learning, student CEO, revenue projects, Elara AI',
  authors: [{ name: 'AZORA ES (Pty) Ltd' }],
  icons: {
    icon: '/packages/public/branding/icons/app-icon-512.svg',
    apple: '/packages/public/branding/icons/app-icon-1024.svg',
  },
  openGraph: {
    title: 'AZORA - World\'s Best Education Platform',
    description: 'Revolutionary education where students become millionaire CEOs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/packages/public/branding/icons/app-icon-512.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
