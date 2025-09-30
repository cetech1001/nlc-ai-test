import {Calendar, Clock, Instagram, Link, MapPin, X, Youtube} from "lucide-react";
import {formatDate, formatTimeAgo} from "@nlc-ai/sdk-core";
import {UserProfile} from "@nlc-ai/types";
import {FC} from "react";
import {ProfileHeaderSkeleton} from "@/lib";

interface IProps {
  isLoading: boolean;
  profile: UserProfile | null;
}

export const ProfileHeader: FC<IProps> = ({ isLoading, profile }) => {
  if (isLoading) {
    return <ProfileHeaderSkeleton/>
  }

  return (
    <div className="glass-card rounded-[30px] p-8 mb-10 relative overflow-hidden">
      <div className="absolute -left-7 -bottom-32 w-[267px] h-[267px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 opacity-40 blur-[112.55px] rounded-full" />

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
        {profile?.avatarUrl && (
          <img
            src={profile?.avatarUrl || ''}
            alt={profile?.firstName + ' ' + profile?.lastName}
            className="w-[124px] h-[124px] rounded-full border-4 border-purple-primary/20"
          />
        )}

        <div className="flex-1">
          <div className="mb-5">
            <p className="text-foreground/70 text-sm mb-1">@{profile?.email}</p>
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-foreground text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 mb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-foreground/40" />
                <span className="text-foreground">
                      Active: {profile?.lastLoginAt && formatTimeAgo(profile.lastLoginAt)}
                    </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-foreground/40" />
                <span className="text-foreground">
                      Joined {profile?.createdAt && formatDate(profile.createdAt)}
                    </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-foreground/40" />
                <span className="text-foreground">
                      {profile?.location}
                    </span>
              </div>
            </div>

            <p className="text-foreground leading-relaxed">
              {profile?.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">9.1k</div>
                <div className="text-foreground/70 text-sm">Followers</div>
                <div className="w-8 h-px bg-white/20 mt-3"></div>
              </div>
              <div className="text-center">
                <div className="text-foreground text-xl font-semibold">63</div>
                <div className="text-foreground/70 text-sm">Following</div>
                <div className="w-8 h-px bg-white/20 mt-3"></div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Link className="w-6 h-6 text-foreground/40" />
              <Youtube className="w-6 h-6 text-foreground/40" />
              <Instagram className="w-6 h-6 text-foreground/40" />
              <X className="w-6 h-6 text-foreground/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
