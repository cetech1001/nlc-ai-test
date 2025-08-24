'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackTo } from "@nlc-ai/web-shared";
import { AlertBanner, Button } from '@nlc-ai/web-ui';
import { sdkClient } from "@/lib";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  BookOpen,
  MessageSquare,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Tag
} from "lucide-react";
import {ExtendedClient} from "@nlc-ai/sdk-users";

const ClientDetailsSkeleton = () => (
  <div className="py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
    <div className="h-6 bg-neutral-700 rounded w-48"></div>
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
      <div className="space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-neutral-800/30 rounded-[20px] p-6 space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-32"></div>
          <div className="h-8 bg-neutral-700 rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({
                    icon: Icon,
                    title,
                    value,
                    subtitle,
                    color = "text-fuchsia-400"
                  }: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) => (
  <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color.replace('text-', 'bg-').replace('400', '500/20')} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="text-stone-50 text-lg font-medium">{title}</h3>
      </div>

      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-stone-400 text-sm">{subtitle}</div>
      )}
    </div>
  </div>
);

const AdminClientDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const clientID = params.clientID as string;

  const [client, setClient] = useState<ExtendedClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (clientID) {
      loadClient();
    }
  }, [clientID]);

  const loadClient = async () => {
    try {
      setIsLoading(true);
      setError("");

      const clientData = await sdkClient.users.clients.getClient(clientID);
      setClient(clientData);
    } catch (err: any) {
      setError(err.message || "Failed to load client data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/clients');
  };

  if (isLoading) {
    return <ClientDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message={error} onDismiss={() => setError('')} />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-8">
        <AlertBanner type="error" message="Client not found" onDismiss={() => setError('')} />
      </div>
    );
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 0.8) return { label: 'Highly Engaged', color: 'text-green-400' };
    if (score >= 0.6) return { label: 'Engaged', color: 'text-blue-400' };
    if (score >= 0.4) return { label: 'Moderately Engaged', color: 'text-yellow-400' };
    return { label: 'Needs Attention', color: 'text-red-400' };
  };

  const engagement = getEngagementLevel(client.engagementScore || 0);

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="Client Details" />

      {/* Client Header Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {client.avatarUrl ? (
                <img
                  src={client.avatarUrl}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-fuchsia-400/30"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}

              <div>
                <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
                  {client.firstName} {client.lastName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 border border-violet-500/30 ${engagement.color}`}>
                    {engagement.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/clients/edit?clientID=${client.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Edit Client
              </Button>
              <Button
                onClick={() => router.push(`/emails?clientID=${client.id}`)}
                className="px-4 py-2 border border-neutral-600 text-stone-300 rounded-lg hover:border-fuchsia-400 hover:text-white transition-colors"
              >
                View Emails
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <div className="text-stone-50 text-base font-medium">{client.email}</div>
            </div>

            {client.phone && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-stone-300 text-sm">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <div className="text-stone-50 text-base font-medium">{client.phone}</div>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Calendar className="w-4 h-4" />
                Date Joined
              </div>
              <div className="text-stone-50 text-base font-medium">
                {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'N/A'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-stone-300 text-sm">
                <Activity className="w-4 h-4" />
                Last Interaction
              </div>
              <div className="text-stone-50 text-base font-medium">
                {client.lastInteractionAt ? new Date(client.lastInteractionAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Never'}
              </div>
            </div>
          </div>

          {/* Coach Information */}
          {client.coaches && client.coaches.length > 0 && (
            <div className="mt-6">
              <div className="text-stone-300 text-sm mb-2">Assigned Coaches</div>
              <div className="flex flex-wrap gap-2">
                {client.coaches.map((coach, index) => (
                  <div key={index}
                       className="flex items-center gap-2 bg-neutral-800/50 px-3 py-1 rounded-lg">
                    <Users className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-white text-sm">
                      {coach.name}
                      {coach.isPrimary && <span className="text-fuchsia-400 ml-1">(Primary)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <div className="mt-6">
              <div className="text-stone-300 text-sm mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-violet-600/20 text-violet-300 border border-violet-600/30 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          title="Courses Bought"
          value={client.coursesBought}
          subtitle="Total purchases"
          color="text-blue-400"
        />

        <StatCard
          icon={Trophy}
          title="Courses Completed"
          value={client.coursesCompleted}
          subtitle={`${client.coursesBought > 0 ? Math.round((client.coursesCompleted / client.coursesBought) * 100) : 0}% completion rate`}
          color="text-green-400"
        />

        <StatCard
          icon={MessageSquare}
          title="Email Threads"
          value={client.emailThreadsCount || 0}
          subtitle="Active conversations"
          color="text-purple-400"
        />

        <StatCard
          icon={TrendingUp}
          title="Engagement Score"
          value={`${Math.round((client.engagementScore || 0) * 100)}%`}
          subtitle={engagement.label}
          color={engagement.color}
        />
      </div>

      {/* Course Enrollments */}
      {client.courseEnrollments && client.courseEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-stone-50 text-xl font-semibold">Course Progress</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {client.courseEnrollments.map((enrollment: any) => (
              <div
                key={enrollment.id}
                className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-stone-50 text-lg font-medium mb-1">
                        {enrollment.course?.title || 'Course'}
                      </h4>
                      <div className="text-stone-400 text-sm">
                        Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-stone-50 text-xl font-bold">
                        {enrollment.progressPercentage || 0}%
                      </div>
                      <div className="text-stone-400 text-xs">Complete</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-fuchsia-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progressPercentage || 0}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-stone-300 font-medium">
                          {enrollment.modulesCompleted || 0}
                        </div>
                        <div className="text-stone-500">Modules Done</div>
                      </div>
                      <div>
                        <div className="text-stone-300 font-medium">
                          {Math.round((enrollment.totalTimeSpentMinutes || 0) / 60)}h
                        </div>
                        <div className="text-stone-500">Time Spent</div>
                      </div>
                      <div>
                        <div className="text-stone-300 font-medium">
                          {enrollment.lastActivityAt
                            ? `${Math.floor((Date.now() - new Date(enrollment.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24))}d`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-stone-500">Last Active</div>
                      </div>
                    </div>

                    {enrollment.status === 'completed' && (
                      <div className="flex items-center gap-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <Trophy className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Completed</span>
                        {enrollment.completedAt && (
                          <span className="text-green-400/70 text-xs">
                            on {new Date(enrollment.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-stone-50 text-xl font-semibold">Recent Activity</h3>

        <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-48 h-48 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Client joined */}
            <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Joined as client</div>
                <div className="text-stone-400 text-xs">
                  {client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Date unknown'}
                </div>
              </div>
            </div>

            {/* Course enrollments */}
            {client.courseEnrollments && client.courseEnrollments.slice(0, 3).map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">
                    Enrolled in {enrollment.course?.title || 'Course'}
                  </div>
                  <div className="text-stone-400 text-xs">
                    {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'Date unknown'}
                  </div>
                </div>
                {enrollment.status === 'completed' && (
                  <Trophy className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            ))}

            {/* Email activity */}
            {client.emailThreadsCount && client.emailThreadsCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Email Communication</div>
                  <div className="text-stone-400 text-xs">
                    {client.emailThreadsCount} active thread{client.emailThreadsCount > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Last interaction */}
            {client.lastInteractionAt && (
              <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Last Interaction</div>
                  <div className="text-stone-400 text-xs">
                    {new Date(client.lastInteractionAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClientDetailsPage;
