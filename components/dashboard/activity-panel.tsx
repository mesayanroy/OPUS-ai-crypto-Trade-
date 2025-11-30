"use client"

import { useState, useEffect } from "react"
import { Bell, TrendingUp, AlertTriangle, Fish, Clock } from "lucide-react"

type AlertType = "trade" | "liquidation" | "whale" | "system"

interface Activity {
  id: string
  type: AlertType
  title: string
  description: string
  timestamp: Date
  severity?: "info" | "warning" | "danger"
}

export function ActivityPanel() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<AlertType | "all">("all")

  useEffect(() => {
    fetchActivities()
    // Simulate real-time updates
    const interval = setInterval(() => {
      addRandomActivity()
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchActivities = async () => {
    setIsLoading(true)
    const data = await getActivityLog()
    setActivities(data)
    setIsLoading(false)
  }

  const addRandomActivity = () => {
    const newActivity = generateRandomActivity()
    setActivities((prev) => [newActivity, ...prev.slice(0, 19)])
  }

  const getIcon = (type: AlertType) => {
    switch (type) {
      case "trade":
        return <TrendingUp className="w-4 h-4" />
      case "liquidation":
        return <AlertTriangle className="w-4 h-4" />
      case "whale":
        return <Fish className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getIconColor = (type: AlertType, severity?: string) => {
    if (severity === "danger") return "text-red-400 bg-red-400/20"
    if (severity === "warning") return "text-yellow-400 bg-yellow-400/20"
    switch (type) {
      case "trade":
        return "text-primary bg-primary/20"
      case "liquidation":
        return "text-red-400 bg-red-400/20"
      case "whale":
        return "text-blue-400 bg-blue-400/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const filteredActivities = filter === "all" ? activities : activities.filter((a) => a.type === filter)

  const filters: { label: string; value: AlertType | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Trades", value: "trade" },
    { label: "Liquidations", value: "liquidation" },
    { label: "Whales", value: "whale" },
  ]

  return (
    <div id="activity" className="rounded-2xl border border-white/20 overflow-hidden relative">
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-foreground text-xl font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Activity & Alerts
            </h2>
            <p className="text-muted-foreground text-sm">Real-time market events</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f.value
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No activities to display</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconColor(activity.type, activity.severity)}`}
                >
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-muted-foreground text-xs truncate">{activity.description}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatTime(activity.timestamp)}
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
async function getActivityLog(): Promise<Activity[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const now = new Date()
  return [
    {
      id: "1",
      type: "trade",
      title: "ETH Buy Order Executed",
      description: "Bought 2.5 ETH @ $3,245.67",
      timestamp: new Date(now.getTime() - 120000),
    },
    {
      id: "2",
      type: "whale",
      title: "Large BTC Transfer Detected",
      description: "500 BTC moved to exchange wallet",
      timestamp: new Date(now.getTime() - 300000),
      severity: "warning",
    },
    {
      id: "3",
      type: "liquidation",
      title: "Liquidation Warning",
      description: "SOL position approaching liquidation zone",
      timestamp: new Date(now.getTime() - 600000),
      severity: "danger",
    },
    {
      id: "4",
      type: "trade",
      title: "AI Trade Suggestion",
      description: "New opportunity detected for ARB",
      timestamp: new Date(now.getTime() - 900000),
    },
    {
      id: "5",
      type: "whale",
      title: "Whale Accumulation",
      description: "Top wallet added 10,000 LINK",
      timestamp: new Date(now.getTime() - 1800000),
    },
    {
      id: "6",
      type: "system",
      title: "Copy Trade Executed",
      description: "Mirrored CryptoWhale: Buy 0.1 ETH",
      timestamp: new Date(now.getTime() - 3600000),
    },
  ]
}

function generateRandomActivity(): Activity {
  const types: AlertType[] = ["trade", "liquidation", "whale", "system"]
  const type = types[Math.floor(Math.random() * types.length)]

  const templates = {
    trade: [
      { title: "Buy Order Executed", description: "Bought 1.2 ETH @ $3,250" },
      { title: "Sell Order Completed", description: "Sold 500 ARB @ $1.32" },
    ],
    liquidation: [
      {
        title: "Liquidation Alert",
        description: "Position nearing liquidation threshold",
        severity: "danger" as const,
      },
    ],
    whale: [{ title: "Whale Movement", description: "Large transfer detected on-chain", severity: "warning" as const }],
    system: [{ title: "System Update", description: "AI model updated with latest data" }],
  }

  const template = templates[type][Math.floor(Math.random() * templates[type].length)]

  return {
    id: Date.now().toString(),
    type,
    ...template,
    timestamp: new Date(),
  }
}
