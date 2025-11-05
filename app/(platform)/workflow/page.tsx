/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import { Metadata } from "next";
import { Suspense } from "react";
import { WorkflowPage } from "./components/WorkflowPage/WorkflowPage";
import { WorkflowLoading } from "./components/WorkflowLoading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Workflow Studio - AZORA OS x Dify",
  description: "Build and deploy powerful AI workflows with visual drag-and-drop interface",
  applicationName: "AZORA OS Workflow Studio",
  authors: [{ name: "Azora AI Team" }],
  keywords: [
    "AI workflows",
    "visual programming",
    "automation",
    "Dify",
    "Azora OS",
    "LangChain",
    "AI agents",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Workflow Studio - AZORA OS x Dify",
    description: "Build and deploy powerful AI workflows with visual drag-and-drop interface",
    type: "website",
    siteName: "AZORA OS Workflow Studio",
    images: [
      {
        url: "/images/workflow-og.png",
        width: 1200,
        height: 630,
        alt: "AZORA OS Workflow Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Workflow Studio - AZORA OS x Dify",
    description: "Build and deploy powerful AI workflows with visual drag-and-drop interface",
    images: ["/images/workflow-twitter.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function WorkflowPage(): Promise<React.ReactElement> {
  return (
    <Suspense fallback={<WorkflowLoading />}>
      <WorkflowPage />
    </Suspense>
  );
}

