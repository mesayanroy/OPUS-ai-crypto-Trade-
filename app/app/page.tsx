"use client"

import { useState } from "react"
import { Web3Provider } from "@/lib/web3/context"
import { AppSidebar } from "@/components/app/sidebar"
import { AppDashboard } from "@/components/app/dashboard"
import { AppPortfolio } from "@/components/app/portfolio"
import { AppTrading } from "@/components/app/trading"
import { AppActivity } from "@/components/app/activity"
import { WalletConnectModal } from "@/components/web3/wallet-connect-modal"

type ActiveView = "dashboard" | "portfolio" | "trading" | "activity"

export default function TradingAppPage() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")

  return (
    <Web3Provider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar - Left side */}
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Main Content - Right side */}
        <main className="flex-1 overflow-auto">
          {activeView === "dashboard" && <AppDashboard />}
          {activeView === "portfolio" && <AppPortfolio />}
          {activeView === "trading" && <AppTrading />}
          {activeView === "activity" && <AppActivity />}
        </main>

        {/* Wallet Connect Modal */}
        <WalletConnectModal />
      </div>
    </Web3Provider>
  )
}
