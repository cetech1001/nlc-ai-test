// libs/ui/src/components/charts/metric-card.tsx
import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "../../utils/cn"
import { Card, CardContent, CardHeader, CardTitle } from "../primitives/card"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
    period: string
  }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null

    switch (change.type) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    if (!change) return "text-gray-500"

    switch (change.type) {
      case "increase":
        return "text-green-600"
      case "decrease":
        return "text-red-600"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            {getTrendIcon()}
            <span className={cn("text-sm font-medium ml-1", getTrendColor())}>
              {change.value}%
            </span>
            <span className="text-sm text-gray-500 ml-1">
              from {change.period}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// libs/ui/src/components/charts/simple-chart.tsx


// libs/ui/src/index.ts
// Primitives


// Layouts


// Data Display


// Forms


// Feedback


// Charts


// Utils


// Styles


// Types


// libs/ui/project.json
