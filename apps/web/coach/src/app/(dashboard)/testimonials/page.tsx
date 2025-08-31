'use client'

import { useState } from 'react';
import {
  Star,
  Quote,
  Video,
  Share2,
  Heart,
  Zap,
  Clock,
  Trophy,
  Camera,
  Globe,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  BarChart3
} from "lucide-react";
import {appConfig} from "@nlc-ai/web-shared";

const TestimonialsLanding = () => {
  const [activeFeature, setActiveFeature] = useState('collection');

  const features = [
    {
      id: 'collection',
      icon: MessageSquare,
      title: "Smart Collection System",
      description: "Automatically request and collect testimonials at the perfect moments",
      benefits: [
        "Automated follow-up sequences after milestones",
        "Smart timing based on client progress",
        "Multiple format options (text, video, audio)",
        "Mobile-friendly collection forms"
      ]
    },
    {
      id: 'showcase',
      icon: Star,
      title: "Beautiful Showcases",
      description: "Display testimonials in stunning, conversion-optimized formats",
      benefits: [
        "Customizable testimonial widgets",
        "Video testimonial galleries",
        "Social proof carousels",
        "SEO-optimized testimonial pages"
      ]
    },
    {
      id: 'management',
      icon: BarChart3,
      title: "Analytics & Management",
      description: "Track testimonial performance and manage your social proof library",
      benefits: [
        "Conversion impact tracking",
        "A/B testing for testimonial placement",
        "Testimonial performance analytics",
        "Easy approval and moderation workflow"
      ]
    }
  ];

  const stats = [
    { label: "Conversion Increase", value: "+127%", icon: TrendingUp },
    { label: "Collection Rate", value: "85%", icon: Trophy },
    { label: "Time Saved", value: "12hrs/week", icon: Clock },
  ];

  const testimonialTypes = [
    {
      icon: Quote,
      title: "Written Reviews",
      description: "Traditional text testimonials",
      features: ["Star ratings", "Detailed feedback", "Quick collection forms"]
    },
    {
      icon: Video,
      title: "Video Testimonials",
      description: "Authentic video reviews",
      features: ["HD video recording", "Easy editing tools", "Social media ready"]
    },
    {
      icon: Camera,
      title: "Before/After Stories",
      description: "Visual transformation proof",
      features: ["Image comparisons", "Progress tracking", "Success timelines"]
    }
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Testimonials & Social Proof
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Collect, manage, and showcase powerful testimonials that convert visitors into clients.
            Turn your success stories into your most powerful marketing tool.
          </p>

          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 text-lg font-medium">
            <Clock className="w-5 h-5" />
            Coming Soon - Private Beta
          </div>
        </div>
      </div>

      {/* Stats Section */}
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

      {/* Testimonial Types */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Collect Every Type of Social Proof</h2>
          <p className="text-stone-300 text-lg">From written reviews to video testimonials and visual transformations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialTypes.map((type, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-fuchsia-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                <p className="text-stone-300 mb-4">{type.description}</p>

                <div className="space-y-2">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-stone-200 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Complete Testimonial Management System</h2>
          <p className="text-stone-300 text-lg">From collection to conversion optimization</p>
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

        {/* Feature Details */}
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

          {/* Testimonial Impact */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Why Testimonials Work</h4>

              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">Trust Building</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    88% of consumers trust online reviews as much as personal recommendations.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Conversion Boost</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Displaying testimonials can increase conversions by up to 127%.
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Social Sharing</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Happy clients sharing testimonials create viral marketing opportunities.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium">SEO Benefits</span>
                </div>
                <p className="text-stone-300 text-sm">
                  Fresh testimonial content improves search rankings and local SEO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Automation Flow */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Automated Collection Process</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: "1",
              title: "Trigger Event",
              desc: "Client completes milestone or finishes program",
              icon: Trophy,
              color: "bg-blue-500/20 text-blue-400"
            },
            {
              step: "2",
              title: "Smart Request",
              desc: "Automated email/SMS sent at optimal timing",
              icon: Zap,
              color: "bg-green-500/20 text-green-400"
            },
            {
              step: "3",
              title: "Easy Submission",
              desc: "Client submits testimonial via mobile-friendly form",
              icon: MessageSquare,
              color: "bg-purple-500/20 text-purple-400"
            },
            {
              step: "4",
              title: "Auto Display",
              desc: "Testimonial appears on website and marketing materials",
              icon: Star,
              color: "bg-yellow-500/20 text-yellow-400"
            }
          ].map((step, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden text-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-4 -top-6 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px]" />
              </div>

              <div className="relative z-10">
                <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{step.step}</div>
                <h4 className="text-white font-semibold mb-2 text-sm">{step.title}</h4>
                <p className="text-stone-400 text-xs">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Testimonial Display */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Beautiful Display Options</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Testimonial Card Example */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Sample Testimonial Card</h4>

              <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-white text-sm mb-4 italic">
                  "Working with this coach completely transformed my business. In just 3 months,
                  I increased my revenue by 200% and finally achieved the work-life balance I'd been seeking."
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    SJ
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">Sarah Johnson</div>
                    <div className="text-stone-400 text-xs">Business Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Testimonial Example */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Video Testimonial Player</h4>

              <div className="bg-neutral-800/50 rounded-lg overflow-hidden border border-neutral-600">
                <div className="aspect-video bg-neutral-700 flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    2:34
                  </div>
                </div>

                <div className="p-4">
                  <h5 className="text-white font-medium mb-1">Amazing Results!</h5>
                  <p className="text-stone-400 text-sm">Client shares their transformation story</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsPage = () => {
  if (appConfig.features.enableLanding) {
    return <TestimonialsLanding />;
  }

  return <div/>;
};

export default TestimonialsPage;
