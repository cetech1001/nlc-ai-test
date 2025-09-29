'use client'

import {FC, ReactNode, useState} from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Clock,
  Zap,
  CheckCircle,
  Brain,
  LineChart,
  PieChart
} from "lucide-react";
import {appConfig} from "@nlc-ai/web-shared";

const AgentsAnalyticsLanding = () => {
  const [activeFeature, setActiveFeature] = useState('performance');

  const features = [
    {
      id: 'performance',
      icon: BarChart3,
      title: "Performance Metrics",
      description: "Track how your AI agents are performing",
      benefits: [
        "Real-time activity monitoring",
        "Success rate tracking per agent",
        "Conversion and engagement metrics",
        "Time saved calculations"
      ]
    },
    {
      id: 'insights',
      icon: Brain,
      title: "AI Insights",
      description: "Understand agent behavior and optimization opportunities",
      benefits: [
        "Pattern recognition in agent actions",
        "Suggestion quality scoring",
        "Client interaction analysis",
        "Predictive performance indicators"
      ]
    },
    {
      id: 'roi',
      icon: TrendingUp,
      title: "ROI Tracking",
      description: "Measure the business impact of AI automation",
      benefits: [
        "Revenue attributed to AI agents",
        "Cost savings from automation",
        "Time-to-value metrics",
        "Efficiency gain percentages"
      ]
    }
  ];

  const stats = [
    { label: "Time Saved", value: "500+ Hours", icon: Clock },
    { label: "Tasks Automated", value: "10,000+", icon: Zap },
    { label: "ROI Increase", value: "+300%", icon: TrendingUp },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            AI Agents Analytics
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Measure, analyze, and optimize your AI agent performance with comprehensive analytics.
            Understand exactly how AI is transforming your coaching business.
          </p>

          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 text-lg font-medium">
            <Clock className="w-5 h-5" />
            Coming Soon - Private Beta
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden text-center">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-stone-300">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Comprehensive Agent Analytics</h2>
          <p className="text-stone-300 text-lg">Data-driven insights for AI optimization</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeFeature === feature.id
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                  : 'bg-neutral-800/50 text-stone-300 hover:bg-neutral-700/50'
              }`}
            >
              <feature.icon className="w-4 h-4" />
              {feature.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`${activeFeature === feature.id ? 'block' : 'hidden'}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-fuchsia-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  </div>

                  <p className="text-stone-300 text-lg mb-6">{feature.description}</p>

                  <div className="space-y-3">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-stone-200">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Agent Performance Breakdown</h4>

              <div className="space-y-3">
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-purple-500"></div>
                    <span className="text-white font-medium text-sm">Coach Replica</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">2,453 interactions</span>
                    <span className="text-green-400">+15%</span>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                    <span className="text-white font-medium text-sm">Lead Follow-Up</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">847 emails sent</span>
                    <span className="text-green-400">+22%</span>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    <span className="text-white font-medium text-sm">Email Assistant</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">1,234 drafts</span>
                    <span className="text-green-400">+18%</span>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-orange-500"></div>
                    <span className="text-white font-medium text-sm">Content Creation</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">156 ideas generated</span>
                    <span className="text-green-400">+31%</span>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <span className="text-white font-medium text-sm">Retention Agent</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">89 surveys sent</span>
                    <span className="text-green-400">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Analytics Dashboard Features</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: LineChart, title: "Trend Analysis", desc: "Track performance over time" },
            { icon: PieChart, title: "Agent Distribution", desc: "See task breakdown by agent" },
            { icon: Activity, title: "Real-Time Monitoring", desc: "Live agent activity feed" },
            { icon: Target, title: "Goal Tracking", desc: "Measure against targets" }
          ].map((item, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden text-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-4 -top-6 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px]" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-fuchsia-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-stone-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Key Metrics Tracked</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Efficiency Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Time Saved per Week</span>
                  <span className="text-white font-bold">30+ Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Tasks Automated</span>
                  <span className="text-white font-bold">1,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Response Time</span>
                  <span className="text-white font-bold">Instant</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Approval Rate</span>
                  <span className="text-white font-bold">94%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Business Impact</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Lead Conversion Rate</span>
                  <span className="text-green-400 font-bold">+50%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Client Retention</span>
                  <span className="text-green-400 font-bold">+60%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Revenue Growth</span>
                  <span className="text-green-400 font-bold">+35%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-300">Client Satisfaction</span>
                  <span className="text-green-400 font-bold">4.8/5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IProps {
  children: ReactNode;
}

const AnalyticsPage: FC<IProps> = (props) => {
  if (appConfig.features.enableLanding) {
    return <AgentsAnalyticsLanding/>;
  }
  return props.children;
}

export default AnalyticsPage;
