"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2, ExternalLink, ChevronRight } from "lucide-react"
import { useWeb3 } from "@/lib/web3/context"
import type { WalletType, WalletInfo } from "@/lib/web3/types"

const WALLETS: WalletInfo[] = [
  {
    type: "metamask",
    name: "MetaMask",
    icon: "/metamask-fox-logo-orange.jpg",
    chains: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
  },
  {
    type: "walletconnect",
    name: "WalletConnect",
    icon: "/walletconnect-blue-logo.png",
    chains: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
  },
  {
    type: "coinbase",
    name: "Coinbase Wallet",
    icon: "/coinbase-blue-circle-logo.jpg",
    chains: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
  },
  {
    type: "phantom",
    name: "Phantom",
    icon: "/phantom-purple-ghost-logo.jpg",
    chains: ["solana", "ethereum", "polygon"],
  },
  {
    type: "solflare",
    name: "Solflare",
    icon: "/solflare-orange-sun-logo.png",
    chains: ["solana"],
  },
  {
    type: "flow",
    name: "Flow Wallet",
    icon: "/flow-green-logo-blockchain.jpg",
    chains: ["flow"],
  },
  {
    type: "petra",
    name: "Petra (Aptos)",
    icon: "/petra-aptos-red-logo.jpg",
    chains: ["aptos"],
  },
]

export function WalletConnectModal() {
  const { showWalletModal, setShowWalletModal, connectWallet, isConnecting } = useWeb3()
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!showWalletModal) return null

  const handleConnect = async (type: WalletType) => {
    setSelectedWallet(type)
    setError(null)

    const success = await connectWallet(type)
    if (!success) {
      setError("Failed to connect. Please try again.")
    }
    setSelectedWallet(null)
  }

  const handleClose = () => {
    if (!isConnecting) {
      setShowWalletModal(false)
      setError(null)
      setSelectedWallet(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border overflow-hidden">
        <div className="absolute inset-0 bg-card/95 backdrop-blur-xl" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-foreground text-xl font-semibold">Connect Wallet</h2>
              <p className="text-muted-foreground text-sm mt-1">Select a wallet to connect to the trading platform</p>
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              disabled={isConnecting}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Wallet List */}
          <div className="space-y-2">
            {WALLETS.map((wallet) => {
              const isLoading = isConnecting && selectedWallet === wallet.type

              return (
                <button
                  key={wallet.type}
                  onClick={() => handleConnect(wallet.type)}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center overflow-hidden">
                    <img src={wallet.icon || "/placeholder.svg"} alt={wallet.name} className="w-8 h-8 object-contain" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-foreground font-medium">{wallet.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {wallet.chains
                        .slice(0, 3)
                        .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
                        .join(", ")}
                      {wallet.chains.length > 3 && ` +${wallet.chains.length - 3}`}
                    </p>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-muted-foreground text-xs text-center">
              By connecting, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* New to Web3 */}
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-foreground text-sm font-medium mb-1">New to Web3?</p>
            <p className="text-muted-foreground text-xs mb-2">Learn how to set up a wallet and start trading</p>
            <a
              href="https://ethereum.org/wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
            >
              Learn more <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
