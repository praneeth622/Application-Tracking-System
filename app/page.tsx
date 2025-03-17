"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Upload,
  FileText,
  BarChart2,
  User,
  Star,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Award,
  Clock,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserDropdown } from "@/components/user-dropdown";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const { user } = useAuth();

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation controls
  const heroControls = useAnimation();
  const featuresControls = useAnimation();
  const howItWorksControls = useAnimation();
  const testimonialsControls = useAnimation();
  const pricingControls = useAnimation();
  const statsControls = useAnimation();
  const ctaControls = useAnimation();

  // Intersection observers
  const [heroRef, heroInView] = useInView({ threshold: 0.3 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.3 });
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.3 });
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.3 });
  const [pricingRef, pricingInView] = useInView({ threshold: 0.3 });
  const [statsRef, statsInView] = useInView({ threshold: 0.3 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.3 });

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Animation triggers
  useEffect(() => {
    if (heroInView) heroControls.start("visible");
    if (featuresInView) featuresControls.start("visible");
    if (howItWorksInView) howItWorksControls.start("visible");
    if (testimonialsInView) testimonialsControls.start("visible");
    if (pricingInView) pricingControls.start("visible");
    if (statsInView) statsControls.start("visible");
    if (ctaInView) ctaControls.start("visible");
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
  ]);

  const features = [
    {
      title: "AI Resume Analysis",
      description:
        "Our AI-powered tool analyzes your resume and provides detailed feedback to help you stand out from the competition.",
      icon: <FileText className="w-10 h-10 text-primary" />,
    },
    {
      title: "Performance Tracking",
      description:
        "Track your resume's performance and get insights on how to improve your job application success rate.",
      icon: <BarChart2 className="w-10 h-10 text-primary" />,
    },
    {
      title: "Profile Optimization",
      description:
        "Optimize your professional profile with personalized recommendations tailored to your career goals.",
      icon: <User className="w-10 h-10 text-primary" />,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "TechCorp",
      content:
        "This platform completely transformed my job search. I received 3 interview calls within a week of optimizing my resume!",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Marketing Specialist",
      company: "BrandGrowth",
      content:
        "The detailed analysis helped me understand exactly what was missing from my resume. Highly recommended for anyone in the job market.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Data Scientist",
      company: "DataInsights",
      content:
        "The AI recommendations were spot-on for my industry. I'm now confident my resume stands out from the competition.",
      avatar: "/placeholder.svg?height=80&width=80",
      rating: 5,
    },
  ];

  const stats = [
    {
      value: "85%",
      label: "Success Rate",
      icon: <Award className="w-6 h-6 text-primary" />,
    },
    {
      value: "24h",
      label: "Fast Turnaround",
      icon: <Clock className="w-6 h-6 text-primary" />,
    },
    {
      value: "50K+",
      label: "Happy Users",
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      value: "100%",
      label: "Satisfaction",
      icon: <Shield className="w-6 h-6 text-primary" />,
    },
  ];

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
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

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
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-roboto font-medium">ResumeAI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-foreground hover:text-primary transition-colors relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#how-it-works"
                className="text-foreground hover:text-primary transition-colors relative group"
              >
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#testimonials"
                className="text-foreground hover:text-primary transition-colors relative group"
              >
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="#pricing"
                className="text-foreground hover:text-primary transition-colors relative group"
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/upload-resume"
                    className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <UserDropdown user={user} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link href="/dashboard" className="btn-primary group">
                    Get Started
                    <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
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
        className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-50 md:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: isMenuOpen ? 0 : "100%", opacity: isMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-md">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-roboto font-medium">ResumeAI</span>
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
                onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
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
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-primary" />
                </span>
                Testimonials
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link
                href="#pricing"
                className="text-foreground text-lg flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-primary" />
                </span>
                Pricing
              </Link>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="pt-6 border-t border-border flex flex-col space-y-4"
            >
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
                      setIsMenuOpen(false);
                      await signOut(auth);
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
                    href="/dashboard"
                    className="px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="h-hero pt-32 flex items-center relative"
      >
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-background"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>

        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate={heroControls}
              className="max-w-xl"
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Resume Analysis
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Elevate Your Resume with{" "}
                <span className="text-gradient">AI-Powered</span> Analysis
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Get personalized feedback, track your application performance,
                and land your dream job faster with our intelligent resume
                optimization platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="btn-primary group">
                  Upload Resume
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#how-it-works" className="btn-secondary group">
                  Learn More
                  <ChevronRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">1,000+</span>{" "}
                  professionals joined this week
                </div>
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
                    Live Preview
                  </div>

                  <div className="p-6 border-b border-primary/10">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">Resume Analysis</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-foreground">
                          Professional summary needs more quantifiable
                          achievements
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-foreground">
                          Skills section matches 85% of job requirements
                        </p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-foreground">
                          Experience section needs more action verbs
                        </p>
                      </div>

                      <div className="mt-6 pt-6 border-t border-primary/10">
                        <div className="bg-muted/50 backdrop-blur-sm rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Overall Score
                            </span>
                            <span className="text-sm font-medium">78/100</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                            <motion.div
                              className="bg-primary h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "78%" }}
                              transition={{
                                duration: 1.5,
                                delay: 0.5,
                                ease: "easeOut",
                              }}
                            ></motion.div>
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
                  transform: `translate(-50%, -50%) translateY(${
                    -scrollY * 0.05
                  }px)`,
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
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={statsControls}
            className="glass-card"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-section bg-muted relative"
      >
        <div className="wavy-divider absolute top-0 left-0 right-0 -mt-[69px]"></div>

        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="section-title">
              Powerful Features to{" "}
              <span className="highlight-text">Boost Your Career</span>
            </h2>
            <p className="section-description">
              Our platform offers everything you need to create a standout
              resume and track your job application success.
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
                className={`glass-card ${
                  index === activeFeature ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>

                <div className="mt-6 pt-4 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-sm text-primary font-medium">
                    Learn more
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 glass-card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Analysis
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Get Detailed Insights Into Your Resume
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our advanced AI analyzes every aspect of your resume, from
                  formatting to content, providing actionable recommendations to
                  improve your chances of landing interviews.
                </p>

                <ul className="space-y-3">
                  {[
                    "Keyword optimization for ATS systems",
                    "Industry-specific recommendations",
                    "Formatting and design suggestions",
                    "Content improvement tips",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative h-full min-h-[300px] bg-muted/30 rounded-l-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  alt="Resume Analysis Dashboard"
                  width={500}
                  height={400}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg"
                />
              </div>
            </div>
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
            <h2 className="section-title">
              How It <span className="highlight-text">Works</span>
            </h2>
            <p className="section-description">
              Our simple three-step process helps you optimize your resume and
              improve your job search results.
            </p>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={howItWorksControls}
            className="relative"
          >
            {/* Progress line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-border hidden md:block"></div>
            <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary hidden md:block"></div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Upload Your Resume",
                  description:
                    "Simply drag and drop your resume in PDF format to get started.",
                  icon: <Upload className="w-8 h-8 text-primary" />,
                },
                {
                  step: "02",
                  title: "Get AI Analysis",
                  description:
                    "Our AI analyzes your resume against industry standards and job requirements.",
                  icon: <BarChart2 className="w-8 h-8 text-primary" />,
                },
                {
                  step: "03",
                  title: "Optimize & Apply",
                  description:
                    "Apply the suggested improvements and track your application success.",
                  icon: <CheckCircle className="w-8 h-8 text-primary" />,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
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
            <Link href="/dashboard" className="btn-primary inline-flex">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        id="testimonials"
        className="py-section bg-muted relative"
      >
        <div className="wavy-divider absolute top-0 left-0 right-0 -mt-[69px]"></div>

        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Star className="w-4 h-4 mr-2" />
              Testimonials
            </div>
            <h2 className="section-title">
              What Our <span className="highlight-text">Users Say</span>
            </h2>
            <p className="section-description">
              Join thousands of professionals who have improved their job search
              results with our platform.
            </p>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={testimonialsControls}
            className="relative"
          >
            <div className="glass-card overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8 md:p-12">
                  <div className="flex mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-primary text-primary mr-1"
                      />
                    ))}
                  </div>

                  <div className="relative">
                    {testimonials.map((testimonial, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{
                          opacity: index === activeTestimonial ? 1 : 0,
                          x: index === activeTestimonial ? 0 : 20,
                          position:
                            index === activeTestimonial
                              ? "relative"
                              : "absolute",
                          zIndex: index === activeTestimonial ? 10 : 0,
                          top: 0,
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                      >
                        <blockquote className="text-xl italic mb-6">
                          "{testimonial.content}"
                        </blockquote>

                        <div className="flex items-center">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={60}
                            height={60}
                            className="rounded-full mr-4 border-2 border-primary/20"
                          />
                          <div>
                            <h4 className="font-semibold text-lg">
                              {testimonial.name}
                            </h4>
                            <p className="text-muted-foreground">
                              {testimonial.role}, {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex mt-8 space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === activeTestimonial
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                        aria-label={`View testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative h-full min-h-[400px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-l-3xl overflow-hidden hidden md:block">
                  <div className="absolute inset-0 dot-pattern opacity-10"></div>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-md">
                    <div className="relative">
                      {testimonials.map((testimonial, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{
                            opacity: index === activeTestimonial ? 1 : 0,
                            scale: index === activeTestimonial ? 1 : 0.9,
                            y: index === activeTestimonial ? 0 : 20,
                            position:
                              index === activeTestimonial
                                ? "relative"
                                : "absolute",
                            zIndex: index === activeTestimonial ? 10 : 0,
                            top: 0,
                            left: 0,
                            width: "100%",
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="bg-background/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-primary/10">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                  <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium">
                                  Resume Analysis
                                </span>
                              </div>
                              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                Success Story
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-accent mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-sm">
                                  Improved ATS compatibility by 85%
                                </p>
                              </div>
                              <div className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-accent mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-sm">
                                  Enhanced professional summary
                                </p>
                              </div>
                              <div className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-accent mt-0.5 mr-2 flex-shrink-0" />
                                <p className="text-sm">
                                  Optimized keywords for target industry
                                </p>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Result:{" "}
                              <span className="text-foreground font-medium">
                                3 interviews in one week
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-section bg-gradient-to-b from-muted/50 to-background"
      >
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              Pricing Plans
            </div>
            <h2 className="section-title">
              Simple, <span className="highlight-text">Transparent</span>{" "}
              Pricing
            </h2>
            <p className="section-description">
              Choose the plan that works best for your career goals.
            </p>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={pricingControls}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {[
              {
                name: "Basic",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "1 Resume Analysis",
                  "Basic Recommendations",
                  "Limited Access to Templates",
                  "Email Support",
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Professional",
                price: "$19",
                period: "per month",
                description: "Most popular for job seekers",
                features: [
                  "Unlimited Resume Analysis",
                  "Advanced AI Recommendations",
                  "Full Access to Templates",
                  "Application Tracking",
                  "Priority Support",
                ],
                cta: "Try Professional",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "$49",
                period: "per month",
                description: "For teams and businesses",
                features: [
                  "Everything in Professional",
                  "Custom Branding",
                  "API Access",
                  "Dedicated Account Manager",
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
                className={`glass-card ${
                  plan.popular ? "border-primary shadow-lg relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    )}
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
                  href="/dashboard"
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
            All plans include a 14-day money-back guarantee. No credit card
            required for free trial.
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="py-section bg-gradient-to-r from-primary/5 to-secondary/5"
      >
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
                Ready to <span className="highlight-text">Supercharge</span>{" "}
                Your Job Search?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have already improved their
                career prospects with our AI-powered resume platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="btn-primary group">
                  Get Started Now{" "}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="#" className="btn-secondary">
                  Schedule a Demo
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-muted-foreground">
                  100% secure & confidential. Cancel anytime.
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
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-roboto font-medium">
                  ResumeAI
                </span>
              </div>
              <p className="text-background/70 mb-6">
                Elevate your career with AI-powered resume analysis and
                optimization.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
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
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Resume Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Career Advice
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Job Search Tips
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Interview Prep
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-background/20 text-center">
            <p className="text-background/60">
              © {new Date().getFullYear()} ResumeAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
