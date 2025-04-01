"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import {
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Search,
  BarChart2,
  Star,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Award,
  Clock,
  Users,
  DollarSign,
  Briefcase,
  Brain,
  Target,
  UserCheck,
  TrendingUp,
  Layers,
  Database,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { UserDropdown } from "@/components/user-dropdown"
import { auth } from "@/FirebaseConfig"
import { signOut } from "firebase/auth"

const TestimonialsLoader = () => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="p-6 bg-card rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded-full mr-1" />
          ))}
        </div>
        <div className="h-24 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const DynamicTestimonials = dynamic(() => import('@/components/testimonials'), {
  loading: () => <TestimonialsLoader />,
  ssr: false
});

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const sectionRef = useRef(null)

  const { user } = useAuth()

  // Update scroll handler to remove unused scrollProgress
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update intersection observer to use the value
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Do something when section is visible, for example:
          // Trigger animations or load content
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [])

  // Animation controls
  const heroControls = useAnimation()
  const featuresControls = useAnimation()
  const howItWorksControls = useAnimation()
  const testimonialsControls = useAnimation()
  const pricingControls = useAnimation()
  const statsControls = useAnimation()
  const ctaControls = useAnimation()

  // Intersection observers
  const [heroRef, heroInView] = useInView({ threshold: 0.3 })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.3 })
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.3 })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.3 })
  const [pricingRef, pricingInView] = useInView({ threshold: 0.3 })
  const [statsRef, statsInView] = useInView({ threshold: 0.3 })
  const [ctaRef, ctaInView] = useInView({ threshold: 0.3 })

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Animation triggers
  useEffect(() => {
    if (heroInView) heroControls.start("visible")
    if (featuresInView) featuresControls.start("visible")
    if (howItWorksInView) howItWorksControls.start("visible")
    if (testimonialsInView) testimonialsControls.start("visible")
    if (pricingInView) pricingControls.start("visible")
    if (statsInView) statsControls.start("visible")
    if (ctaInView) ctaControls.start("visible")
  }, [
    heroInView,
    featuresInView,
    howItWorksInView,
    testimonialsInView,
    pricingInView,
    statsInView,
    ctaInView,
    heroControls,
    featuresControls,
    howItWorksControls,
    testimonialsControls,
    pricingControls,
    statsControls,
    ctaControls,
  ])

  const features = [
    {
      title: "AI-Powered Candidate Matching",
      description:
        "Our advanced AI algorithms match candidates to job requirements with 95% accuracy, reducing screening time by 70%.",
      icon: <Target className="w-10 h-10 text-primary" />,
    },
    {
      title: "Comprehensive Talent Pipeline",
      description:
        "Manage your entire recruitment workflow from sourcing to onboarding in one centralized, intuitive platform.",
      icon: <Layers className="w-10 h-10 text-primary" />,
    },
    {
      title: "Team Collaboration Hub",
      description:
        "Enable seamless communication between hiring managers, recruiters, and HR teams with real-time feedback and evaluations.",
      icon: <Users className="w-10 h-10 text-primary" />,
    },
  ]


  const stats = [
    {
      value: "70%",
      label: "Faster Time-to-Hire",
      icon: <Clock className="w-6 h-6 text-primary" />,
    },
    {
      value: "3x",
      label: "More Candidates Processed",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      value: "40%",
      label: "Cost Reduction",
      icon: <DollarSign className="w-6 h-6 text-primary" />,
    },
  ]

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10 dot-pattern opacity-50"></div>
      <div
        className="fixed top-0 right-0 w-[800px] h-[800px] -z-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/5 blur-3xl"
        style={{
          transform: `translate(40%, -40%) translateY(${scrollY * 0.1}px)`,
        }}
      ></div>
      <div
        className="fixed bottom-0 left-0 w-[600px] h-[600px] -z-10 rounded-full bg-gradient-to-tr from-accent/10 to-primary/5 blur-3xl"
        style={{
          transform: `translate(-30%, 30%) translateY(${-scrollY * 0.05}px)`,
        }}
      ></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/70 backdrop-blur-xl z-50 border-b border-primary/10 shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-roboto font-medium">TalentSync</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-foreground hover:text-primary transition-colors relative group"
                onClick={() => scrollToSection("features")}
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#how-it-works"
                className="text-foreground hover:text-primary transition-colors relative group"
                onClick={() => scrollToSection("how-it-works")}
              >
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#testimonials"
                className="text-foreground hover:text-primary transition-colors relative group"
                onClick={() => scrollToSection("testimonials")}
              >
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#pricing"
                className="text-foreground hover:text-primary transition-colors relative group"
                onClick={() => scrollToSection("pricing")}
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <UserDropdown user={user} />
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-foreground hover:text-primary transition-colors">
                    Login
                  </Link>
                  <Link href="/upload-resume" className="btn-primary group">
                    Request Demo
                    <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              aria-label="Open mobile menu"
              role="button"
              className="md:hidden text-foreground" 
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-50 md:hidden ${isMenuOpen ? "block" : "hidden"}`}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: isMenuOpen ? 0 : "100%", opacity: isMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-roboto font-medium">TalentSync</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)}>
              <X className="w-6 h-6 text-foreground" />
            </button>
          </div>

          <motion.div
            className="flex flex-col space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <Link
                href="#features"
                className="text-foreground text-lg flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToSection("features")
                }}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                </span>
                Features
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link
                href="#how-it-works"
                className="text-foreground text-lg flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToSection("how-it-works")
                }}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-primary" />
                </span>
                How It Works
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link
                href="#testimonials"
                className="text-foreground text-lg flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToSection("testimonials")
                }}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-primary" />
                </span>
                Success Stories
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link
                href="#pricing"
                className="text-foreground text-lg flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToSection("pricing")
                }}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-primary" />
                </span>
                Pricing
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} className="pt-6 border-t border-border flex flex-col space-y-4">
              {user ? (
                <>
                  <Link
                    href="/upload-resume"
                    className="px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false)
                      await signOut(auth)
                    }}
                    className="px-4 py-3 text-center text-foreground border border-border rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-3 text-center text-foreground border border-border rounded-lg hover:bg-muted transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/upload-resume"
                    className="px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Request Demo
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section ref={heroRef} className="h-hero pt-32 flex items-center relative">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-background"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>

        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={sectionVariants} initial="hidden" animate={heroControls} className="max-w-xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Recruitment Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Streamline Your <span className="text-gradient">Talent Acquisition</span> with AI
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Empower your recruitment team with AI-driven candidate matching, automated screening, and comprehensive
                analytics to hire better talent, faster.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/upload-resume" className="btn-primary group">
                  Schedule a Demo
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#how-it-works" className="btn-secondary" onClick={() => scrollToSection("how-it-works")}>
                  See How It Works
                </Link>
              </div>

              <div className="mt-8 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Trusted by 500+</span> recruitment agencies and HR teams
                worldwide
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.div className="glass-card animated-border animate-float">
                  <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-md">
                    Live Dashboard
                  </div>

                  <div className="p-6 border-b border-primary/10">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <BarChart2 className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">Recruitment Analytics</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Time-to-Hire</span>
                            <span className="text-sm text-accent">-35%</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              className="bg-primary h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "65%" }}
                              transition={{
                                duration: 1.5,
                                delay: 0.5,
                                ease: "easeOut",
                              }}
                            ></motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Candidate Quality</span>
                            <span className="text-sm text-accent">+42%</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              className="bg-primary h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "82%" }}
                              transition={{
                                duration: 1.5,
                                delay: 0.7,
                                ease: "easeOut",
                              }}
                            ></motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-full">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Cost-per-Hire</span>
                            <span className="text-sm text-accent">-40%</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              className="bg-primary h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "60%" }}
                              transition={{
                                duration: 1.5,
                                delay: 0.9,
                                ease: "easeOut",
                              }}
                            ></motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-primary/10">
                        <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Active Candidates</span>
                            <span className="text-sm font-medium">248</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Positions Filled (Q1)</span>
                            <span className="text-sm font-medium text-accent">+28%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div
                className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 rounded-full blur-3xl"
                style={{
                  transform: `translate(-50%, -50%) translateY(${-scrollY * 0.05}px)`,
                }}
              ></div>

              <div className="absolute -right-16 -bottom-10 w-32 h-32 bg-primary/10 rounded-full animate-pulse-slow"></div>
              <div
                className="absolute -left-10 -top-10 w-20 h-20 bg-secondary/10 rounded-full animate-pulse-slow"
                style={{ animationDelay: "1s" }}
              ></div>

              <div className="absolute -right-4 top-1/3 w-8 h-8 border border-primary/30 rounded-lg rotate-12 animate-spin-slow"></div>
              <div
                className="absolute left-1/4 -bottom-4 w-6 h-6 border border-accent/30 rounded-full animate-spin-slow"
                style={{ animationDirection: "reverse" }}
              ></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16">
        <div className="container mx-auto">
          <motion.div variants={sectionVariants} initial="hidden" animate={statsControls} className="glass-card">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-section bg-muted relative">
        <div className="wavy-divider absolute top-0 left-0 right-0 -mt-[69px]"></div>

        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="section-title">Recruitment Tools That Drive Results</h2>
            <p className="section-description">
              Our platform offers everything you need to streamline your recruitment process and make better hiring
              decisions.
            </p>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={featuresControls}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
                className={`glass-card ${index === activeFeature ? "ring-2 ring-primary" : ""}`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>

                <div className="mt-6 pt-4 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-sm text-primary font-medium">Learn more</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <motion.div className="glass-card" whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Candidate Database & CRM</h3>
              <p className="text-muted-foreground mb-4">
                Build and maintain a rich talent pool with advanced search capabilities. Nurture relationships with
                passive candidates and re-engage previous applicants.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Advanced candidate tagging</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Automated follow-ups</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Automated follow-ups</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Candidate relationship tracking</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Talent pool segmentation</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="glass-card" whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics & Reporting</h3>
              <p className="text-muted-foreground mb-4">
                Gain actionable insights with comprehensive recruitment metrics. Track KPIs, identify bottlenecks, and
                optimize your hiring process with data-driven decisions.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Custom dashboard creation</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Recruitment funnel analysis</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Source effectiveness tracking</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm">Automated performance reports</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="py-section bg-gradient-to-b from-background to-muted/50 relative"
      >
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Zap className="w-4 h-4 mr-2" />
              Simple Process
            </div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Streamline your recruitment workflow in three simple steps</p>
          </div>

          <motion.div variants={sectionVariants} initial="hidden" animate={howItWorksControls} className="relative">
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border hidden md:block"></div>
            <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary hidden md:block"></div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Define Your Requirements",
                  description: "Create detailed job profiles with custom requirements, skills, and screening criteria.",
                  icon: <Briefcase className="w-8 h-8 text-primary" />,
                },
                {
                  step: "02",
                  title: "AI-Powered Matching",
                  description:
                    "Our AI analyzes and ranks candidates based on job requirements, skills, and cultural fit.",
                  icon: <Brain className="w-8 h-8 text-primary" />,
                },
                {
                  step: "03",
                  title: "Streamlined Hiring",
                  description:
                    "Manage candidates through your pipeline with automated workflows and collaborative tools.",
                  icon: <UserCheck className="w-8 h-8 text-primary" />,
                },
              ].map((item, index) => (
                <motion.div key={index} className="relative" whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                  <div className="glass-card relative z-10">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      {item.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-full z-20">
                      <ArrowRight className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="mt-16 text-center">
            <Link href="/upload-resume" className="btn-primary inline-flex">
              Schedule a Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} id="testimonials" className="py-section bg-muted relative">
        <div className="wavy-divider absolute top-0 left-0 right-0 -mt-[69px]"></div>

        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Success Stories
            </div>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-description">
              Join hundreds of recruitment teams who have transformed their hiring process with our platform.
            </p>
          </div>

          <motion.div variants={sectionVariants} initial="hidden" animate={testimonialsControls} className="relative">
            <DynamicTestimonials />
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} id="pricing" className="py-section bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              Pricing Plans
            </div>
            <h2 className="section-title">Simple, Transparent, Pricing</h2>
            <p className="section-description">Choose the plan that works best for your recruitment team.</p>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={pricingControls}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                name: "Starter",
                price: "$299",
                period: "per month",
                description: "Perfect for small recruitment teams",
                features: [
                  "Up to 5 users",
                  "50 active job postings",
                  "Basic AI candidate matching",
                  "Standard analytics",
                  "Email support",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Professional",
                price: "$599",
                period: "per month",
                description: "Most popular for mid-sized agencies",
                features: [
                  "Up to 15 users",
                  "Unlimited job postings",
                  "Advanced AI matching & screening",
                  "Comprehensive analytics",
                  "Candidate CRM",
                  "Priority support",
                ],
                cta: "Try Professional",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large recruitment operations",
                features: [
                  "Unlimited users",
                  "Unlimited job postings",
                  "Custom AI models & workflows",
                  "Advanced reporting & API access",
                  "Dedicated account manager",
                  "White-labeling options",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: { duration: 0.3 },
                }}
                className={`glass-card ${plan.popular ? "border-primary shadow-lg relative" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                </div>

                <div className="border-t border-b border-primary/10 py-6 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/upload-resume"
                  className={`w-full py-3 rounded-lg text-center block transition-all ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                      : "border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required to start.
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-section bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate={ctaControls}
              className="relative z-10 text-center p-12"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started Today
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="highlight-text">Transform</span> Your Recruitment Process?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of recruitment teams who have already improved their hiring metrics with our AI-powered
                platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/upload-resume" className="btn-primary group">
                  Schedule a Demo <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#" className="btn-secondary">
                  Contact Sales
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">
                  Enterprise-grade security. SOC 2 and GDPR compliant.
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <Search className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-roboto font-medium">TalentSync</span>
              </div>
              <p className="text-background/70 mb-6">
                Empowering recruitment teams with AI-driven tools to hire better talent, faster.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Recruitment Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Industry Reports
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Webinars & Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-background/70 hover:text-background transition-colors">
                    GDPR Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-background/20 text-center">
            <p className="text-background/60">© {new Date().getFullYear()} TalentSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

