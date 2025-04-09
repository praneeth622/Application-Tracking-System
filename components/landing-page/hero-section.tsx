"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { BrandCarousel } from "@/components/landing-page/brand-carousel"
import { useTheme } from "next-themes"

export function HeroSection() {
  useTheme()
  const [isTyping, setIsTyping] = useState(true)
  const [placeholderText, setPlaceholderText] = useState("")
  const fullPlaceholder = "Ask PerfectAI to find me a tech lead in Seattle with cloud computing expertise."
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isTyping) {
      if (placeholderText.length < fullPlaceholder.length) {
        const timeout = setTimeout(() => {
          setPlaceholderText(fullPlaceholder.slice(0, placeholderText.length + 1))
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        setIsTyping(false)
        const timeout = setTimeout(() => {
          setPlaceholderText("")
          setIsTyping(true)
        }, 5000)
        return () => clearTimeout(timeout)
      }
    }
  }, [placeholderText, isTyping])

  const handleFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.placeholder = ""
    }
  }

  const handleBlur = () => {
    if (textareaRef.current) {
      textareaRef.current.placeholder = placeholderText
    }
  }

  // Variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  // Floating animation for the search box
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const, // Use a type assertion to 'const' to satisfy TypeScript
      ease: "easeInOut",
    },
  }

  return (
    <motion.main
      id="home"
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 pt-28 pb-32 text-center relative z-10"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-rose-500/20 to-violet-600/20 rounded-full filter blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-gradient-to-r from-violet-600/20 to-blue-500/20 rounded-full filter blur-[80px] animate-pulse delay-1000"></div>
      </motion.div>

      <motion.h1
        variants={item}
        className="text-white text-5xl md:text-7xl font-bold mb-8 max-w-5xl mx-auto leading-tight tracking-tight"
      >
        Your{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 dark:from-violet-400 dark:to-indigo-500">
          Perfect
        </span>{" "}
        Hire
        <br />
        in Seconds.
      </motion.h1>

      <motion.p variants={item} className="text-white text-xl md:text-2xl mb-14 max-w-3xl mx-auto leading-relaxed">
        Type what you&apos;re looking for, and let AI find the best matches - faster than ever
      </motion.p>

      <motion.div
        variants={item}
        animate={floatingAnimation}
        className="max-w-3xl mx-auto glass-card rounded-xl p-3 premium-shadow"
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full p-5 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-gray-700 min-h-[120px] transition-all duration-300 bg-white/90 backdrop-blur-sm"
            placeholder={placeholderText}
            rows={3}
            onFocus={handleFocus}
            onBlur={handleBlur}
          ></textarea>
          <div className="absolute bottom-4 right-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(236, 72, 153, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-rose-500 to-violet-500 hover:from-rose-600 hover:to-violet-600 text-white px-6 py-3 rounded-full font-medium flex items-center shadow-md"
            >
              Try Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="text-white text-sm mt-8 flex items-center justify-center mb-12">
        <CheckCircle className="w-5 h-5 mr-2 text-white" />
        No Strings Attached, No credit card required
      </motion.div>

      <motion.div variants={item} className="mt-4">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-6 font-medium">Trusted by leading companies</p>
        <BrandCarousel />
      </motion.div>
    </motion.main>
  )
}

