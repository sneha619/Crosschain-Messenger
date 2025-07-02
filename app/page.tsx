"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Wallet,
  Send,
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  AlertTriangle,
  Network,
  Globe,
  ArrowRightLeft,
  MessageCircle,
  Layers,
  Activity,
} from "lucide-react"

import { MessageHistory } from "@/components/message-history"
import { StatusTracker } from "@/components/status-tracker"
import { EnhancedThemeToggle } from "@/components/enhanced-theme-toggle"
import { SimpleThemeToggle } from "@/components/simple-theme-toggle"
import { GasFeeEstimator } from "@/components/gas-fee-estimator"
import { EnhancedFormValidator } from "@/components/enhanced-form-validation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FloatingElements } from "@/components/floating-elements"
import { NetworkVisualization } from "@/components/network-visualisation"
import { useWalletEnhanced } from "@/hooks/use-wallet-enhanced"
import { useHyperlane } from "@/hooks/use-hyperlane"
import { useGasFees } from "@/hooks/use-gas-fees"
import { useToast } from "@/hooks/use-toast"
import { SUPPORTED_CHAINS } from "@/lib/chains"
import { validateAddress, sanitizeInput, validateMessage } from "@/lib/validation"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export default function CrossChainMessenger() {
  const {
    address,
    isConnected,
    chain,
    connect,
    disconnect,
    switchChain,
    isConnecting,
    error: walletError,
  } = useWalletEnhanced()
  const { toast } = useToast()

  const [message, setMessage] = useState("")
  const [sourceChain, setSourceChain] = useState("")
  const [destinationChain, setDestinationChain] = useState("")
  const [recipient, setRecipient] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})

  const { sendMessage, isLoading, error, currentTransaction, messageHistory, refreshHistory } = useHyperlane()
  const { gasEstimate: rawGasEstimate, isEstimating, estimateGas } = useGasFees()
  const gasEstimate = rawGasEstimate || null

  const validateField = async (field: string, value: string) => {
    setIsValidating((prev) => ({ ...prev, [field]: true }))
    await new Promise((resolve) => setTimeout(resolve, 500))

    let error = ""
    switch (field) {
      case "message":
        const messageValidation = validateMessage(value)
        if (!messageValidation.isValid) {
          error = messageValidation.error || "Invalid message"
        }
        break
      case "recipient":
        if (!value.trim()) {
          error = "Recipient address is required"
        } else if (!validateAddress(value)) {
          error = "Invalid Ethereum address format"
        }
        break
      case "sourceChain":
        if (!value) error = "Source chain is required"
        break
      case "destinationChain":
        if (!value) {
          error = "Destination chain is required"
        } else if (value === sourceChain) {
          error = "Destination chain must be different from source chain"
        }
        break
    }

    setValidationErrors((prev) => ({ ...prev, [field]: error }))
    setIsValidating((prev) => ({ ...prev, [field]: false }))
    return !error
  }

  const handleInputChange = async (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value)

    switch (field) {
      case "message":
        setMessage(sanitizedValue)
        break
      case "recipient":
        setRecipient(sanitizedValue)
        break
    }

    await validateField(field, sanitizedValue)

    if ((field === "recipient" || field === "message") && sourceChain && destinationChain) {
      estimateGas({
        sourceChain,
        destinationChain,
        message: field === "message" ? sanitizedValue : message,
        recipient: field === "recipient" ? sanitizedValue : recipient,
      })
    }
  }

  const handleChainChange = async (field: string, value: string) => {
    if (field === "sourceChain") {
      setSourceChain(value)
    } else {
      setDestinationChain(value)
    }

    await validateField(field, value)

    if (message && recipient) {
      estimateGas({
        sourceChain: field === "sourceChain" ? value : sourceChain,
        destinationChain: field === "destinationChain" ? value : destinationChain,
        message,
        recipient,
      })
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to send across chains",
        variant: "destructive",
      })
      return
    }

    if (!recipient.trim()) {
      toast({
        title: "No Recipient",
        description: "Please enter a recipient address for the message",
        variant: "destructive",
      })
      return
    }

    const messageValid = await validateField("message", message)
    const recipientValid = await validateField("recipient", recipient)
    const sourceChainValid = await validateField("sourceChain", sourceChain)
    const destinationChainValid = await validateField("destinationChain", destinationChain)

    if (!messageValid || !recipientValid || !sourceChainValid || !destinationChainValid) {
      toast({
        title: "Validation Error",
        description: "Please fix all form errors before submitting",
        variant: "destructive",
      })
      return
    }

    if (chain?.id !== Number.parseInt(sourceChain)) {
      try {
        await switchChain(Number.parseInt(sourceChain))
      } catch {
        toast({
          title: "Chain Switch Failed",
          description: "Failed to switch to the source chain",
          variant: "destructive",
        })
        return
      }
    }

    try {
      await sendMessage({
        message: sanitizeInput(message),
        sourceChainId: sourceChain,
        destinationChainId: destinationChain,
        recipient: sanitizeInput(recipient),
      })

      toast({
        title: "Message Sent!",
        description: "Your cross-chain message has been initiated successfully",
      })

      setMessage("")
      setRecipient("")
      setValidationErrors({})
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const isFormValid =
    message.trim() &&
    sourceChain &&
    destinationChain &&
    recipient.trim() &&
    sourceChain !== destinationChain &&
    Object.values(validationErrors).every((error) => !error)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-1000" />

      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Network Visualization */}
      <NetworkVisualization />

      {/* Main Content */}
      <motion.div
        className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            {/* Navigation Bar */}
            <div className="flex items-center justify-between mb-8">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Network className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">CrossChain</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Messenger</p>
                </div>
              </motion.div>

              <div className="flex items-center gap-3">
                <SimpleThemeToggle />
                <Separator orientation="vertical" className="h-6" />
                <EnhancedThemeToggle />
              </div>
            </div>

            {/* Hero Section */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-full" />
              <div className="relative">
                <motion.div
                  className="flex items-center justify-center gap-4 mb-6"
                  variants={floatingVariants}
                  animate="animate"
                >
                  <Globe className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  <ArrowRightLeft className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                  <Globe className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                </motion.div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Cross-Chain
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">Messaging</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Send messages seamlessly across different blockchains with enterprise-grade security and real-time
                  tracking
                </p>
              </div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div className="flex flex-wrap justify-center gap-3" variants={itemVariants}>
              {[
                { icon: Zap, label: "Instant Gas Estimation", color: "from-yellow-400 to-orange-500" },
                { icon: Shield, label: "Military-Grade Security", color: "from-green-400 to-emerald-500" },
                { icon: Activity, label: "Real-time Tracking", color: "from-blue-400 to-cyan-500" },
                { icon: Layers, label: "Multi-Chain Support", color: "from-purple-400 to-pink-500" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="group relative"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-lg"
                    style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  />
                  <Badge
                    variant="secondary"
                    className="relative flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="font-medium">{feature.label}</span>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Wallet Connection Card */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <motion.div
                    className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"
                    animate={{ rotate: isConnecting ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isConnecting ? Number.POSITIVE_INFINITY : 0 }}
                  >
                    <Wallet className="w-5 h-5 text-white" />
                  </motion.div>
                  Wallet Connection
                  {isConnected && (
                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                      Connected
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {walletError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                    <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{walletError}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {!isConnected ? (
                    <motion.div
                      key="disconnected"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={connect}
                          disabled={isConnecting}
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isConnecting ? (
                            <>
                              <LoadingSpinner className="mr-3" />
                              Connecting Wallet...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-3 w-5 h-5" />
                              Connect Wallet
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connected"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Connected to {chain?.name}</p>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          onClick={disconnect}
                          className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                        >
                          Disconnect
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Message Form - Takes 2 columns on xl screens */}
            <motion.div variants={itemVariants} className="xl:col-span-2">
              <Card className="relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    Compose Message
                  </CardTitle>
                  <CardDescription className="text-base">
                    Send secure messages across blockchain networks
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-6">
                  {/* Chain Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EnhancedFormValidator error={validationErrors.sourceChain} isValidating={isValidating.sourceChain}>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Source Chain</Label>
                      <Select value={sourceChain} onValueChange={(value) => handleChainChange("sourceChain", value)}>
                        <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
                          <SelectValue placeholder="Select source blockchain" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                          {SUPPORTED_CHAINS.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              <motion.div
                                className="flex items-center gap-3"
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className={`w-4 h-4 rounded-full ${chain.color} shadow-lg`} />
                                <span className="font-medium">{chain.name}</span>
                              </motion.div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EnhancedFormValidator>

                    <EnhancedFormValidator
                      error={validationErrors.destinationChain}
                      isValidating={isValidating.destinationChain}
                    >
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Destination Chain
                      </Label>
                      <Select
                        value={destinationChain}
                        onValueChange={(value) => handleChainChange("destinationChain", value)}
                      >
                        <SelectTrigger className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
                          <SelectValue placeholder="Select destination blockchain" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                          {SUPPORTED_CHAINS.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id.toString()}>
                              <motion.div
                                className="flex items-center gap-3"
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <div className={`w-4 h-4 rounded-full ${chain.color} shadow-lg`} />
                                <span className="font-medium">{chain.name}</span>
                              </motion.div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </EnhancedFormValidator>
                  </div>

                  {/* Recipient Address */}
                  <EnhancedFormValidator error={validationErrors.recipient} isValidating={isValidating.recipient}>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recipient Address</Label>
                    <Input
                      placeholder="0x... Enter the recipient's wallet address"
                      value={recipient}
                      onChange={(e) => handleInputChange("recipient", e.target.value)}
                      className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
                    />
                  </EnhancedFormValidator>

                  {/* Message Input */}
                  <EnhancedFormValidator error={validationErrors.message} isValidating={isValidating.message}>
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Message Content</Label>
                    <Textarea
                      placeholder="Type your cross-chain message here..."
                      value={message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={5}
                      maxLength={1000}
                      className="resize-none bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-500 focus:border-pink-500 dark:focus:border-pink-400 transition-all duration-300"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Maximum 1000 characters</span>
                      <motion.span
                        className="font-medium"
                        animate={{
                          color: message.length > 900 ? "#ef4444" : message.length > 800 ? "#f59e0b" : "#6b7280",
                        }}
                      >
                        {message.length}/1000
                      </motion.span>
                    </div>
                  </EnhancedFormValidator>

                  {/* Gas Fee Estimator */}
                  <GasFeeEstimator
                    gasEstimate={gasEstimate}
                    isEstimating={isEstimating}
                    sourceChain={sourceChain}
                    destinationChain={destinationChain}
                  />

                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Send Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!isConnected || !isFormValid || isLoading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3" />
                          Send Cross-Chain Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Tracker - Takes 1 column on xl screens */}
            <motion.div variants={itemVariants} className="xl:col-span-1">
              <StatusTracker transaction={currentTransaction} />
            </motion.div>
          </div>

          {/* Message History */}
          <motion.div variants={itemVariants}>
            <MessageHistory messages={messageHistory} onRefresh={refreshHistory} isLoading={isLoading} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
