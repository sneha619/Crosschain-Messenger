"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface FormValidatorProps {
  children: React.ReactNode
  error?: string
}

export function FormValidator({ children, error }: FormValidatorProps) {
  return (
    <div className="space-y-2">
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
