'use client'

import { useState, useEffect } from 'react';
import { StatCard } from "@nlc-ai/web-shared";
import {
  LeadsFollowUpWidget,
  TaskList,
  TimeSavedWidget,
  RevenueChart,
  TestimonialOpportunity,
  TopPerformingContent,
  ClientEmailWidget,
  CoachConfidenceScore, sdkClient
} from "@/lib";
import {
  Flag,
  Mail,
  MessageCircleWarning,
  TriangleAlert,
  Trophy,
  Users,
  MessagesSquare,
  MessageCircleHeart,
  Lightbulb
} from "lucide-react";
import { CoachDashboardData } from '@nlc-ai/sdk-analytics';
import { useAuth } from "@nlc-ai/web-auth";

const CoachHome = () => {
  const [dashboardData, setDashboardData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      (() => loadDashboardData(user.id))();
    }
  }, [user]);

  const loadDashboardData = async (coachID: string) => {
    try {
      setIsLoading(true);
      setError('');

      // TODO: Get actual coachID from auth context
      // const coachID = 'current-coach-id';

      // Create analytics client - TODO: Get config from app config
      const data = await sdkClient.analytics.coach.getDashboardData(coachID);
      setDashboardData(data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /*if (isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="h-32 bg-neutral-800 rounded-[30px]"></div>
            <div className="h-32 bg-neutral-800 rounded-[30px]"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
            <div className="h-64 bg-neutral-800 rounded-[30px]"></div>
            <div className="h-64 bg-neutral-800 rounded-[30px]"></div>
            <div className="h-64 bg-neutral-800 rounded-[30px]"></div>
          </div>
        </div>
      </div>
    );
  }*/

  if ((error || !dashboardData) && !isLoading) {
    return (
      <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
        <div className="text-center p-8">
          <p className="text-red-400 mb-4">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => loadDashboardData(user?.id || '')}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div/>
  }

  const priorityList = [
    {
      icon: Mail,
      label: "Emails To Approve",
      count: dashboardData?.priorities.find(p => p.type === 'emails_to_approve')?.count || 0,
      color: "text-fuchsia-400"
    },
    {
      icon: TriangleAlert,
      label: "Clients At Risk",
      count: dashboardData?.priorities.find(p => p.type === 'clients_at_risk')?.count || 0,
      color: "text-purple-400"
    },
    {
      icon: Flag,
      label: "Survey Responses Flagged",
      count: dashboardData?.priorities.find(p => p.type === 'survey_responses_flagged')?.count || 0,
      color: "text-red-400"
    },
    {
      icon: Trophy,
      label: "Clients Nearing Completion",
      count: dashboardData?.priorities.find(p => p.type === 'clients_nearing_completion')?.count || 0,
      color: "text-yellow-400"
    },
    {
      icon: MessageCircleWarning,
      label: "Chat Bot Escalations",
      count: dashboardData?.priorities.find(p => p.type === 'chatbot_escalations')?.count || 0,
      color: "text-orange-400"
    }
  ];

  const agentStats = [
    {
      icon: Users,
      label: "Leads Captured",
      count: dashboardData?.agentStats.leadsCaptured!,
      color: "text-fuchsia-400"
    },
    {
      icon: Mail,
      label: "Follow Up Emails Sent",
      count: dashboardData?.agentStats.followUpEmailsSent!,
      color: "text-purple-400"
    },
    {
      icon: MessagesSquare,
      label: "Feedback Surveys Sent",
      count: dashboardData?.agentStats.feedbackSurveysSent!,
      color: "text-red-400"
    },
    {
      icon: MessageCircleHeart,
      label: "Testimonials Received",
      count: dashboardData?.agentStats.testimonialsReceived!,
      color: "text-yellow-400"
    },
    {
      icon: Lightbulb,
      label: "Content Ideas Generated",
      count: dashboardData?.agentStats.contentIdeasGenerated!,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          isLoading={isLoading}
          title="Total Clients"
          value={dashboardData?.totalClients.toString()}
          growth={dashboardData?.totalClients! > 0 ? 25 : undefined}
          description="Number Of enrolled students or active clients"
        />
        <CoachConfidenceScore
          title={'Coach Confidence Score'}
          value={dashboardData?.confidenceScore!}
          description={'Accuracy of AI outputs based on coach approval/edit history'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <ClientEmailWidget stats={dashboardData?.clientEmailStats!} />
        <TaskList
          title={"Today's Priorities"}
          tasks={priorityList}
          cta={{
            text: 'View All Actions',
            onClick: () => {}
          }} />
        <TaskList title={"Agent Stats"} tasks={agentStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="h-full">
          <RevenueChart
            data={dashboardData?.revenueData!}
            growth={dashboardData?.revenueGrowth!}
          />
        </div>
        <div className="h-full">
          <TimeSavedWidget data={dashboardData?.timeSavedData!} />
        </div>
      </div>

      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TestimonialOpportunity opportunity={dashboardData?.testimonialOpportunity!} />
          <div className={"flex flex-col gap-3"}>
            <LeadsFollowUpWidget data={dashboardData?.leadsFollowUp!} />
            <StatCard
              isLoading={isLoading}
              title="Leads Captured Weekly"
              value={dashboardData?.weeklyLeadsCaptured.toString()}
            />
          </div>
        </div>
        <TopPerformingContent content={dashboardData?.topPerformingContent!} />
      </div>
    </div>
  );
}

export default CoachHome;
