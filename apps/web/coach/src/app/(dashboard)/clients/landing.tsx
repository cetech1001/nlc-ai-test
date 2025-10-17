'use client'

import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  UserPlus,
  BarChart3,
  Activity
} from "lucide-react";

export const ClientsLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState('management');

  const features = [
    {
      id: 'management',
      icon: Users,
      title: "Client Management",
      description: "Organize and track all your clients in one place",
      benefits: [
        "Complete client profiles with history",
        "Progress tracking and milestones",
        "Custom tags and segmentation",
        "Client notes and important dates"
      ]
    },
    {
      id: 'insights',
      icon: Activity,
      title: "Client Insights",
      description: "Understand your clients better with data-driven insights",
      benefits: [
        "Engagement tracking and analytics",
        "At-risk client identification",
        "Progress visualization",
        "Session history and outcomes"
      ]
    },
    {
      id: 'communication',
      icon: BarChart3,
      title: "Communication Hub",
      description: "All client interactions in one centralized location",
      benefits: [
        "Email history and templates",
        "Message threading",
        "Quick contact options",
        "Communication preferences"
      ]
    }
  ];

  const stats = [
    { label: "Client Organization", value: "100%", icon: Target },
    { label: "Faster Access", value: "5x", icon: Clock },
    { label: "Better Retention", value: "+35%", icon: TrendingUp },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden px-4">
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Client Management Made Simple
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Keep track of every client, their progress, and communications in one powerful platform.
            Never miss a follow-up or lose track of client details again.
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
          <h2 className="text-3xl font-bold text-white mb-4">Powerful Client Organization</h2>
          <p className="text-stone-300 text-lg">Everything you need to manage clients effectively</p>
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
              <h4 className="text-lg font-semibold text-white mb-4">Key Features</h4>

              <div className="space-y-3">
                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium text-sm">Advanced Search</span>
                  </div>
                  <p className="text-stone-400 text-xs">Find any client instantly by name, email, or tag</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Filter className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium text-sm">Smart Filtering</span>
                  </div>
                  <p className="text-stone-400 text-xs">Filter by status, program, engagement level, and more</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <UserPlus className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium text-sm">Quick Onboarding</span>
                  </div>
                  <p className="text-stone-400 text-xs">Add new clients in seconds with streamlined forms</p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium text-sm">Activity Timeline</span>
                  </div>
                  <p className="text-stone-400 text-xs">Complete history of interactions and progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Client Data at Your Fingertips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, title: "Contact Info", desc: "Email, phone, preferred contact method" },
            { icon: Target, title: "Goals & Progress", desc: "Track milestones and achievements" },
            { icon: BarChart3, title: "Engagement Data", desc: "Session attendance and participation" },
            { icon: CheckCircle, title: "Program Status", desc: "Current programs and completion rates" }
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
