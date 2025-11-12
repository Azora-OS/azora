import './globals.css'

export const metadata = {
  title: 'AZORA - World\'s Best Education Platform',
  description: 'Learn, Code, Earn. Revolutionary education where students become millionaire CEOs.',
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
