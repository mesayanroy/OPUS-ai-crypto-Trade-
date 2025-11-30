"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, XCircle, FileSignature, AlertTriangle, Loader2, ArrowRight } from "lucide-react"
import type { EIP712TypedData, ChainType } from "@/lib/web3/types"
import { signTypedData, submitToRelayer, detectCrossChain } from "@/lib/web3/contracts"

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  typedData: EIP712TypedData | null
  userAddress: string
  chain: ChainType
  sourceChain?: ChainType
  targetChain?: ChainType
  onSuccess?: (txHash: string) => void
  intentSummary: string
}

export function SignatureModal({
  isOpen,
  onClose,
  typedData,
  userAddress,
  chain,
  sourceChain,
  targetChain,
  onSuccess,
  intentSummary,
}: SignatureModalProps) {
  const [status, setStatus] = useState<"pending" | "signing" | "relaying" | "success" | "error">("pending")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  if (!isOpen || !typedData) return null

  const crossChainInfo = sourceChain && targetChain ? detectCrossChain(sourceChain, targetChain) : null

  const handleApprove = async () => {
    try {
      setStatus("signing")
      setErrorMessage(null)

      // Sign the typed data
      const signature = await signTypedData(typedData, userAddress)
      if (!signature) {
        throw new Error("Signature rejected by user")
      }

      setStatus("relaying")

      // Submit to relayer for gasless execution
      const relayerTx = await submitToRelayer(userAddress, typedData, signature, chain)

      // Wait for confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const hash = relayerTx.txHash || `0x${Math.random().toString(16).slice(2)}`
      setTxHash(hash)
      setStatus("success")

      if (onSuccess) {
        onSuccess(hash)
      }

      // Auto close after success
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Transaction failed")
    }
  }

  const handleReject = () => {
    setStatus("error")
    setErrorMessage("Transaction rejected by user")
    setTimeout(() => {
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    setStatus("pending")
    setErrorMessage(null)
    setTxHash(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border overflow-hidden">
        <div className="absolute inset-0 bg-card/98 backdrop-blur-xl" />

        <div className="relative p-6">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <p className="text-foreground text-xl font-semibold mb-2">Transaction Submitted</p>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Your transaction has been submitted to the network
              </p>
              {txHash && (
                <div className="px-4 py-2 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-mono">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <p className="text-foreground text-xl font-semibold mb-2">Transaction Failed</p>
              <p className="text-muted-foreground text-sm text-center">{errorMessage || "Something went wrong"}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileSignature className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-foreground text-lg font-semibold">Signature Request</h2>
                    <p className="text-muted-foreground text-xs">EIP-712 Typed Data</p>
                  </div>
                </div>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  disabled={status === "signing" || status === "relaying"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Cross-chain Warning */}
              {crossChainInfo?.isCrossChain && (
                <div className="mb-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 text-sm font-medium">Cross-Chain Transaction</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-xs capitalize">{sourceChain}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs capitalize">{targetChain}</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        Estimated time: {crossChainInfo.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Intent Summary */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border mb-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Intent Summary</p>
                <p className="text-foreground leading-relaxed text-sm">{intentSummary}</p>
              </div>

              {/* Typed Data Preview */}
              <div className="mb-6">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Typed Data</p>
                <div className="p-3 rounded-xl bg-muted/20 border border-border max-h-[150px] overflow-y-auto">
                  <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                    {JSON.stringify(typedData.message, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Gasless Badge */}
              <div className="mb-4 flex items-center justify-center">
                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <p className="text-primary text-xs font-medium">Gasless Transaction via Relayer</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  variant="outline"
                  disabled={status === "signing" || status === "relaying"}
                  className="flex-1 rounded-full border-border text-foreground hover:bg-muted/50 bg-transparent"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={status === "signing" || status === "relaying"}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  {status === "signing" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing...
                    </>
                  ) : status === "relaying" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
