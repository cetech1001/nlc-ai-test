'use client'

import { useState } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  Mail,
  Clock,
  Sparkles,
  CheckCircle,
  Zap,
  Calendar,
  BarChart3
} from "lucide-react";

export const LeadsLanding = () => {
  const [activeFeature, setActiveFeature] = useState('tracking');

  const features = [
    {
      id: 'tracking',
      icon: Target,
      title: "Lead Tracking",
      description: "Never lose track of a potential client",
      benefits: [
        "Comprehensive lead profiles",
        "Source tracking and attribution",
        "Status pipeline management",
        "Meeting scheduling integration"
      ]
    },
    {
      id: 'automation',
      icon: Sparkles,
      title: "AI Follow-Up",
      description: "Automated nurture sequences that convert",
      benefits: [
        "Smart email sequences",
        "Personalized messaging at scale",
        "Behavior-based triggers",
        "A/B testing for optimization"
      ]
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: "Conversion Analytics",
      description: "Understand what turns leads into clients",
      benefits: [
        "Conversion rate tracking",
        "Source performance analysis",
        "Pipeline velocity metrics",
        "ROI per lead source"
      ]
    }
  ];

  const stats = [
    { label: "Conversion Rate", value: "+50%", icon: TrendingUp },
    { label: "Follow-Up Speed", value: "10x Faster", icon: Clock },
    { label: "Lead Organization", value: "100%", icon: Target },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Turn More Leads Into Clients
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Capture, nurture, and convert leads with intelligent automation and data-driven insights.
            Stop letting opportunities slip through the cracks.
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
          <h2 className="text-3xl font-bold text-white mb-4">Complete Lead Management System</h2>
          <p className="text-stone-300 text-lg">From first contact to signed client</p>
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
              <h4 className="text-lg font-semibold text-white mb-4">Lead Pipeline Stages</h4>

              <div className="space-y-3">
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-white font-medium text-sm">New Lead</span>
                  </div>
                  <p className="text-stone-400 text-xs">Just captured, awaiting initial contact</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-white font-medium text-sm">Contacted</span>
                  </div>
                  <p className="text-stone-400 text-xs">In active follow-up sequence</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-white font-medium text-sm">Scheduled</span>
                  </div>
                  <p className="text-stone-400 text-xs">Meeting booked, awaiting conversion</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-white font-medium text-sm">Converted</span>
                  </div>
                  <p className="text-stone-400 text-xs">Successfully became a client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Smart Lead Management Features</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Mail, title: "Auto Follow-Up", desc: "AI-powered email sequences" },
            { icon: Calendar, title: "Meeting Booking", desc: "Integrated scheduling system" },
            { icon: Zap, title: "Quick Actions", desc: "One-click email and SMS" },
            { icon: BarChart3, title: "Performance Data", desc: "Track every lead source" }
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
    </div>
  );
};
