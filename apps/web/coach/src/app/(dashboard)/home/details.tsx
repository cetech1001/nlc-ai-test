'use client'

import React, { useState, useEffect } from 'react';
import { StatCard } from "@nlc-ai/web-shared";
import {
  TaskList,
  TimeSavedWidget,
  RevenueChart,
  TestimonialOpportunity,
  TopPerformingContent,
  ClientEmailWidget,
  CoachConfidenceScore,
  sdkClient,
  Leaderboard,
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
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAuth } from "@nlc-ai/web-auth";

export const CoachDetailsPage = () => {
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

      const data = await sdkClient.analytics.coach.getDashboardData(coachID);
      setDashboardData(data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
      link: '/agents/emails',
      count: dashboardData?.priorities.find(p => p.type === 'emails_to_approve')?.count || 0,
      color: "text-fuchsia-400"
    },
    {
      icon: TriangleAlert,
      label: "Clients At Risk",
      link: '/agents/retention',
      count: dashboardData?.priorities.find(p => p.type === 'clients_at_risk')?.count || 0,
      color: "text-purple-400"
    },
    {
      icon: Flag,
      label: "Survey Responses Flagged",
      link: '/agents/retention',
      count: dashboardData?.priorities.find(p => p.type === 'survey_responses_flagged')?.count || 0,
      color: "text-red-400"
    },
    {
      icon: Trophy,
      label: "Clients Nearing Completion",
      link: '/courses',
      count: dashboardData?.priorities.find(p => p.type === 'clients_nearing_completion')?.count || 0,
      color: "text-yellow-400"
    },
    {
      icon: MessageCircleWarning,
      label: "Chat Bot Escalations",
      link: '/messages',
      count: dashboardData?.priorities.find(p => p.type === 'chatbot_escalations')?.count || 0,
      color: "text-orange-400"
    }
  ];

  const agentStats = [
    {
      icon: Users,
      label: "Leads Captured",
      link: '/leads',
      count: dashboardData?.agentStats.leadsCaptured || 0,
      color: "text-fuchsia-400"
    },
    {
      icon: Mail,
      label: "Follow Up Emails Sent",
      link: '/agents/followup',
      count: dashboardData?.agentStats.followUpEmailsSent || 0,
      color: "text-purple-400"
    },
    {
      icon: MessagesSquare,
      label: "Feedback Surveys Sent",
      link: '/agents/retention',
      count: dashboardData?.agentStats.feedbackSurveysSent || 0,
      color: "text-red-400"
    },
    {
      icon: MessageCircleHeart,
      label: "Testimonials Received",
      link: '/agents/testimonials',
      count: dashboardData?.agentStats.testimonialsReceived || 0,
      color: "text-yellow-400"
    },
    {
      icon: Lightbulb,
      label: "Content Ideas Generated",
      link: '/agents/suggestion',
      count: dashboardData?.agentStats.contentIdeasGenerated || 0,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="py-4 px-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          isLoading={isLoading}
          title="Total Clients"
          value={dashboardData?.totalClients.toString()}
          growth={(dashboardData?.totalClients || 0) > 0 ? 25 : undefined}
          description="Number Of enrolled students or active clients"
        />
        <CoachConfidenceScore
          title={'Coach Confidence Score'}
          value={dashboardData?.confidenceScore || 0}
          description={'Accuracy of AI outputs based on coach approval/edit history'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <TaskList
          title={"Today's Priorities"}
          tasks={priorityList}
        />
        <TaskList title={"Agent Stats"} tasks={agentStats} />
        <Leaderboard isLoading={isLoading}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="h-full">
          <RevenueChart
            data={dashboardData?.revenueData as any}
            growth={dashboardData?.revenueGrowth || 0}
          />
        </div>
        <div className="h-full">
          <TimeSavedWidget data={dashboardData?.timeSavedData as any} />
        </div>
      </div>

      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TestimonialOpportunity opportunity={dashboardData?.testimonialOpportunity as any} />
          <ClientEmailWidget stats={dashboardData?.clientEmailStats as any} />
        </div>
        <TopPerformingContent content={dashboardData?.topPerformingContent as any} />
      </div>
    </div>
  );
}
