'use client'

import { StatCard } from "@nlc-ai/web-shared";
import {
  LeadsFollowUpWidget,
  TaskList,
  TimeSavedWidget,
  RevenueChart,
  TestimonialOpportunity,
  TopPerformingContent,
  ClientEmailWidget, CoachConfidenceScore
} from "@/lib";
import {
  Flag,
  Mail,
  MessageCircleWarning,
  TriangleAlert,
  Trophy,
  Users,
  MessagesSquare,
  MessageCircleHeart, Lightbulb
} from "lucide-react";

const priorityList = [
  {
    icon: Mail,
    label: "Emails To Approve",
    count: 3,
    color: "text-fuchsia-400"
  },
  {
    icon: TriangleAlert,
    label: "Clients At Risk",
    count: 2,
    color: "text-purple-400"
  },
  {
    icon: Flag,
    label: "Survey Responses Flagged",
    count: 5,
    color: "text-red-400"
  },
  {
    icon: Trophy,
    label: "Clients Nearing Completion",
    count: 1,
    color: "text-yellow-400"
  },
  {
    icon: MessageCircleWarning,
    label: "Chat Bot Escalations",
    count: 8,
    color: "text-orange-400"
  }
];

const agentStats = [
  {
    icon: Users,
    label: "Leads Captured",
    count: 10,
    color: "text-fuchsia-400"
  },
  {
    icon: Mail,
    label: "Follow Up Emails Sent",
    count: 10,
    color: "text-purple-400"
  },
  {
    icon: MessagesSquare,
    label: "Feedback Surveys Sent",
    count: 3,
    color: "text-red-400"
  },
  {
    icon: MessageCircleHeart,
    label: "Testimonials Received",
    count: 1,
    color: "text-yellow-400"
  },
  {
    icon: Lightbulb,
    label: "Content Ideas Generated",
    count: 8,
    color: "text-orange-400"
  }
];

const CoachHome = () => {
  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Total Clients"
          value="4,629"
          growth={25}
          description="Number Of enrolled students or active clients"
        />
        <CoachConfidenceScore
          title={'Coach Confidence Score'}
          value={85}
          description={'Accuracy of AI outputs based on coach approval/edit history'}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <ClientEmailWidget/>
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
          <RevenueChart />
        </div>
        <div className="h-full">
          <TimeSavedWidget />
        </div>
      </div>

      <div className={"grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TestimonialOpportunity />
          <div className={"flex flex-col gap-3"}>
            <LeadsFollowUpWidget />
            <StatCard
              title="Leads Captured Weekly"
              value="32"
            />
          </div>
        </div>
        <TopPerformingContent />
      </div>
    </div>
  );
}

export default CoachHome;
