"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"

const brands = [
  { name: "Salesforce", logo: "SF" },
  { name: "Microsoft", logo: "MS" },
  { name: "Adobe", logo: "AD" },
  { name: "Shopify", logo: "SP" },
  { name: "Slack", logo: "SL" },
  { name: "Dropbox", logo: "DB" },
  { name: "Airbnb", logo: "AB" },
  { name: "Spotify", logo: "SP" },
  { name: "Twitter", logo: "TW" },
  { name: "Uber", logo: "UB" },
]

export function BrandCarousel() {
  const { theme } = useTheme()

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className="flex space-x-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {/* First set of logos */}
        {brands.map((brand, index) => (
          <div
            key={`brand-1-${index}`}
            className="flex items-center justify-center min-w-[120px] h-10 glass-card rounded-md px-4 py-2 hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {brand.logo}
              </div>
              <span className="text-white text-sm font-medium">{brand.name}</span>
            </div>
          </div>
        ))}

        {/* Duplicate set for seamless looping */}
        {brands.map((brand, index) => (
          <div
            key={`brand-2-${index}`}
            className="flex items-center justify-center min-w-[120px] h-10 glass-card rounded-md px-4 py-2 hover:bg-white/20 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {brand.logo}
              </div>
              <span className="text-white text-sm font-medium">{brand.name}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

