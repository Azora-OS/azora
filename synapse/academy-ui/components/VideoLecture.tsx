/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function VideoLecture({ src, title }: { src: string; title: string }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            controls
            className="w-full h-full"
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Watch the video and complete the lesson to earn AZR tokens.
        </p>
      </CardContent>
    </Card>
  );
}
