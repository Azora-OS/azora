/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { Suspense } from "react";
import { AzoraBasePage } from "./components/AzoraBasePage/AzoraBasePage";
import { AzoraBaseLoading } from "./components/AzoraBaseLoading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AzoraBase - AZORA OS x Supabase Database Management",
  description: "Complete database management system with real-time sync, authentication, storage, and edge functions",
  applicationName: "AzoraBase Database System",
  authors: [{ name: "Azora AI Team" }],
  keywords: [
    "database management",
    "Supabase",
    "PostgreSQL",
    "real-time sync",
    "authentication",
    "storage",
    "edge functions",
    "Azora OS",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AzoraBase - AZORA OS x Supabase Database Management",
    description: "Complete database management system with real-time sync, authentication, storage, and edge functions",
    type: "website",
    siteName: "AzoraBase Database System",
    images: [
      {
        url: "/images/azorabase-og.png",
        width: 1200,
        height: 630,
        alt: "AzoraBase Database System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AzoraBase - AZORA OS x Supabase Database Management",
    description: "Complete database management system with real-time sync, authentication, storage, and edge functions",
    images: ["/images/azorabase-twitter.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function AzoraBasePage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<AzoraBaseLoading />}>
      <AzoraBasePage />
    </Suspense>
  );
}

