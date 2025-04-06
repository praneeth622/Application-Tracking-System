"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"
import { Check, Slack, Mail, Linkedin, Video, MessageSquare, Users, Calendar, BarChart3 } from "lucide-react"

export function WorkflowSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  })

  const [activeIntegration, setActiveIntegration] = useState<string>("slack")
  const [activeTeamFeature, setActiveTeamFeature] = useState<string>("collaboration")
  const [activeUser, setActiveUser] = useState<number | null>(null)

  const integrations = [
    { id: "slack", name: "Slack", icon: <Slack className="h-5 w-5" /> },
    { id: "gmail", name: "Gmail", icon: <Mail className="h-5 w-5" /> },
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="h-5 w-5" /> },
    { id: "zoom", name: "Zoom", icon: <Video className="h-5 w-5" /> },
    { id: "teams", name: "Teams", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "calendar", name: "Calendar", icon: <Calendar className="h-5 w-5" /> },
  ]

  const integrationDetails = {
    slack: {
      title: "Slack Integration",
      description:
        "Get real-time notifications about candidate updates, team mentions, and scheduled interviews directly in your Slack channels.",
      features: [
        "Instant notifications",
        "Candidate profile sharing",
        "Team collaboration channels",
        "Interview scheduling",
      ],
    },
    gmail: {
      title: "Gmail Integration",
      description:
        "Seamlessly connect your Gmail account to track communications, schedule follow-ups, and manage candidate relationships.",
      features: ["Email tracking", "Template management", "Automated follow-ups", "Calendar sync"],
    },
    linkedin: {
      title: "LinkedIn Integration",
      description:
        "Connect directly to LinkedIn to source candidates, view profiles, and engage with potential hires without leaving Perfect.",
      features: ["Profile importing", "InMail integration", "Connection management", "Activity tracking"],
    },
    zoom: {
      title: "Zoom Integration",
      description:
        "Schedule and conduct video interviews directly through Perfect with automatic recording and note-taking capabilities.",
      features: ["One-click scheduling", "Automated reminders", "Recording management", "Interview notes"],
    },
    teams: {
      title: "Teams Integration",
      description:
        "Collaborate with your hiring team through Microsoft Teams with shared candidate profiles and real-time updates.",
      features: ["Team channels", "File sharing", "Meeting scheduling", "Candidate discussions"],
    },
    calendar: {
      title: "Calendar Integration",
      description:
        "Sync with your calendar to manage interview schedules, availability, and candidate follow-ups efficiently.",
      features: ["Availability management", "Interview scheduling", "Reminder notifications", "Team calendar sync"],
    },
  }

  const teamFeatures = [
    {
      id: "collaboration",
      title: "Collaborative Hiring",
      description:
        "Work together seamlessly with your entire team to evaluate candidates, share feedback, and make hiring decisions.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "analytics",
      title: "Team Analytics",
      description:
        "Track team performance metrics, hiring velocity, and individual recruiter effectiveness with detailed analytics.",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      id: "permissions",
      title: "Role-Based Access",
      description: "Set custom permissions for different team members based on their role in the hiring process.",
      icon: <Check className="h-6 w-6" />,
    },
  ]

  const handleUserClick = (index: number) => {
    setActiveUser(activeUser === index ? null : index)
  }

  const userProfiles = [
    { name: "Sarah Johnson", role: "Recruiter", activity: "Added 3 candidates" },
    { name: "Michael Chen", role: "Hiring Manager", activity: "Reviewed 7 profiles" },
    { name: "Priya Patel", role: "HR Director", activity: "Scheduled 2 interviews" },
    { name: "James Wilson", role: "Team Lead", activity: "Provided feedback" },
    { name: "Olivia Garcia", role: "Recruiter", activity: "Sent 5 messages" },
    { name: "David Kim", role: "CTO", activity: "Approved job posting" },
    { name: "Emma Thompson", role: "Talent Acquisition", activity: "Sourced 12 candidates" },
    { name: "New Team Member", role: "Add Colleague", activity: "Invite to collaborate" },
  ]

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Simplified Workflow</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Perfect fits into your workflow and brings your team together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Seamless Integration
              <br />
              with Your Favorite Tools
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Connect seamlessly with the tools you already use, keeping your workflows smooth and efficient.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {integrations.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIntegration(tool.id)}
                  className={`bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm transition-all duration-300 ${
                    activeIntegration === tool.id
                      ? "ring-2 ring-violet-500 dark:ring-violet-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div
                    className={`h-10 w-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                      activeIntegration === tool.id
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    {tool.icon}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      activeIntegration === tool.id
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {tool.name}
                  </p>
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeIntegration}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm"
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                {integrationDetails[activeIntegration as keyof typeof integrationDetails].title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {integrationDetails[activeIntegration as keyof typeof integrationDetails].description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {integrationDetails[activeIntegration as keyof typeof integrationDetails].features.map(
                  (feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">{feature}</span>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All Hands on Deck
              <br />
              Unlimited Seats Included.
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Invite your entire team with no limits or extra costs. Perfect ensures seamless collaboration for
              everyone.
            </p>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm mb-6">
              <div className="flex flex-wrap -mx-1 mb-4">
                {userProfiles.slice(0, 8).map((user, index) => (
                  <motion.div
                    key={index}
                    className="p-1"
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserClick(index)}
                  >
                    <div
                      className={`h-10 w-10 rounded-full ${index === 7 ? "bg-gradient-to-r from-violet-500 to-indigo-600" : "bg-gray-200 dark:bg-gray-600"} flex items-center justify-center text-${index === 7 ? "white" : "gray-500 dark:text-gray-300"} text-xs font-medium cursor-pointer transition-all duration-300 ${activeUser === index ? "ring-2 ring-violet-500 scale-110" : ""}`}
                    >
                      {index === 7 ? "+" : `U${index + 1}`}
                    </div>
                  </motion.div>
                ))}
              </div>

              {activeUser !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{userProfiles[activeUser].name}</span>
                    <span className="text-xs text-violet-600 dark:text-violet-400">
                      {userProfiles[activeUser].role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recent activity: {userProfiles[activeUser].activity}
                  </p>
                </motion.div>
              )}

              <div className="flex space-x-2 mb-4">
                {teamFeatures.map((feature) => (
                  <motion.button
                    key={feature.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTeamFeature(feature.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center space-x-1 ${
                      activeTeamFeature === feature.id
                        ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                        : "bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                    }`}
                  >
                    <span className="w-4 h-4">{feature.icon}</span>
                    <span>{feature.title}</span>
                  </motion.button>
                ))}
              </div>

              <motion.div
                key={activeTeamFeature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {teamFeatures.find((f) => f.id === activeTeamFeature)?.description}
                </p>
              </motion.div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Unlimited team members</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Collaborative hiring</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Shared candidate pools</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

