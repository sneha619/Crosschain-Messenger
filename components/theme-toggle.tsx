"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 rounded-full">
        <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
      </Button>
    )
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  const cycleTheme = () => {
    // Simplified toggle between light and dark
    setTheme(currentTheme === "light" ? "dark" : "light")
  }

  const getThemeIcon = () => {
    switch (currentTheme) {
      case "light":
        return <Sun className="h-4 w-4 text-amber-500" />
      case "dark":
        return <Moon className="h-4 w-4 text-blue-400" />
      default:
        return <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getThemeLabel = () => {
    return currentTheme === "light" ? "Switch to dark mode" : "Switch to light mode"
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleTheme}
        className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 overflow-hidden"
        aria-label={getThemeLabel()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {getThemeIcon()}
          </motion.div>
        </AnimatePresence>

        {/* Animated background ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          animate={{
            borderColor: currentTheme === "light" ? "#f59e0b" : currentTheme === "dark" ? "#3b82f6" : "#6b7280",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow:
              currentTheme === "light"
                ? "0 0 20px rgba(245, 158, 11, 0.3)"
                : currentTheme === "dark"
                  ? "0 0 20px rgba(59, 130, 246, 0.3)"
                  : "0 0 20px rgba(107, 114, 128, 0.2)",
          }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </motion.div>
  )
}
