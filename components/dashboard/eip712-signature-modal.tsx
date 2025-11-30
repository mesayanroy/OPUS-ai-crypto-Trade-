"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, XCircle, FileText } from "lucide-react"

interface EIP712SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  proposal: {
    action: "buy" | "sell"
    symbol: string
    amount: number
    price: number
  } | null
}

export function EIP712SignatureModal({ isOpen, onClose, proposal }: EIP712SignatureModalProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")

  if (!isOpen || !proposal) return null

  const typedData = buildEIP712TypedData(proposal)

  const handleApprove = async () => {
    // Placeholder: In production, call window.ethereum.request for eth_signTypedData_v4
    setStatus("approved")
    setTimeout(() => {
      setStatus("pending")
      onClose()
    }, 2000)
  }

  const handleReject = () => {
    setStatus("rejected")
    setTimeout(() => {
      setStatus("pending")
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(15, 18, 17, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />

        <div className="relative p-6">
          {status === "approved" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="w-16 h-16 text-primary mb-4" />
              <p className="text-foreground text-xl font-semibold">Signature Approved</p>
              <p className="text-muted-foreground text-sm">Transaction submitted successfully</p>
            </div>
          ) : status === "rejected" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="w-16 h-16 text-red-400 mb-4" />
              <p className="text-foreground text-xl font-semibold">Signature Rejected</p>
              <p className="text-muted-foreground text-sm">Transaction cancelled</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-semibold">Signature Request</h2>
                    <p className="text-muted-foreground text-xs">EIP-712 Typed Data</p>
                  </div>
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

              {/* Human-readable summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Intent Summary</p>
                <p className="text-foreground leading-relaxed">
                  You are authorizing a{" "}
                  <span className="text-primary font-semibold">{proposal.action.toUpperCase()}</span> order for{" "}
                  <span className="text-primary font-semibold">
                    {proposal.amount} {proposal.symbol}
                  </span>{" "}
                  at <span className="text-primary font-semibold">${proposal.price.toFixed(2)}</span> per token.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Total: ${(proposal.amount * proposal.price).toLocaleString()}
                </p>
              </div>

              {/* Typed Data Preview */}
              <div className="mb-6">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Typed Data</p>
                <div className="p-3 rounded-xl bg-muted/30 border border-white/10 max-h-[150px] overflow-y-auto">
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                    {JSON.stringify(typedData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 rounded-full border-white/20 text-foreground hover:bg-white/10 bg-transparent"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Placeholder EIP-712 Typed Data Builder
function buildEIP712TypedData(proposal: { action: string; symbol: string; amount: number; price: number }) {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      TradeOrder: [
        { name: "action", type: "string" },
        { name: "token", type: "string" },
        { name: "amount", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "TradeOrder",
    domain: {
      name: "AI Trading Bot",
      version: "1",
      chainId: 1,
      verifyingContract: "0x0000000000000000000000000000000000000000",
    },
    message: {
      action: proposal.action,
      token: proposal.symbol,
      amount: proposal.amount,
      price: Math.floor(proposal.price * 100),
      nonce: Date.now(),
      deadline: Math.floor(Date.now() / 1000) + 3600,
    },
  }
}
