"use client"

import { useState } from "react"
import { useWeb3 } from "@/lib/web3/context"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Search, Brain, AlertTriangle, ArrowRight, Loader2, Users } from "lucide-react"
import { buildTradeOrderTypedData, buildCopyTradingTypedData, detectCrossChain } from "@/lib/web3/contracts"
import { SignatureModal } from "@/components/web3/signature-modal"
import type { EIP712TypedData, ChainType, Token, TopTrader } from "@/lib/web3/types"

// Mock market data
const MARKET_TOKENS: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x1",
    chain: "ethereum",
    decimals: 18,
    price: 3245.67,
    change24h: 2.34,
    balance: 0,
    value: 0,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    address: "0x2",
    chain: "ethereum",
    decimals: 8,
    price: 67234.12,
    change24h: -1.23,
    balance: 0,
    value: 0,
  },
  {
    symbol: "SOL",
    name: "Solana",
    address: "0x3",
    chain: "solana",
    decimals: 9,
    price: 145.23,
    change24h: 5.67,
    balance: 0,
    value: 0,
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    address: "0x4",
    chain: "arbitrum",
    decimals: 18,
    price: 1.24,
    change24h: -0.56,
    balance: 0,
    value: 0,
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    address: "0x5",
    chain: "polygon",
    decimals: 18,
    price: 0.89,
    change24h: 3.12,
    balance: 0,
    value: 0,
  },
  {
    symbol: "OP",
    name: "Optimism",
    address: "0x6",
    chain: "optimism",
    decimals: 18,
    price: 2.45,
    change24h: 1.89,
    balance: 0,
    value: 0,
  },
]

const TOP_TRADERS: TopTrader[] = [
  {
    address: "0x1234...5678",
    name: "CryptoWhale.eth",
    avatar: "",
    pnl: 156780,
    pnlPercent: 234.5,
    winRate: 78,
    followers: 12453,
    strategy: "Momentum",
    riskScore: 35,
    trades: 1245,
  },
  {
    address: "0x2345...6789",
    name: "DeFiKing",
    avatar: "",
    pnl: 89450,
    pnlPercent: 167.8,
    winRate: 72,
    followers: 8923,
    strategy: "Value",
    riskScore: 28,
    trades: 892,
  },
  {
    address: "0x3456...7890",
    name: "AlphaHunter",
    avatar: "",
    pnl: 67230,
    pnlPercent: 145.2,
    winRate: 65,
    followers: 6234,
    strategy: "Scalping",
    riskScore: 62,
    trades: 3421,
  },
]

