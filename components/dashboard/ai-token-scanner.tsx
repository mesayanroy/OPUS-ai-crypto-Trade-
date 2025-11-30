"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertTriangle, Droplets, ChevronRight } from "lucide-react"
import { TradeProposalModal } from "./trade-proposal-modal"

interface ScannedToken {
  symbol: string
  name: string
  score: number
  risk: "Low" | "Medium" | "High"
  liquidity: number
  reason: string
}

export function AITokenScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedTokens, setScannedTokens] = useState<ScannedToken[]>([])
  const [selectedToken, setSelectedToken] = useState<ScannedToken | null>(null)
  const [showProposal, setShowProposal] = useState(false)

  const handleScan = async () => {
    setIsScanning(true)
    const tokens = await scanMarket()
    setScannedTokens(tokens)
    setIsScanning(false)
  }

  const handleSuggestTrade = (token: ScannedToken) => {
    setSelectedToken(token)
    setShowProposal(true)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "text-primary bg-primary/20"
      case "Medium":
        return "text-yellow-400 bg-yellow-400/20"
      case "High":
        return "text-red-400 bg-red-400/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <>
      <div id="scanner" className="rounded-2xl border border-white/20 overflow-hidden relative">
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
              <h2 className="text-foreground text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Token Scanner
              </h2>
              <p className="text-muted-foreground text-sm">Discover high-potential opportunities</p>
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 font-medium text-sm"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Scanning...
                </span>
              ) : (
                "Scan Market"
              )}
            </Button>
          </div>

          {/* Scanned Tokens List */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {scannedTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Click &ldquo;Scan Market&rdquo; to discover tokens</p>
              </div>
            ) : (
              scannedTokens.map((token) => (
                <div
                  key={token.symbol}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{token.symbol}</p>
                        <p className="text-muted-foreground text-xs">{token.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(token.score)}`}>{token.score}</span>
                      <span className="text-muted-foreground text-xs">/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getRiskColor(token.risk)}`}>
                        {token.risk} Risk
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">${(token.liquidity / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-3">{token.reason}</p>

                  <Button
                    onClick={() => handleSuggestTrade(token)}
                    variant="ghost"
                    className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      AI Suggest Trade
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trade Proposal Modal */}
      <TradeProposalModal isOpen={showProposal} onClose={() => setShowProposal(false)} token={selectedToken} />
    </>
  )
}

// Placeholder API function
async function scanMarket(): Promise<ScannedToken[]> {
  // Simulate API call to /api/ai/scan
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return [
    {
      symbol: "ETH",
      name: "Ethereum",
      score: 87,
      risk: "Low",
      liquidity: 15000000000,
      reason: "Strong institutional inflows and upcoming protocol upgrades indicate bullish momentum.",
    },
    {
      symbol: "ARB",
      name: "Arbitrum",
      score: 78,
      risk: "Medium",
      liquidity: 850000000,
      reason: "Growing DeFi ecosystem and increasing TVL suggest continued adoption.",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      score: 72,
      risk: "Medium",
      liquidity: 1200000000,
      reason: "Enterprise partnerships and zkEVM development driving network growth.",
    },
    {
      symbol: "PEPE",
      name: "Pepe",
      score: 45,
      risk: "High",
      liquidity: 320000000,
      reason: "High volatility meme coin with speculative trading patterns.",
    },
  ]
}
