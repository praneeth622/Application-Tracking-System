"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Check } from "lucide-react"
import Image from "next/image"
export function FeatureSection() {

  const [ref1, inView1] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [ref2, inView2] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [ref3, inView3] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })
 
  const [ref4, inView4] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8,
      },
    },
  }

  // const staggerContainer = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.2,
  //     },
  //   },
  // }

  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/5 rounded-full"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref1}
          variants={fadeInUp}
          initial="hidden"
          animate={inView1 ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          <motion.span
            className="inline-block px-4 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView1 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            AI-Powered Recruitment
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Find Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Perfect
            </span>
            <br />
            Candidate - Every Time.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the right candidates effortlessly. Collaborate with your team and let AI handle the details. 50% faster
            hires!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            ref={ref2}
            variants={fadeInUp}
            initial="hidden"
            animate={inView2 ? "visible" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Seniority</span>
                <div className="ml-2 text-gray-400">...</div>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Skills</span>
                <div className="ml-2 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                  Career Path
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-violet-500"></div>
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">Trends</span>
                <div className="ml-2 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs rounded-full">
                  Similar Roles
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contextual Search
              <br />
              Beyond Keywords
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Find candidates who align perfectly. Semantic search interprets the full context of your needs, offering
              smarter and more relevant matches than basic keyword searches ever could.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Understands career context</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Identifies hidden talent</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Matches beyond job titles</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={ref3}
            variants={fadeInUp}
            initial="hidden"
            animate={inView3 ? "visible" : "hidden"}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="relative w-full h-32 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  Predict Career Moves
                  <br />
                  with Confidence
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Likely To Move</span>
                      <span className="text-sm font-medium text-violet-600 dark:text-violet-400">72.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-violet-500 to-violet-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={inView3 ? { width: "73%" } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Career Advancement</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Professional Milestone</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-violet-500 dark:text-violet-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Industry Movement</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              Discover candidates ready for their next step. Perfect analyzes career, industry, and company trajectories
              to predict how likely someone is to make a move.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Understand Career Patterns</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Go deeper than job titles and timelines. Evaluate candidates by analyzing their career trajectories,
              focusing on growth, impact, and progression.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                  P
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Technical Lead • ACME SaaS Tech Company
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">2020 - Present</div>
                </div>
              </div>

              <motion.div
                className="ml-11 border-l-2 border-gray-300 dark:border-gray-600 pl-4 space-y-3"
                initial={{ height: 0, opacity: 0 }}
                animate={inView3 ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Sr. Software Engineer → Triangle</div>
                </div>
                <div className="text-xs">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Engineering Manager → Box</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            ref={ref4}
            initial={{ opacity: 0, y: 60 }}
            animate={inView4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
            }}
            className="bg-white dark:bg-gray-800/50 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Leverage Your
              <br />
              Team&apos;s Network
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Uncover hidden opportunities by analyzing your team&apos;s professional connections, offering insights to
              engage candidates effectively.
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">CONTACT VIA LINKEDIN</div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <Image src="/placeholder.svg" alt="Profile" className="h-full w-full object-cover" width={40} height={40} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Alex Chen • Product Manager</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Your colleague Sam Roberts knows them</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

