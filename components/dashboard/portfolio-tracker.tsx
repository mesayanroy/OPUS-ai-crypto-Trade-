"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Token {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  leverage?: number
  liquidationPrice?: number
}

interface PortfolioData {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  tokens: Token[]
}

export function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    setIsLoading(true)
    const data = await getPortfolioData()
    setPortfolio(data)
    setIsLoading(false)
  }

  return (
    <div id="portfolio" className="rounded-2xl border border-white/20 overflow-hidden">
      {/* Glassmorphism background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "rgba(231, 236, 235, 0.04)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-foreground text-xl font-semibold">Portfolio Tracker</h2>
            <p className="text-muted-foreground text-sm">Real-time asset overview</p>
          </div>
          <Button
            onClick={fetchPortfolio}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Total Value */}
        {portfolio && (
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-muted-foreground text-sm mb-1">Total Portfolio Value</p>
            <div className="flex items-end gap-3">
              <span className="text-foreground text-3xl font-bold">${portfolio.totalValue.toLocaleString()}</span>
              <span
                className={`flex items-center gap-1 text-sm font-medium pb-1 ${
                  portfolio.totalPnL >= 0 ? "text-primary" : "text-red-400"
                }`}
              >
                {portfolio.totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {portfolio.totalPnL >= 0 ? "+" : ""}
                {portfolio.totalPnLPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Token List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            portfolio?.tokens.map((token) => (
              <div
                key={token.symbol}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {token.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{token.symbol}</p>
                    <p className="text-muted-foreground text-xs">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-medium">${token.value.toLocaleString()}</p>
                  <p className={`text-xs ${token.change24h >= 0 ? "text-primary" : "text-red-400"}`}>
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </p>
                </div>
                {token.leverage && token.liquidationPrice && (
                  <div className="ml-4 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      {token.leverage}x
                    </span>
                    {token.liquidationPrice > token.value * 0.8 && (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs">Liq. Risk</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Placeholder API function
async function getPortfolioData(): Promise<PortfolioData> {
  // Simulate API call to /api/portfolio
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    totalValue: 125847.32,
    totalPnL: 12584.73,
    totalPnLPercent: 11.12,
    tokens: [
      { symbol: "ETH", name: "Ethereum", balance: 15.5, value: 48250, change24h: 3.42 },
      { symbol: "BTC", name: "Bitcoin", balance: 0.85, value: 52700, change24h: 1.87 },
      {
        symbol: "SOL",
        name: "Solana",
        balance: 120,
        value: 14400,
        change24h: -2.15,
        leverage: 3,
        liquidationPrice: 95,
      },
      { symbol: "ARB", name: "Arbitrum", balance: 5000, value: 6500, change24h: 5.67 },
      {
        symbol: "LINK",
        name: "Chainlink",
        balance: 250,
        value: 3997.32,
        change24h: -0.83,
        leverage: 2,
        liquidationPrice: 14,
      },
    ],
  }
}
