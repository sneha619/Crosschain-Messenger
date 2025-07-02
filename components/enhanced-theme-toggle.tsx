"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Monitor, Palette, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function EnhancedThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
  // const isDark = resolvedTheme === "dark"

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Clean and bright interface",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Easy on the eyes",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follows your device settings",
    },
  ]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 group"
            aria-label="Theme settings"
          >
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="relative z-10">
              <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors" />
            </motion.div>

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{
                boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)",
              }}
            />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium">
          <Palette className="w-4 h-4" />
          Theme Preferences
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="space-y-1">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value
            const isActive = currentTheme === option.value

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                      color: isSelected
                        ? option.value === "light"
                          ? "#f59e0b"
                          : option.value === "dark"
                            ? "#3b82f6"
                            : "#6b7280"
                        : "#6b7280",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  {isSelected && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-blue-500 dark:border-blue-400"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.label}</span>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                </div>

                <Switch
                  checked={isSelected}
                  onCheckedChange={() => setTheme(option.value)}
                  className="ml-2"
                  aria-label={`Select ${option.label} theme`}
                />
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator />

        <div className="p-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          <div className="flex items-center justify-center gap-1">
            <span>System:</span>
            <Badge variant="outline" className="text-xs">
              {systemTheme === "dark" ? "Dark" : "Light"}
            </Badge>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
