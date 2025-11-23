import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AZORA - World's Best Education Platform",
  description: "AI-Powered Learning | Earn While You Learn | Ubuntu Philosophy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] min-h-screen text-white">
        {children}
      </body>
    </html>
  );
}
