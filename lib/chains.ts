export const SUPPORTED_CHAINS = [
  {
    id: 11155111, // Sepolia
    name: "Ethereum Sepolia",
    color: "bg-blue-500",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "SEP",
      decimals: 18,
    },
  },
  {
    id: 421614, // Arbitrum Sepolia
    name: "Arbitrum Sepolia",
    color: "bg-cyan-500",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: {
      name: "Arbitrum Sepolia Ether",
      symbol: "ASPE",
      decimals: 18,
    },
  },
  {
    id: 84532, // Base Sepolia
    name: "Base Sepolia",
    color: "bg-indigo-500",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Base Sepolia Ether",
      symbol: "BSE",
      decimals: 18,
    },
  },
  {
    id: 11155420, // Optimism Sepolia
    name: "Optimism Sepolia",
    color: "bg-red-500",
    rpcUrl: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    nativeCurrency: {
      name: "Optimism Sepolia Ether",
      symbol: "OSE",
      decimals: 18,
    },
  },
]
