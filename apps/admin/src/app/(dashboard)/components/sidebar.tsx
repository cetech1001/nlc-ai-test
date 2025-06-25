'use client'

import {useRouter} from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
} from "lucide-react";
import {useState} from "react";
import {Logo} from "@/app/(auth)/components/logo";

export const Sidebar = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/(dashboard)" },
    { icon: Users, label: "Coaches", path: "/coaches" },
    { icon: CreditCard, label: "Subscription Plans", path: "/subscription-plans" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  const handleLogout = () => {
    router.push("/");
  };

  const handleNavigation = (item: any) => {
    setActiveItem(item.label);
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <div className="w-64 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-white text-lg font-semibold">Dashboard</span>
        </div>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#7B21BA] text-white"
                    : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#1A1A1A]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
