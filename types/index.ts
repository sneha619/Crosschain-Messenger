// Ensure this file is treated as a module
export {};

export interface CrossChainTransaction {
  id: string
  message: string
  sourceChainId: string
  destinationChainId: string
  recipient: string
  sourceStatus: "pending" | "confirmed" | "failed"
  destinationStatus: "pending" | "confirmed" | "failed"
  timestamp: number
  sourceTxHash: string | null
  destinationTxHash: string | null
}

export interface SendMessageParams {
  message: string
  sourceChainId: string
  destinationChainId: string
  recipient: string
}

export interface GasEstimate {
  sourceGas: string
  destinationGas: string
  totalGas: string
  sourceUsd: string
  destinationUsd: string
  totalUsd: string
  sourceTrend: "up" | "down" | "stable"
  destinationTrend: "up" | "down" | "stable"
  estimatedTime: string
  timestamp: number
}
