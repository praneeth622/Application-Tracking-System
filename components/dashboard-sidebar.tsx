"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  User,
  Search,
  BarChart2,
  Settings,
  LogOut,
  X,
  Upload,
  Briefcase,
  HelpCircle,
  ChevronLeft,
  ArrowRightToLine,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface DashboardSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
  const isMobile = useMobile()
  const [activeItem, setActiveItem] = useState("upload")
  const [isHovering, setIsHovering] = useState<string | null>(null)

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: isMobile ? "0rem" : "4.5rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    mobile: {
      x: isOpen ? 0 : "-100%",
      width: "16rem",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const navItems = [
    { id: "upload", label: "Analyze Resume", icon: <FileText className="w-5 h-5" />, href: "/upload-resume" },
    { id: "profiles", label: "My Profiles", icon: <User className="w-5 h-5" />, href: "/profiles" },
    { id: "keywords", label: "Keyword Matcher", icon: <Search className="w-5 h-5" />, href: "/keyword-matcher" },
    { id: "applications", label: "Job Applications", icon: <Briefcase className="w-5 h-5" />, href: "/applications" },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="w-5 h-5" />, href: "/analytics" },
  ]

  const secondaryNavItems = [
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" />, href: "/settings" },
    { id: "help", label: "Help & Support", icon: <HelpCircle className="w-5 h-5" />, href: "/help" },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        variants={isMobile ? { open: sidebarVariants.mobile, closed: sidebarVariants.mobile } : sidebarVariants}
        initial={false}
        animate={isMobile ? (isOpen ? "open" : "closed") : isOpen ? "expanded" : "collapsed"}
        className="bg-background border-r border-primary/10 fixed top-0 bottom-0 left-0 z-50 overflow-hidden flex flex-col"
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md flex-shrink-0">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              {(isOpen || isMobile) && (
                <span className="text-xl font-roboto font-medium whitespace-nowrap overflow-hidden">ResumeAI</span>
              )}
            </div>

            {/* Toggle button inside sidebar header - only for expanded mode */}
            {!isMobile && isOpen && (
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md hover:bg-primary/10 transition-colors flex-shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </motion.button>
            )}

            {isMobile && (
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-md hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-2">
            {(isOpen || isMobile) && (
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Main</div>
            )}
            <nav className="space-y-1 mb-8">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setIsHovering(item.id)}
                  onMouseLeave={() => setIsHovering(null)}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`flex items-center ${isOpen || isMobile ? "px-3" : "justify-center"} py-2.5 rounded-lg transition-colors relative group ${
                      activeItem === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setActiveItem(item.id)
                      if (isMobile) setIsOpen(false)
                    }}
                  >
                    <span className={`${isOpen || isMobile ? "mr-3" : ""} flex-shrink-0`}>{item.icon}</span>
                    {(isOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
                    {activeItem === item.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && !isMobile && isHovering === item.id && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-foreground text-background text-xs py-1 px-2 rounded shadow-lg z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {(isOpen || isMobile) && (
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Account
              </div>
            )}
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setIsHovering(item.id)}
                  onMouseLeave={() => setIsHovering(null)}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`flex items-center ${isOpen || isMobile ? "px-3" : "justify-center"} py-2.5 rounded-lg transition-colors ${
                      activeItem === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => {
                      setActiveItem(item.id)
                      if (isMobile) setIsOpen(false)
                    }}
                  >
                    <span className={`${isOpen || isMobile ? "mr-3" : ""} flex-shrink-0`}>{item.icon}</span>
                    {(isOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>

                  {/* Tooltip for collapsed mode */}
                  {!isOpen && !isMobile && isHovering === item.id && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-foreground text-background text-xs py-1 px-2 rounded shadow-lg z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-primary/10">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              {(isOpen || isMobile) && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">John Doe</div>
                  <div className="text-xs text-muted-foreground truncate">john.doe@example.com</div>
                </div>
              )}
              <motion.button
                className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Expand button at bottom for collapsed mode */}
          {!isMobile && !isOpen && (
            <div className="p-2 border-t border-primary/10 flex justify-center">
              <motion.button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors w-full flex justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Expand sidebar"
              >
                <ArrowRightToLine className="w-5 h-5 text-primary" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  )
}

