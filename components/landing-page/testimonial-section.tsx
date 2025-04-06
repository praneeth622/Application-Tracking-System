"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useTheme } from "next-themes"

export function TestimonialSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const { theme } = useTheme()

  return (
    <section id="testimonials" ref={ref} className="py-24 bg-gray-50 relative overflow-hidden dark:bg-gray-900">
      {/* Background elements - only show in dark mode */}
      {theme === "dark" && (
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-5"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
          </svg>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.8,
          }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-violet-600 dark:text-violet-400"
            >
              <path
                d="M6.5 10.5H4.5C3.95 10.5 3.45 10.3 3.05 9.9C2.65 9.5 2.45 9 2.45 8.45V6.5C2.45 5.95 2.65 5.45 3.05 5.05C3.45 4.65 3.95 4.45 4.5 4.45H6.5C7.05 4.45 7.55 4.65 7.95 5.05C8.35 5.45 8.55 5.95 8.55 6.5V8.5C8.55 10.5 7.55 12.4 5.75 13.9L5 14.5L6.85 16.85C7.05 17.1 7.1 17.4 6.95 17.65C6.8 17.95 6.55 18.05 6.25 18.05H4.5C4.25 18.05 4.05 17.95 3.9 17.8L1.6 15C1.2 14.55 1 13.9 1 13.25C1 12.6 1.2 11.95 1.6 11.5L2.5 10.5C2.5 10.5 4.5 8.5 4.5 6.5V6C4.5 5.7 4.7 5.5 5 5.5H6C6.3 5.5 6.5 5.7 6.5 6V10.5ZM16.5 10.5H14.5C13.95 10.5 13.45 10.3 13.05 9.9C12.65 9.5 12.45 9 12.45 8.45V6.5C12.45 5.95 12.65 5.45 13.05 5.05C13.45 4.65 13.95 4.45 14.5 4.45H16.5C17.05 4.45 17.55 4.65 17.95 5.05C18.35 5.45 18.55 5.95 18.55 6.5V8.5C18.55 10.5 17.55 12.4 15.75 13.9L15 14.5L16.85 16.85C17.05 17.1 17.1 17.4 16.95 17.65C16.8 17.95 16.55 18.05 16.25 18.05H14.5C14.25 18.05 14.05 17.95 13.9 17.8L11.6 15C11.2 14.55 11 13.9 11 13.25C11 12.6 11.2 11.95 11.6 11.5L12.5 10.5C12.5 10.5 14.5 8.5 14.5 6.5V6C14.5 5.7 14.7 5.5 15 5.5H16C16.3 5.5 16.5 5.7 16.5 6V10.5Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 italic"
          >
            " The Recruiter's AI Sidekick "
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 font-medium">Yogi Kidar</p>
            <p className="text-md text-gray-500 dark:text-gray-400">Founder @ Reeco</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.9 }}
            className="mt-12"
          >
            <div className="inline-flex items-center justify-center p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg">
              <div className="flex space-x-1">
                {[1, 2, 3].map((dot, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-violet-600 dark:bg-violet-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

