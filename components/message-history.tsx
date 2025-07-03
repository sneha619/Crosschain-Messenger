"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ExternalLink, ArrowRight, History, MessageSquare, Clock } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import type { CrossChainTransaction } from "@/types"

interface MessageHistoryProps {
  messages: CrossChainTransaction[]
  onRefresh: () => void
  isLoading: boolean
}

export function MessageHistory({ messages, onRefresh, isLoading }: MessageHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200"
    }
  }

  return (
    <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <History className="w-5 h-5 text-white" />
            </div>
            Message History
            {messages.length > 0 && (
              <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                {messages.length} messages
              </Badge>
            )}
          </CardTitle>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <MessageSquare className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No messages sent yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your cross-chain message history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => {
              const sourceChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === message.sourceChainId)
              const destinationChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === message.destinationChainId)

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${sourceChain?.color} shadow-sm`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {sourceChain?.name}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${destinationChain?.color} shadow-sm`} />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {destinationChain?.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(message.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{message.message}</p>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(message.sourceStatus)}`}>
                          Source: {message.sourceStatus}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(message.destinationStatus)}`}>
                          Dest: {message.destinationStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {message.sourceTxHash && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(`${sourceChain?.blockExplorer}/tx/${message.sourceTxHash}`, "_blank")
                              }
                              className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        )}
                        {message.destinationTxHash && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `${destinationChain?.blockExplorer}/tx/${message.destinationTxHash}`,
                                  "_blank",
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}