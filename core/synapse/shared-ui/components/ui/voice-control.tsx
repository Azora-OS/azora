/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSpeechRecognition, useSpeechSynthesis } from "react-speech-kit"
import { useHapticFeedback } from "react-haptic-feedback"
import { useHotkeys } from "react-hotkeys-hook"
import { cn } from "@/lib/utils"
import { Mic, MicOff, Volume2, VolumeX, Settings, Zap } from "lucide-react"

interface VoiceControlProps {
  onCommand?: (command: string, confidence: number) => void
  onError?: (error: string) => void
  commands?: Array<{
    command: string
    action: () => void
    description?: string
  }>
  className?: string
  enabled?: boolean
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  language?: string
  hotkeys?: string[]
  hapticFeedback?: boolean
  visualFeedback?: boolean
  soundFeedback?: boolean
}

export function VoiceControl({
  onCommand,
  onError,
  commands = [],
  className,
  enabled = true,
  continuous = true,
  interimResults = true,
  maxAlternatives = 1,
  language = "en-US",
  hotkeys = ["ctrl+shift+v", "cmd+shift+v"],
  hapticFeedback = true,
  visualFeedback = true,
  soundFeedback = true,
  ...props
}: VoiceControlProps) {
  const [isListening, setIsListening] = React.useState(false)
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [confidence, setConfidence] = React.useState(0)
  const [isEnabled, setIsEnabled] = React.useState(enabled)
  const [volume, setVolume] = React.useState(1)
  const [rate, setRate] = React.useState(1)
  const [pitch, setPitch] = React.useState(1)
  
  const { triggerHaptic } = useHapticFeedback()
  const { speak, speaking, cancel } = useSpeechSynthesis()
  
  const {
    listen,
    listening,
    stop,
    supported: browserSupported,
  } = useSpeechRecognition({
    onResult: (result) => {
      setTranscript(result.transcript)
      setConfidence(result.confidence)
      
      if (hapticFeedback && result.confidence > 0.8) {
        triggerHaptic("impact", "light")
      }
      
      // Check for command matches
      const matchedCommand = commands.find(cmd => 
        result.transcript.toLowerCase().includes(cmd.command.toLowerCase())
      )
      
      if (matchedCommand) {
        matchedCommand.action()
        if (hapticFeedback) {
          triggerHaptic("impact", "medium")
        }
      }
      
      onCommand?.(result.transcript, result.confidence)
    },
    onError: (error) => {
      console.error("Speech recognition error:", error)
      onError?.(error)
      if (hapticFeedback) {
        triggerHaptic("notification", "error")
      }
    },
    continuous,
    interimResults,
    maxAlternatives,
    language,
  })

  // Hotkey support
  useHotkeys(hotkeys, () => {
    if (isEnabled) {
      toggleListening()
    }
  }, { enabled: isEnabled })

  const toggleListening = React.useCallback(() => {
    if (listening) {
      stop()
      setIsListening(false)
    } else {
      listen()
      setIsListening(true)
      if (hapticFeedback) {
        triggerHaptic("impact", "light")
      }
    }
  }, [listening, listen, stop, hapticFeedback])

  const speakText = React.useCallback((text: string) => {
    if (speaking) {
      cancel()
    }
    
    speak({
      text,
      voice: window.speechSynthesis.getVoices().find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      ) || undefined,
      rate,
      pitch,
      volume,
    })
    
    setIsSpeaking(true)
    
    if (hapticFeedback) {
      triggerHaptic("impact", "light")
    }
  }, [speak, speaking, cancel, language, rate, pitch, volume, hapticFeedback])

  const stopSpeaking = React.useCallback(() => {
    cancel()
    setIsSpeaking(false)
  }, [cancel])

  React.useEffect(() => {
    if (speaking !== isSpeaking) {
      setIsSpeaking(speaking)
    }
  }, [speaking, isSpeaking])

  if (!browserSupported) {
    return (
      <div className={cn("p-4 text-center text-destructive", className)}>
        <MicOff className="w-8 h-8 mx-auto mb-2" />
        <p>Speech recognition not supported in this browser</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Voice Control Interface */}
      <div className="flex items-center justify-center space-x-4">
        {/* Microphone Button */}
        <motion.button
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
            isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={toggleListening}
          disabled={!isEnabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            scale: {
              repeat: isListening ? Infinity : 0,
              duration: 1,
            },
          }}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <Mic className="w-8 h-8" />
              </motion.div>
            ) : (
              <motion.div
                key="not-listening"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <MicOff className="w-8 h-8" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Pulse animation when listening */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>

        {/* Speaker Button */}
        <motion.button
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            isSpeaking
              ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          onClick={isSpeaking ? stopSpeaking : () => speakText(transcript)}
          disabled={!transcript}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VolumeX className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="not-speaking"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Volume2 className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Settings Button */}
        <motion.button
          className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all duration-300"
          onClick={() => setIsEnabled(!isEnabled)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Status Indicators */}
      {visualFeedback && (
        <div className="space-y-2">
          {/* Transcript Display */}
          {transcript && (
            <motion.div
              className="p-4 bg-muted rounded-lg text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm font-medium">Transcript:</p>
              <p className="text-lg">{transcript}</p>
              <div className="mt-2 flex items-center justify-center space-x-2">
                <div className="text-xs text-muted-foreground">
                  Confidence: {Math.round(confidence * 100)}%
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-1 h-4 rounded-full",
                        i < Math.round(confidence * 5)
                          ? "bg-green-500"
                          : "bg-muted-foreground/30"
                      )}
                      animate={{
                        scale: i < Math.round(confidence * 5) ? [1, 1.2, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Status Text */}
          <motion.div
            className="text-center text-sm text-muted-foreground"
            animate={{ opacity: isListening ? [0.5, 1, 0.5] : 1 }}
            transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
          >
            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
          </motion.div>
        </div>
      )}

      {/* Commands List */}
      {commands.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available Commands:</h4>
          <div className="grid grid-cols-1 gap-2">
            {commands.map((cmd, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div>
                  <span className="font-medium">"{cmd.command}"</span>
                  {cmd.description && (
                    <span className="text-xs text-muted-foreground ml-2">
                      - {cmd.description}
                    </span>
                  )}
                </div>
                <Zap className="w-4 h-4 text-primary" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <motion.div
        className="space-y-4 p-4 bg-muted/30 rounded-lg"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-sm font-medium">Voice Settings</h4>
        
        {/* Volume Control */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Rate Control */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Speech Rate</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Pitch</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </motion.div>
    </div>
  )
}

// Voice Command Hook
export function useVoiceCommand(commands: Array<{
  command: string
  action: () => void
  description?: string
}>) {
  const [isActive, setIsActive] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [confidence, setConfidence] = React.useState(0)

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setTranscript(result.transcript)
      setConfidence(result.confidence)
      
      const matchedCommand = commands.find(cmd => 
        result.transcript.toLowerCase().includes(cmd.command.toLowerCase())
      )
      
      if (matchedCommand && result.confidence > 0.7) {
        matchedCommand.action()
      }
    },
    onError: (error) => {
      console.error("Voice command error:", error)
    },
  })

  const startListening = React.useCallback(() => {
    listen()
    setIsActive(true)
  }, [listen])

  const stopListening = React.useCallback(() => {
    stop()
    setIsActive(false)
  }, [stop])

  return {
    isActive,
    listening,
    transcript,
    confidence,
    startListening,
    stopListening,
  }
}
