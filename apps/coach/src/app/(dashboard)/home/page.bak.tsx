'use client'

import React, { useState, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  MessageCircle,
  BookOpen,
  Star,
  ChevronRight,
  Target,
  Play,
  Eye,
  ThumbsUp
} from "lucide-react";

// Mock data - replace with real API calls
const revenueData = [
  { period: 'Jan', revenue: 4500 },
  { period: 'Feb', revenue: 5200 },
  { period: 'Mar', revenue: 4800 },
  { period: 'Apr', revenue: 6100 },
  { period: 'May', revenue: 7300 },
  { period: 'Jun', revenue: 8500 }
];

const clientProgressData = [
  { name: 'Completed Goals', value: 68, color: '#10B981' },
  { name: 'In Progress', value: 24, color: '#F59E0B' },
  { name: 'Not Started', value: 8, color: '#EF4444' }
];

const weeklyActivityData = [
  { day: 'Mon', sessions: 4, emails: 12 },
  { day: 'Tue', sessions: 6, emails: 8 },
  { day: 'Wed', sessions: 3, emails: 15 },
  { day: 'Thu', sessions: 8, emails: 6 },
  { day: 'Fri', sessions: 5, emails: 10 },
  { day: 'Sat', sessions: 2, emails: 4 },
  { day: 'Sun', sessions: 1, emails: 2 }
];

const recentClients = [
  {
    id: '#1234',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    lastSession: '2 hours ago',
    progress: 85,
    status: 'Active'
  },
  {
    id: '#1235',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    lastSession: '1 day ago',
    progress: 92,
    status: 'Active'
  },
  {
    id: '#1236',
    name: 'Emma Davis',
    email: 'emma.d@email.com',
    lastSession: '3 days ago',
    progress: 67,
    status: 'Needs Attention'
  },
  {
    id: '#1237',
    name: 'Alex Rivera',
    email: 'alex.r@email.com',
    lastSession: '5 days ago',
    progress: 78,
    status: 'Active'
  }
];

const upcomingSessions = [
  {
    id: 1,
    client: 'Sarah Johnson',
    time: '10:00 AM',
    duration: '60 min',
    type: 'Goal Setting',
    avatar: 'SJ'
  },
  {
    id: 2,
    client: 'Mike Chen',
    time: '2:30 PM',
    duration: '45 min',
    type: 'Progress Review',
    avatar: 'MC'
  },
  {
    id: 3,
    client: 'Emma Davis',
    time: '4:00 PM',
    duration: '30 min',
    type: 'Check-in',
    avatar: 'ED'
  }
];

const recentContent = [
  {
    id: 1,
    title: 'Morning Motivation: 5 Ways to Start Strong',
    type: 'Article',
    views: 1247,
    engagement: 89,
    publishedAt: '2 days ago'
  },
  {
    id: 2,
    title: 'Goal Setting Masterclass',
    type: 'Video',
    views: 892,
    engagement: 94,
    publishedAt: '1 week ago'
  },
  {
    id: 3,
    title: 'Weekly Productivity Tips',
    type: 'Email',
    views: 2156,
    engagement: 76,
    publishedAt: '3 days ago'
  }
];

