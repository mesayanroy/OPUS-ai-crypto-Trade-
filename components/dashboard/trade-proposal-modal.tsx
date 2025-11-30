"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, TrendingDown, AlertTriangle, Shield, FileSignature } from "lucide-react"
import { EIP712SignatureModal } from "./eip712-signature-modal"

interface TradeProposal {
  action: "buy" | "sell"
  symbol: string
  amount: number
  price: number
  reasoning: string
  riskScore: number
  estimatedSlippage: number
  liquidationZone: { min: number; max: number }
}

interface TradeProposalModalProps {
  isOpen: boolean
  onClose: () => void
  token: { symbol: string; name: string; score: number } | null
}

export function TradeProposalModal({ isOpen, onClose, token }: TradeProposalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [proposal, setProposal] = useState<TradeProposal | null>(null)
  const [showSignature, setShowSignature] = useState(false)

  const fetchProposal = async () => {
    if (!token) return
    setIsLoading(true)
    const data = await getTradeProposal(token.symbol)
    setProposal(data)
    setIsLoading(false)
  }

  // Fetch proposal when modal opens
  useState(() => {
    if (isOpen && token) {
      fetchProposal()
    }
  })

  if (!isOpen) return null

  const handleGenerateSignature = () => {
    setShowSignature(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/20 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(15, 18, 17, 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-foreground text-xl font-semibold">AI Trade Proposal</h2>
                <p className="text-muted-foreground text-sm">
                  {token?.symbol} - {token?.name}
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isLoading || !proposal ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Recommendation */}
                <div
                  className={`p-4 rounded-xl mb-4 ${
                    proposal.action === "buy"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-red-400/10 border border-red-400/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {proposal.action === "buy" ? (
                      <TrendingUp className="w-6 h-6 text-primary" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p
                        className={`font-semibold text-lg ${
                          proposal.action === "buy" ? "text-primary" : "text-red-400"
                        }`}
                      >
                        {proposal.action === "buy" ? "BUY" : "SELL"} {proposal.symbol}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {proposal.amount} tokens @ ${proposal.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4">
                  <p className="text-muted-foreground text-sm mb-2">AI Reasoning</p>
                  <p className="text-foreground text-sm leading-relaxed">{proposal.reasoning}</p>
                </div>

                {/* Risk & Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">Risk Score</span>
                    </div>
                    <p
                      className={`text-lg font-semibold ${
                        proposal.riskScore <= 30
                          ? "text-primary"
                          : proposal.riskScore <= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {proposal.riskScore}/100
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">Slippage</span>
                    </div>
                    <p className="text-foreground text-lg font-semibold">{proposal.estimatedSlippage.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-muted-foreground text-xs mb-1">Liquidation Zone</p>
                    <p className="text-foreground text-lg font-semibold">
                      ${proposal.liquidationZone.min}-${proposal.liquidationZone.max}
                    </p>
                  </div>
                </div>

                {/* Generate Signature Button */}
                <Button
                  onClick={handleGenerateSignature}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-3 font-medium"
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  Generate Signature Request
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* EIP-712 Signature Modal */}
      <EIP712SignatureModal isOpen={showSignature} onClose={() => setShowSignature(false)} proposal={proposal} />
    </>
  )
}

// Placeholder API function
async function getTradeProposal(symbol: string): Promise<TradeProposal> {
  // Simulate API call to /api/ai/propose-trade
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    action: "buy",
    symbol,
    amount: 50,
    price: 3245.67,
    reasoning:
      "Technical analysis indicates a strong support level at $3,200 with increasing buy volume. On-chain metrics show accumulation by large holders. RSI suggests oversold conditions, presenting a favorable entry point.",
    riskScore: 35,
    estimatedSlippage: 0.15,
    liquidationZone: { min: 2800, max: 2950 },
  }
}
