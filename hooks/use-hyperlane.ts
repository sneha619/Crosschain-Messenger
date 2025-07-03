"use client"

// Ensure this file is treated as a module
export {}

import { useState, useEffect, useCallback } from "react"
import type { CrossChainTransaction, SendMessageParams } from "@/types"
import { toast } from "@/hooks/use-toast"

export function useHyperlane() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTransaction, setCurrentTransaction] = useState<CrossChainTransaction | null>(null)
  const [messageHistory, setMessageHistory] = useState<CrossChainTransaction[]>([])

  // Load message history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hyperlane_messages")
    if (stored) {
      try {
        setMessageHistory(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to load message history:", error)
      }
    }
  }, [])

  // Save message history to localStorage
  const saveMessageHistory = useCallback((messages: CrossChainTransaction[]) => {
    localStorage.setItem("hyperlane_messages", JSON.stringify(messages))
    setMessageHistory(messages)
  }, [])

  // Simulate cross-chain message delivery
  const simulateDelivery = useCallback(
    (transaction: CrossChainTransaction) => {
      // Simulate source transaction confirmation (2-5 seconds)
      setTimeout(
        () => {
          const confirmedTransaction = {
            ...transaction,
            sourceStatus: "confirmed" as const,
            sourceTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          }

          setCurrentTransaction(confirmedTransaction)

          // Get fresh history from localStorage to avoid stale state
          const stored = localStorage.getItem("hyperlane_messages")
          const currentHistory = stored ? JSON.parse(stored) : []
          const updatedHistory = currentHistory.map((msg: CrossChainTransaction) => (msg.id === transaction.id ? confirmedTransaction : msg))
          saveMessageHistory(updatedHistory)

          // Simulate destination transaction (8-15 seconds after source)
          setTimeout(
            () => {
              const deliveredTransaction = {
                ...confirmedTransaction,
                destinationStatus: "confirmed" as const,
                destinationTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
              }

              setCurrentTransaction(deliveredTransaction)

              // Get fresh history again for final update
              const storedFinal = localStorage.getItem("hyperlane_messages")
              const finalCurrentHistory = storedFinal ? JSON.parse(storedFinal) : []
              const finalHistory = finalCurrentHistory.map((msg: CrossChainTransaction) => (msg.id === transaction.id ? deliveredTransaction : msg))
              saveMessageHistory(finalHistory)
              
              // Show success notification when message is delivered
              toast({
                title: "Message Successfully Delivered",
                description: "Your cross-chain message has been successfully delivered to the destination chain",
                variant: "default",
              })
            },
            Math.random() * 7000 + 8000,
          ) // 8-15 seconds
        },
        Math.random() * 3000 + 2000,
      ) // 2-5 seconds
    },
    [saveMessageHistory],
  )

  const sendMessage = async (params: SendMessageParams) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate inputs
      if (!params.message || !params.recipient) {
        throw new Error("Message and recipient are required")
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(params.recipient)) {
        throw new Error("Invalid recipient address")
      }

      // Create transaction record
      const transaction: CrossChainTransaction = {
        id: Date.now().toString(),
        message: params.message,
        sourceChainId: params.sourceChainId,
        destinationChainId: params.destinationChainId,
        recipient: params.recipient,
        sourceStatus: "pending",
        destinationStatus: "pending",
        timestamp: Date.now(),
        sourceTxHash: null,
        destinationTxHash: null,
      }

      setCurrentTransaction(transaction)

      // Add to history immediately
      const updatedHistory = [transaction, ...messageHistory]
      saveMessageHistory(updatedHistory)

      // Start simulation
      simulateDelivery(transaction)
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshHistory = useCallback(() => {
    const stored = localStorage.getItem("hyperlane_messages")
    if (stored) {
      try {
        setMessageHistory(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to refresh message history:", error)
      }
    }
  }, [])

  return {
    sendMessage,
    isLoading,
    error,
    currentTransaction,
    messageHistory,
    refreshHistory,
  }
}
