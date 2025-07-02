"use client"

import { useState, useCallback } from "react"
import { SUPPORTED_CHAINS } from "@/lib/chains"

interface Chain {
  id: number
  name: string
  color: string
  blockExplorer: string
  rpcUrl: string
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chain, setChain] = useState<Chain | null>(null)

  const connect = useCallback(async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        if (Array.isArray(accounts) && accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)

          // Get current chain
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          })

          const currentChain = SUPPORTED_CHAINS.find((c) => c.id === Number.parseInt(chainId as string, 16))
          setChain(currentChain || SUPPORTED_CHAINS[0])
        }
      } else {
        // Fallback for demo purposes
        setAddress("0x1234567890123456789012345678901234567890")
        setIsConnected(true)
        setChain(SUPPORTED_CHAINS[0])
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setChain(null)
  }, [])

  const switchChain = useCallback(async (chainId: number) => {
    const targetChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
    if (!targetChain) return

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
      }
      setChain(targetChain)
    } catch (error) {
      console.error("Failed to switch chain:", error)
      // For demo purposes, just update the chain
      setChain(targetChain)
    }
  }, [])

  return {
    isConnected,
    address,
    chain,
    connect,
    disconnect,
    switchChain,
  }
}
