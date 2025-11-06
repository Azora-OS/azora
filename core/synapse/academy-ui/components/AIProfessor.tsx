/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, Loader2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function AIProfessor({ module, professor }: { module: string; professor: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [teaching, setTeaching] = useState(false);
  const [lesson, setLesson] = useState("");
  const [loading, setLoading] = useState(false);

  async function askProfessor() {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, module, professor }),
      });

      const data = await res.json();
      setAnswer(data.answer || 'I apologize, but I encountered an error. Please try again.');
      toast.success('Response received!');
    } catch (error) {
      console.error('AI tutor error:', error);
      setAnswer('I apologize, but I encountered an error. Please try again.');
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  }

  async function startTeaching() {
    setTeaching(true);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: `Teach me ${module} step by step`, module, professor }),
      });

      const data = await res.json();
      setLesson(data.answer || 'Let me explain this concept step by step...');
      toast.success('Lesson started!');
    } catch (error) {
      console.error('Teaching error:', error);
      setLesson('Let me explain this concept step by step...');
      toast.error('Failed to start lesson');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/50 dark:to-violet-950/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {professor}
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Professor
                </Badge>
              </CardTitle>
              <CardDescription>Your intelligent learning assistant</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={startTeaching}
          disabled={teaching || loading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          {loading && !lesson ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Teaching...
            </>
          ) : (
            <>
              <GraduationCap className="w-4 h-4 mr-2" />
              Start Lesson: {module}
            </>
          )}
        </Button>

        {lesson && (
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Lesson Content</h4>
            <div className="text-foreground whitespace-pre-line leading-relaxed">{lesson}</div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askProfessor()}
            placeholder={`Ask ${professor} about ${module}...`}
            className="flex-1"
          />
          <Button
            onClick={askProfessor}
            disabled={loading || !question.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {answer && (
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Response</h4>
            <div className="text-foreground whitespace-pre-line leading-relaxed">{answer}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
