import * as React from "react";

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  active?: boolean
  badge?: string | number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

export interface Stat {
  name: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease" | "neutral"
  icon?: React.ComponentType<{ className?: string }>
}
