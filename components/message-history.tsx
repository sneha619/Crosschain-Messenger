"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ExternalLink, ArrowRight, History } from "lucide-react"
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
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Message History
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No messages sent yet</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const sourceChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === message.sourceChainId)
              const destinationChain = SUPPORTED_CHAINS.find((c) => c.id.toString() === message.destinationChainId)

              return (
                <div key={message.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${sourceChain?.color}`} />
                        <span className="text-sm font-medium">{sourceChain?.name}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${destinationChain?.color}`} />
                        <span className="text-sm font-medium">{destinationChain?.name}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</div>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 p-2 rounded text-sm">{message.message}</div>

                  {/* Status and Links */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(message.sourceStatus)}>Source: {message.sourceStatus}</Badge>
                      <Badge className={getStatusColor(message.destinationStatus)}>
                        Dest: {message.destinationStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {message.sourceTxHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(`${sourceChain?.blockExplorer}/tx/${message.sourceTxHash}`, "_blank")
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {message.destinationTxHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(`${destinationChain?.blockExplorer}/tx/${message.destinationTxHash}`, "_blank")
                          }
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}