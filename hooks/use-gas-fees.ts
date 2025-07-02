"use client"

import { useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import type { GasEstimate } from "@/types"

interface GasEstimateParams {
  sourceChain: string
  destinationChain: string
  message: string
  recipient: string
}

export function useGasFees() {
  const [estimateParams, setEstimateParams] = useState<GasEstimateParams | null>(null)

  const { data: gasEstimate, isLoading: isEstimating } = useQuery({
    queryKey: ["gasEstimate", estimateParams],
    queryFn: async (): Promise<GasEstimate> => {
      if (!estimateParams) throw new Error("No estimate parameters")

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock gas estimation based on chains and message length
      const messageLength = estimateParams.message.length
      const baseGas = 0.001
      const messageFactor = messageLength * 0.00001

      const sourceGas = (baseGas + messageFactor + Math.random() * 0.002).toFixed(6)
      const destinationGas = (baseGas * 0.5 + messageFactor + Math.random() * 0.001).toFixed(6)
      const totalGas = (Number.parseFloat(sourceGas) + Number.parseFloat(destinationGas)).toFixed(6)

      // Mock USD prices (ETH = $2000)
      const ethPrice = 2000
      const sourceUsd = (Number.parseFloat(sourceGas) * ethPrice).toFixed(2)
      const destinationUsd = (Number.parseFloat(destinationGas) * ethPrice).toFixed(2)
      const totalUsd = (Number.parseFloat(totalGas) * ethPrice).toFixed(2)

      // Random trends
      const trends: Array<"up" | "down" | "stable"> = ["up", "down", "stable"]
      const sourceTrend = trends[Math.floor(Math.random() * trends.length)]
      const destinationTrend = trends[Math.floor(Math.random() * trends.length)]

      return {
        sourceGas,
        destinationGas,
        totalGas,
        sourceUsd,
        destinationUsd,
        totalUsd,
        sourceTrend,
        destinationTrend,
        estimatedTime: "2-5 minutes",
        timestamp: Date.now(),
      }
    },
    enabled: !!estimateParams && !!estimateParams.sourceChain && !!estimateParams.destinationChain,
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
  })

  const estimateGas = useCallback((params: GasEstimateParams) => {
    if (params.sourceChain && params.destinationChain && params.sourceChain !== params.destinationChain) {
      setEstimateParams(params)
    }
  }, [])

  return {
    gasEstimate,
    isEstimating,
    estimateGas,
  }
}
