'use client'

import { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Bell,
  Zap,
  Globe,
  Smartphone,
  Shield,
  CheckCircle,
  CalendarDays,
  Timer,
  MapPin
} from "lucide-react";

export const CalendarLanding = () => {
  const [activeFeature, setActiveFeature] = useState('booking');

  const features = [
    {
      id: 'booking',
      icon: Calendar,
      title: "Smart Booking System",
      description: "Let clients book appointments seamlessly with intelligent scheduling",
      benefits: [
        "24/7 online booking availability",
        "Smart conflict detection and prevention",
        "Custom buffer times between appointments",
        "Multiple service types and durations"
      ]
    },
    {
      id: 'automation',
      icon: Zap,
      title: "Automated Workflows",
      description: "Reduce no-shows and streamline your booking process",
      benefits: [
        "Automated confirmation and reminder emails",
        "SMS notifications and follow-ups",
        "Custom intake forms and questionnaires",
        "Follow-up sequences for missed sessions"
      ]
    },
    {
      id: 'integration',
      icon: Globe,
      title: "Calendar Integration",
      description: "Sync with your existing calendars and tools",
      benefits: [
        "Calendly sync",
        "Gmail",
        "Outlook"
        // "Zoom, Teams, and other video platform integration",
        // "CRM and client management system sync",
        // "Mobile app for on-the-go management"
      ]
    }
  ];

  const stats = [
    { label: "Booking Efficiency", value: "+90%", icon: Timer },
    { label: "Fewer No-Shows", value: "60%", icon: Bell },
    { label: "Time Saved Weekly", value: "20+ Hours", icon: Clock },
  ];

  const bookingTypes = [
    {
      icon: Users,
      title: "1-on-1 Coaching",
      description: "Personal coaching sessions",
      features: ["Custom duration options", "Pre-session questionnaires", "Video call integration"]
    },
    {
      icon: Video,
      title: "Group Sessions",
      description: "Workshops and group coaching",
      features: ["Multi-participant booking", "Capacity management", "Group communication tools"]
    },
    {
      icon: MapPin,
      title: "In-Person Meetings",
      description: "Face-to-face appointments",
      features: ["Location management", "Travel time buffers", "Directions and parking info"]
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
            <CalendarDays className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Smart Calendar & Booking
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Smart scheduling that saves time, fills your calendar, and keeps clients showing up. With our seamless
            {' '} calendar integration, never miss a booking or deal with a scheduling conflict again.
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

      {/* Booking Types */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Support All Your Booking Types</h2>
          <p className="text-stone-300 text-lg">Flexible scheduling options for every type of coaching session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bookingTypes.map((type, index) => (
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
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need for Seamless Scheduling</h2>
          <p className="text-stone-300 text-lg">Powerful features that save time and improve client experience</p>
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

          {/* Booking Flow */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Simple Booking Process</h4>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <div className="text-white font-medium">Choose Service</div>
                    <div className="text-stone-400 text-sm">Client selects coaching type and duration</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">2</div>
                  <div>
                    <div className="text-white font-medium">Pick Time</div>
                    <div className="text-stone-400 text-sm">Smart calendar shows available slots only</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">3</div>
                  <div>
                    <div className="text-white font-medium">Confirmed</div>
                    <div className="text-stone-400 text-sm">Instant confirmation with options for the client to add to their calendar</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">Secure Bookings</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Reliable scheduling with built-in security and privacy.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-600/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Mobile Optimized</span>
                  </div>
                  <p className="text-stone-300 text-sm">
                    Perfect booking experience on any device, anywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
