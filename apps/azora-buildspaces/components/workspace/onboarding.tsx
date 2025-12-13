"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Sparkles, Code2, Palette, Brain, Terminal, Check } from "lucide-react"

interface OnboardingProps {
  onComplete: () => void
}

const steps = [
  {
    title: "Welcome to BuildSpaces",
    description: "Your AI-powered development environment is ready. Let's take a quick tour!",
    icon: Sparkles,
    highlight: null,
  },
  {
    title: "Code Chamber",
    description: "Write, edit, and collaborate on code with AI assistance. Use Ctrl+1 to switch here.",
    icon: Code2,
    highlight: "code-chamber",
  },
  {
    title: "Design Studio",
    description: "Create UI designs and convert them to code. Perfect for prototyping.",
    icon: Palette,
    highlight: "design-studio",
  },
  {
    title: "AI Studio",
    description: "Train models, run experiments, and deploy AI solutions.",
    icon: Brain,
    highlight: "ai-studio",
  },
  {
    title: "Command Desk",
    description: "Execute commands, manage deployments, and automate workflows.",
    icon: Terminal,
    highlight: "command-desk",
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsVisible(false)
      setTimeout(onComplete, 300)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
    setTimeout(onComplete, 300)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-md w-full"
        >
          <Card className="relative">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                <steps[currentStep].icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-base">
                {steps[currentStep].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Indicator */}
              <div className="flex justify-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleSkip} className="flex-1">
                  Skip Tour
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>

              {/* Keyboard Shortcuts Hint */}
              {currentStep > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Pro tip: Use <Badge variant="outline" className="mx-1">Ctrl+{currentStep}</Badge> to jump to this room
                </div>
              )}
            </CardContent>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleSkip}
            >
              <X className="w-4 h-4" />
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}