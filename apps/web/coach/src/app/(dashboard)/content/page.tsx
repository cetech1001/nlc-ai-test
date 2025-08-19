'use client'

import { useState } from 'react';
import {
  TvMinimalPlay,
  Calendar,
  TrendingUp,
  Zap,
  Clock,
  Target,
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import appConfig from "@/config/app.config";
import ContentCategories from "@/app/(dashboard)/content/categories/page";

const ContentManagementLanding = () => {
  const [activeTab, setActiveTab] = useState('content-calendar');

  const features = [
    {
      icon: Calendar,
      title: "Content Calendar",
      description: "Plan and schedule your social media content across all platforms",
      benefits: [
        "Visual content calendar with drag-and-drop scheduling",
        "Multi-platform posting (Instagram, LinkedIn, Twitter, Facebook)",
        "Content templates and coaching-focused post ideas",
        "Optimal posting time recommendations"
      ]
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track engagement and optimize your content strategy",
      benefits: [
        "Detailed analytics for each post and platform",
        "Engagement rate tracking and audience insights",
        "Content performance comparisons",
        "Growth metrics and follower analysis"
      ]
    },
    {
      icon: Zap,
      title: "AI Content Generation",
      description: "Let AI help create engaging content tailored to your coaching niche",
      benefits: [
        "AI-powered post suggestions based on your expertise",
        "Caption generation with coaching insights",
        "Hashtag recommendations for maximum reach",
        "Content ideas based on trending topics in coaching"
      ]
    }
  ];

  const tabs = [
    { id: 'content-calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-generation', label: 'AI Generation', icon: Zap }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TvMinimalPlay className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Content Management
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Streamline your social media presence with AI-powered content creation,
            scheduling, and analytics designed specifically for coaches.
          </p>

          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 text-lg font-medium">
            <Clock className="w-5 h-5" />
            Coming Soon - Launch Expected in Q2 2025
          </div>
        </div>
      </div>

      {/* Features Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'
                  : 'bg-neutral-800/50 text-stone-300 hover:bg-neutral-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`${activeTab === feature.title.toLowerCase().replace(' ', '-') ? 'block' : 'hidden'}`}
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

          {/* Preview Mockup */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">What You'll Get</h4>

              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Smart Targeting</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    AI analyzes your audience and suggests the best times and content types for maximum engagement.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">Growth Insights</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Track which content drives the most client inquiries and course sign-ups.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium">Brand Consistency</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Maintain your unique coaching voice across all platforms with AI-powered content suggestions.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-fuchsia-600/10 to-violet-600/10 border border-fuchsia-600/20 rounded-lg">
                <p className="text-fuchsia-300 text-sm font-medium mb-2">Early Access Benefit</p>
                <p className="text-stone-300 text-sm">
                  Be among the first to access these powerful content management tools. Your feedback will help shape the final product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Ready to Transform Your Content Strategy?</h3>
        <p className="text-stone-300 text-lg">
          Join our waitlist to be notified when Content Management launches.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            Join Waitlist
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-3 border border-neutral-600 text-stone-300 rounded-lg hover:border-fuchsia-400 hover:text-white transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentManagementPage = () => {
  if (appConfig.features.enableLanding) {
    return <ContentManagementLanding />;
  }

  return <ContentCategories/>;
};

export default ContentManagementPage;
