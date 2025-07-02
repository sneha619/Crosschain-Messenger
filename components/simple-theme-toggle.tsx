"use client"

// Ensure this file is treated as a module
export {}

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function SimpleThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-10 h-10 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="relative w-10 h-10 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 group"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
              : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className="relative z-10"
          animate={{
            rotate: isDark ? 180 : 0,
          }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-blue-200 group-hover:text-blue-100 transition-colors" />
          ) : (
            <Sun className="h-4 w-4 text-amber-100 group-hover:text-white transition-colors" />
          )}
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            boxShadow: isDark ? "0 0 20px rgba(59, 130, 246, 0.4)" : "0 0 20px rgba(245, 158, 11, 0.4)",
          }}
        />
      </Button>
    </motion.div>
  )
}
