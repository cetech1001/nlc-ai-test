'use client'

import {Calendar, Clock, Instagram, Link, MapPin, X, Youtube} from "lucide-react";
import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import {useAuth} from "@nlc-ai/web-auth";
import {UserProfile, UserType} from "@nlc-ai/types";
import {sdkClient} from "@/lib";
import {formatDate, formatTimeAgo} from "@nlc-ai/sdk-core";

const ProfilePage = () => {
  const { user } = useAuth(UserType.COACH);

  const params = useParams();
  const userID = params.userID as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (userID) {
      fetchUserProfile();
    } else {
      setProfile(user);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const result = await sdkClient.users.profiles.lookupUserProfile(userID, UserType.COACH);
    setProfile(result);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1">
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
                  <br/>($1M+ Made, 1B+ Views, 2M+ Followers at 22 y/o)
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

        <div className="mb-10">
          <h2 className="text-foreground text-[30px] font-medium mb-5">Courses In Progress</h2>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-6 flex-1">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/44ca50efb93c94b257832c3c725a43726311e049?width=128"
                    alt="Course"
                    className="w-16 h-16 rounded-[13px] border border-white/10"
                  />
                  <div className="flex-1">
                    <h3 className="text-foreground text-xl font-semibold mb-1">AchieveGreatness.com (FREE)</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>4k members</span>
                      <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                      <span>Free</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">
                  View
                </button>
              </div>

              <p className="text-foreground mb-5 leading-relaxed">
                Turn your Personal Brand into a Client Generating machine, scale your business to $1M - $10M/year, and Achieve Greatness in your industry.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((lesson) => (
                  <div key={lesson} className="glass-card rounded-[30px] p-6 text-center">
                    <img
                      src={`https://api.builder.io/api/v1/image/assets/TEMP/d8c3f9bbe97f3132b2b777a5c797678eeaad5072?width=160`}
                      alt="Lesson"
                      className="w-16 h-[72px] mx-auto mb-2 mix-blend-screen"
                    />
                    <p className="text-white text-xs font-semibold leading-tight">
                      Check out the first module of lessons
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-6 flex-1">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/44ca50efb93c94b257832c3c725a43726311e049?width=128"
                    alt="Course"
                    className="w-16 h-16 rounded-[13px] border border-white/10"
                  />
                  <div className="flex-1">
                    <h3 className="text-foreground text-xl font-semibold mb-1">AchieveGreatness.com (FREE)</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>4k members</span>
                      <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                      <span>Free</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors">
                  View
                </button>
              </div>

              <p className="text-foreground mb-5 leading-relaxed">
                Turn your Personal Brand into a Client Generating machine, scale your business to $1M - $10M/year, and Achieve Greatness in your industry.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((lesson) => (
                  <div key={lesson} className="glass-card rounded-[30px] p-6 text-center">
                    <img
                      src={`https://api.builder.io/api/v1/image/assets/TEMP/d8c3f9bbe97f3132b2b777a5c797678eeaad5072?width=160`}
                      alt="Lesson"
                      className="w-16 h-[72px] mx-auto mb-2 mix-blend-screen"
                    />
                    <p className="text-white text-xs font-semibold leading-tight">
                      Check out the first module of lessons
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-foreground text-[30px] font-medium mb-5">Membership</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-6">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/9566b5bc49b2086f3db69ca10ef8980a1c7ee556?width=112"
                  alt="ACQ Scale Advisory"
                  className="w-14 h-14 rounded-[9px]"
                />
                <div className="flex-1">
                  <h3 className="text-foreground text-lg font-semibold mb-1">ACQ Scale Advisory</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>1.1k members</span>
                    <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                    <span>Paid</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-6">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/16d3388314915b9f25a9493d4cb5c564d8517a51?width=112"
                  alt="The 100"
                  className="w-14 h-14 rounded-[9px]"
                />
                <div className="flex-1">
                  <h3 className="text-foreground text-lg font-semibold mb-1">The 100</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>98 members</span>
                    <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                    <span>Free</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-6">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/a4bd9f6573e3c76a336f30eeb83a2931a660da57?width=112"
                  alt="FERW Group"
                  className="w-14 h-14 rounded-[9px]"
                />
                <div className="flex-1">
                  <h3 className="text-foreground text-lg font-semibold mb-1">FERW Group</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <span>2.5k members</span>
                    <div className="w-1 h-1 bg-[#4B4B4B] rounded-full"></div>
                    <span>Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
