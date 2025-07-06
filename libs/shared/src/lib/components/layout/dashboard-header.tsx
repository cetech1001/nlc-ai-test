import {useMemo} from "react";
import {Skeleton} from "@nlc-ai/ui";

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

interface IProps {
  title: string;
  user: any;
  isLoading: boolean;
}

export const DashboardHeader = (props: IProps) => {
  const { user } = props;
  const userInitials = useMemo(() => {
    if (!user?.firstName || !user?.lastName) return '';
    return `${user.firstName[0]}${user.lastName[0]}`;
  }, [user?.firstName, user?.lastName]);

  return (
    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <h1 className="text-white text-xl sm:text-2xl font-semibold">{props.title}</h1>
      </div>

      <div className="flex flex-1 justify-end items-center gap-x-4 lg:gap-x-6">
        <div className="flex items-center gap-3">
          <UserDisplaySection user={user} isLoading={props.isLoading} />
          <div
            className="w-8 h-8 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-sm font-medium">
              {userInitials}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
