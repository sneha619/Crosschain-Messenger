"use client"

import { motion } from "framer-motion"
import { Network, Globe, Zap, Shield, Layers } from "lucide-react"
import { useEffect, useState } from "react"

export function FloatingElements() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const elements = [
    { icon: Network, color: "text-blue-400", size: "w-8 h-8", delay: 0 },
    { icon: Globe, color: "text-purple-400", size: "w-6 h-6", delay: 2 },
    { icon: Zap, color: "text-yellow-400", size: "w-5 h-5", delay: 4 },
    { icon: Shield, color: "text-green-400", size: "w-7 h-7", delay: 1 },
    { icon: Layers, color: "text-pink-400", size: "w-6 h-6", delay: 3 },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {elements.map((element, index) => {
        const Icon = element.icon
        return (
          <motion.div
            key={index}
            className={`absolute ${element.color} opacity-60 dark:opacity-40`}
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
            }}
            animate={{
              x: [
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
              ],
              y: [
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
              ],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: element.delay,
            }}
          >
            <Icon className={element.size} />
          </motion.div>
        )
      })}
    </div>
  )
}