export function AppTrading() {
  const { wallet, isConnected, setShowWalletModal } = useWeb3()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const [targetChain, setTargetChain] = useState<ChainType>("ethereum")
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [aiRecommendation, setAIRecommendation] = useState<string | null>(null)

  // Signature modal state
  const [showSignature, setShowSignature] = useState(false)
  const [signatureData, setSignatureData] = useState<EIP712TypedData | null>(null)
  const [intentSummary, setIntentSummary] = useState("")
  const [orderSourceChain, setOrderSourceChain] = useState<ChainType | undefined>()
  const [orderTargetChain, setOrderTargetChain] = useState<ChainType | undefined>()

  const filteredTokens = MARKET_TOKENS.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAIAnalysis = async () => {
    if (!selectedToken) return
    setIsAIAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setAIRecommendation(
      `Based on technical analysis, ${selectedToken.symbol} shows strong support at $${(selectedToken.price * 0.95).toFixed(2)}. RSI indicates oversold conditions. Recommended action: ${selectedToken.change24h > 0 ? "HOLD or BUY on dips" : "Accumulate gradually"}.`,
    )
    setIsAIAnalyzing(false)
  }

  const handleTrade = () => {
    if (!selectedToken || !amount || !wallet) return

    const sourceChain = wallet.chain
    const crossChainInfo = detectCrossChain(sourceChain, targetChain)

    const orderData = {
      type: tradeType,
      token: selectedToken,
      amount: Number.parseFloat(amount),
      price: selectedToken.price,
      total: Number.parseFloat(amount) * selectedToken.price,
      chain: targetChain,
      isCrossChain: crossChainInfo.isCrossChain,
      sourceChain: sourceChain,
      targetChain: targetChain,
    }

    const typedData = buildTradeOrderTypedData(orderData, wallet.address, wallet.chainId)

    setSignatureData(typedData)
    setOrderSourceChain(sourceChain)
    setOrderTargetChain(targetChain)
    setIntentSummary(
      `You are authorizing a ${tradeType.toUpperCase()} order for ${amount} ${selectedToken.symbol} at $${selectedToken.price.toFixed(2)} per token. Total: $${(Number.parseFloat(amount) * selectedToken.price).toLocaleString()}.${crossChainInfo.isCrossChain ? ` This is a cross-chain transaction from ${sourceChain} to ${targetChain}.` : ""}`,
    )
    setShowSignature(true)
  }

  const handleCopyTrader = (trader: TopTrader) => {
    if (!wallet) return

    const typedData = buildCopyTradingTypedData(trader.address, wallet.address, 10000, wallet.chainId)

    setSignatureData(typedData)
    setOrderSourceChain(undefined)
    setOrderTargetChain(undefined)
    setIntentSummary(
      `You are authorizing copy-trading from ${trader.name}. This will mirror their trades with a maximum allocation of $10,000. You can cancel at any time.`,
    )
    setShowSignature(true)
  }

  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Connect your wallet to start trading</p>
          <Button onClick={() => setShowWalletModal(true)} className="bg-primary text-primary-foreground rounded-full">
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-2xl md:text-3xl font-semibold">Trading</h1>
        <p className="text-muted-foreground mt-1">AI-powered trading with gasless transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Token List */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-foreground font-semibold">Market</h2>
            </div>
            <div className="divide-y divide-border">
              {filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${
                    selectedToken?.symbol === token.symbol ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-foreground font-medium">{token.symbol}</p>
                      <p className="text-muted-foreground text-sm capitalize">{token.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-medium">${token.price.toLocaleString()}</p>
                    <p
                      className={`text-sm flex items-center justify-end gap-1 ${
                        token.change24h >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Trading Section */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-foreground font-semibold">Copy Trading</h2>
            </div>
            <div className="divide-y divide-border">
              {TOP_TRADERS.map((trader) => (
                <div key={trader.address} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{trader.name.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{trader.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary">+{trader.pnlPercent}%</span>
                        <span className="text-muted-foreground">Win: {trader.winRate}%</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            trader.riskScore <= 40
                              ? "bg-primary/10 text-primary"
                              : trader.riskScore <= 60
                                ? "bg-yellow-400/10 text-yellow-400"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          Risk: {trader.riskScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopyTrader(trader)}
                    variant="outline"
                    size="sm"
                    className="border-primary/20 text-primary hover:bg-primary/10 rounded-full"
                  >
                    Mirror
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Panel */}
        <div className="space-y-4">
          {selectedToken ? (
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">{selectedToken.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="text-foreground text-lg font-semibold">{selectedToken.symbol}</p>
                    <p className="text-muted-foreground text-sm">{selectedToken.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground text-lg font-semibold">${selectedToken.price.toLocaleString()}</p>
                  <p className={`text-sm ${selectedToken.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
                    {selectedToken.change24h >= 0 ? "+" : ""}
                    {selectedToken.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-foreground text-sm font-medium">AI Analysis</span>
                  </div>
                  <Button
                    onClick={handleAIAnalysis}
                    size="sm"
                    variant="ghost"
                    disabled={isAIAnalyzing}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    {isAIAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Analyze"}
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  {aiRecommendation || "Click Analyze for AI-powered trading insights"}
                </p>
              </div>

              {/* Trade Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTradeType("buy")}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                    tradeType === "buy"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType("sell")}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                    tradeType === "sell"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-muted-foreground text-sm mb-1.5 block">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Target Chain */}
              <div>
                <label className="text-muted-foreground text-sm mb-1.5 block">Target Chain</label>
                <select
                  value={targetChain}
                  onChange={(e) => setTargetChain(e.target.value as ChainType)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="bsc">BSC</option>
                  <option value="solana">Solana</option>
                </select>
              </div>

              {/* Cross-chain Warning */}
              {wallet && wallet.chain !== targetChain && (
                <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Cross-Chain Transaction</p>
                    <p className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                      <span className="capitalize">{wallet.chain}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="capitalize">{targetChain}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Total */}
              {amount && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-foreground font-medium">
                      ${(Number.parseFloat(amount) * selectedToken.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Trade Button */}
              <Button
                onClick={handleTrade}
                disabled={!amount || Number.parseFloat(amount) <= 0}
                className={`w-full py-3 rounded-xl font-medium ${
                  tradeType === "buy"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                }`}
              >
                {tradeType === "buy" ? "Buy" : "Sell"} {selectedToken.symbol}
              </Button>

              {/* Gasless Badge */}
              <p className="text-center text-muted-foreground text-xs">Gasless transaction via relayer</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
              <p className="text-muted-foreground">Select a token to trade</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignature}
        onClose={() => setShowSignature(false)}
        typedData={signatureData}
        userAddress={wallet?.address || ""}
        chain={wallet?.chain || "ethereum"}
        sourceChain={orderSourceChain}
        targetChain={orderTargetChain}
        intentSummary={intentSummary}
        onSuccess={(txHash) => {
          console.log("[v0] Transaction submitted:", txHash)
          setAmount("")
          setSelectedToken(null)
          setAIRecommendation(null)
        }}
      />
    </div>
  )
}
