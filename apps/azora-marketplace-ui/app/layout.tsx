import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azora Marketplace",
  description: "The premier marketplace for Azora OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
