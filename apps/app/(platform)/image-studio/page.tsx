/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { Suspense } from "react";
import { ImageStudioPage } from "./components/ImageStudioPage/ImageStudioPage";
import { ImageStudioLoading } from "./components/ImageStudioLoading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Image Studio - AZORA OS x Stable Diffusion",
  description: "Create stunning images with AI-powered Stable Diffusion technology",
  applicationName: "AZORA OS Image Studio",
  authors: [{ name: "Azora AI Team" }],
  keywords: [
    "AI image generation",
    "Stable Diffusion",
    "artificial intelligence",
    "image creation",
    "Azora OS",
    "machine learning",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Image Studio - AZORA OS x Stable Diffusion",
    description: "Create stunning images with AI-powered Stable Diffusion technology",
    type: "website",
    siteName: "AZORA OS Image Studio",
    images: [
      {
        url: "/images/image-studio-og.png",
        width: 1200,
        height: 630,
        alt: "AZORA OS Image Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Studio - AZORA OS x Stable Diffusion",
    description: "Create stunning images with AI-powered Stable Diffusion technology",
    images: ["/images/image-studio-twitter.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function ImageStudioPage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<ImageStudioLoading />}>
      <ImageStudioPage />
    </Suspense>
  );
}

