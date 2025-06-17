import * as React from "react"
import { cn } from "../../utils/cn"
import { Button } from "../primitives/button"
import {
  LayoutDashboard,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut
} from "lucide-react"

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  active?: boolean
  badge?: string | number
}

interface User {
  name: string
  email: string
  avatar?: string
  role?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: User
  navItems: NavItem[]
  onNavigate?: (href: string) => void
  onLogout?: () => void
  className?: string
  sidebarCollapsed?: boolean
  onSidebarToggle?: () => void
}

export function DashboardLayout({
  children,
  user,
  navItems,
  onNavigate,
  onLogout,
  className,
  sidebarCollapsed = false,
  onSidebarToggle,
}: DashboardLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
        sidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 shadow-sm">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="ml-3 text-xl font-semibold text-gray-900">
                  Coach AI
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => onNavigate?.(item.href)}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors",
                    item.active
                      ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                    item.active ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="ml-3 inline-block py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-900">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* User menu */}
          {user && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img className="h-8 w-8 rounded-full" src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Mobile nav content - same as desktop but without collapse logic */}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Top bar */}
        <div className="flex-shrink-0">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden ml-2"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="hidden md:flex ml-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 px-4 flex justify-between items-center">
              <div className="flex-1 flex">
                <div className="w-full flex md:ml-0">
                  <div className="relative w-full max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Search..."
                      type="search"
                    />
                  </div>
                </div>
              </div>

              <div className="ml-4 flex items-center md:ml-6">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
