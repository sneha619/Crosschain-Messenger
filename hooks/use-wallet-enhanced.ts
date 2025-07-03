"use client"

// Ensure this file is treated as a module
export {}

import { useState, useEffect, useCallback } from "react"
import { SUPPORTED_CHAINS } from "@/lib/chains"

type Chain = {
  id: number
  name: string
  color: string
  blockExplorer: string
  rpcUrl: string
}

export function useWalletEnhanced() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chain, setChain] = useState<Chain | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        }) as string[]

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await getCurrentChain()
        }
      }
    } catch (error) {
      console.error("Failed to check connection:", error)
    }
  }

  const getCurrentChain = async () => {
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        }) as string

        const currentChain = SUPPORTED_CHAINS.find((c) => c.id === Number.parseInt(chainId, 16))
        setChain(currentChain || SUPPORTED_CHAINS[0])
      }
    } catch (error) {
      console.error("Failed to get current chain:", error)
    }
  }

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[]

        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await getCurrentChain()

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts: unknown) => {
            const accountsArray = accounts as string[];
            if (accountsArray.length === 0) {
              disconnect()
            } else {
              setAddress(accountsArray[0])
            }
          })

          // Listen for chain changes
          window.ethereum.on("chainChanged", (...args: unknown[]) => {
            const chainId = args[0] as string;
            const newChain = SUPPORTED_CHAINS.find((c) => c.id === Number.parseInt(chainId, 16))
            setChain(newChain || SUPPORTED_CHAINS[0])
          })
        }
      } else {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setError(error instanceof Error ? error.message : "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setChain(null)
    setError(null)

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", () => {})
      window.ethereum.removeListener("chainChanged", () => {})
    }
  }, [])

  const switchChain = useCallback(async (chainId: number) => {
    const targetChain = SUPPORTED_CHAINS.find((c) => c.id === chainId)
    if (!targetChain) {
      throw new Error("Unsupported chain")
    }

    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
        setChain(targetChain)
      }
    } catch (error) {
      // Chain not added to MetaMask
      if (typeof error === "object" && error !== null && "code" in error) {
        const err = error as { code: number }

        if (err.code === 4902) {
          try {
            await window.ethereum?.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${chainId.toString(16)}`,
                  chainName: targetChain.name,
                  rpcUrls: [targetChain.rpcUrl],
                  blockExplorerUrls: [targetChain.blockExplorer],
                  nativeCurrency: targetChain.nativeCurrency,
                },
              ],
            })
            setChain(targetChain)
          } catch (addError) {
            console.error("Failed to add chain:", addError)
            throw new Error("Failed to add chain to MetaMask")
          }
        } else {
          console.error("Failed to switch chain:", error)
          throw new Error("Failed to switch chain")
        }
      }
    }
  }, [])

  const sendTransaction = useCallback(
    async (params: {
      to: string
      data: string
      value?: string
    }) => {
      if (!isConnected || !address) {
        throw new Error("Wallet not connected")
      }

      try {
        const txHash = await window.ethereum?.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: params.to,
              data: params.data,
              value: params.value || "0x0",
            },
          ],
        })

        return txHash
      } catch (error) {
        console.error("Transaction failed:", error)
        throw error
      }
    },
    [isConnected, address],
)

  return {
    isConnected,
    address,
    chain,
    isConnecting,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
  }
}
