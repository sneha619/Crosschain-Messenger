"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowRight, Activity, Loader2 } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import type { CrossChainTransaction } from "@/types"

interface StatusTrackerProps {
  transaction: CrossChainTransaction | null
}

export function StatusTracker({ transaction }: StatusTrackerProps) {
  if (!transaction) {
    return (
      <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Transaction Status
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <motion.div
              className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Clock className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No active transaction</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Send a message to see real-time status updates</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sourceChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === transaction.sourceChainId)
  const destinationChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === transaction.destinationChainId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700"
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700"
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          Transaction Status
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Chain Route Visualization */}
        <div className="relative">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${sourceChain?.color} shadow-lg`} />
              <div>
                <p className="font-semibold text-sm">{sourceChain?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
              </div>
            </div>

            <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
              <ArrowRight className="w-5 h-5 text-purple-500" />
            </motion.div>

            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-sm text-right">{destinationChain?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Destination</p>
              </div>
              <div className={`w-4 h-4 rounded-full ${destinationChain?.color} shadow-lg`} />
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Message Content:</h4>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{transaction.message}</p>
          </div>
        </div>

        {/* Transaction Steps */}
        <div className="space-y-4">
          {/* Source Transaction */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">Source Transaction</h4>
              <Badge className={getStatusColor(transaction.sourceStatus)}>
                {getStatusIcon(transaction.sourceStatus)}
                <span className="ml-2 capitalize">{transaction.sourceStatus}</span>
              </Badge>
            </div>

            {transaction.sourceTxHash ? (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 font-mono">
                  {transaction.sourceTxHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`${sourceChain?.blockExplorer}/tx/${transaction.sourceTxHash}`, "_blank")}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Waiting for transaction confirmation...</p>
              </div>
            )}
          </motion.div>

          {/* Destination Transaction */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">Destination Transaction</h4>
              <Badge className={getStatusColor(transaction.destinationStatus)}>
                {getStatusIcon(transaction.destinationStatus)}
                <span className="ml-2 capitalize">{transaction.destinationStatus}</span>
              </Badge>
            </div>

            {transaction.destinationTxHash ? (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1 font-mono">
                  {transaction.destinationTxHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(`${destinationChain?.blockExplorer}/tx/${transaction.destinationTxHash}`, "_blank")
                  }
                  className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">Waiting for cross-chain delivery...</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Timestamp */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Initiated: {new Date(transaction.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
