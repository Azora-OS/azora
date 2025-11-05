/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Loader2 } from 'lucide-react';
import AdaptiveQuiz from './AdaptiveQuiz';
import { toast } from 'sonner';

export default function InteractiveLesson({
  courseId,
  lessonId,
  lessonTitle,
  professor,
  quiz
}: {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  professor: string;
  quiz: { q: string; a: string }[];
}) {
  const [completed, setCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId })
      });

      const data = await res.json();

      if (res.ok) {
        setCompleted(true);
        setProgressMsg(`✅ Lesson completed! Earned ${data.progress?.azrEarned || 50} AZR tokens.`);
        toast.success('Progress saved!', {
          description: `You earned ${data.progress?.azrEarned || 50} AZR tokens.`,
        });
      } else {
        setProgressMsg("Error saving progress. Please try again.");
        toast.error('Failed to save progress');
      }
    } catch (error) {
      console.error('Progress save error:', error);
      setProgressMsg("Error saving progress. Please try again.");
      toast.error('Failed to save progress');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <CardTitle className="text-2xl">{lessonTitle}</CardTitle>
              <CardDescription className="mt-1">
                Learn interactively with your AI Professor {professor}
              </CardDescription>
            </div>
          </div>
          {completed && (
            <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {quiz.length > 0 && (
            <Button
              variant={showQuiz ? "secondary" : "outline"}
              onClick={() => setShowQuiz(s => !s)}
            >
              {showQuiz ? "Hide Quiz" : "Take Quiz"}
            </Button>
          )}
        </div>

        {showQuiz && quiz.length > 0 && (
          <div className="mt-4">
            <AdaptiveQuiz questions={quiz} />
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={handleComplete}
            disabled={completed || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Lesson Completed!
              </>
            ) : (
              'Mark Lesson Complete'
            )}
          </Button>
          {progressMsg && (
            <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
              {progressMsg}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
