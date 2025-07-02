"use client"

// Ensure this file is treated as a module
export {}

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Fuel, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import type { GasEstimate } from "@/types"

interface GasFeeEstimatorProps {
  gasEstimate: GasEstimate | null
  isEstimating: boolean
  sourceChain: string
  destinationChain: string
}

export function GasFeeEstimator({ gasEstimate, isEstimating, sourceChain, destinationChain }: GasFeeEstimatorProps) {
  const sourceChainData = SUPPORTED_CHAINS.find((c) => c.id.toString() === sourceChain)
  const destinationChainData = SUPPORTED_CHAINS.find((c) => c.id.toString() === destinationChain)

  if (!sourceChain || !destinationChain) {
    return null
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-red-500" />
      case "down":
        return <TrendingDown className="w-3 h-3 text-green-500" />
      default:
        return <Minus className="w-3 h-3 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600 dark:text-red-400"
      case "down":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Fuel className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Gas Fee Estimate</h3>
          </div>

          {isEstimating ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner className="mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Calculating gas fees...</span>
            </div>
          ) : gasEstimate ? (
            <div className="space-y-3">
              {/* Route */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sourceChainData?.color}`} />
                  <span>{sourceChainData?.name}</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-2">
                  <span>{destinationChainData?.name}</span>
                  <div className={`w-2 h-2 rounded-full ${destinationChainData?.color}`} />
                </div>
              </div>

              {/* Gas Estimates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Source Gas</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(gasEstimate.sourceTrend)}
                      <span className={`text-xs ${getTrendColor(gasEstimate.sourceTrend)}`}>
                        {gasEstimate.sourceTrend === "up"
                          ? "High"
                          : gasEstimate.sourceTrend === "down"
                            ? "Low"
                            : "Normal"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{gasEstimate.sourceGas} ETH</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">~${gasEstimate.sourceUsd}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Destination Gas</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(gasEstimate.destinationTrend)}
                      <span className={`text-xs ${getTrendColor(gasEstimate.destinationTrend)}`}>
                        {gasEstimate.destinationTrend === "up"
                          ? "High"
                          : gasEstimate.destinationTrend === "down"
                            ? "Low"
                            : "Normal"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{gasEstimate.destinationGas} ETH</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">~${gasEstimate.destinationUsd}</div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Estimated Cost</span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-900 dark:text-blue-100">{gasEstimate.totalGas} ETH</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">~${gasEstimate.totalUsd}</div>
                  </div>
                </div>
              </div>

              {/* Speed Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Estimated delivery: {gasEstimate.estimatedTime}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Enter message details to see gas estimate
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
