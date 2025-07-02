export function validateAddress(address: string): boolean {
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return ethAddressRegex.test(address)
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters and trim
  return input
    .replace(/[<>'"&]/g, "") // Remove HTML/script injection characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/data:/gi, "") // Remove data: protocol
    .trim()
}

export function validateMessage(message: string): { isValid: boolean; error?: string } {
  if (!message.trim()) {
    return { isValid: false, error: "Message cannot be empty" }
  }

  if (message.length > 1000) {
    return { isValid: false, error: "Message must be less than 1000 characters" }
  }

  // Check for potentially malicious content
  const dangerousPatterns = [/<script/i, /javascript:/i, /data:text\/html/i, /vbscript:/i, /onload=/i, /onerror=/i]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(message)) {
      return { isValid: false, error: "Message contains potentially unsafe content" }
    }
  }

  return { isValid: true }
}

export function validateChainSelection(
  sourceChain: string,
  destinationChain: string,
): { isValid: boolean; error?: string } {
  if (!sourceChain || !destinationChain) {
    return { isValid: false, error: "Both source and destination chains must be selected" }
  }

  if (sourceChain === destinationChain) {
    return { isValid: false, error: "Source and destination chains must be different" }
  }

  return { isValid: true }
}
