"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"
import { Check, MessageSquare, Clock, Zap, Users, Sparkles, BarChart } from "lucide-react"

export function OutreachSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [activeTab, setActiveTab] = useState<"campaigns" | "personalize" | "ai">("campaigns")

  const tabContent = {
    campaigns: {
      title: "Run Campaigns Your Way",
      description:
        "Automate your outreach or customize campaigns to fit your strategy. Reach candidates via LinkedIn, email, SMS, and more.",
      features: [
        { icon: <MessageSquare className="h-4 w-4" />, text: "Multi-channel outreach" },
        { icon: <Clock className="h-4 w-4" />, text: "Automated scheduling" },
        { icon: <Zap className="h-4 w-4" />, text: "Instant follow-ups" },
      ],
      image: (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Campaign Dashboard</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">3 active campaigns</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                Running
              </span>
            </div>

            <div className="space-y-3">
              {["Senior Developer Outreach", "Product Manager Search", "Design Lead Campaign"].map((campaign, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      {i + 1}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{campaign}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">42 contacts</span>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 dark:bg-violet-400 rounded-full"
                        style={{ width: `${65 - i * 15}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    personalize: {
      title: "Personalize Your Outreach Style",
      description:
        "Craft outreach your way. Choose manual, automated, or a custom blend, and adjust tone, timing, follow-ups, delivery channels, and more to fit your style.",
      features: [
        { icon: <Users className="h-4 w-4" />, text: "Candidate-specific messaging" },
        { icon: <Sparkles className="h-4 w-4" />, text: "Custom tone and style" },
        { icon: <BarChart className="h-4 w-4" />, text: "Performance analytics" },
      ],
      image: (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Message Style</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize your approach</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { name: "Tone", options: ["Professional", "Friendly", "Casual"] },
                { name: "Length", options: ["Brief", "Standard", "Detailed"] },
                { name: "Follow-ups", options: ["None", "1 time", "2 times"] },
              ].map((setting, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{setting.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    {setting.options.map((option, j) => (
                      <button
                        key={j}
                        className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                          j === 1
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    ai: {
      title: "AI-Tailored Messages That Engage",
      description:
        "AI crafts personalized messages for every candidate, using data insights and best practices to maximize engagement.",
      features: [
        { icon: <Check className="h-4 w-4" />, text: "Data-driven personalization" },
        { icon: <Check className="h-4 w-4" />, text: "Engagement optimization" },
        { icon: <Check className="h-4 w-4" />, text: "One-click regeneration" },
      ],
      image: (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">AI-Generated Message</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">9:45 AM</div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">Hi Jamie,</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                I hope this finds you well! I'm reaching out because your experience at{" "}
                <span className="text-violet-600 dark:text-violet-400">Acme Corp</span> caught my attention.
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Our <span className="text-violet-600 dark:text-violet-400">Senior Product Manager</span> role might be a
                perfect next step for you. Would you be open to a quick chat?
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 text-amber-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Friendly and Professional</span>
              </div>
              <button className="text-violet-600 dark:text-violet-400 text-sm font-medium hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                REGENERATE
              </button>
            </div>
          </div>
        </div>
      ),
    },
  }

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Automated Outreach That
            <br />
            Gets Replies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Send personalized messages crafted with insights from candidates' careers and goals. Reach out on LinkedIn,
            email, or SMS—and get the responses you need.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center mb-8 gap-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => setActiveTab("campaigns")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "campaigns"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Campaign Management
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={() => setActiveTab("personalize")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "personalize"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Personalization
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              onClick={() => setActiveTab("ai")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === "ai"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              AI-Powered Messaging
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div className="order-2 md:order-1">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {tabContent[activeTab].image}
              </motion.div>
            </div>

            <div className="order-1 md:order-2">
              <motion.div
                key={`content-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tabContent[activeTab].title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{tabContent[activeTab].description}</p>

                <div className="space-y-3 mt-6">
                  {tabContent[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        {feature.icon}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

