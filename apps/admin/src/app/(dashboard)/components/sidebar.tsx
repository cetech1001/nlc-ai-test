'use client'

import {useRouter} from "next/navigation";
import {useState} from "react";
import {Logo} from "@/app/(auth)/components/logo";
import {
  HomeIcon,
  UserIcon,
  PlansIcon,
  CalendarIcon,
  TransactionsIcon,
  SleepIcon,
  SpeakerIcon,
  SettingsIcon,
  LogoutIcon
} from "@nlc-ai/ui";

export const Sidebar = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Dashboard");

  const menuItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/home" },
    { icon: UserIcon, label: "Coaches", path: "/coaches" },
    { icon: PlansIcon, label: "Subscription Plans", path: "/subscription-plans" },
    { icon: TransactionsIcon, label: "Transactions", path: "/transactions" },
    { icon: SleepIcon, label: "Inactive Coaches", path: "/inactive-coaches" },
    { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
    { icon: SpeakerIcon, label: "Help", path: "/help" },
    // { icon: SettingsIcon, label: "Settings", path: "/settings" },
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
                <span className={"w-1/6"}>
                  <Icon />
                </span>
                <span></span>
                {item.label}
              </button>
            );
          })}

          <div className={"border-b border-[#1A1A1A]"}></div>

          <button
            key={'Settings'}
            onClick={() => handleNavigation({ icon: SettingsIcon, label: "Settings", path: "/settings" })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A]`}
          >
            <SettingsIcon />
            Settings
          </button>
        </nav>
      </div>

      <div className="p-4 border-t border-[#1A1A1A]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A0A0A0] hover:text-white hover:bg-[#1A1A1A] transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
};
