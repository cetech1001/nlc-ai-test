import React, { useState, useRef, useEffect } from 'react';
import { User, CreditCard, LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  user: any;
  userInitials: string | React.ReactNode;
  onLogout: () => void;
  handleRouterNav: (path: string) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  userInitials,
  onLogout,
  handleRouterNav
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    handleRouterNav(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group focus:outline-none"
      >
        <div className="w-8 h-8 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center group-hover:shadow-lg transition-shadow">
          <span className="text-white text-sm font-medium">
            {userInitials}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 py-2">
          <div className="px-4 py-3 border-b border-neutral-700">
            <div className="text-white text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-stone-400 text-xs truncate">
              {user?.email}
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleNavigation('/settings/account')}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-neutral-800 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium">Account</span>
            </button>

            <button
              onClick={() => handleNavigation('/settings/billing')}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-neutral-800 transition-colors flex items-center gap-3"
            >
              <CreditCard className="w-4 h-4 text-stone-400" />
              <span className="text-sm font-medium">Billing</span>
            </button>
          </div>

          <div className="border-t border-neutral-700 my-2"></div>

          <div className="py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
