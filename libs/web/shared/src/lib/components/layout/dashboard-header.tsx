import React, { useMemo } from 'react';
import { Skeleton } from "@nlc-ai/web-ui";
import { NLCClient } from "@nlc-ai/sdk-main";
import {ProfileDropdown} from "./profile-dropdown";

interface DashboardHeaderProps {
  title: string;
  user: any;
  isLoading: boolean;
  goToNotifications: () => void;
  handleNavRouter: (path: string) => void;
  sdkClient: NLCClient;
  onLogout: () => void;
}

const UserDisplaySection = ({ user, isLoading }: { user: any; isLoading: boolean }) => {
  const userFullName = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName} ${user.lastName}`;
  }, [user?.firstName, user?.lastName]);

  if (isLoading) {
    return (
      <div className="hidden sm:block">
        <Skeleton className="h-2 w-28 mb-1.5" />
        <Skeleton className="h-2 w-36 mb-1.5" />
      </div>
    );
  }

  return (
    <div className="text-right hidden sm:block">
      <p className="text-white text-sm font-medium">{userFullName}</p>
      <p className="text-[#A0A0A0] text-xs">{user?.email}</p>
    </div>
  );
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  user,
  isLoading,
  handleNavRouter,
  onLogout,
}) => {
  const userInitials = useMemo(() => {
    if (user?.avatarUrl) {
      return (
        <img
          src={user?.avatarUrl}
          alt={'Avatar'}
          className={"w-full h-full rounded-full object-cover"}
        />
      )
    }
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName[0]}${user.lastName[0]}`;
  }, [user?.firstName, user?.lastName, user?.avatarUrl]);

  return (
    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <h1 className="text-white text-xl sm:text-2xl font-semibold">{title}</h1>
      </div>

      <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
        <div className="flex items-center gap-3">
          <UserDisplaySection user={user} isLoading={isLoading} />
          <ProfileDropdown
            user={user}
            userInitials={userInitials}
            handleRouterNav={handleNavRouter}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
};