// Components
const StatCard = ({ title, value, subtitle, growth, icon: Icon, colorClass = "text-fuchsia-400" }) => {
  const showGrowth = growth !== undefined && growth !== 0;
  const isPositiveGrowth = growth && growth > 0;

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 lg:p-7 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[100px] sm:min-h-[120px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-stone-300 text-sm sm:text-base font-medium leading-tight sm:leading-relaxed">{title}</h3>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex flex-col justify-between items-start gap-2 mt-auto">
          <p className="text-stone-50 text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight sm:leading-relaxed">{value}</p>
          {showGrowth && (
            <div className={`px-2.5 py-0.5 rounded-full border flex justify-center items-center gap-1 ${
              isPositiveGrowth
                ? 'bg-green-700/20 border-green-700'
                : 'bg-red-700/20 border-red-700'
            }`}>
              {isPositiveGrowth ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-sm font-medium leading-relaxed ${
                isPositiveGrowth ? 'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
            </div>
          )}
          {subtitle && !showGrowth && (
            <div className="px-2.5 py-0.5 bg-green-700/20 rounded-full border border-green-700 flex justify-center items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-sm font-medium leading-relaxed">{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RevenueChart = () => {
  const [timePeriod, setTimePeriod] = useState("Month");
  const chartRef = useRef(null);

  const handlePeriodChange = useCallback((period) => {
    if (period === timePeriod) return;

    if (chartRef.current) {
      chartRef.current.style.opacity = '0.7';
      chartRef.current.style.transition = 'opacity 200ms ease-out';
    }

    setTimeout(() => {
      setTimePeriod(period);
      requestAnimationFrame(() => {
        if (chartRef.current) {
          chartRef.current.style.opacity = '1';
        }
      });
    }, 100);
  }, [timePeriod]);

  const formatTooltip = useCallback((value, name) => {
    return [`$${value.toLocaleString()}`, "Revenue"];
  }, []);

  return (
    <div className="relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
        <div className="min-w-0 w-full sm:w-85">
          <h2 className="text-stone-50 text-2xl font-semibold leading-relaxed mb-1.5">
            Your Revenue
          </h2>
          <p className="text-stone-300 text-sm font-normal leading-tight sm:leading-relaxed">
            +23.5% from last month
          </p>
        </div>

        <div className="flex items-center justify-start sm:justify-end gap-3 sm:gap-5 flex-shrink-0">
          {["Week", "Month", "Year"].map((period, index, array) => (
            <React.Fragment key={period}>
              <button
                onClick={() => handlePeriodChange(period)}
                className={`text-sm font-normal leading-relaxed transition-all duration-300 ease-out whitespace-nowrap ${
                  timePeriod === period
                    ? "text-fuchsia-400 font-bold"
                    : "text-stone-300 hover:text-stone-50"
                }`}
              >
                {period}
              </button>
              {index < array.length - 1 && (
                <div className="w-3 sm:w-4 h-0 border-t-[0.5px] border-white rotate-90" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        ref={chartRef}
        className="h-40 sm:h-48 lg:h-56 relative transition-opacity duration-300 ease-out"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{
              top: 10,
              right: 20,
              left: 20,
              bottom: 0
            }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C084FC" stopOpacity={0.2}/>
                <stop offset="50%" stopColor="#7B21BA" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#581C87" stopOpacity={0.2}/>
              </linearGradient>
            </defs>

            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#A3A3A3",
                fontSize: 12
              }}
              interval={0}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #404040",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              formatter={formatTooltip}
              animationDuration={0}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7B21BA"
              strokeWidth={3.46}
              fill="url(#revenueGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 6,
                fill: "#7B21BA",
                stroke: "#ffffff",
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ClientProgressChart = () => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full">
      <h3 className="text-stone-50 text-xl font-semibold mb-6">Client Progress Overview</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientProgressData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {clientProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #404040",
                  borderRadius: "8px",
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-4">
          {clientProgressData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-stone-300 text-sm flex-1">{item.name}</span>
              <span className="text-stone-50 text-sm font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeeklyActivityChart = () => {
  return (
    <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 h-full">
      <h3 className="text-stone-50 text-xl font-semibold mb-6">Weekly Activity</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A3A3A3", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#ffffff",
              }}
            />
            <Bar dataKey="sessions" fill="#7B21BA" radius={[4, 4, 0, 0]} />
            <Bar dataKey="emails" fill="#C084FC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#7B21BA] rounded"></div>
          <span className="text-stone-300 text-sm">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#C084FC] rounded"></div>
          <span className="text-stone-300 text-sm">Emails</span>
        </div>
      </div>
    </div>
  );
};

const SessionCard = ({ session }) => (
  <div className="flex items-center gap-3 p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] hover:bg-[#333333] transition-colors cursor-pointer">
    <div className="w-10 h-10 bg-[#7B21BA] rounded-full flex items-center justify-center">
      <span className="text-white text-sm font-medium">{session.avatar}</span>
    </div>
    <div className="flex-1">
      <h4 className="text-white text-sm font-medium">{session.client}</h4>
      <p className="text-[#A0A0A0] text-xs">
        {session.time} | {session.duration} | {session.type}
      </p>
    </div>
    <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
  </div>
);

const ClientCard = ({ client }) => (
  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:bg-[#333333] transition-colors cursor-pointer">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h4 className="text-white text-sm font-medium">{client.name}</h4>
        <p className="text-[#A0A0A0] text-xs">{client.email}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        client.status === 'Active'
          ? 'bg-green-600/20 text-green-400'
          : 'bg-yellow-600/20 text-yellow-400'
      }`}>
        {client.status}
      </span>
    </div>

    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#A0A0A0] text-xs">Progress</span>
        <span className="text-white text-xs font-medium">{client.progress}%</span>
      </div>
      <div className="w-full bg-[#1A1A1A] rounded-full h-2">
        <div
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${client.progress}%` }}
        />
      </div>
    </div>

    <p className="text-[#A0A0A0] text-xs">Last session: {client.lastSession}</p>
  </div>
);

const ContentCard = ({ content }) => (
  <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] p-4 hover:bg-[#333333] transition-colors cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="text-white text-sm font-medium mb-1 line-clamp-2">{content.title}</h4>
        <p className="text-[#A0A0A0] text-xs">{content.type} • {content.publishedAt}</p>
      </div>
      <div className="ml-3">
        {content.type === 'Video' ? (
          <Play className="w-4 h-4 text-fuchsia-400" />
        ) : content.type === 'Email' ? (
          <MessageCircle className="w-4 h-4 text-fuchsia-400" />
        ) : (
          <BookOpen className="w-4 h-4 text-fuchsia-400" />
        )}
      </div>
    </div>

    <div className="flex items-center gap-4 text-xs text-[#A0A0A0]">
      <div className="flex items-center gap-1">
        <Eye className="w-3 h-3" />
        <span>{content.views}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThumbsUp className="w-3 h-3" />
        <span>{content.engagement}%</span>
      </div>
    </div>
  </div>
);

export default function CoachDashboard() {
  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-full overflow-hidden">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Clients"
          value="47"
          growth={12.5}
          icon={Users}
          colorClass="text-blue-400"
        />
        <StatCard
          title="Monthly Revenue"
          value="$8,540"
          growth={23.5}
          icon={DollarSign}
          colorClass="text-green-400"
        />
        <StatCard
          title="Sessions This Week"
          value="29"
          growth={8.2}
          icon={Calendar}
          colorClass="text-purple-400"
        />
        <StatCard
          title="Client Satisfaction"
          value="4.9"
          subtitle="+0.2 this month"
          icon={Star}
          colorClass="text-yellow-400"
        />
      </div>

      {/* Charts Section */}
      <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="flex-1 relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 sm:p-6 min-w-0 overflow-hidden">
          <div className="absolute w-64 h-64 -left-12 top-52 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <div className="absolute w-64 h-64 right-40 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
          <RevenueChart />
        </div>

        {/* Client Progress Chart */}
        <div className="w-full xl:w-1/3">
          <ClientProgressChart />
        </div>
      </div>

      {/* Activity and Content Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <WeeklyActivityChart />

        {/* Quick Actions */}
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <h3 className="text-stone-50 text-xl font-semibold mb-6">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] hover:bg-[#333333] transition-colors group">
              <Calendar className="w-6 h-6 text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium block">Schedule Session</span>
            </button>

            <button className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] hover:bg-[#333333] transition-colors group">
              <MessageCircle className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium block">Send Message</span>
            </button>

            <button className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] hover:bg-[#333333] transition-colors group">
              <BookOpen className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium block">Create Content</span>
            </button>

            <button className="p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] hover:bg-[#333333] transition-colors group">
              <Target className="w-6 h-6 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-white text-sm font-medium block">Set Goals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Today's Sessions */}
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-stone-50 text-xl font-semibold">Today's Sessions</h3>
            <button className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-stone-50 text-xl font-semibold">Recent Clients</h3>
            <button className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentClients.slice(0, 2).map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-stone-50 text-xl font-semibold">Top Content</h3>
            <button className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentContent.slice(0, 2).map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
