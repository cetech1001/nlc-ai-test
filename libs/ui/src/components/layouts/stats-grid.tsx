import { cn } from "../../utils/cn"
import { Card, CardContent } from "../primitives/card"
import { LucideIcon } from "lucide-react"

interface Stat {
  name: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease" | "neutral"
  icon?: LucideIcon
}

interface StatsGridProps {
  stats: Stat[]
  className?: string
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {stat.icon && (
                  <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            {stat.change && (
              <div className="mt-4">
                <div className="flex items-center">
                  <div className={cn(
                    "text-sm font-medium",
                    stat.changeType === "increase" && "text-green-600",
                    stat.changeType === "decrease" && "text-red-600",
                    stat.changeType === "neutral" && "text-gray-500"
                  )}>
                    {stat.change}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
