'use client'

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackTo } from "@nlc-ai/shared";
import { clientsAPI } from "@nlc-ai/api-client";
import { AlertBanner } from '@nlc-ai/ui';
import { ClientWithDetails, Course } from "@nlc-ai/types";

interface CourseCardProps {
  course?: Course;
  enrollment?: any;
  tab: 'bought' | 'yet-to-buy';
}

const CourseCard = ({ course, enrollment, tab }: CourseCardProps) => {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
      </div>

      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
        {course?.thumbnailUrl ? (
          <img
            src={course?.thumbnailUrl}
            alt={course?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {course?.title.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {tab === 'bought' && enrollment && (
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
            <span className="text-white text-xs font-medium">
              {enrollment.progressPercentage || 0}% Complete
            </span>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="relative z-10 p-4 space-y-3">
        <h3 className="text-stone-50 text-lg font-semibold leading-tight line-clamp-2">
          {course?.title}
        </h3>

        {course?.description && (
          <p className="text-stone-300 text-sm leading-relaxed line-clamp-2">
            {course?.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{course?.totalModules} modules</span>
          {course?.estimatedDurationHours && (
            <span>{course?.estimatedDurationHours}h duration</span>
          )}
        </div>

        {tab === 'bought' && enrollment && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-stone-300">
              <span>Progress</span>
              <span>{enrollment.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progressPercentage || 0)}`}
                style={{ width: `${enrollment.progressPercentage || 0}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-stone-400 mt-3">
              <div>
                <span className="block text-stone-300">{enrollment.modulesCompleted || 0}</span>
                <span>Modules Done</span>
              </div>
              <div>
                <span className="block text-stone-300">{Math.round((enrollment.totalTimeSpentMinutes || 0) / 60)}h</span>
                <span>Time Spent</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'yet-to-buy' && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>{course?.totalEnrollments} enrolled</span>
              <span>{course?.completionRate}% completion rate</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ClientDetailsSkeleton = () => (
  <div className="py-4 sm:py-6 lg:py-8 space-y-6 animate-pulse">
    <div className="h-6 bg-neutral-700 rounded w-48"></div>

    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
      <div className="space-y-4">
        <div className="h-8 bg-neutral-700 rounded w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-20"></div>
              <div className="h-5 bg-neutral-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <div className="h-6 bg-neutral-700 rounded w-32"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-800/50 rounded-[20px] p-4 space-y-4">
            <div className="h-48 bg-neutral-700 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-5 bg-neutral-700 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ClientDetails() {
  const router = useRouter();
  const params = useParams();
  const clientID = params.clientID as string;

  const [client, setClient] = useState<ClientWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'bought' | 'yet-to-buy'>('bought');

  useEffect(() => {
    if (clientID) {
      (async () => {
        try {
          setIsLoading(true);
          setError("");

          const clientData = await clientsAPI.getClient(clientID);
          setClient(clientData);
        } catch (err: any) {
          setError(err.message || "Failed to load client data");
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [clientID]);

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

  const boughtCourses = client.courseEnrollments || [];
  const availableCourses: Course[] = []; // This would come from a separate API call for available courses

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 max-w-full overflow-hidden">
      <BackTo onClick={handleBackClick} title="Client Details" />

      {/* Client Info Card */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed">
              {client.firstName} {client.lastName}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">User ID</div>
              <div className="text-stone-50 text-base font-medium">#{client.id.slice(-8)}</div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Email</div>
              <div className="text-stone-50 text-base font-medium">{client.email}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Date Joined</div>
              <div className="text-stone-50 text-base font-medium">
                {new Date(client.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Courses Bought</div>
              <div className="text-stone-50 text-base font-medium">{client.coursesBought}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Courses Completed</div>
              <div className="text-stone-50 text-base font-medium">{client.coursesCompleted}</div>
            </div>

            <div className="space-y-1">
              <div className="text-stone-300 text-sm font-normal leading-relaxed">Average Review Rating</div>
              <div className="text-stone-50 text-base font-medium">4.8</div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-6">
        <h3 className="text-stone-50 text-2xl font-semibold leading-relaxed">Courses</h3>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('bought')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'bought'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-stone-300 hover:text-stone-50'
            }`}
          >
            Bought
          </button>
          <button
            onClick={() => setActiveTab('yet-to-buy')}
            className={`text-lg font-medium transition-colors ${
              activeTab === 'yet-to-buy'
                ? 'text-fuchsia-400 border-b-2 border-fuchsia-400'
                : 'text-stone-300 hover:text-stone-50'
            }`}
          >
            Yet To Buy
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeTab === 'bought' ? (
            boughtCourses.length > 0 ? (
              boughtCourses.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  enrollment={enrollment}
                  tab="bought"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">No courses purchased yet</div>
                <div className="text-stone-500 text-sm">This client hasn't bought any courses</div>
              </div>
            )
          ) : (
            availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  tab="yet-to-buy"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-stone-400 text-lg mb-2">All courses purchased</div>
                <div className="text-stone-500 text-sm">This client has bought all available courses</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
