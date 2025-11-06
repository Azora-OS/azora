/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import * as React from "react"
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion"
import { useIntersectionObserver } from "react-intersection-observer"
import { cn } from "@/lib/utils"

interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "rotate" | "flip" | "bounce" | "float" | "glow" | "morph"
  delay?: number
  duration?: number
  stagger?: number
  once?: boolean
  threshold?: number
  trigger?: "inView" | "hover" | "click" | "scroll"
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  easing?: string
  repeat?: boolean
  repeatType?: "loop" | "reverse" | "mirror"
  repeatDelay?: number
}

const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  rotate: {
    hidden: { opacity: 0, rotate: -180 },
    visible: { opacity: 1, rotate: 0 }
  },
  flip: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 }
  },
  bounce: {
    hidden: { opacity: 0, y: -100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  },
  float: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }
      }
    }
  },
  glow: {
    hidden: { opacity: 0, boxShadow: "0 0 0px rgba(59, 130, 246, 0)" },
    visible: { 
      opacity: 1, 
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      transition: {
        boxShadow: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2
        }
      }
    }
  },
  morph: {
    hidden: { 
      opacity: 0, 
      borderRadius: "50%",
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      borderRadius: "8px",
      scale: 1
    }
  }
}

export function AnimatedContainer({
  children,
  className,
  animation = "fadeIn",
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  once = true,
  threshold = 0.1,
  trigger = "inView",
  direction = "up",
  distance = 50,
  easing = "easeOut",
  repeat = false,
  repeatType = "loop",
  repeatDelay = 0,
  ...props
}: AnimatedContainerProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isClicked, setIsClicked] = React.useState(false)
  
  const { ref, inView } = useIntersectionObserver({
    threshold,
    triggerOnce: once
  })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  React.useEffect(() => {
    if (trigger === "inView" && inView) {
      setIsVisible(true)
    }
  }, [inView, trigger])

  const getAnimationProps = () => {
    const baseVariant = animationVariants[animation]
    
    if (trigger === "scroll") {
      return {
        style: { y, opacity }
      }
    }

    const shouldAnimate = 
      (trigger === "inView" && isVisible) ||
      (trigger === "hover" && isHovered) ||
      (trigger === "click" && isClicked)

    return {
      variants: baseVariant,
      initial: "hidden",
      animate: shouldAnimate ? "visible" : "hidden",
      transition: {
        duration,
        delay,
        ease: easing,
        repeat: repeat ? Infinity : 0,
        repeatType,
        repeatDelay
      }
    }
  }

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsHovered(false)
    }
  }

  const handleClick = () => {
    if (trigger === "click") {
      setIsClicked(!isClicked)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={cn("", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...getAnimationProps()}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Staggered Animation for Lists
export function StaggeredList({
  children,
  className,
  staggerDelay = 0.1,
  animation = "slideUp",
  ...props
}: {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  animation?: keyof typeof animationVariants
} & Omit<AnimatedContainerProps, "children" | "stagger">) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const itemVariants = animationVariants[animation]

  return (
    <motion.div
      className={cn("", className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Parallax Scroll Component
export function ParallaxScroll({
  children,
  className,
  speed = 0.5,
  direction = "up",
  ...props
}: {
  children: React.ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down" | "left" | "right"
} & Omit<AnimatedContainerProps, "animation" | "trigger">) {
  const { ref, inView } = useIntersectionObserver({
    threshold: 0,
    triggerOnce: false
  })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const getTransform = () => {
    switch (direction) {
      case "up":
        return useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])
      case "down":
        return useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed])
      case "left":
        return useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])
      case "right":
        return useTransform(scrollYProgress, [0, 1], [-100 * speed, 100 * speed])
      default:
        return useTransform(scrollYProgress, [0, 1], [0, 0])
    }
  }

  const y = direction === "up" || direction === "down" ? getTransform() : 0
  const x = direction === "left" || direction === "right" ? getTransform() : 0

  return (
    <motion.div
      ref={ref}
      className={cn("", className)}
      style={{ y, x }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Morphing Text Component
export function MorphingText({
  texts,
  className,
  duration = 2,
  delay = 0,
  ...props
}: {
  texts: string[]
  className?: string
  duration?: number
  delay?: number
} & Omit<AnimatedContainerProps, "children" | "animation">) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, duration * 1000)

    return () => clearInterval(interval)
  }, [texts.length, duration])

  return (
    <AnimatedContainer
      className={cn("", className)}
      animation="morph"
      duration={0.5}
      delay={delay}
      {...props}
    >
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="inline-block"
      >
        {texts[currentIndex]}
      </motion.span>
    </AnimatedContainer>
  )
}

// Loading Spinner with Advanced Animation
export function LoadingSpinner({
  size = "default",
  color = "primary",
  className,
  ...props
}: {
  size?: "sm" | "default" | "lg" | "xl"
  color?: "primary" | "secondary" | "accent" | "destructive"
  className?: string
} & Omit<AnimatedContainerProps, "children" | "animation">) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
    destructive: "border-destructive"
  }

  return (
    <motion.div
      className={cn(
        "relative",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-transparent border-t-current",
          colorClasses[color]
        )}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-r-current opacity-50"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  )
}
