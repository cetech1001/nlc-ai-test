import { useState } from 'react';
import {
  GraduationCap,
  Video,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  PlayCircle,
  BookOpen,
  Trophy,
  CheckCircle,
  Star
} from "lucide-react";

export const CoursesLanding = () => {
  const [activeFeature, setActiveFeature] = useState('course-builder');

  const features = [
    {
      id: 'course-builder',
      icon: BookOpen,
      title: "Course Builder",
      description: "Create professional courses with our intuitive drag-and-drop builder",
      benefits: [
        "Simple lesson creation with video & PDF uploads",
        "AI Powered content suggestions for engaging lessons",
        "Progress tracking and certificates of completion",
        "Visual builder to structure and organize your course"
      ]
    },
    {
      id: 'student-management',
      icon: Users,
      title: "Student Management",
      description: "Track student progress and engagement across all your courses",
      benefits: [
        "Gamified client experience that keeps students logging in daily",
        "Progress tracking, achievements, built-in streaks, badges, and milestones to drive engagement",
        "Course design that rewards progress and builds habits",
        "Performance analytics and insights"
      ]
    },
    {
      id: 'monetization',
      icon: DollarSign,
      title: "Monetization Tools",
      description: "Multiple pricing models and payment options for your courses",
      benefits: [
        "One-time, subscription, and payment plan options",
        "Coupon and discount management",
        "Revenue analytics and reporting",
        "Integrated payment processing"
      ]
    }
  ];

  const stats = [
    { label: "Course Creation", value: "5x Faster", icon: Clock },
    { label: "Student Engagement", value: "2x More", icon: Trophy },
    { label: "Revenue Growth", value: "3x Average", icon: BarChart3 },
  ];

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8 max-w-full overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-8 overflow-hidden">
        <div className="absolute w-64 h-64 -left-12 top-32 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />
        <div className="absolute w-64 h-64 right-20 -top-20 opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[112px]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-fuchsia-400" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Course Creation & Management
          </h1>
          <p className="text-xl text-stone-300 mb-8">
            Build, sell, and manage online courses with our comprehensive platform.
            Turn your expertise into scalable digital products.
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

      {/* Features Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Create Profitable Courses</h2>
          <p className="text-stone-300 text-lg">From content creation to student management and revenue optimization</p>
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

          {/* Course Creation Flow */}
          <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-32 h-32 -right-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
            </div>

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-white mb-4">Course Creation Made Simple</h4>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
                  <div>
                    <div className="text-white font-medium">Upload Content</div>
                    <div className="text-stone-400 text-sm">Photos, Videos, PDFs, Links, and more</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">2</div>
                  <div>
                    <div className="text-white font-medium">Structure & Organize</div>
                    <div className="text-stone-400 text-sm">Design your course layout with a simple visual builder</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">3</div>
                  <div>
                    <div className="text-white font-medium">Price & Publish</div>
                    <div className="text-stone-400 text-sm">Set pricing and go live instantly</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Pro Tip</span>
                </div>
                <p className="text-stone-300 text-sm">
                  Use our AI content suggestions to create engaging course material that keeps students coming back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Types */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Perfect for Any Type of Course</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Video, title: "Video Courses", desc: "HD video lessons with interactive elements" },
            { icon: BookOpen, title: "Text-Based", desc: "Rich text content with downloadable resources" },
            { icon: PlayCircle, title: "Live Sessions", desc: "Scheduled live coaching calls and Q&As" },
            { icon: Trophy, title: "Cohort Programs", desc: "Group-based learning with peer interaction" }
          ].map((type, index) => (
            <div key={index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-4 overflow-hidden text-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-24 h-24 -left-4 -top-6 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[40px]" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <type.icon className="w-6 h-6 text-fuchsia-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">{type.title}</h4>
                <p className="text-stone-400 text-sm">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
