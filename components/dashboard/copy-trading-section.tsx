"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Copy, CheckCircle } from "lucide-react"

interface Trader {
  id: string
  name: string
  avatar: string
  strategy: string
  pnl: number
  pnlPercent: number
  riskScore: number
  followers: number
  winRate: number
}

export function CopyTradingSection() {
  const [traders, setTraders] = useState<Trader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mirroredTraders, setMirroredTraders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTopTraders()
  }, [])

  const fetchTopTraders = async () => {
    setIsLoading(true)
    const data = await getTopTraders()
    setTraders(data)
    setIsLoading(false)
  }

  const handleMirror = (traderId: string) => {
    setMirroredTraders((prev) => {
      const next = new Set(prev)
      if (next.has(traderId)) {
        next.delete(traderId)
      } else {
        next.add(traderId)
      }
      return next
    })
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-primary"
    if (score <= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div id="copy-trading" className="rounded-2xl border border-white/20 overflow-hidden relative">
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
              <Users className="w-5 h-5 text-primary" />
              Copy Trading
            </h2>
            <p className="text-muted-foreground text-sm">Mirror top trader strategies</p>
          </div>
        </div>

        {/* Traders List */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            traders.map((trader) => (
              <div
                key={trader.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-primary font-bold">
                      {trader.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{trader.name}</p>
                      <p className="text-muted-foreground text-xs">{trader.strategy}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleMirror(trader.id)}
                    size="sm"
                    className={`rounded-full px-4 transition-all ${
                      mirroredTraders.has(trader.id)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-white/10 text-foreground hover:bg-white/20"
                    }`}
                  >
                    {mirroredTraders.has(trader.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mirroring
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Mirror
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-muted-foreground text-xs mb-1">PnL</p>
                    <p className={`font-semibold text-sm ${trader.pnl >= 0 ? "text-primary" : "text-red-400"}`}>
                      {trader.pnl >= 0 ? "+" : ""}${trader.pnl.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-muted-foreground text-xs mb-1">Win Rate</p>
                    <p className="text-foreground font-semibold text-sm">{trader.winRate}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-muted-foreground text-xs mb-1">Risk</p>
                    <p className={`font-semibold text-sm ${getRiskColor(trader.riskScore)}`}>{trader.riskScore}/100</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-muted-foreground text-xs mb-1">Followers</p>
                    <p className="text-foreground font-semibold text-sm">{trader.followers}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Placeholder API function
async function getTopTraders(): Promise<Trader[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    {
      id: "1",
      name: "CryptoWhale",
      avatar: "",
      strategy: "DeFi Yield Farming",
      pnl: 125847,
      pnlPercent: 342,
      riskScore: 45,
      followers: 1247,
      winRate: 78,
    },
    {
      id: "2",
      name: "AlphaHunter",
      avatar: "",
      strategy: "NFT Flipping",
      pnl: 89432,
      pnlPercent: 215,
      riskScore: 62,
      followers: 892,
      winRate: 65,
    },
    {
      id: "3",
      name: "SafeHands",
      avatar: "",
      strategy: "Blue Chip HODLer",
      pnl: 45231,
      pnlPercent: 89,
      riskScore: 18,
      followers: 2341,
      winRate: 91,
    },
    {
      id: "4",
      name: "DegenerateApe",
      avatar: "",
      strategy: "Meme Coin Trading",
      pnl: -12450,
      pnlPercent: -34,
      riskScore: 85,
      followers: 456,
      winRate: 42,
    },
  ]
}
