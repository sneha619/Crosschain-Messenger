"use client"

// Ensure this file is treated as a module
export {}

import type { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnhancedFormValidatorProps {
  children: ReactNode
  error?: string
  success?: string
  isValidating?: boolean
}

export function EnhancedFormValidator({ children, error, success, isValidating }: EnhancedFormValidatorProps) {
  return (
    <div className="space-y-2">
      <motion.div
        animate={{
          scale: error ? 0.98 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Alert variant="destructive" className="border-red-200 dark:border-red-800">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className="h-4 w-4" />
              </motion.div>
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </motion.div>
              <AlertDescription className="text-sm font-medium text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {isValidating && (
          <motion.div
            key="validating"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
          >
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <span>Validating...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
