// Web3 Types for Multi-Chain Trading Platform

export type WalletType = "metamask" | "walletconnect" | "phantom" | "coinbase" | "flow" | "petra" | "solflare"

export type ChainType = "ethereum" | "polygon" | "arbitrum" | "optimism" | "bsc" | "solana" | "flow" | "aptos"

export interface WalletInfo {
  type: WalletType
  name: string
  icon: string
  chains: ChainType[]
  installed?: boolean
}

export interface ConnectedWallet {
  type: WalletType
  address: string
  chain: ChainType
  balance: string
  chainId: number
}

export interface Token {
  symbol: string
  name: string
  address: string
  chain: ChainType
  decimals: number
  price: number
  change24h: number
  balance: number
  value: number
  logoUrl?: string
}

export interface TradeOrder {
  id: string
  type: "buy" | "sell"
  token: Token
  amount: number
  price: number
  total: number
  status: "pending" | "confirmed" | "failed" | "cancelled"
  timestamp: number
  txHash?: string
  chain: ChainType
  isCrossChain: boolean
  sourceChain?: ChainType
  targetChain?: ChainType
}

export interface EIP712TypedData {
  types: {
    EIP712Domain: { name: string; type: string }[]
    [key: string]: { name: string; type: string }[]
  }
  primaryType: string
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  }
  message: Record<string, unknown>
}

export interface RelayerTransaction {
  id: string
  userAddress: string
  targetContract: string
  data: string
  signature: string
  status: "pending" | "submitted" | "confirmed" | "failed"
  txHash?: string
  gasEstimate?: string
  timestamp: number
}

export interface TopTrader {
  address: string
  name: string
  avatar: string
  pnl: number
  pnlPercent: number
  winRate: number
  followers: number
  strategy: string
  riskScore: number
  trades: number
}

export interface ActivityLog {
  id: string
  type: "trade" | "liquidation" | "whale" | "alert" | "copy"
  message: string
  timestamp: number
  data?: Record<string, unknown>
}
