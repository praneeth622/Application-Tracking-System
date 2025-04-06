"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const { theme } = useTheme()
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)

      // Check if we're still in the header section
      const headerHeight =
        document.querySelector(".bg-gradient-to-r.from-rose-500")?.getBoundingClientRect().height || 0
      setIsHeaderVisible(window.scrollY < headerHeight - 100)

      // Update active section based on scroll position
      const sections = document.querySelectorAll("section[id]")
      let currentSection = "home"

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop
        if (window.scrollY >= sectionTop - 100) {
          currentSection = section.id
        }
      })

      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ]

  // Determine navbar background based on theme and scroll position
  const getNavbarBackground = () => {
    if (!isScrolled) return "bg-transparent"

    if (theme === "dark") {
      return "bg-gray-900 shadow-md"
    } else {
      // Light mode
      return isHeaderVisible
        ? "bg-gradient-to-r from-rose-500 via-violet-500 to-blue-500 shadow-md"
        : "bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 shadow-md"
    }
  }

  // Determine mobile menu background based on theme and header visibility
  const getMobileMenuBackground = () => {
    if (theme === "dark") {
      return "bg-gray-900"
    } else {
      // Light mode
      return isHeaderVisible
        ? "bg-gradient-to-r from-rose-500 via-violet-500 to-blue-500"
        : "bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500"
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("fixed top-0 w-full z-50 transition-all duration-500 ease-in-out", getNavbarBackground())}
    >
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="w-8 h-8 mr-2 bg-white rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-violet-600"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fillOpacity="0.4"
              />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">ATS Checker</span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn("relative hover:text-opacity-80 transition-colors py-2 text-white font-medium")}
            >
              {item.name}
              {activeSection === item.name.toLowerCase() && (
                <motion.span
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-white"
                />
              )}
            </Link>
          ))}
          <Link href="#" className="text-white hover:text-opacity-80 transition-colors font-medium">
            Login
          </Link>

          <ThemeToggle />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="bg-white text-violet-600 hover:bg-white/90 hover:text-violet-700 px-6 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg h-auto">
              Book a Demo
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <motion.button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.9 }}>
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden shadow-lg overflow-hidden ${getMobileMenuBackground()}`}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-white hover:text-white/80 transition-colors py-2",
                    activeSection === item.name.toLowerCase() ? "font-medium" : "",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="#"
                className="text-white hover:text-white/80 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Button
                className="bg-white text-violet-600 hover:bg-white/90 hover:text-violet-700 px-6 py-3 rounded-full font-medium transition-all duration-300 w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book a Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

