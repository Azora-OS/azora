/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { Suspense } from "react";
import { LearningCenterPage } from "./components/LearningCenterPage/LearningCenterPage";
import { LearningCenterLoading } from "./components/LearningCenterLoading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Learning Center - AZORA OS x Microsoft Generative AI",
  description: "Comprehensive AI learning platform with 21 courses covering everything from prompt engineering to fine-tuning",
  applicationName: "AZORA OS Learning Center",
  authors: [{ name: "Azora AI Team" }],
  keywords: [
    "AI learning",
    "Microsoft Generative AI",
    "prompt engineering",
    "fine-tuning",
    "RAG",
    "AI agents",
    "Azora OS",
    "machine learning",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Learning Center - AZORA OS x Microsoft Generative AI",
    description: "Comprehensive AI learning platform with 21 courses covering everything from prompt engineering to fine-tuning",
    type: "website",
    siteName: "AZORA OS Learning Center",
    images: [
      {
        url: "/images/learning-center-og.png",
        width: 1200,
        height: 630,
        alt: "AZORA OS Learning Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Learning Center - AZORA OS x Microsoft Generative AI",
    description: "Comprehensive AI learning platform with 21 courses covering everything from prompt engineering to fine-tuning",
    images: ["/images/learning-center-twitter.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function LearningCenterPage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<LearningCenterLoading />}>
      <LearningCenterPage />
    </Suspense>
  );
}

