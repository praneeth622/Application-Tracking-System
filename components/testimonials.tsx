"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Head of Talent Acquisition",
      company: "TechHire Solutions",
      content: "TalentSync has revolutionized our recruitment process. We've reduced time-to-hire by 60% and improved candidate quality significantly.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "Global Staffing Inc",
      content: "The AI matching capabilities have transformed how we handle high-volume recruiting. We're now able to process 3x more applications.",
      rating: 5,
    },
    {
      name: "Jessica Williams",
      role: "Recruitment Manager",
      company: "Innovate Recruiting",
      content: "Outstanding platform that has streamlined our entire recruitment workflow. The interface is intuitive and the AI matching is spot-on.",
      rating: 5,
    },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="p-6 bg-card rounded-lg shadow-lg"
        >
          <div className="flex items-center mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="mb-4 text-muted-foreground">{testimonial.content}</p>
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}