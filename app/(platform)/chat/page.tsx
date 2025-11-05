/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { Suspense } from "react";
import { ChatInterfacePage } from "./components/ChatInterfacePage/ChatInterfacePage";
import { ChatInterfaceLoading } from "./components/ChatInterfaceLoading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Chat Interface - AZORA OS x Open WebUI",
  description: "Advanced AI chat interface with multiple model support, code execution, and real-time collaboration",
  applicationName: "AZORA OS Chat Interface",
  authors: [{ name: "Azora AI Team" }],
  keywords: [
    "AI chat",
    "Open WebUI",
    "conversational AI",
    "code execution",
    "real-time chat",
    "Azora OS",
    "LLM interface",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Chat Interface - AZORA OS x Open WebUI",
    description: "Advanced AI chat interface with multiple model support, code execution, and real-time collaboration",
    type: "website",
    siteName: "AZORA OS Chat Interface",
    images: [
      {
        url: "/images/chat-interface-og.png",
        width: 1200,
        height: 630,
        alt: "AZORA OS Chat Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chat Interface - AZORA OS x Open WebUI",
    description: "Advanced AI chat interface with multiple model support, code execution, and real-time collaboration",
    images: ["/images/chat-interface-twitter.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function ChatInterfacePage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<ChatInterfaceLoading />}>
      <ChatInterfacePage />
    </Suspense>
  );
}

