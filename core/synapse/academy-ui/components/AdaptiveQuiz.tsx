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
import { CheckCircle2, XCircle, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Question = { q: string; a: string };

export default function AdaptiveQuiz({ questions }: { questions: Question[] }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  function submit() {
    const correct = input.trim().toLowerCase() === questions[idx].a.trim().toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(s => s + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error(`Incorrect. The answer is: ${questions[idx].a}`);
    }

    setTimeout(() => {
      setInput("");
      setShowResult(false);
      if (idx + 1 < questions.length) {
        setIdx(i => i + 1);
      } else {
        setDone(true);
        toast.success(`Quiz complete! Score: ${score + (correct ? 1 : 0)}/${questions.length}`);
      }
    }, 2000);
  }

  if (done) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="mb-6 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                Quiz Complete!
              </h3>
              <p className="text-3xl font-bold text-foreground mb-2">
                {score}/{questions.length}
              </p>
              <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {percentage}% Score
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {percentage >= 80
                ? 'Excellent work! You\'ve mastered this lesson! 🎓'
                : percentage >= 60
                ? 'Good job! Keep practicing to improve! 💪'
                : 'Keep learning! Review the material and try again! 📚'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Interactive Quiz</span>
          <Badge variant="outline">
            Question {idx + 1} of {questions.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test your understanding of the lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-lg font-medium text-foreground">{questions[idx].q}</p>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !showResult && submit()}
            placeholder="Type your answer..."
            disabled={showResult}
            className="flex-1"
          />
          <Button
            onClick={submit}
            disabled={showResult || !input.trim()}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            Submit
          </Button>
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
          }`}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">Correct! Well done!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <span className="text-red-700 dark:text-red-300 font-medium">Incorrect.</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Correct answer: <strong>{questions[idx].a}</strong>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress: {idx + 1}/{questions.length}</span>
          <span>Score: {score}/{idx + 1}</span>
        </div>
      </CardContent>
    </Card>
  );
}
