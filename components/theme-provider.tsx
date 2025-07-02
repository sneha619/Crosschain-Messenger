"use client"

// Ensure this file is treated as a module
export {}

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ReactNode } from "react"

interface CustomThemeProviderProps {
  children: ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
